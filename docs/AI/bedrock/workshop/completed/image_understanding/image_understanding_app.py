import streamlit as st
import image_understanding_lib as glib

st.set_page_config(layout="wide", page_title="Image Understanding")

st.title("Image Understanding")

col1, col2, col3 = st.columns(3)

prompt_options_dict = {
    "Image caption": "Please provide a brief caption for this image.",
    "Detailed description": "Please provide a thoroughly detailed description of this image.",
    "Image classification": "Please categorize this image into one of the following categories: People, Food, Other. Only return the category name.",
    "Object recognition": "Please create a comma-separated list of the items found in this image. Only return the list of items.",
    "Subject identification": "Please name the primary object in the image. Only return the name of the object in <object> tags.",
    "Writing a story": "Please write a fictional short story based on this image.",
    "Answering questions": "What emotion are the people in this image displaying?",
    "Transcribing text": "Please transcribe any text found in this image.",
    "Translating text": "Please translate the text in this image to French.",
    "Other": "",
}

prompt_options = list(prompt_options_dict)

image_options_dict = {
    "Food": "images/food.jpg",
    "People": "images/people.jpg",
    "Person and cat": "images/person_and_cat.jpg",
    "Room": "images/room.jpg",
    "Text in image": "images/text2.png",
    "Toy": "images/toy_car.jpg",
    "Other": "images/house.jpg",
}

image_options = list(image_options_dict)


with col1:
    st.subheader("Select an Image")
    
    image_selection = st.radio("Image example:", image_options)
    
    if image_selection == 'Other':
        uploaded_file = st.file_uploader("Select an image", type=['png', 'jpg'], label_visibility="collapsed")
    else:
        uploaded_file = None
    
    if uploaded_file and image_selection == 'Other':
        uploaded_image_preview = glib.get_bytesio_from_bytes(uploaded_file.getvalue())
        st.image(uploaded_image_preview)
    else:
        st.image(image_options_dict[image_selection])
    
    
with col2:
    st.subheader("Prompt")
    
    prompt_selection = st.radio("Prompt example:", prompt_options)
    
    prompt_example = prompt_options_dict[prompt_selection]
    
    prompt_text = st.text_area("Prompt",
        #value=,
        value=prompt_example,
        height=100,
        help="What you want to know about the image.",
        label_visibility="collapsed")
    
    go_button = st.button("Go", type="primary")
    
    
with col3:
    st.subheader("Result")

    if go_button:
        with st.spinner("Processing..."):
            
            if uploaded_file:
                image_bytes = uploaded_file.getvalue()
            else:
                image_bytes = glib.get_bytes_from_file(image_options_dict[image_selection])
            
            response = glib.get_response_from_model(
                prompt_content=prompt_text, 
                image_bytes=image_bytes,
            )
        
        st.write(response)
