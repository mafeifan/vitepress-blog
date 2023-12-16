持续部署中需要将编译后的静态资源打包上传到S3服务中 ，就研究了下。
需要申请Amazon账号，得开通信用卡，可免费使用一年
然后开通S3服务，填写bucket名字，最后生成Access Key和Access Secret。
### 图形化工具：  
* Windows平台：
[http://s3browser.com/](http://s3browser.com/)

连接 bucket
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-f1768abeb95af95a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-419905c1b1ecbb78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* mac平台

推荐Transmit

### 命令行工具(awscli)：

* Windows平台：

[https://s3.amazonaws.com/aws-cli/AWSCLI64.msi](https://s3.amazonaws.com/aws-cli/AWSCLI64.msi)

* Mac平台：

参考：  [https://github.com/aws/aws-cli](https://github.com/aws/aws-cli)
```
sudo easy_install pip
sudo pip install awscli --ignore-installed six
# 根据提示输入 Origin, AccessKey, AccessSecret
aws configure
```
AWS Cli 操作文档：https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-e1a48b4783a9b6c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 开放访问权限
默认情况下文件对象和上传的文件不能公共下载的，比如访问 `https://s3-us-west-1.amazonaws.com/yourbucketname/README.md` 会提示 access deny。
如果需要对某目录下的文件开发公共访问权限，可以这么干，
打开 [策略生成器](https://awspolicygen.s3.amazonaws.com/policygen.html)
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-dfcf1c96c11c4eb6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击 generate policy,复制 json配置内容，粘贴到存储桶策略中

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-dc7cb33619d96f59.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
