from langchain_community.llms import Bedrock
from langchain.prompts import PromptTemplate

#

def get_llm():
    
    model_kwargs = { #AI21
        "maxTokens": 1024, 
        "temperature": 0, 
        "topP": 0.5, 
        "stopSequences": [], 
        "countPenalty": {"scale": 0 }, 
        "presencePenalty": {"scale": 0 }, 
        "frequencyPenalty": {"scale": 0 } 
    }
    
    llm = Bedrock(
        model_id="ai21.j2-ultra-v1", #set the foundation model
        model_kwargs=model_kwargs) #configure the properties for Claude
    
    return llm

#

def get_prompt(adjective, noun, verb):
    
    template = "Tell me a story about a {adjective} {noun} who loves to {verb}:"

    prompt_template = PromptTemplate.from_template(template) #this will automatically identify the input variables for the template

    prompt = prompt_template.format(noun=noun, adjective=adjective, verb=verb)
    
    return prompt

#

def get_text_response(adjective, noun, verb): #text-to-text client function
    llm = get_llm()
    
    prompt = get_prompt(adjective, noun, verb)
    
    return llm.invoke(prompt) #return a response to the prompt

#

