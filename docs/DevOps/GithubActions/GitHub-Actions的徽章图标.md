每次修改后推送源码，GitHub Actions 都会自动运行，那怎么知道运行的结果呢，GitHub Actions 为我们提供了徽标图标，可以加入到你的项目主页中，图标地址语法如下：

`https://github.com/<OWNER>/<REPOSITORY>/workflows/<WORKFLOW_NAME>/badge.svg?branch=<branch-name>`

* `<OWNER>`：所有者的用户名
* `<REPOSITORY>`：项目仓库名称
* `<WORKFLOW_NAME>`：工作流名称
* `<branch-name>`：分支名称，如果不写默认是master分支

本项目的图标地址就是：`https://github.com/mafeifan/vue-press/workflows/CI/badge.svg`


https://github.com/mafeifan/vue-press/workflows/CI/badge.svg