本篇告诉你：
* 阿里云设置容器镜像服务
* Jenkins 指定 Docker agent 拉代码基于 Dockerfile 构建镜像并上传到阿里云镜像仓库

1. 登录阿里云账号，在产品服务中搜索“容器镜像服务”，首先我们先创建一个命名空间，一个命名空间可以包含多个镜像仓库，你可以理解为项目组

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-dbed731e07a40061.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 然后来到镜像仓库，创建一个新的镜像仓库，一个镜像仓库其实对应一个项目的代码仓库

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-4cd69c040fd0abac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 这里拉仓库代码和Docker构建，我不希望让阿里云帮我构建，而是在Jenkins完成，只是构建完成后并上传到这个刚创建的镜像仓库中。
所以选择“本地仓库”

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-fa839047956029b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至此，我们获得了一个阿里云提供的私有仓库地址，点击操作的管理页面，会有具体的操作指南

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-11683df3222dd009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 复制镜像地址 `registry.cn-zhangjiakou.aliyuncs.com/fineyma/node-demo`

5. Jenkins 中新建一个 freestyle 项目，填写Git仓库地址，添加构建步骤，Build - Add build step - Publish Docker Image

* Image： 粘贴刚复制的地址，同时勾选 push image，这里表示构建完成，推到我们刚创建的镜像仓库中

* Registry Credentials 需针对阿里云容器仓库新建凭证，就是 docker login 时输入的账号和密码，可以先到阿里云-容器镜像服务-访问凭证中设置固定的密码。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-74711ed949065127.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

需要注意镜像名称要填写完整 `registry.cn-zhangjiakou.aliyuncs.com/fineyma/node-demo:${BUILD_NUMBER}-${GIT_PREVIOUS_COMMIT}`
格式是 `registry地址/命名空间/镜像仓库名:tag`

其中 tag 为了保证唯一，使用了 Jenkins 提供的`GIT_PREVIOUS_COMMIT`和`BUILD_NUMBER`环境变量

6. 点击构建，查看日志，看到 Docker Build Done

阿里云中也可以看到刚刚构建的镜像，注意查看版本

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-c86fa207e41ca750.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

版本号其实就是自增的构建次数+commit_id，是和仓库的提交id一致的 [https://github.com/mafeifan/docker-express-demo/commit/c5636e58f3603e8a40fed6dd8d991db09f80b156](https://github.com/mafeifan/docker-express-demo/commit/c5636e58f3603e8a40fed6dd8d991db09f80b156)

所以在任何装有Docker的主机上，根据提交id，我们就可以方便的docker run部署和回滚项目

 怎么用pipeline实现同样的操作呢，请见下篇

#### 心得
生成环境部署Docker容器还是方便非常的， 比较费时的是寻找好的Docker基础镜像和写好Dockerfile，尽量让Dockerfile打包生成的镜像小些，而Dockerfile一般基于Linux，所以掌握好Linux基础知识是关键。

