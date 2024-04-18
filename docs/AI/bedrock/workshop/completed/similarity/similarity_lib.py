import json
from langchain_community.embeddings import BedrockEmbeddings
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import JSONLoader


class ListItem(): #create a class that can capture and display a list item
    def __init__(self, name, url, description):
        self.name = name
        self.url = url
        self.description = description


source_json = "services.json"


#Function to get collection of items to present in the UI
def get_item_dict(): 
    with open(source_json) as f:
        raw_json = json.load(f)
        
    items = [ListItem(i["name"], i["url"], i["description"]) for i in raw_json]

    item_dict = {}
    
    for item in items:
        item_dict[item.name] = item
        
    return item_dict


#function to identify the metadata to capture in the vectorstore and return along with the matched content
def item_metadata_func(record: dict, metadata: dict) -> dict: 

    metadata["name"] = record.get("name")
    metadata["url"] = record.get("url")

    return metadata


def get_index(): #creates and returns an in-memory vector store to be used in the application
    
    embeddings = BedrockEmbeddings() #create a Titan Embeddings client
    
    loader = JSONLoader(
        file_path=source_json,
        jq_schema='.[]',
        content_key='description',
        metadata_func=item_metadata_func)

    text_splitter = RecursiveCharacterTextSplitter( #create a text splitter
        separators=["\n\n", "\n", ".", " "], #split chunks at (1) paragraph, (2) line, (3) sentence, or (4) word, in that order
        chunk_size=8000, #based on this content, we just want the whole item so no chunking - this could lead to an error if the content is too long
        chunk_overlap=0 #number of characters that can overlap with previous chunk
    )
    
    index_creator = VectorstoreIndexCreator( #create a vector store factory
        vectorstore_cls=FAISS, #use an in-memory vector store for demo purposes
        embedding=embeddings, #use Titan embeddings
        text_splitter=text_splitter, #use the recursive text splitter
    )
    
    index_from_loader = index_creator.from_loaders([loader]) #create an vector store index from the loaded PDF
    
    
    return index_from_loader #return the index to be cached by the client app




def get_similar_items(index, selected_key, condition):
    
    results = index.vectorstore.similarity_search_with_score(condition, k=6) #return up to 6 items (we'll exclude the submitted item later)
    
    processed_results = [] #list to store the similar items
    
    keys = {selected_key: selected_key} #dict to check for duplicates, and that the submitted item isn't returned
    
    for result in results:
        desc = result[0].page_content
        
        item_name = result[0].metadata.get("name") 
        
        if not item_name in keys: #don't add any duplicate items, or add the selected item
            
            url = result[0].metadata.get("url")
            
            processed_results.append(ListItem(item_name, url, desc))
            
            keys[item_name] = item_name
        
    
    return processed_results
