某些网络环境下，我们拉取不到官方docker hub的镜像。
提供几种思路：

1. 提前用`docker pull`把镜像拉到本地

2. 搭建内部使用的镜像仓库，把镜像同步进来

流程也非常简单，docker pull先拉下来，然后重新打tag，最后push到我们自己的仓库
```shell
sudo docker pull registry.cn-hangzhou.aliyuncs.com/lfy_ruoyi/ruoyi-visual-monitor:v2
docker images
docker tag eb5aeb93fe3b finleyma/ruoyi-visual-monitor:v2
docker login
docker push finleyma/ruoyi-visual-monitor:v2
```

更进一步，创建俩文件一个是待同步的镜像列表，一个是脚本文件，执行后会同步镜像

run.sh

```
#!/bin/bash

file="images.txt"
username="finleyma"

while read -r line
do
	new_image=`echo ${line#*/} | sed 's|/|-|g'`
	echo "docker pull ${line}"
	echo "docker tag ${line} ${username}/${new_image}"
	echo "docker push v5cn/${new_image}"
done < "$file"
```

images.txt

```
k8s.gcr.io/defaultbackend-amd64:1.5
k8s.gcr.io/ingress-nginx/controller:v0.46.0
k8s.gcr.io/pause:3.2
k8s.gcr.io/kube-controller-manager:v1.19.7
k8s.gcr.io/kube-scheduler:v1.19.7
k8s.gcr.io/kube-proxy:v1.19.7
k8s.gcr.io/kube-apiserver:v1.19.7
k8s.gcr.io/etcd:3.4.13-0
k8s.gcr.io/coredns:1.7.0
quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.26.1
```


3. 其实harbor自带了镜像同步功能

以一个把dockerhub的名称为finleyma/raco-bird的镜像同步到harbor为例

左侧菜单：仓库管理 - 创建目标，弹出的对话框中

目标名: hub.docker.com
	
目标URL:  https://hub.docker.com

左侧菜单：复制管理 - 添加规则

* 名称: raco-bird
* 描述: 同步docker hub的finleyma/raco-bird到harbor

![](http://pek3b.qingstor.com/hexo-blog/20211010174053.png)

* 源资源过滤器: finleyma/raco-bird
* Ta: latest
* 触发模式: 手动
* 勾选: 覆盖和启动规则

点击"复制"按钮


![](http://pek3b.qingstor.com/hexo-blog/20211010174341.png)

4. 使用工具 [image-syncer](https://github.com/AliyunContainerService/image-syncer)

涉及到下载和上传，注意服务器上传带宽限制


## 参考

https://www.lishuai.fun/2020/11/05/harbor-proxy/
