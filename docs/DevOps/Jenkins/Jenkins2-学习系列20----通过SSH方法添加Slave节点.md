#### 概念介绍

#### 节点
节点分为主节点master和代理节点agent。
在Jenkins 2中，节点是一个基础概念，代表了任何可以执行Jenkins任务的系统。节点中包含主节点和代理节点，有的时候也用于指代这些概念。此外，节点也可以是一个容器，比如Docker。

#### 主节点 master
Jenkins主节点是一个Jenkins实例(instance) 的主要控制系统。它能够完全访问所有Jenkins配置选项和任务(job) 列表。如果没有指定其他系统(system) ，它也是默认的任务执行节点。

Jenkins设计之初就支持master-slave的分支式架构。最佳实践是不要在master上跑业务job，而在slave上跑，这样不会拖累master，任何需要大量处理的任务都应该在主节点之外的系统上运行。性能与隔离两不误。

这样做的另一个原因是，凡是在主节点上执行的任务，都有权限访问所有的数据、配置和操作，这会构成潜在的安全风险。同样值得注意的是，在主系统上不应该执行任何包含潜在阻塞的操作，因为主系统需要持续响应和管理各类操作过程。

此外，基于容器技术，可以轻松实现slave的标准化、集群化、弹性化，从而保障构建环境的一致性和资源有效利用率。这点后续文章我会介绍。

#### agent 代理节点
在早先版本的Jenkins中，代理节点被称为从节点(slave) ，其代表了所有非主节点的系统。这类系统由主系统管理，按需分配或指定执行特定的任务。例如，我们可以分配不同的代理节点针对不同的操作系统构建任务，或者可以分配多个代理节点并发地运行测试任务。
为了减少系统负载，降低安全风险，通常在子系统上只会安装一个轻量级的Jenkins客户端应用来处理任务，这个客户端应用对资源访问是受限的。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-97ed71c29d20c975.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Jenkins支持创建传统Slave，比如通过SSH方式添加一个机器作为Slave，配置一个或多个Executor，此Slave一般保持长连接状态，等待构建任务的分配和运行。这种类型的Slave往往直接挂载物理机或虚拟机，通过Jenkins UI可以查看Slave的状态，并对Slave进行管理。

除此之外，Jenkins对容器化Slave支持也很好，通过Docker插件，Kubernetes插件等根据构建需求动态提供容器作为Jenkins Slave，运行构建任务后及时销毁容器Slave。这种方式在Slave的自动扩容缩容上弹性比较好，也能大幅提高资源利用率。

添加agent可以通过JNLP协议，SSH协议

我们这里介绍如何添加另外一台物理机作为Master的Slave节点，两台都是Linux ubuntu 系统

####  添加物理机节点
实际就是让master jenkins用户可无密码访问slave

* Slave 机器

创建 jenkins 用户并设置密码 `sudo useradd jenkins`

* Master 机器

1. 登录master机器
2. 设置 jenkins 用户的密码，一般master上既然跑着Jenkins，安装时候就已经创建了jenkins用户  `sudo passwd jenkins`
3. 切换到 jenkins 用户 `su - jenkins` 路径一般是 `/var/lib/jenkins`
4. 生成 ssh key `ssh-keygen -t rsa -b 4096 -C "jenkins@your.com"` 邮箱可不配，得到 id_rsa 和 id_rsa.pub 俩文件
5. 复制 id_rsa 中的内容
6. Jenkins 中创建SSH类型的凭证，username 填 jenkins, private内容粘贴 id_rsa 中的内容
7. 上传 id_rsa.pub 到 slave 机器，`ssh-copy-id -p 4522 jenkins@slave机器的IP` -p是端口，如果是22可不加此参数。
8. 检查连通性， `ssh -p 4522 jenkins@slave机器的IP`
9. Jenkins - manage - manage nodes 添加节点

>  ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-0ca64b6ba31e4519.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>  ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-39905a4184d77b0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

成功的话可以看到Slave机器的信息
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f77c208f48134ec1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并且Slave的`/home/jenkins`中你会看到`remoting.jar`和remoting目录

我们来验证一下让新添加的slave工作，创建一个freestyle的job，

General 选项卡：勾选"Restrict where this project can be run"，Label Expression 中填写我们起的label，如linux，会有自动提示。
Build 选项卡：添加 Execute shell，内容填在slave中执行的命令，如`ps -ef`
最后保存，build，查看 Console Output 结果。应该和直接在slave上执行的结果一致。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-557272ff5d41c9e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果新建的job类型是pipeline，等价的写法如下：
```groovy
pipeline {
  agent {
    label 'linux'
  }
  stages {
     stage ('testing') {
         steps {
           sh "ps -ef"
         }
     }
  }
}
```
下篇文章会有更多的pipeline agent语法介绍

#### 参考
* [https://www.howtoforge.com/tutorial/ubuntu-jenkins-master-slave/](https://www.howtoforge.com/tutorial/ubuntu-jenkins-master-slave/)
* [https://stackoverflow.com/questions/41734737/why-jenkins-says-server-rejected-the-1-private-keys-while-launching-the-agen](https://stackoverflow.com/questions/41734737/why-jenkins-says-server-rejected-the-1-private-keys-while-launching-the-agen)
