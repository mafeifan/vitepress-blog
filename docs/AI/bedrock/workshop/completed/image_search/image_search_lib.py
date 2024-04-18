import os
import boto3
import json
import base64
from langchain_community.vectorstores import FAISS
from io import BytesIO


#calls Bedrock to get a vector from either an image, text, or both
def get_multimodal_vector(input_image_base64=None, input_text=None):
    
    session = boto3.Session()

    bedrock = session.client(service_name='bedrock-runtime') #creates a Bedrock client
    
    request_body = {}
    
    if input_text:
        request_body["inputText"] = input_text
        
    if input_image_base64:
        request_body["inputImage"] = input_image_base64
    
    body = json.dumps(request_body)
    
    response = bedrock.invoke_model(
    	body=body, 
    	modelId="amazon.titan-embed-image-v1", 
    	accept="application/json", 
    	contentType="application/json"
    )
    
    response_body = json.loads(response.get('body').read())
    
    embedding = response_body.get("embedding")
    
    return embedding


#creates a vector from a file
def get_vector_from_file(file_path):
    with open(file_path, "rb") as image_file:
        input_image_base64 = base64.b64encode(image_file.read()).decode('utf8')
    
    vector = get_multimodal_vector(input_image_base64 = input_image_base64)
    
    return vector


#creates a list of (path, vector) tuples from a directory
def get_image_vectors_from_directory(path):
    items = []
    
    for file in os.listdir("images"):
        file_path = os.path.join(path,file)
        
        vector = get_vector_from_file(file_path)
        
        items.append((file_path, vector))
        
    return items


#creates and returns an in-memory vector store to be used in the application
def get_index(): 

    image_vectors = get_image_vectors_from_directory("images")
    
    text_embeddings = [("", item[1]) for item in image_vectors]
    metadatas = [{"image_path": item[0]} for item in image_vectors]
    
    index = FAISS.from_embeddings(
        text_embeddings=text_embeddings,
        embedding = None,
        metadatas = metadatas
    )
    
    return index


#get a base64-encoded string from file bytes
def get_base64_from_bytes(image_bytes):
    
    image_io = BytesIO(image_bytes)
    
    image_base64 = base64.b64encode(image_io.getvalue()).decode("utf-8")
    
    return image_base64


#get a list of images based on the provided search term and/or search image
def get_similarity_search_results(index, search_term=None, search_image=None):
    
    search_image_base64 = (get_base64_from_bytes(search_image) if search_image else None)

    search_vector = get_multimodal_vector(input_text=search_term, input_image_base64=search_image_base64)
    
    results = index.similarity_search_by_vector(embedding=search_vector)
    
    results_images = []
    
    for res in results: #load images into list
        
        with open(res.metadata['image_path'], "rb") as f:
            img = BytesIO(f.read())
        
        results_images.append(img)
    
    
    return results_images
