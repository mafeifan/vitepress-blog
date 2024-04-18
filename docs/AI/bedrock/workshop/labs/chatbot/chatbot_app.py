import streamlit as st  # 所有 streamlit 命令都可以通过“st”别名使用
import chatbot_lib as glib  # 对本地库脚本的引用

st.set_page_config(page_title="Chatbot")  # HTML title
st.title("Chatbot")  # page title

if 'memory' not in st.session_state:
    st.session_state.memory = glib.get_memory()  # 初始化内存

# 查看聊天历史是否尚未创建
if 'chat_history' not in st.session_state:
    # 初始化聊天历史
    st.session_state.chat_history = []

# 重新渲染聊天历史（Streamlit 重新运行此脚本，因此需要它来保留以前的聊天消息）
for message in st.session_state.chat_history:  # 遍历聊天历史
    with st.chat_message(message["role"]):  # 为给定角色渲染聊天行，包含在 with 块中的所有内容
        st.markdown(message["text"])  # 显示聊天内容

input_text = st.chat_input("Chat with your bot here")  # 聊天框
if input_text:
    # 显示用户聊天消息
    with st.chat_message("user"):
        # 渲染用户的最新消息
        st.markdown(input_text)
        # 将用户的最新消息附加到聊天历史记录中。
    st.session_state.chat_history.append({"role": "user", "text": input_text})
    # 通过支持库调用模型
    chat_response = glib.get_chat_response(input_text=input_text, memory=st.session_state.memory)

    # 显示机器人聊天消息
    with st.chat_message("assistant"):
        # 显示机器人的最新响应
        st.markdown(chat_response)
    # 将机器人的最新消息附加到聊天历史记录中
    st.session_state.chat_history.append({"role": "assistant", "text": chat_response})

