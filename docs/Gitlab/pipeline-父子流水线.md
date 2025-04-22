## demo1 将父流水线的 artifacts 传递给子流水线

### 使用 $CI_JOB_TOKEN

![](https://pek3b.qingstor.com/hexo-blog/202407011621473.png)

project1

```yaml
create_artifacts:
  stage: demo
  when: manual
  artifacts:
    paths:
    - newfile.txt
    expire_in: 1 week
  script:
    - CHILD_PROJECT_ID=493
    - CHILD_REF_BRANCH_NAME=feature/cicd
    - echo "CI_JOB_ID:$CI_JOB_ID" >> newfile.txt
    - echo "CI_PIPELINE_ID:$CI_PIPELINE_ID" >> newfile.txt
    # 触发下游项目流水线, 并传递 PROJECT_ID 和 JOB_ID
    - curl --request POST --form "token=$CI_JOB_TOKEN"  --form "variables[PARENT_JOB_ID]=$CI_JOB_ID" --form "variables[PARENT_PROJECT_ID]=$CI_PROJECT_ID" --form ref=${CHILD_REF_BRANCH_NAME} "${CI_SERVER_HOST}/api/v4/projects/${CHILD_PROJECT_ID}/trigger/pipeline"
```


project2

```yaml
download_upstream_artifacts:
  # variables:
  #   CI_DEBUG_TRACE: "true"
  stage: downstream_job
  # download upstream pipeline artifacts:
  needs:
    - pipeline: $PARENT_PIPELINE_ID
      job: create_artifacts
  # 限制仅通过父流水线触发时运行
  rules:
    - if: $CI_PIPELINE_SOURCE == "pipeline"
  script:
    - git config --global user.name "gitlab-ci"
    - git config --global user.email "gitlab-ci@mafeifan.com"
    - git config --global --add safe.directory "*"
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan ${CI_SERVER_HOST} >> ~/.ssh/known_hosts && chmod 644 ~/.ssh/known_hosts
    - cat "$SSH_PRIVATE_KEY" >  ~/.ssh/gitlab && chmod 500 ~/.ssh/gitlab
    - cat "$SSH_CONFIG" >  ~/.ssh/config

    - echo $PARENT_PROJECT_ID
    - echo $PARENT_JOB_ID
    # 下载 artifacts
    # 会产生问题，因为 project1的流水线是先触发downstream才上传artifacts,有时间差问题，这个时候有可能取不到artifacts
    # 解决方法：将artifacts存到外部存储，不使用 artifact
    - curl --location --output artifacts.zip "${CI_SERVER_HOST}/api/v4/projects/${PARENT_PROJECT_ID}/jobs/${PARENT_JOB_ID}/artifacts?job_token=$CI_JOB_TOKEN"
    - unzip -o artifacts.zip
```

## 优化，支持传递 artifacts

project1

```yaml
create_artifacts:
  stage: demo
  when: manual
  artifacts:
    paths:
    - newfile.txt
    expire_in: 1 week
  script:
    - CHILD_PROJECT_ID=493
    - CHILD_REF_BRANCH_NAME=feature/cicd
    - echo "CI_JOB_ID:$CI_JOB_ID" >> newfile.txt
    - echo "CI_PIPELINE_ID:$CI_PIPELINE_ID" >> newfile.txt

trigger_downstream:
  stage: deploy
  trigger: 
    include:
      - project: path_to/downstream/repo_name   # Path to the project to trigger a pipeline in
        ref: 'feature/cicd'
        file: '.gitlab-ci.yml'
```
