# streamlit 命令使用别名 "st"
import streamlit as st
import text_lib as glib

# 页面 title
st.set_page_config(page_title="Text to Text")
# page title
st.title("Text to Text")

# 输入文本内容
input_text = st.text_area("Input text", label_visibility="collapsed")
# 请求按钮
go_button = st.button("Go", type="primary")

if go_button: #运行按钮
    with st.spinner("Working..."): #当带有块的代码运行时显示一个微调器
      response_content = glib.get_text_response(input_content=input_text) #调用方法
      st.write(response_content) #显示响应内容
