## artifacts
动态名称

```yaml
script:
    # 动态生成时间戳
    - export TIMESTAMP=$(date +'%Y%m%d%H%M%S')
    # 动态生成文件名
    - export ARTIFACT_NAME="${CI_JOB_NAME}-${TIMESTAMP}"
artifacts:
    # 使用动态生成的制品名称
    # 不生效，实际是 default.zip
    name: $ARTIFACT_NAME
    paths:
      - "/target"
```


参考：https://gitlab.com/gitlab-org/gitlab-runner/-/issues/1664

## cache

### Use separate caches for protected branches
By default, protected and non-protected branches do not share the cache. 
However, you can change this behavior.

so we run pipeline on cmss-web2321 branch, the cache url will be like
http://minio.minio:9000/gitlab-runner/gitlab-cache/runner/-z_CiEf6/project/441/cmss-web-non_protected 
but on feature branch, the cache url will become to 
http://minio.minio:9000/gitlab-runner/gitlab-cache/runner/-z_CiEf6/project/441/cmss-web-non_protected 

![](https://pek3b.qingstor.com/hexo-blog/202310232117691.png)

you can have all branches (protected and unprotected) use the same cache.

Clear the Use separate caches for protected branches checkbox.

![](https://pek3b.qingstor.com/hexo-blog/202310232121001.png)

## script

### use !reference to combine script
```yaml
stages:
  - demo

.setup:
  script:
    - echo creating environment

.teardown:
  after_script:
    - echo deleting environment

demo-reference:
  stage: demo
  script:
    - !reference [.setup, script]
    - echo running my own command
  after_script:
    - !reference [.teardown, after_script]
```

output result:
```
creating environment
echo running my own command
deleting environment
```

## 限制分支创建

![](https://pek3b.qingstor.com/hexo-blog/202409251721118.png)

* 只有 maintainers 才能合并代码到 develop 分支
* 只有 开发者才能合并代码到 feature 开头的分支
