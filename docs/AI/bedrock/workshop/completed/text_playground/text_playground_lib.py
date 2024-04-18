from langchain_community.llms import Bedrock

def get_titan_response(model, input_content, temperature, top_p, max_token_count, stop_sequence): #text-to-text client function
    
    model_kwargs = { #For the LangChain Bedrock implementation, these parameters will be added to the textGenerationConfig item that LangChain creates for us
        "maxTokenCount": max_token_count, 
        "stopSequences": [stop_sequence],
        "temperature": temperature, 
        "topP": top_p
    }
    
    llm = Bedrock( #create a Bedrock llm client
        model_id=model, #use the requested model
        model_kwargs = model_kwargs
    )
    
    return llm.invoke(input_content) #return a response to the prompt

