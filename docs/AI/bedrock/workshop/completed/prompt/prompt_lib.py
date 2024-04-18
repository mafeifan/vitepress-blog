from langchain_community.llms import Bedrock
from langchain_community.chat_models import BedrockChat
from langchain.prompts import PromptTemplate


def get_inference_parameters(model_id, temperature): #return a default set of parameters based on the model's provider
    bedrock_model_provider = model_id.split('.')[0] #grab the model provider from the first part of the model id
    
    if (bedrock_model_provider == 'anthropic'): #Anthropic model
        return { #anthropic
            "max_tokens": 4000,
            "temperature": temperature, 
            "top_k": 250, 
            "top_p": 1, 
            "stop_sequences": ["\n\nHuman:"] 
           }
    
    elif (bedrock_model_provider == 'ai21'): #AI21
        return { #AI21
            "maxTokens": 4000, 
            "temperature": temperature, 
            "topP": 0.5, 
            "stopSequences": [], 
            "countPenalty": {"scale": 0 }, 
            "presencePenalty": {"scale": 0 }, 
            "frequencyPenalty": {"scale": 0 } 
           }
    
    elif (bedrock_model_provider == 'cohere'): #COHERE
        return {
            "max_tokens": 4000,
            "temperature": temperature,
            "p": 0.5,
            "k": 0,
            "stop_sequences": [],
            "return_likelihoods": "NONE"
        }
    
    elif (bedrock_model_provider == 'meta'): #META
        return {
            "temperature": temperature,
            "top_p": 0.9,
            "max_gen_len": 2000 #temp
        }
    
    elif (bedrock_model_provider == 'mistral'): #MISTRAL
        return {
            "max_tokens" : 4000,
            "stop" : [],    
            "temperature": 0,
            "top_p": 0.9,
            "top_k": 50
        }
    
    else: #Amazon
        #For the LangChain Bedrock implementation, these parameters will be added to the 
        #textGenerationConfig item that LangChain creates for us
        return { 
            "maxTokenCount": 4000, 
            "stopSequences": [], 
            "temperature": temperature, 
            "topP": 0.9 
        }


def get_llm(model_id, temperature):
    
    model_kwargs = get_inference_parameters(model_id, temperature)
    
    bedrock_model_provider = model_id.split('.')[0] #grab the model provider from the first part of the model id
    
    if bedrock_model_provider == 'anthropic' or bedrock_model_provider == 'mistral' or bedrock_model_provider == 'meta' or bedrock_model_provider == 'amazon':
        llm = BedrockChat(
            model_id=model_id, #set the foundation model
            model_kwargs=model_kwargs) #configure the properties for the LLM
        
        is_chat = True
    else:
        llm = Bedrock(
            model_id=model_id, #set the foundation model
            model_kwargs=model_kwargs) #configure the properties for the LLM
        
        is_chat = False
    return llm, is_chat


def read_file(file_name):
    with open(file_name, "r") as f:
        text = f.read()
     
    return text


def get_context_list():
    return ["Prompt engineering basics", "Content creation", "Summarization", "Question and answer", "Translation", "Analysis: Positive email", "Analysis: Negative email", "Code", "Advanced techniques: Claude"]


def get_context(lab):
    if lab == "Prompt engineering basics":
        return read_file("basics.txt")
    if lab == "Summarization":
        return read_file("summarization_content.txt")
    elif lab == "Question and answer":
        return read_file("qa.txt")
    elif lab == "Analysis: Positive email":
        return read_file("analysis_positive.txt")
    elif lab == "Analysis: Negative email":
        return read_file("analysis_negative.txt")
    elif lab == "Content creation":
        return read_file("qa.txt")
    elif lab == "Translation":
        return read_file("qa.txt")
    elif lab == "Code":
        return ""
    elif lab == "Advanced techniques: Claude":
        return read_file("summarization_content.txt")


def get_prompt(template, context=None, user_input=None):
    
    prompt_template = PromptTemplate.from_template(template) #this will automatically identify the input variables for the template
    
    if "{context}" not in template:
        prompt = prompt_template.format()
    else:
        prompt = prompt_template.format(context=context) #, user_input=user_input)
    
    return prompt



def get_text_response(model_id, temperature, template, context=None, user_input=None): #text-to-text client function
    llm, is_chat = get_llm(model_id, temperature)
    
    prompt = get_prompt(template, context, user_input)
    
    response = llm.invoke(prompt) #return a response to the prompt
    
    if is_chat:
        response = response.content
    
    print(response)
    
    return response
