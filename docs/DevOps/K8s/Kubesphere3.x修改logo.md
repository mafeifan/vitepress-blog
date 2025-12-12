首先 kubesphere 的前端叫 [console](https://github.com/kubesphere/console) 基于react开发的。
logo文件保存在[这里](https://github.com/kubesphere/console/blob/master/src/assets/logo.svg)

所以只要把这个文件替换掉即可。

比较省事的做法是进到 console 镜像所在的 node 节点，然后docker exec进到容器，替换掉svg文件即可

需要注意的是要使用 root 用户进到容器，不然没有操作权限

> 注意：容器重启了 logo 还会还原

> 商业用途请联系 kubesphere 商务，这里只是本地实验

查看 ks-console 在哪个节点上运行

`kubectl describe pods -l app=ks-console -n kubesphere-system | grep "Node"`

比如显示 master

ssh 登录到 master 机器节点，进入到容器
```bash
# 查看console的容器ID
sudo docker ps | grep "console"
834fe7c6a782        kubespheredev/ks-console   "docker-entrypoint.s…"   2 weeks ago         Up 2 weeks                              k8s_ks-console_ks-console-7684cb7965-jwl9z_kubesphere-system_17a82fb7-b315-4ba5-a518-580ec8caa5fc_0
# 进入容器
sudo docker exec -it -u root 834fe7c6a782 /bin/ash
```

以下是容器内执行

````bash
cd dist/
mv assets/logo.svg  assets/logo2.svg
wget https://www.osvlabs.com/static/icons/logo.svg
mv logo.svg assets/
````

## 关于语言文本

kubesphere本身支持多语言，语言文件在dist目录。以locale开头，比如打开locale-en.6ea577bc5b07101a8d52.json
搜索'KS_DESCRIPTION'替换掉描述文本

![](https://pek3b.qingstor.com/hexo-blog/微信图片_20220108183704.png)

![](https://pek3b.qingstor.com/hexo-blog/20220108184418.png)

![](https://pek3b.qingstor.com/hexo-blog/20220303172934.png)

## 参考
https://stackoverflow.com/questions/42793382/exec-commands-on-kubernetes-pods-with-root-access
