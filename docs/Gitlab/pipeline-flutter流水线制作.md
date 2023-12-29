有时需要让pipeline自己执行 git commit。 为此，gitlab runner需要向gitlab认证自己。
需要生成一对SSH密钥，实现步骤如下：

1. 创建密钥对，比如本地执行 `ssh-keygen -t ed25519 -C "Keypair for FSD"'`
2. 公钥做为部署key，存放到gitlab项目中
3. 在项目中setting-cicd中定义一个类型为file的CICD变量，命名为`SSH_PRIVATE_KEY`
4. 在 gitlab-ci.yml中使用这个文件变量
```yaml
default:
  tags: [ mnf, basic, global ]
  image: $DEFAULT_IMAGE
  before_script:
    - git config --global user.name "gitlab-ci"
    - git config --global user.email "gitlab-ci@xxx.com"
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan ${CI_SERVER_HOST} >> ~/.ssh/known_hosts && chmod 644 ~/.ssh/known_hosts
    - eval $(ssh-agent -s)
    - cat "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - git checkout $CI_COMMIT_REF_NAME
    - git submodule update --init
    - git remote set-url origin git@$CI_SERVER_HOST:$CI_PROJECT_PATH.git
```
