from langchain.memory import ConversationSummaryBufferMemory
from langchain_community.chat_models import BedrockChat
from langchain.chains import ConversationChain
import boto3

session = boto3.Session(profile_name="bedrock")
BEDROCK_CLIENT = session.client(service_name='bedrock-runtime')  # 创建Bedrock client


def get_llm():
    model_kwargs = {
        "max_gen_len": 2048,
        "temperature": 0.5,
        "top_p": 0.9
    }
    # 设置调用模型
    llm = BedrockChat(
        model_id="meta.llama2-70b-chat-v1",
        model_kwargs=model_kwargs,
        client=BEDROCK_CLIENT
    )
    return llm


# 为这个聊天会话创建内存
def get_memory():
    llm = get_llm()
    # 维持之前消息的摘要
    # ConversationSummaryBufferMemory类 来跟踪聊天历史，通过跟踪最新消息并汇总旧消息来支持此功能。
    memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=1024)
    return memory


# 聊天客户端函数
def get_chat_response(input_text, memory):
    llm = get_llm()
    # 创建一个聊天客户端
    conversation_with_summary = ConversationChain(
        # 使用 Bedrock LLM
        llm=llm,
        # 带有总结的内存
        memory=memory,
        # 在运行时打印出链的一些内部状态
        verbose=True
    )
    # 将用户消息和摘要传递给模型
    chat_response = conversation_with_summary.invoke(input_text)
    return chat_response['response']
