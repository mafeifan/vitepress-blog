之前讲解了Docker镜像的分层机制，本节介绍下Docker的分层缓存机制。

为了加快构建速度，Docker实现了缓存：
如果Dockerfile和相关文件未更改，则重建(rebuild)时可以重用本地镜像缓存中的某些现有层。
但是，为了利用此缓存，您需要了解它的工作方式，这就是我们将在本文中介绍的内容。


我们来看一个使用以下Dockerfile的示例：
```dockerfile
FROM python:3.7-slim-buster
COPY . .
RUN pip install --quiet -r requirements.txt
ENTRYPOINT ["python", "server.py"]
```

第一次运行时，所有命令都会运行：
```bash
$ docker build -t example1 .
Sending build context to Docker daemon   5.12kB
Step 1/4 : FROM python:3.7-slim-buster
 ---> f96c28b7013f
Step 2/4 : COPY . .
 ---> eff791eb839d
Step 3/4 : RUN pip install --quiet -r requirements.txt
 ---> Running in 591f97f47b6e
Removing intermediate container 591f97f47b6e
 ---> 02c7cf5a3d9a
Step 4/4 : ENTRYPOINT ["python", "server.py"]
 ---> Running in e3cf483c3381
Removing intermediate container e3cf483c3381
 ---> 598b0340cc90
Successfully built 598b0340cc90
Successfully tagged example1:latest
```


第二次构建时，因为没有任何改变，docker构建将使用镜像缓存：
```bash
$ docker build -t example1 .
Sending build context to Docker daemon   5.12kB
Step 1/4 : FROM python:3.7-slim-buster
 ---> f96c28b7013f
Step 2/4 : COPY . .
 ---> Using cache
 ---> eff791eb839d
Step 3/4 : RUN pip install --quiet -r requirements.txt
 ---> Using cache
 ---> 02c7cf5a3d9a
Step 4/4 : ENTRYPOINT ["python", "server.py"]
 ---> Using cache
 ---> 598b0340cc90
Successfully built 598b0340cc90
Successfully tagged example1:latest
```

请注意，上面显示的Using cache加快了构建速度(无需从网络下载任何pip依赖包)

如果我们删除镜像，则后续构建将从头开始(没有层缓存了)：
```bash
$ docker image rm example1
Untagged: example1:latest
Deleted: sha256:598b0340cc90967501c5c51862dc586ca69a01ca465f48232fc457d3ab122a73
Deleted: sha256:02c7cf5a3d9af1939b9f5286312b23898fd3ea12b7cb1d7a77251251740a806c
Deleted: sha256:d9e9602d9c3fd7381a8e1de301dc4345be2eb2b8488b5fc3e190eaacbb2f9596
Deleted: sha256:eff791eb839d00cbf46d139d8595b23867bc580bb9164b90253d0b2d9fcca236
Deleted: sha256:53d34b2ead0a465d229a4260fee2a845fb8551856d4019cd2e608dfe0e039e77
$ docker build -t example1 .
Sending build context to Docker daemon   5.12kB
Step 1/4 : FROM python:3.7-slim-buster
 ---> f96c28b7013f
Step 2/4 : COPY . .
 ---> 63c32b9b1af6
...
```

缓存算法还有一个更重要的规则：

#### 如果某层无法应用层缓存，则后续层都不能从层缓存加载
在以下示例中，前后两次构建过程的C层均未更改，尽管如此，由于上层并不是从层缓存中加载，因此后置的C层仍然无法从缓存中加载：

![](https://pek3b.qingstor.com/hexo-blog/2025/12/11/21-38-05-79503e54c8f50738fa83d81278c7bc86-50-03-3cb3e531-ba7f-4705-8408-e920da6f3c38-150f68.png)

层缓存对下面的Dockerfile意味着什么？
```dockerfile
FROM python:3.7-slim-buster
COPY requirements.txt .
COPY server.py .
RUN pip install --quiet -r requirements.txt
ENTRYPOINT ["python", "server.py"]
```

如果COPY命令的任何文件改变了，则会使后续所有层缓存失效：我们需要重新运行pip install。
但是，如果server.py更改了，但requirements.txt却没有更改，为什么我们必须重做pip安装？毕竟，pip安装仅使用requirements.txt。

推及到现代编程语言：前端的依赖包文件package.json, dotnet的项目管理文件dotnetdemo.csproj等，一般很少变更；随时变动的业务代码，导致后续的层缓存失效(后续层每次都要重新下载&安装依赖)。

因此，要做的是仅复制实际需要运行下一步的那些文件，以最大程度地减少缓存失效的机会。

```dockerfile
FROM python:3.7-slim-buster
COPY requirements.txt .
RUN pip install --quiet -r requirements.txt
COPY server.py .
ENTRYPOINT ["python", "server.py"]
```

如果想通过重用之前缓存的层来进行快速构建，则需要适当地编写Dockerfile：

* 仅复制下一步所需的文件，以最大程度地减少构建过程中的缓存失效。
* 尽量将文件可能变更的新增(ADD命令)、拷贝(COPY命令) 延迟到Dockerfile的后部。
