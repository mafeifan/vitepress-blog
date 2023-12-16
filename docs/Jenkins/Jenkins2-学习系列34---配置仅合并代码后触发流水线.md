想实现合并代码后才触发Pipeline流水线构建，可以借助强大的 Generic Webhook Trigger 插件做到

## 流程

1. Build Triggers 下开启 Generic Webhook Trigger
2. 配置全局唯一token
3. 开启 Print post content 和 Print contributed variables in job log选项，可以看到接收到的payload和自定义变量
4. gitlab或github配置merge request事件的webhook

![](http://pek3b.qingstor.com/hexo-blog/20220515220805.png)
5. 创建merge request，观察数据

合并后GitLab的webhook触发了， 我们需要对比开启请求和合并请求的数据。找不同，找特点。


```
# approved状态
$.event_type = merge_request
$.object_attributes.state = opened
$.object_attributes.action = approved

# merge状态
$.event_type = merge_request
$.object_attributes.state = merged
$.object_attributes.action = merge


#拿到source和target分支
$.object_attributes.source_branch
$.object_attributes.target_branch
```
6. 此部分都是在jenkins上面配置的
配置Generic Webhook的过滤没用的请求，实现精准触发

```groovy
currentBuild.description = "Trigger: ${source_branch}  > ${target_branch} \n${event_type}  \n ${state}  \n ${action}"

pipeline {
    agent any
    
    triggers {
        GenericTrigger(causeString: 'Generic Cause', 
            genericVariables: [[defaultValue: '', key: 'event_type', regexpFilter: '', value: '$.event_type'], 
                [defaultValue: 'NULL', key: 'state', regexpFilter: '', value: '$.object_attributes.state'], 
                [defaultValue: 'NULL', key: 'action', regexpFilter: '', value: '$.object_attributes.action'],
                [defaultValue: 'NULL', key: 'source_branch', regexpFilter: '', value: '$.object_attributes.source_branch'], 
                [defaultValue: 'NULL', key: 'target_branch', regexpFilter: '', value: '$.object_attributes.target_branch']],
            printContributedVariables: true, 
            printPostContent: true, 
            regexpFilterExpression: '^merge_request\\smerged\\smerge$', 
            regexpFilterText: '$event_type $state $action', 
            token: 'devops-merge-trigger', 
            tokenCredentialId: '')
    }

    stages {
        stage('Hello') {
            steps {
                echo 'Hello World'
            }
        }
    }
}
```

7. 完成


## 参考

https://mp.weixin.qq.com/s/VuM8EqKp448fama_qXkJvQ