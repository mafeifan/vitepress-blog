# 新版本更简单

from langchain_aws import BedrockLLM

# Initialize the Bedrock LLM
llm = BedrockLLM(
    credentials_profile_name="bedrock",
    model_id="anthropic.claude-v2:1",
    streaming=True
)

# Invoke the llm
response = llm.invoke("Hello! How are you today?")
print(response)
