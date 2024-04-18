from langchain_community.llms import Bedrock

##################################################################

llm = Bedrock( #create a Bedrock llm client
    model_id="ai21.j2-ultra-v1" #set the foundation model
)

##################################################################

prompt = "What is the largest city in Vermont?"
    
response_text = llm.invoke(prompt) #return a response to the prompt

print(response_text)
