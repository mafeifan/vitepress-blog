import pandas as pd
from io import StringIO
from langchain_community.llms import Bedrock

#

def get_llm():

    llm = Bedrock( #create a Bedrock llm client
        model_id="ai21.j2-ultra-v1", #use the AI21 Jurassic-2 Ultra model
        model_kwargs = {"maxTokens": 1024, "temperature": 0.0 } #for data extraction, minimum temperature is best
    )

    return llm

#

def validate_and_return_csv(response_text):
    #returns has_error, response_content, err 
    try:
        csv_io = StringIO(response_text)
        return False, pd.read_csv(csv_io), None #attempt to load response CSV into a dataframe
    
    except Exception as err:
        return True, response_text, err

#

def get_csv_response(input_content): #text-to-text client function
    
    llm = get_llm()

    response = llm.invoke(input_content) #the text response for the prompt
    
    return validate_and_return_csv(response)

