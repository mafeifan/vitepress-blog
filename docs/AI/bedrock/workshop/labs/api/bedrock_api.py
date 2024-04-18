import json
import boto3

session = boto3.Session(profile_name="bedrock")
# 初始化Bedrock客户端库
bedrock = session.client(service_name='bedrock-runtime')

# 设置模型
bedrock_model_id = "meta.llama2-70b-chat-v1"
# 提示词
prompt = "说一下冒泡排序的原理？"
body = json.dumps({
    "prompt": prompt,
    "max_gen_len": 2048,
    "temperature": 0.5,
    "top_p": 0.9
})

# 发送调用请求
response = bedrock.invoke_model(body=body, modelId=bedrock_model_id, accept='application/json', contentType='application/json')

response_body = json.loads(response.get('body').read())
# 从 JSON 中返回相应数据
response_text=response_body['generation']
print(response_text)

