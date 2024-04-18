import streamlit as st #all streamlit commands will be available through the "st" alias
import recommendations_lib as glib #reference to local lib script


st.set_page_config(page_title="Personalized Recommendations", layout="wide") #HTML title
st.title("Personalized Recommendations") #page title



if 'vector_index' not in st.session_state: #see if the vector index hasn't been created yet
    with st.spinner("Indexing document..."): #show a spinner while the code in this with block runs
        st.session_state.vector_index = glib.get_index() #retrieve the index through the supporting library and store in the app's session cache



input_text = st.text_input("Name some key features you need from a cloud service:") #display a multiline text box with no label
go_button = st.button("Go", type="primary") #display a primary button



if go_button: #code in this if block will be run when the button is clicked
    
    with st.spinner("Working..."): #show a spinner while the code in this with block runs
        response_content = glib.get_similarity_search_results(index=st.session_state.vector_index, question=input_text)
        
        for result in response_content:
            st.markdown(f"### [{result['name']}]({result['url']})")
            st.write(result['summary'])
            with st.expander("Original"):
                st.write(result['original'])