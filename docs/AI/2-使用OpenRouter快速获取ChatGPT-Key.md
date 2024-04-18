## OpenRouter 快速获取 ChatGPT API Key

OpenRouter是一个开源的API代理服务，可以免费使用ChatGPT的API，支持自定义接口，模型等，关键你可以一个key同时调用多个模型

### 前提

* Visa信用卡
* 谷歌账号
* 已经部署了ChatGPTNextWeb，或支持自定义接口

1. 打开 https://openrouter.ai 使用 google 账号登录
2. 点顶部的 Credits 绑定信用卡，这里我充值 10 美元，注意 openrouter 会额外收一定的手续费

![](https://pek3b.qingstor.com/hexo-blog/202404180926085.png)

3. 进到 https://openrouter.ai/keys 页面，点 create key，起个名字

最好也填上 Credit Limit, 这里我填5，超过5美元后就会自动停用

最终我们拿到 sk 开头的key

![](https://pek3b.qingstor.com/hexo-blog/202404180941224.png)

4. 进到已经部署了ChatGPTNextWeb的配置页面

* 接口地址: https://openrouter.ai/api
* API Key: 填写 OpenRouter sk 开头的key

![](https://pek3b.qingstor.com/hexo-blog/202404181026587.png)

切换模型，验证是否生效

![](https://pek3b.qingstor.com/hexo-blog/202404181029186.png)

![](https://pek3b.qingstor.com/hexo-blog/202404181029336.png)

![](https://pek3b.qingstor.com/hexo-blog/202404181030172.png)
