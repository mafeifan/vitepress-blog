import streamlit as st
import image_extension_lib as glib

st.set_page_config(layout="wide", page_title="Image Extension")

st.title("Image Extension")

col1, col2, col3 = st.columns(3)


horizontal_alignment_dict = { #horizontal alignment options for original image placement within the extended area
    "Left": 0.0,
    "Center": 0.5,
    "Right": 1.0,
}

vertical_alignment_dict = {  #vertical alignment options for original image placement within the extended area
    "Top": 0.0,
    "Middle": 0.5,
    "Bottom": 1.0,
}

horizontal_alignment_options = list(horizontal_alignment_dict)
vertical_alignment_options = list(vertical_alignment_dict)

with col1:
    st.subheader("Initial image")
    
    uploaded_file = st.file_uploader("Select an image (smaller than 1024x1024)", type=['png', 'jpg'])
    
    if uploaded_file:
        uploaded_image_preview = glib.get_bytesio_from_bytes(uploaded_file.getvalue())
        st.image(uploaded_image_preview)
    else:
        st.image("images/example.jpg")


with col2:
    st.subheader("Extension parameters")
    prompt_text = st.text_area("What should be seen in the extended image:", height=100, help="The prompt text")
    negative_prompt = st.text_input("What should not be in the extended area:", help="The negative prompt")
    
    horizontal_alignment_selection = st.select_slider("Original image horizontal placement:", options=horizontal_alignment_options, value="Center")
    vertical_alignment_selection = st.select_slider("Original image vertical placement:", options=vertical_alignment_options, value="Middle")
    
    generate_button = st.button("Generate", type="primary")
    

with col3:
    st.subheader("Result")

    if generate_button:
        with st.spinner("Drawing..."):
            
            if uploaded_file:
                image_bytes = uploaded_file.getvalue()
            else:
                image_bytes = glib.get_bytes_from_file("images/example.jpg")
             
            generated_image = glib.get_image_from_model(
                prompt_content=prompt_text, 
                image_bytes=image_bytes,
                negative_prompt=negative_prompt,
                vertical_alignment=vertical_alignment_dict[vertical_alignment_selection],
                horizontal_alignment=horizontal_alignment_dict[horizontal_alignment_selection],
            )
        
        st.image(generated_image)
