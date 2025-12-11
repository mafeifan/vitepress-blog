Docker Desktop v3.0 已于前两周正式发布，从这个版本起，Docker 官方承诺每次的更新将以增量更新的方式来提供，以便减少下载包的体积，提升效率。

除了将 Docker Engine 更新至 v20.10.0 外，还新增了一个Docker Hub CLI 工具
直接`hub-tool -h`

本文已`hub-tool v0.2.0`为准

```bash
A tool to manage your Docker Hub images

Usage:
  hub-tool
  hub-tool [command]

Available Commands:
  account     Manage your account
  help        Help about any command
  login       Login to the Hub
  logout      Logout of the Hub
  org         Manage organizations
  repo        Manage repositories
  tag         Manage tags
  token       Manage Personal Access Tokens
  version     Version information about this tool

Flags:
  -h, --help      help for hub-tool
      --verbose   Print logs
      --version   Display the version of this tool

Use "hub-tool [command] --help" for more information about a command.
```

从一级菜单来看，主要功能包括：

* 登录/登出 DockerHub;
* 账户相关管理功能；
* 组织相关管理功能；
* 仓库和 tag 的相关管理功能；
* token 的相关管理功能；

但这里需要注意的是 Hub Tool 并没有使用 Docker Desktop 默认的用户凭证，也就是说，即使你在 Docker Desktop 中已经登录了帐号，你同样还是需要再次在终端下执行 login 操作。

## account 账户管理

包含info和rate-limiting两个子命令
对于免费用户每 6 小时只允许 pull 200 次 `200 container image requests per 6 hours`
详情或最新政策见[官网](https://www.docker.com/pricing)

```bash
> hub-tool account info
Username:	finleyma
Full name:
Company:
Location:
Joined:		3 years ago
Plan:		free
Limits:
  Seats:		1
  Private repositories:	1
  Parallel builds:	1
  Collaborators:	unlimited
  Teams:		unlimited
```


```bash
> hub-tool account rate-limiting
  Limit:     200, 6 hours window
  Remaining: 200, 6 hours window
```

## repo 仓库和tag管理

查看repo列表和删除repo

```bash
> hub-tool repo ls
REPOSITORY                                 DESCRIPTION    LAST UPDATE      PULLS    STARS    PRIVATE
finleyma/simplewhale                                      7 weeks ago      9        0        false
finleyma/express                                          16 months ago    61       0        false
finleyma/yapi                                             16 months ago    10       0        false
finleyma/circleci-nodejs-browser-awscli                   23 months ago    331      0        false
finleyma/phpenv                                           2 years ago      24       0        false
finleyma/my-first-flask-app                               3 years ago      58       0        false
```

列出repo的所有tag
```bash
> hub-tool tag ls finleyma/express 
```

查看镜像详情
```bash
> hub-tool tag inspect finleyma/express
```

## org 组织和token管理

这个比较简单，
`hub-tool org`展示一些组织和成员相关信息。
`hub-tool token`对个人 Token 的创建/删除，激活/失效，列表，查询详细等功能。

## 参考
* https://segmentfault.com/a/1190000038629701
