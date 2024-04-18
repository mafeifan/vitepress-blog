import boto3
import json
import base64
from PIL import Image
from io import BytesIO

#

session = boto3.Session()

bedrock = session.client(service_name='bedrock-runtime') #creates a Bedrock client

bedrock_model_id = 'stability.stable-diffusion-xl-v1'

#

def get_resized_image_io(image_bytes):
    image_io = BytesIO(image_bytes)
    image = Image.open(image_io)
    resized_image = image.resize((512, 512))
    
    resized_io = BytesIO()
    resized_image.save(resized_io, format=image.format)
    return resized_io

#

def prepare_image_for_endpoint(image_bytes):
    
    resized_io = get_resized_image_io(image_bytes)
    
    img_str = base64.b64encode(resized_io.getvalue()).decode("utf-8")
    
    return img_str


def get_stability_ai_request_body(prompt, image_str = None):
    #see https://platform.stability.ai/docs/features/api-parameters
    body = {"text_prompts": [ {"text": prompt } ], "cfg_scale": 9, "steps": 50, }
    
    if image_str:
        body["init_image"] = image_str
    
    return json.dumps(body)

#

def get_stability_ai_response_image(response):

    response = json.loads(response.get('body').read())
    images = response.get('artifacts')
    
    image_data = base64.b64decode(images[0].get('base64'))

    return BytesIO(image_data)

#

def get_altered_image_from_model(prompt_content, image_bytes):
    
    image_str = prepare_image_for_endpoint(image_bytes)
    
    body = get_stability_ai_request_body(prompt_content, image_str)
    
    response = bedrock.invoke_model(body=body, modelId=bedrock_model_id, contentType="application/json", accept="application/json")
    
    output = get_stability_ai_response_image(response)
    
    return output
