import streamlit as st #all streamlit commands will be available through the "st" alias
import similarity_lib as glib #reference to local lib script



st.set_page_config(page_title="Similarity Search", layout="wide") #HTML title
st.title("Similarity Search") #page title

col1, col2 = st.columns(2)


with col1:
    if 'vector_index' not in st.session_state: #see if the vector index hasn't been created yet
        with st.spinner("Indexing data..."): #show a spinner while the code in this with block runs
            st.session_state.vector_index = glib.get_index() #retrieve the index through the supporting library and store in the app's session cache

            st.session_state.item_dict = glib.get_item_dict() #retrieve the items from the json

            st.session_state.item_keys = list(st.session_state.item_dict)



with col1:
    
    selected_item = st.selectbox("Select an item:", st.session_state.item_keys)

    selected_description = st.session_state.item_dict[selected_item].description

    st.text_area("Item description:", value=selected_description, height=350, disabled=True)

    go_button = st.button("Find similar items", type="primary") #display a primary button

    


with col2:
    if go_button: #code in this if block will be run when the button is clicked

        with st.spinner("Running..."):
            results = glib.get_similar_items(index=st.session_state.vector_index, selected_key = selected_item, condition=selected_description)

            st.subheader(f"Displaying similar matches for \"{selected_item}\"")
            
            for res in results:
                
                with st.expander(res.name):
                    
                    st.write(res.description)
                    st.write(f"[More on {res.name}]({res.url})")
