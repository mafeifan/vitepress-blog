from langchain_community.embeddings import BedrockEmbeddings
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.llms import Bedrock
import boto3
import os

session = boto3.Session(profile_name="bedrock")
# 创建Bedrock client
BEDROCK_CLIENT = session.client(service_name='bedrock-runtime')

def get_llm():
    model_kwargs = {
        "max_gen_len": 2048,
        "temperature": 0.5,
        "top_p": 0.9
    }

    llm = Bedrock(
        # 设置调用模型
        model_id="meta.llama2-70b-chat-v1",
        model_kwargs=model_kwargs,
        client=BEDROCK_CLIENT
    )

    return llm

# creates and returns an in-memory vector store to be used in the application
def get_index():
    # 创建一个 Titan Embeddings 客户端
    embeddings = BedrockEmbeddings(
        credentials_profile_name="bedrock",
    )
    # 本地 PDF 文件
    pdf_name = "2022-Shareholder-Letter.pdf"

    # 获取当前脚本所在目录的绝对路径
    script_directory = os.path.dirname(os.path.abspath(__file__))
    print(script_directory)

    file_full_path = script_directory + "/" + pdf_name
    # 加载 PDF 文件
    loader = PyPDFLoader(file_path=file_full_path)

    # 创建一个文本拆分器
    text_splitter = RecursiveCharacterTextSplitter(
        # 以（1）段落、（2）行、（3）句子或（4）单词的顺序，在这些分隔符处拆分块
        separators=["\n\n", "\n", ".", " "],
        # 使用上述分隔符将其分成 1000 个字符的块
        chunk_size=1000,
        # 与前一个块重叠的字符数
        chunk_overlap=100
    )
    # 创建一个向量存储创建器    vectorstore_cls=FAISS,
    # 为了演示目的，使用内存中的向量存储
    # 同时使用 Amazon Titan Embeddings 创建提示的数字表示，以传递到矢量数据库。
    index_creator = VectorstoreIndexCreator(
        # 使用 Titan 嵌入
        embedding=embeddings,
        # 使用递归文本拆分器
        text_splitter=text_splitter,
    )
    # 从加载器创建向量存储索引
    # 根据PDF创建向量索引和存储到向量数据库
    index_from_loader = index_creator.from_loaders([loader])
    # 返回索引以由客户端应用程序进行缓存
    return index_from_loader


# rag 客户端函数
def get_rag_response(index, question):
    # 针对内存中的索引进行搜索，将结果填充到提示中并发送给语言模型
    llm = get_llm()
    response_text = index.query(question=question, llm=llm)
    return response_text
