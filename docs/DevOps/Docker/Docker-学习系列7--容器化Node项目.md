本节我们自己打包一个docker镜像并发布到官方的镜像仓库中。这样任何人只需执行以下命令： 
`docker run -d -p 3000:3000  finleyma/express` 就可以访问一个简单的express程序了。

需要你有简单的express使用经验
实现过程非常简单：
1. 本地全局安装 `npm install express-generator -g`
2. 初始化一个express项目 `express myapp`
3. cd myapp，然后 npm run start，项目就在本地运行了。
4. 我们在项目内建立Dockerfile，内容如下：
```bash
FROM node:10.8.0-alpine
MAINTAINER www.mafeifan.com
# 设置工作目录，下面的RUN命令会在工作目录执行
WORKDIR /app
# 先拷贝本地的 package.json 和 package-lock 到容器内
# 这样是利用docker的镜像分层机制
COPY package*.json ./
# 安装项目依赖包
# 生产环境可以运行 RUN npm install --only=production 只按照 package.json 中dependencies定义的模块
RUN npm install
# 将根目录下的文件都copy到container（运行此镜像的容器）文件系统的app文件夹下
ADD . /app/
# 暴露容器内的3000端口
EXPOSE 3000
# 容器启动时执行的命令，类似npm run start
CMD ["npm", "start"]
```
5. 构建镜像 `docker build -t finleyma/express .`
别忘了最后的点，表示当前目录
6. 启动容器 `docker run -d -p 3000:3000 finleyma/express`
7. 可选，登录docker hub, 并提交镜像。`docker login`,  `docker push finleyma/express`
8. 进入容器 `docker run -it --rm  finleyma/express:1.0 ash`
简要说下参数：
* -it：这是两个参数，一个是 -i：交互式操作，一个是 -t 终端。我们这里打算进入 容器 执行一些命令并查看返回结果，因此我们需要交互式终端。
* --rm：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 docker rm。我们这里只是随便执行个命令，看看结果，不需要排障和保留结果，因此使用 --rm 可以避免浪费空间。
* ash：因为我们的Node的基础镜像是10.8.0-alpine， alpine的交互式 Shell是ash不是bash，使用bash会提示not found。注意这个细节。
会发现整个项目文件都在容器内。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-b0ac3d1703181ffa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

简单总结使用Docker的好处：
1. 使用版本方便，比如服务器上跑着node6，而你的项目需要node8以上。使用docker因为是隔离环境
2. 部署分享也方便，一行命令完事

问题：容器内的 node_modules 是本来就有还是容器执行 npm install 产生的呢？
答案：是构建的时候打包进镜像内了。我们看一下体积，有20M而且进到容器内， ls -l node_modules 时间也是打包的什么，并不是当前时间。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-aee960c96b2a23bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 参考：
* https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
* https://www.imooc.com/article/19840
* https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
