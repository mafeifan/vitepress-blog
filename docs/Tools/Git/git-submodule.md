## 添加 submodule
```bash
git submodule add git@gitlab.com:cndevops/ci/components.git
git add .
git commit -m "init"
git push --set-upstream origin feature-submodule
```

## 使用submodule
```bash
git clone git@gitlab.com:cndevops/gitlab-pipeline-examples/demo-pipeline.git
cd demo-pipeline
git checkout feature-submodule

## 注意区别！ ## 

## 初始化并拉取子模块内容
git submodule update --init
## 更新子模块，该命令会将子模块的 HEAD 指针更新为远程分支的最新提交。
git submodule update --remote
## 返回初始提交的内容
git submodule update --init --recursive
```
IDEA系列好像有个bug，检测不到submodule的变更，需要执行下菜单栏 git-update project


## 区别
git submodule sync --init:

* 更新 所有 子模块及其子模块（递归）。
* 将每个子模块重置为 父模块中指定的提交（使用 .gitmodules 文件中的 branch 字段）。
* 不会 从远程仓库获取更新（除非使用 --fetch 选项）。
* 更适合 同步多个子模块 并确保它们与父模块保持一致。

git submodule update --init:
* 只更新 指定的子模块（不递归）。
* 将子模块重置为其 远程分支的最新的提交。
* 会从远程仓库 获取更新。
* 更适合 单独更新单个子模块 到最新状态。
```
