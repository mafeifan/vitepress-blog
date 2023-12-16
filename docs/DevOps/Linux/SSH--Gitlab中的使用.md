#### 一、创建ssh公钥免密登陆服务器

1. 执行ssh-keygen命令生成ssh密钥对
执行后~/.ssh/目录下，会新生成两个文件：id_rsa.pub和id_rsa
`ssh-keygen`

2. 执行ssh-copy-id命令将公钥传送到服务器
`ssh-copy-id root@host`

3. 测试免密码登陆
`ssh root@host`

#### 二、添加变量
gitlab项目/群组 -> 设置 -> CI/CD -> 变量

```
SSH_USER = 服务器的用户名
SSH_HOST = 服务器ip
SSH_KNOWN_HOSTS = 文件 ~/.ssh/known_host 有你服务器ip的一行
SSH_PRIVATE_KEY = 文件 ~/.ssh/id_rsa 里的内容
```

#### 三、添加.gitlab-ci.yml
```
stage:
  - Deploy
Deplpy:
  stage: Deploy
  only:
    - master
  before_script:
    - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  when: manual #手动确认之后才能构建
  script:
    - pwd
    - ls -l
    #主要同步代码的命令，可以在这里排除一些文件，同步权限，配置服务器的项目路径等。重点参考rsync命令的用法。
    - rsync -aztp --exclude ".gitlab-ci.yml" ./ $SSH_USER@$SSH_HOST:/data/wwwroot/laravel
```

#### 四、记得配置runner
