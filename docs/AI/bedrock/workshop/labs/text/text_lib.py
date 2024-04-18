from langchain_community.llms import Bedrock
import boto3


session = boto3.Session(profile_name="bedrock")
# 初始化Bedrock客户端库
BEDROCK_CLIENT = session.client(service_name='bedrock-runtime')
def get_text_response(input_content): #文生文函数
    llm = Bedrock( #创建Bedrock llm 客户端
        model_id="meta.llama2-70b-chat-v1", #设置模型
        model_kwargs={
            "prompt": input_content,
            "max_gen_len": 2048,
            "temperature": 0.5,
            "top_p": 0.9
        },
        client=BEDROCK_CLIENT
    )
    return llm.invoke(input_content)
