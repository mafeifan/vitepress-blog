## 教程

https://dev.amazoncloud.cn/experience/cloudlab?id=65fd7f888f852201f9704488


Titan Text G1 - Express 就是垃圾，根本不能用

![](https://pek3b.qingstor.com/hexo-blog/202404221712781.png)

```bash
aws bedrock-runtime invoke-model \
--model-id meta.llama2-13b-chat-v1 \
--body "{\"prompt\":\"[INST]Find the issue in this code below. Explain your reason\\nimport torch\\ntorch.device(\\\"cuda:0\\\" if torch.cuda.is_available() else \\\"cpu\\\")\\ndef run_som_func(a, b):\\nc = c*2\\nc=a+b\\nprint(c)\\nreturn c ^ 2\\nI get an error saying variable referred before[/INST]\",\"max_gen_len\":512,\"temperature\":0.5,\"top_p\":0.9}" \
--cli-binary-format raw-in-base64-out \
--region us-east-1 \
invoke-model-output.txt
```

```bash
curl 'https://dev-media.amazoncloud.cn/doc/workshop.zip' --output workshop.zip
unzip workshop.zip
pip3 install -r bedrock/workshop/setup/requirements.txt -U

# add code for labs/api/bedrock_api.py

python bedrock/workshop/labs/api/bedrock_api.py

streamlit run bedrock/workshop/labs/text/text_app.py --server.port 8080

streamlit run bedrock/workshop/labs/streaming/streaming_app.py --server.port 8080
```

## LangChain
LangChain可以抽象出使用Boto3客户端的许多细节，尤其是当你想专注于文本输入和文本输出时。
