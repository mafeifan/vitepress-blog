#### 最开始的方案，在服务器直接拉代码部署
通过ssh登录服务器，然后执行git pull, npm build等构建命令 
需要提前在github仓库的setting页面配置ssh host，password，user等环境变量

**优点**：简单粗暴

**缺点**：直接在服务器上拉代码并不是最好的办法，而且还需要配置ssh，对于前端项目一般只需要构建后的dist目录。而且有时候国内服务器直接拉github仓库的代码会超时。

```yaml
# This is a basic workflow to help you get started with Actions

name: CI

# Controls when the action will run. Triggers the workflow on push or pull request
# events but only for the master branch
on:
  push:
    branches: [ master, develop ]
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
        script: cd /home/mafei20191103/IntoGolfV3 && git reset --hard origin/develop && git pull && npm run prod && php artisan migrate && composer install && php artisan telescope:prune && composer dump-autoload -o;

    # Slack Notification
    - name: Slack Notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        fields: repo,message,commit,author,action,eventName,ref,workflow,job,took # selectable (default: repo,message)
      env:
        GITHUB_TOKEN: ${{ secrets.PERSONAL_TOKEN }} # optional
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }} # required
      if: always() # Pick up events even if the job fails or is canceled.

```

#### 优化方案，使用rsync 同步文件
基于[ssh deploy](https://github.com/marketplace/actions/ssh-deploy)
原理是在action的机器中拉代码，构建，然后使用rsync命令将产物同步到目标服务器的指定目录中

**好处**：解决了超时问题，同步速度也不慢

待优化，如果文件非常多，是否可以压缩后然后再目标服务器上解压。

