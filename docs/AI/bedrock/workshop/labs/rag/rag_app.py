# 所有 streamlit 命令都可以通过“st”别名使用
import streamlit as st
# 对本地库脚本的引用
import rag_lib as glib

st.set_page_config(page_title="Retrieval-Augmented Generation")  # HTML title
st.title("Retrieval-Augmented Generation")  # page title

# 查看向量索引是否尚未创建
if 'vector_index' not in st.session_state:
    # 在这个 with 块运行的代码时显示一个旋转器
    with st.spinner("Indexing document..."):
        # 通过支持库检索索引并存储在应用程序的会话缓存中
        st.session_state.vector_index = glib.get_index()

# 创建一个多行文本框
input_text = st.text_area("Input text", label_visibility="collapsed")
# 按钮
go_button = st.button("Go", type="primary")

# What's AMC
# AWS 未来的规划是什么
# how many consumer business  in 2022

if go_button:
    with st.spinner("Working..."):
        # 通过支持库调用模型
        response_content = glib.get_rag_response(
            index=st.session_state.vector_index,
            question=input_text
        )
        st.write(response_content)
