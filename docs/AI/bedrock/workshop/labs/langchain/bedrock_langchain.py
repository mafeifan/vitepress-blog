from langchain_community.llms import Bedrock
import boto3

session = boto3.Session(profile_name="bedrock")
BEDROCK_CLIENT = session.client(service_name='bedrock-runtime')  # 创建Bedrock client

# create a Bedrock llm client
llm = Bedrock(
    # 选择模型
    model_id="meta.llama2-70b-chat-v1",
    client=BEDROCK_CLIENT
)
prompt = "简述一下冒泡排序的原理？"
# return a response to the prompt
response_text = llm.invoke(prompt)
print(response_text)
