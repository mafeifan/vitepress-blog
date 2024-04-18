import streamlit as st
import image_to_image_lib as glib

#

st.set_page_config(layout="wide", page_title="Image to Image")

st.title("Image to Image")

col1, col2 = st.columns(2)

#

with col1:
    st.subheader("Input image")
    
    uploaded_file = st.file_uploader("Select an image", type=['png', 'jpg'])
    
    if uploaded_file:
        uploaded_image_preview = glib.get_resized_image_io(uploaded_file.getvalue())
        st.image(uploaded_image_preview)
    
    prompt_text = st.text_area("Prompt text", height=200)
    
    process_button = st.button("Run", type="primary")
    
#

with col2:
    st.subheader("Result")

    if process_button:
        with st.spinner("Drawing..."):
            generated_image = glib.get_altered_image_from_model(prompt_content=prompt_text, image_bytes=uploaded_file.getvalue())
        
        st.image(generated_image)
