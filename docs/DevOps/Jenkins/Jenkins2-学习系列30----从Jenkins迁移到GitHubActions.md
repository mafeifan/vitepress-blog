Github推出了自己的CI服务，叫[Actions](https://docs.github.com/en/actions)
对于个人或小的，部署需求也非常简单的项目，非常推荐使用Github Actions。

## 比起Jenkins的优势：
1. 比起自己搞服务器，安装部署Jenkins省事多了
2. 免费提供了每月2000分钟构建时长，和2核7G内存硬件配额，算是非常大方了。
3. Actions workflow 语法简单，如果你懂Jenkins pipeline几分钟就可以转移过去。

关于Jenkins pipeline和Action的语法区别。官方文档有[表格](https://docs.github.com/cn/actions/learn-github-actions/migrating-from-jenkins-to-github-actions)

Github Action 使用非常简单，我专门录制了[视频-Github Action 实现SSH登录部署和Slack通知](https://www.bilibili.com/video/BV1wt4y1X7sY)

这里贴下我正在使用的workflow脚本。具体讲解可以见[Github Actions系列](/DevOps/GithubActions/入门)

流程非常简单 本地提交代码 -> SSH登录到远程服务器 -> 执行构建命令 -> 执行成功发送Slack通知
```yaml
# This is a basic workflow to help you get started with Actions

name: CI

# Controls when the action will run. Triggers the workflow on push or pull request
# events but only for the master branch
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:

    # Runs a single command using the runners shell
    - name: Run a one-line script
      run: echo Hello, world!

    # Runs a set of commands using the runners shell
    - name: SSH Remote Commands
      uses: appleboy/ssh-action@v0.1.2
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.PRIVATE_KEY }}
        port: ${{ secrets.PORT }}
        script: cd /var/www/vue-press && git pull && npm i && npm run build

    # Slack Notification
    - name: Slack Notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        fields: repo,message,commit,author,action,eventName,ref,workflow,job,took # selectable (default: repo,message)
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # optional
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }} # required
      if: always() # Pick up events even if the job fails or is canceled.
```

更多信息见官方文档，这是个好习惯

## 参考
https://docs.github.com/en/actions/learn-github-actions
