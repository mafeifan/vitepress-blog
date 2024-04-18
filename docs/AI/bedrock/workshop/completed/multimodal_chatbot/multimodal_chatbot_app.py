import streamlit as st #all streamlit commands will be available through the "st" alias
import multimodal_chatbot_lib as glib #reference to local lib script


st.set_page_config(page_title="Multimodal Chatbot") #HTML title
st.title("Multimodal Chatbot") #page title

if 'chat_history' not in st.session_state: #see if the chat history hasn't been created yet
    st.session_state.chat_history = [] #initialize the chat history


chat_container = st.container()

input_text = st.chat_input("Chat with your bot here") #display a chat input box

uploaded_file = st.file_uploader("Select an image", type=['png', 'jpg'], label_visibility="collapsed")


col1, col2, col3 = st.columns(3)
with col1:
    upload_image_1 = st.button("Add miniature house image")

with col2:
    upload_image_2 = st.button("Add house and car image")

with col3:
    upload_image_3 = st.button("Add miniature car image")


if upload_image_1:
    image_bytes = glib.get_bytes_from_file("images/minihouse.jpg")
    glib.chat_with_model(message_history=st.session_state.chat_history, new_text=None, new_image_bytes=image_bytes)
    
elif upload_image_2:
    image_bytes = glib.get_bytes_from_file("images/house_and_car.jpg")
    glib.chat_with_model(message_history=st.session_state.chat_history, new_text=None, new_image_bytes=image_bytes)

elif upload_image_3:
    image_bytes = glib.get_bytes_from_file("images/minicar.jpg")
    glib.chat_with_model(message_history=st.session_state.chat_history, new_text=None, new_image_bytes=image_bytes)

elif input_text: #run the code in this if block after the user submits a chat message
    glib.chat_with_model(message_history=st.session_state.chat_history, new_text=input_text, new_image_bytes=None)

elif uploaded_file:
    image_bytes = uploaded_file.getvalue()
    
    glib.chat_with_model(message_history=st.session_state.chat_history, new_text=None, new_image_bytes=image_bytes)
    
    
#Re-render the chat history (Streamlit re-runs this script, so need this to preserve previous chat messages)
for message in st.session_state.chat_history: #loop through the chat history
    with chat_container.chat_message(message.role): #renders a chat line for the given role, containing everything in the with block
        if (message.message_type == 'image'):
            st.image(message.bytesio)
        else:
            st.markdown(message.text) #display the chat content
