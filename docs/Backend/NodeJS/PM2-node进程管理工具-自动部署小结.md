2018-04-12 更新pm2的权限问题

PM2 的功能不多做介绍了，总之使用简单，功能强大。
今天实现了本地自动部署node项目到服务器的流程。简单总结下几个注意点。
建议先看 [文档](http://pm2.keymetrics.io/docs/usage/deployment/#getting-started)

1. 先要保证要部署的服务器上(以下简称server)能直接ssh拉仓库代码，比如 `git clone git@gitee.com:finley/demo.git`。不行的话配下server生成ssh-key，然后把public key存到代码仓库服务商，比如coding.net, github。
2. 权限问题，比如服务器的登录用户是ubuntu，将来项目要部署在/home/ubuntu下面，可以执行下 `sudo chown ubuntu:ubuntu /home/ubuntu/.pm2/*` 不然可能会部署失败。
3. 部署成功后会在配置的项目路径里出现以下三个目录：
> current   -- 当前服务运行的文件夹(是source的软链接)
share        -- log pid 等共享数据
source   -- clone 下来的源代码
4. 配置脚本
```
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'NODE-API',
      script    : 'server.js',
      // 这里是公共变量
      env: {
          SERVER_PORT: 8081,
      },
      env_development: {
        NODE_ENV: 'development',
      },
      env_production : {
        NODE_ENV: 'production',
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    // 项目信息
    // 下面的配置是我用什么用户登录哪个服务器，从哪拉代码，项目存到什么位置。拉完执行的脚本是啥
    'master' : {
      user : 'ubuntu',
      // 写成数组，可以同时部署到多台服务器
      host : '119.254.xxx.xxx',
      ref  : 'origin/master',
      repo : 'ssh://git@demo.com/demo.git',
      // 项目的存放地址，会生成current, source, share目录
      path : '/home/ubuntu/node-project',
      // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      "post-deploy" : 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
    }
  }
};
```

5. 执行命令, 如果是windows，在CMD中执行没用，建议在 git bash下执行。
先初始化下，这里会尝试远程登录服务器并建立项目目录，如果失败通常是ssh问题。
所以先在服务器上试试git clone能否成功，如果拉不下来，考虑服务器防火墙限制或ssh配置
`pm2 deploy ecosystem.config.js master setup`
这个命令只是拉仓库代码
`pm2 deploy ecosystem.config.js master`
这个命令会执行 配置文件的 post-deploy 部分，最终运行项目

### pm2 reload 和pm2 restart 有啥区别
官方说明：As opposed to restart, which kills and restarts the process, reload achieves a 0-second-downtime reload.
简单理解：
restart = stop+start
reload 会更优雅一些
具体用哪个要根据项目运行实际情况，有些项目需要7*24运行，不得stop，这时候用reload比较好。

### 权限问题
使用 `sudo pm2 start ecosystem.config.js` 和 `pm2 start ecosystem.config.js` 启动项目是有区别的，前者用户可能是root，后者是当前用户。建议不加sudo启动。我们在服务器上操作pm2 list, pm2 logs非常频繁。如果非得加sudo和密码才能成功。
可以 `sudo visudo` 然后追加`ubuntu  ALL=(ALL) NOPASSWD:ALL` ubuntu 是不希望输入密码的用户名。
