## 1. Create a token on Github

We want to sync a private repo(https://github.com/mafeifan/vue-press.git) to gitlab

go to https://github.com/settings/tokens to generate a  `Personal access tokens (classic)`

only check  scope repo

remember the token: which like `ghp_QabT1sLA*****d839uR1alj5S`

you can make a test on your local 

```bash
GITHUB_TOKEN=ghp_QabT1sLA*****j5S
git clone https://ghp_QabT1sLA*****j5S:x-oauth-basic@github.com/mafeifan/vue-press.git
```

![](https://pek3b.qingstor.com/hexo-blog/202404221535071.png)

## 2. Create an empty project on gitlab

then go to Settings - repository - Mirroring repositories

fill in the below content in form 

* Git repository URL: https://github.com/mafeifan/vue-press.git
* Authentication method: Username and Password
* Username: x-oauth-basic
* Password: ghp_QabT1sLA*****j5S

![](https://pek3b.qingstor.com/hexo-blog/202404221557013.png)

### Alternative way
Not to use mirror feature, Use gitlab pipeline to sync code automatically

we need to generate a gitlab token to access gitlab repo

![](https://pek3b.qingstor.com/hexo-blog/202404221627667.png)

```bash
sync-code-from-github:
  image: public.ecr.aws/bitnami/git:2
  stage: sync
  services: []
  when: manual
  script: |
    set -x
    # define $GITHUB_TOKEN and $GITLAB_TOKEN in gitlab pipeline variables first
    git clone https://$GITHUB_TOKEN:x-oauth-basic@github.com/mafeifan/vue-press.git
    cd vue-press
    ls
    GITLAB_USERNAME=gitlab
    git remote add gitlab https://$GITLAB_USERNAME:$GITLAB_TOKEN@gitlab.cn/cndevops/vue-press.git
    git push gitlab master
```
