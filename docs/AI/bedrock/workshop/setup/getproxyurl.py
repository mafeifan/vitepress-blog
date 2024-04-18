import json
import boto3

with open("/opt/ml/metadata/resource-metadata.json") as f:
    resource_metadata = json.load(f)

domain_id = resource_metadata["DomainId"]

sess = boto3.session.Session()
region = sess.region_name

text_color = '\033[32m'
link_color = '\033[33m'
no_color = '\033[0m'

print(f"{text_color}--------------------------------------------------------------------------------------")
print("CLICK THE URL BELOW TO VIEW YOUR STREAMLIT APP: ")
print(f"{link_color}")
print(f"https://{domain_id}.studio.{region}.sagemaker.aws/jupyter/default/proxy/8501/")
print(f"{text_color}")
print("If you are running multiple Streamlit apps, you may need to change the number")
print("after 'proxy/' to match the port indicated by Streamlit.")
print(f"--------------------------------------------------------------------------------------{no_color}")

