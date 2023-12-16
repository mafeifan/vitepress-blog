想实现提交内容中带有[CI]才触发流水线构建，可以借助强大的 Generic Webhook Trigger 插件做到

## 流程

1. Build Triggers 下开启 Generic Webhook Trigger
2. 配置token
3. Post content parameters 部分表示从payload中提取commit message，并赋给变量。

Expression 填写`$.commits[0].message`

name 起做 commit_message的变量名


假设payload:

```json
{
  "commits": [
    {
      "message": "CI: build"
    }
  ]
}
```

则`$commit_message = "CI: build"`

可以这么理解

![](http://pek3b.qingstor.com/hexo-blog/20220515215616.png)

4. Optional filter 部分是可选的，如果指定了，则只有匹配到的才会触发构建。

这里我们为了实现，只有commit message中带有`[CI]`才触发构建

Expression填写: 正则`^\[CI]`

Text填写上面指定的变量：$commit_message

![](http://pek3b.qingstor.com/hexo-blog/20220515215756.png)

## 参考

https://stackoverflow.com/questions/7293008/display-last-git-commit-comment

https://github.com/jenkinsci/commit-message-trigger-plugin

https://stackoverflow.com/questions/53128992/triggering-build-based-on-commit-message-using-jenkins-webhook-trigger
