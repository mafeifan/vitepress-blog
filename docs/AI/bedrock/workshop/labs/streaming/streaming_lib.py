import json
import boto3

session = boto3.Session(profile_name="bedrock")
bedrock = session.client(service_name='bedrock-runtime')  # 创建Bedrock client


def chunk_handler(chunk):
    print(chunk, end='')


def get_streaming_response(prompt, streaming_callback):
    bedrock_model_id = "meta.llama2-70b-chat-v1"  # 设置模型

    body = json.dumps({
        "prompt": prompt,  # 提示词
        "max_gen_len": 2048,
        "temperature": 0.5,
        "top_p": 1,
    })

    response = bedrock.invoke_model_with_response_stream(modelId=bedrock_model_id, body=body)

    for event in response.get('body'):
        chunk = json.loads(event['chunk']['bytes'])
        streaming_callback(chunk["generation"])
