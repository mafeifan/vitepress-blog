import streamlit as st
import image_variation_lib as glib


st.set_page_config(layout="wide", page_title="Image Variation")

st.title("Image Variation")

col1, col2 = st.columns(2)


with col1:
    st.subheader("Image parameters")
    
    uploaded_file = st.file_uploader("Select an image", type=['png', 'jpg'])
    
    if uploaded_file:
        uploaded_image_preview = glib.get_bytesio_from_bytes(uploaded_file.getvalue())
        st.image(uploaded_image_preview)
    else:
        st.image("images/example.jpg")
    
    prompt_text = st.text_input("Brief description of the selected image:", value="A miniature car", help="The prompt text")

    generate_button = st.button("Generate", type="primary")
    

with col2:
    st.subheader("Result")

    if generate_button:
        
        if uploaded_file:
            image_bytes = uploaded_file.getvalue()
        else:
            image_bytes = glib.get_bytes_from_file("images/example.jpg")
        
        with st.spinner("Drawing..."):
            generated_image = glib.get_image_from_model(
                prompt_content=prompt_text,
                image_bytes=image_bytes,
            )
        
        st.image(generated_image)
