import streamlit as st
import summarization_lib as glib

st.set_page_config(page_title="Document Summarization")
st.title("Document Summarization")

    
return_intermediate_steps = st.checkbox("Return intermediate steps", value=True)
summarize_button = st.button("Summarize", type="primary")


if summarize_button:
    st.subheader("Combined summary")

    with st.spinner("Running..."):
        response_content = glib.get_summary(return_intermediate_steps=return_intermediate_steps)


    if return_intermediate_steps:

        st.write(response_content["output_text"])

        st.subheader("Section summaries")

        for step in response_content["intermediate_steps"]:
            st.write(step)
            st.markdown("---")

    else:
        st.write(response_content["output_text"])

