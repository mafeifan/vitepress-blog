import streamlit as st
import image_insertion_lib as glib


st.set_page_config(layout="wide", page_title="Image Insertion")

st.title("Image Insertion")

col1, col2, col3 = st.columns(3)

placement_options_dict = { #Configure mask areas for image insertion
    "Wall behind desk": (3, 3, 506, 137), #x, y, width, height
    "On top of desk": (78, 60, 359, 115),
    "Beneath desk": (108, 237, 295, 239),
    "Custom": (0, 0, 200, 100), 
}

placement_options = list(placement_options_dict)


with col1:
    st.subheader("Initial image")
    
    uploaded_file = st.file_uploader("Select an image (must be 512x512)", type=['png', 'jpg'])
    
    if uploaded_file:
        uploaded_image_preview = glib.get_bytesio_from_bytes(uploaded_file.getvalue())
        st.image(uploaded_image_preview)
    else:
        st.image("images/desk.jpg")
    

with col2:
    st.subheader("Insertion parameters")
    
    placement_area = st.radio("Placement area:", 
        placement_options,
    )
    
    with st.expander("Custom:", expanded=False):
        
        mask_dimensions = placement_options_dict[placement_area]
    
        mask_x = st.number_input("Mask x position", value=mask_dimensions[0])
        mask_y = st.number_input("Mask y position", value=mask_dimensions[1])
        mask_width = st.number_input("Mask width", value=mask_dimensions[2])
        mask_height = st.number_input("Mask height", value=mask_dimensions[3])
    
    prompt_text = st.text_area("Object to add:", height=100, help="The prompt text")
    
    generate_button = st.button("Generate", type="primary")
    

with col3:
    st.subheader("Result")

    if generate_button:
        with st.spinner("Drawing..."):
            if uploaded_file:
                image_bytes = uploaded_file.getvalue()
            else:
                image_bytes = None
            
            generated_image = glib.get_image_from_model(
                prompt_content=prompt_text, 
                image_bytes=image_bytes, 
                insertion_position=(mask_x, mask_y),
                insertion_dimensions=(mask_width, mask_height),
            )
        
        st.image(generated_image)
