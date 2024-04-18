import streaming_lib as glib
import streamlit as st

st.set_page_config(page_title="Response Streaming")
st.title("Response Streaming")

input_text = st.text_area("Input text", label_visibility="collapsed")
go_button = st.button("Go", type="primary")

if go_button:
    # 创建一个可更新的空 Streamlit 容器
    output_container = st.empty()
    # 累加器变量，用于存储流式文本
    global accumulated_text
    accumulated_text = ''

    # 流式响应的回调函数
    def streamlit_callback(chunk):
        global accumulated_text
        # 将新的文本块附加到累加器
        accumulated_text += chunk
        # 更新 Streamlit 容器
        output_container.markdown(accumulated_text)
    # 调用流式接口函数并传递输入和回调函数
    glib.get_streaming_response(prompt=input_text, streaming_callback=streamlit_callback)
