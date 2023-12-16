制品是软件开发过程中产生的多种有形副产品之一，个人理解，比如前端build后产生的dist静态资源文件，安卓打包生成的apk文件，这些产物都可以认为是制品。
制品的使用可以非常简单。
比如下面的流水线Job。
第一步拉代码，仓库中存在一个名为`Dockerfile`的文件。
第二步把文件存为制品。
```groovy
#!groovy

pipeline {
    agent any
    stages {
        stage('checkout')  {
            steps {
               git 'https://git.dev.tencent.com/finley/angular-js.git'
               archiveArtifacts 'Dockerfile'
            }
        }        
    }
}
```
然后在Jenkins 构建页面中就可以直接查看和下载制品
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d2f84760216093f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### archiveArtifacts 指令
参数：
* artifacts 只有这一个参数是必填的，需要归档的文件路径，可以是Ant文件风格的路径表达式
* fingerprint |  布尔  | 是否对归档文件进行签名
* excludes 需要排除的文件路径，可以是Ant文件风格的路径表达式
* onlyIfSuccessful  |  布尔  |  只在构建成功时进行归档
* allowEmptyArchive |  布尔 |  如果归档文件没有返回任何结果，不构建失败

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-09b0265b57e691c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 制品管理软件
制品多了话需要管理，单靠Jenkins有点力不从心了，需要专门的制品管理软件，目前流行的有[Nexus Repository OSS](https://www.sonatype.com/download-oss-sonatype) 和 [Artifactory](https://jfrog.com/open-source/)
他们都提供免费的社区版和收费的专业版，安装可以使用Docker镜像，省时省力。

以Nexus为例，制品软件系统到底有啥用呢，通过[官方文档](https://help.sonatype.com/repomanager3/formats)，通过Nexus制品管理软件。有以下功能
可以方便的搭建使用自己的私有Docker仓库，Composer， NPM，Raw(任何文件格式) 等。
更好的文件分类，更好的角色权限控制
支持REST API
更好的备份恢复机制
所以个人觉得大公司很有必要建立的自己制品管理系统。

缺点: 自己搭建和维护，需要一定服务器运行成本

制品管理软件详细的使用本文不再展开，大家参照文档即可，大致流程是: 搭建制品仓库系统，Jenkins安装对应的插件，修改pipeline通过插件提供的指令上传制品到制品仓库。供系统项目或人员使用

如果只是为了Docker私有仓库，不用搭建Nexus，阿里云，腾讯云等公有云提供的有类似服务而且是免费的。

####  使用 nexus3 搭建 私有Docker仓库
最快的方法使
```bash
docker run -d --name nexus3 --restart=always \
    -p 8081:8081 \
    --mount src=nexus-data,target=/nexus-data \
    sonatype/nexus3
```
等待 3-5 分钟，如果 nexus3 容器没有异常退出，那么你可以使用浏览器打开 http://YourIP:8081 访问 Nexus 了。

第一次启动 Nexus 的默认帐号是 admin 密码是 通过 `docker exec -it nexus3 cat /nexus-data/admin.password` 获取，登录以后点击页面上方的齿轮按钮进行设置。

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-f8a2dbb16d4c1645.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

创建一个私有仓库的方法： Repository->Repositories 点击右边菜单 Create repository 选择 docker (hosted)

Name: 仓库的名称
HTTP: 仓库单独的访问端口
Enable Docker V1 API: 如果需要同时支持 V1 版本请勾选此项（不建议勾选）。
Hosted -> Deployment policy: 请选择 Allow redeploy 否则无法上传 Docker 镜像。
其它的仓库创建方法请各位自己摸索，还可以创建一个 docker (proxy) 类型的仓库链接到 DockerHub 上。再创建一个 docker (group) 类型的仓库把刚才的 hosted 与 proxy 添加在一起。主机在访问的时候默认下载私有仓库中的镜像，如果没有将链接到 DockerHub 中下载并缓存到 Nexus 中。

详细内容请自行查看 Nexus 文档

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-1b372b24c25ff95b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 参考
* [https://help.sonatype.com/repomanager3/formats/docker-registry](https://help.sonatype.com/repomanager3/formats/docker-registry)
* [https://jfrog.com/open-source/#](https://jfrog.com/open-source/#)
* [https://yeasy.gitbooks.io/docker_practice/repository/nexus3_registry.html](https://yeasy.gitbooks.io/docker_practice/repository/nexus3_registry.html)
