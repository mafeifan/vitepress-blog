通常情况下我们都是将项目托管到Github，Coding等服务商。如果你有一台自己的Linux云主机，在上面搭建Git服务器比想象中要简单的多。这篇文章讲解如何搭建Git服务器及使用git的hook机制(使用post-receive这个hook，在git服务器受到push请求，并且接受完代码提交时触发)

大致要执行下面的命令
```
# 创建一个名为git的用户，专门访问仓库，这里会问一系列问题，包括设置用户密码，请牢记
sudo adduser git
# 配置SSH，无密码访问服务器，这里不是本文重点，关于SSH配置请自行搜索，要创建 home/git/.ssh 目录，并设置权限
sudo chmod 700 /home/git/.ssh  
chmod 600 authorized_keys
# 创建项目目录，这里没有放到用户目录下
mkdir -p /usr/git_repo/gittest.git && cd ..  
# 建立一个裸仓库并设置该仓库目录的组权限为可写。
# 裸仓库就是一个只包含.git子目录的内容，不包含其他资料。
git init --bare --shared

# 好，服务端的仓库已经创建，下面是本地操作

# 开发人员小马先在本地创建一个git项目，将刚才创建的仓库设置为项目的远程仓库并推送分支。
git init
touch readme && vi readme
git add .
git commit -m 'add readme'
git remote add origin git@cloud:/usr/git_repo/gittest.git
git push origin master

# 小张作为另外一个开发人员，可以直接clone项目，并推送自己的改动
# 本地尝试访问并拉仓库。cloud是我配置ssh主机名称，也可以是IP地址或域名
# 如果不成功检查SSH的配置
git clone git@cloud:/usr/git_repo/gittest.git
cd gittest
vi readme
git commit -am 'fix the readme file'
git push origin master
```

是不是和Github的 `git clone git@github.com:mafeifan/smzdm.git` 很类似？但是Github还支持HTTP协议，比如 `https://github.com/mafeifan/smzdm.git` 想达到同样的目的，需要在服务器上针对apache或nginx配置 [git-http-backend](https://git-scm.com/book/zh/v2/%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84-Git-Smart-HTTP)。

## 使用服务器的hook
每当本地push代码，还得在服务器上git pull。这样太麻烦了。git支持hook机制，类似事件通知，比如git服务器收到push请求，并且接受完代码提交时触发。需要在hooks目录下创建post-receive文件
服务器操作
```
cd /usr/git_repo/gittest.git/hooks
sudo cp post-update.sample  post-receive
# 编辑post-receive内容为
echo $(date) >> hook.log
```
这样push代码到服务器，就会多出一个记录时间的hook.log
你可以优化内容，比如执行代码检查，git pull代码到/var/www，npm install，等操作。

## 使用托管网站的web-hook
以bitbucket为例，我在上面创建一个nodejs项目叫git-deploy-demo，暴露一个接口叫deploy，必须是post方法。项目跑在我自己的主机叫cloud。每次push代码，我让他调用这个deploy接口
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-6a41eb3e26a43784.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
关于deploy接口，接收调用后执行update.sh脚本
```
const exec = require('child_process').exec;
app.post('/deploy', (req, res) => {
  const commands = 'sh ./update.sh';
  exec(commands, (err, out, code) => {
  	if (res.statusCode === 200) {
  		res.send('deploy done');
  	}else {
  		res.send(out)
  	}
  })
```

update.sh内容如下：
```
#!/bin/bash
git pull
npm install
sudo pm2 restart git-deploy-demo
```


## 参考：
* [服务器上的-Git-协议](https://git-scm.com/book/zh/v2/%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84-Git-%E5%8D%8F%E8%AE%AE)
* [Coding Webhook 自动部署Git项目](https://www.codecasts.com/series/something-that-a-little-helpful/episodes/3)
* [通过git自动部署WEB服务上的PHP代码，提交即生效](http://www.yinqisen.cn/blog-675.html)
* 需FQ [Git push deployment in 7 easy steps.md](https://gist.github.com/thomasfr/9691385)
