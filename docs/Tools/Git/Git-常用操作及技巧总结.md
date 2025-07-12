#### git push --force
使用 `git push --force` 可以覆盖上一次的push提交。不过一般不推荐这么做

#### git rebase
合并本地多个还没有push过的commit
使用 git rebase , 比如合并最近两次的commit 。`git rebase HEAD~2 `

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-b3a4fc7bd865db42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

-i 出现交互界面 
* pick：正常选中 
* reword：选中，并且修改提交信息； 
* edit：选中，rebase时会暂停，允许你修改这个commit（参考这里） 
* squash：选中，会将当前commit与上一个commit合并 
* fixup：与squash相同，但不会保存当前commit的提交信息 
* exec：执行其他shell命令

#### git commit --amend
* 修改commit信息 `git commit --amend`
* 修改commit的author `git commit --amend --author "New Author Name "`
* 修改commit的提交时间 `git commit --amend --date="$(date -R)" `

####  git pull
`git pull = git fetch + git merge` ， 所以 fetch 更安全些

#### git diff --name-only `<commit-id>`

需求: 某次远程提交的文件列表，并判断是否包含某文件类型
```
# 更新远程的变更
git fetch
# 查看提交历史，获取最后一次提交的commit id
git log origin/develop
```
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-a96518a543af4b4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
# 查看具体的提交内容
git show 2678b99db5be1d6870feecde243dffb6e59d4bcd
```
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-45ad2acc277ab22e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
# 只查看更新的文件
git diff --name-only 2678b99db5be1d6870feecde243dffb6e59d4bcd
结果只会列出 `app.js`
```

#### gitignore_global 全局忽略文件
不需要在每一个仓库中添加`.gitignore`文件，只需要在家目录下建立`.gitignore_global`文件就可以忽略我们想忽略的内容
```
touch ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore
```
内容为:
```
*~
.DS_Store
.idea
```

#### includeif 根据目录统一配置
问题：每次新建一个仓库，都得使用`git config user.email`配置邮箱和用户名而且，项目分公司的个人的，公司项目要使用公司邮箱maf@mycompany.com，个人邮箱是mafeifan@qq.com。
方案：gitconfig中有includeIf指令，使用他可以根据条件导入额外的配置

#### 维护全局配置文件

我的是在`~/.gitconfig`,也可能`/etc/gitconfig`也会存在一个系统级别的配置文件，这个文件可以设置全局的配置，比如邮箱，用户名等。

使用命令`git config --global core.editor emacs`本质就是编辑这个文件

使用`git config --list`查看当前git的配置信息,注意配置文件可能存在多处

使用`git config --list --show-origin`显示文件出处

#### 快速重写 git history

有时候 git commit 会不一致，公司邮箱和个人邮箱容器混用,最简单方法是使用 git-filter-repo

```bash
pip3 install git-filter-repo --break-system-packages
git filter-repo --force --email-callback  'return b"mafeifan@qq.com"'
git filter-repo --force --name-callback  'return b"mafeifan"'
```

[详见](https://www.git-tower.com/learn/git/faq/git-filter-repo)
