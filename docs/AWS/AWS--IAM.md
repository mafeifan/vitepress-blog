```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MyListBucket",
      "Effect": "Allow",
      "Action": "S3:ListBucket",
      "Resource": [
        "arn:aws:s3:::com.demo.file"
      ],
      "Condition": {"StringEquals":  {"aws:username": "Bob"}}
    }
  ]
}
```

1. 同一Condition名称不能出现两次，要合并

https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html

* IAM User 可以属于某个 IAM Group，甚至可以属于多个 Group
* IAM User 无法属于某个 IAM Role，必须透过”切换”的方式，在 AWS 中称为 “Assume Role”，而”切换”这个操作需要有权限才行

Assume Role 基本上是一种 `Action("Action": "sts:AssumeRole")`，因为 Assume Role 这个行为是从 AWS Security Token Service 中取得一个暂时的 token，藉此取得该 Role 所事先定义好的权限。(sts:AssumeRole Action & IAM Role 的对应关係可以从[此 AWS 官网文件]（https://docs.aws.amazon.com/zh_cn/service-authorization/latest/reference/list_awssecuritytokenservice.html#awssecuritytokenservice-actions-as-permissions）找到)

## assuming role

切换角色



## 参考

https://godleon.github.io/blog/AWS/learn-AWS-IAM-2-policy/
