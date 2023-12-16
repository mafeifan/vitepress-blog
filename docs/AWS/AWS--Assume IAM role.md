## AWS 切换用户

AWS 要授权给他人访问指定资源有哪几种方式呢？

* 在自己帐号下创建一个用户，把 Access Key ID 和 Secret Access Key 告诉别人。可为该用户限定权限，但任何获得那两个 Key 的人都能使用该用户。不够安全。
* 创建一个 IAM Role, 并指定谁(帐号或 Role) 能以该 Role 的身份来访问。被 Assume 的 Role 可限定权限和会话有效期。

所以，用 Assume Role 的方式具有更高的安全可控性，还不用维护 Access Key ID 和 Secret Access Key。

比如在构建和部署时通常是有一个特定的 Account, 然后 Assume 到别的 IAM Role 去操作资源。

本文将详细介绍在帐号 A 创建一个 IAM Role(标注为 R) 并分配一些权限，然后允许另一个帐号 B 以 IAM Role - R 的身份来访问帐号 A 下的资源。

IAM Role 将用 awscli 来创建，Assume Role 的过程用 awscli 和 boto3 Python 代码两种方式来演示。

已知两个账号A，B

~/.aws/credentials 添加好key

```ini
[a]
aws_access_key_id=AKIA5*****USBKPN4DIH
aws_secret_access_key=OdUsUew**********MEgoC8*****9LCvbqkaCQQS

[b]
aws_access_key_id=AKIA*****2USOGAHFVAU
aws_secret_access_key=b2nXQ**********7EuBO*****5ngKM3Msg2CLqma
```

## 帐号 A 下创建 IAM Role

```
aws s3 ls --profile a

# 或者用环境变量，这是更推荐的方式
export AWS_DEFAULT_PROFILE=a

# 查看账户A下的S3资源
aws s3 ls

# 在账号A下创建 test-assumed-role
aws iam create-role --role-name test-assumed-role --assume-role-policy-document file://role-trust-policy.json

# 给新建的 test-assumed-role 加上 S3 的只读权限
aws iam attach-role-policy --role-name test-assumed-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

## 帐号 B Assume 帐号 A 的 role

```
export AWS_DEFAULT_PROFILE=b
# 924612875556是账户A的account id
# 这句话的意思是用，将账户B切换为账户A
aws sts assume-role --role-arn arn:aws:iam::924612875556:role/test-assumed-role --role-session-name awscli-session

返回内容:

{
    "Credentials": {
        "AccessKeyId": "ASIA*******O5OOFMMB",
        "SecretAccessKey": "qLR4rNZ*******PPJAIBx22plNN8oWIRtp2bbq",
        "SessionToken": "IQoJb3JpZ2luX2VjEPb//////////wEaDmFwLW5v*******xIkcwRQIgCKgl/h9gP4430qtSRfnp*******VddkekMUcN2ECIQC06q/7vYhcVMj7jujstIVzBhecnYQgB3bZf0l5qaxjzyqbAggwEAEaDDkyNDYxMjg3NTU1NiIMKP1BdAa6NQhoo2FYKvgBy5B1tyKn0GPz7DwG+YWxdfc9+ayNwzulKsF895wLpzuC9Hkyd2+KL22PgcaAOHV+PU3CPicDS8xTlanAQZvlPQy3egXv+JNOwlrJaVmyKuNbtzGCpYlBFs9TnC1sD+Uz0MGtXPh3GLhoZZ9gHt7fktDwohoz5+fbA+6zXUvO4xmFAicoYy7PCSM1v8weQ+oXqMAFREJ3Pd3Zs3y5adQYK100+reEJ1uvMIIdk3KSKYsF3T8ZByU+MdP+YBSgilfaY/YVgXExUp0B2dwWMRRh95FSdmmIfAtqSrt/0mXhah5zxTaoVxbPUT68A6Fj4Gecw+3iZiIeM2MwycSrlgY6nQGlo4fNrVvHEgw8yBFPE6wiY+jAi1vLNplxJ1WN59OMK+0rfdyBO91JFeoOEiQNXzbZJSorI2SuEUi3dVgVotvGwCMYsOYByM4zyJa9tdsjXTKX6UL2CdHyGKm6y5QK1DhXhl9mtEMqNqEWoQN4LkgGHv/4fzJLoFqKO2cC+VZDQ40AofaTVEsKaJjU3zt3NCUa+Ltq5qyfyTkHxoky",
        "Expiration": "2022-07-10T15:29:29+00:00"
    },
    "AssumedRoleUser": {
        "AssumedRoleId": "AROA5ORZY2USEASI2XI4F:awscli-session",
        "Arn": "arn:aws:sts::924612875556:assumed-role/test-assumed-role/awscli-session"
    }
}
```


这时候得到一组新的 AccessKeyId, SecretAccessKey 和 SessionToken，可以在 `~/.aws/credentials` 中配置一个新的 profile C, 然后 export AWS_DEFAULT_PROFILE=C 来使用。
或都用 export 分别导出三个环境变量 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, 和 AWS_SESSION_TOKEN, 分别对应前面的三个值。
```
$ export AWS_ACCESS_KEY_ID=<Credentials.AccessKeyId>
$ export AWS_SECRET_ACCESS_KEY=<Credentials.SecretAccessKey>
$ export AWS_SESSION_TOKEN=<Credentials.SessionToken>
```

```
aws s3 ls --profile c

# 想访问超出 test-assumed-role 之外的权限将被提示 Access Denied
aws s3 cp Desktop/jump-server.sh s3://blog.finleyma.ml --profile ty-assume
upload failed: Desktop/jump-server.sh to s3://blog.finleyma.ml/jump-server.sh An error occurred (AccessDenied) when calling the PutObject operation: Access Denied

# 查看当前所使用的角色
aws sts get-caller-identity --profile c

{
    "UserId": "AROA5ORZY2USEASI2XI4F:awscli-session",
    "Account": "924612875556",
    "Arn": "arn:aws:sts::924612875556:assumed-role/test-assumed-role/awscli-session"
}
```


## 用 Python 的 boto3 包实现

帐号 B 登陆，调用 boto3 的 sts.assume_role() 函数切换到帐号 A 下的 IAM Role test-assumed-role，之后的操作就限定到 test-assumed-role 的约束中了。
```python
import boto3
 
aws_credentials_b = {
    'region_name': 'us-east-1',
    'aws_access_key_id':'PNKDIESJGWAURFEWDLLT',
    'aws_secret_access_key':'TdTMlDUSKecRadKeMlNIBEmIkRjmZOSvtnhgQDZc',
    'aws_session_token':'IQoJb3JpZ2luX2VjEDYabEbMG5J2lzlv......IEQisSAwzmnkv7LNf+'
}
 
 
sts=boto3.client('sts', **aws_credentials_b)
 
stsresponse = sts.assume_role(
    RoleArn="arn:aws:iam::123456789011:role/test-assumed-role", # under account A
    RoleSessionName='assumed'
)
 
aws_credentials_assumed_role = {
    'region_name':'us-east-1',
    'aws_access_key_id':stsresponse["Credentials"]["AccessKeyId"],
    'aws_secret_access_key':stsresponse["Credentials"]["SecretAccessKey"],
    'aws_session_token':stsresponse["Credentials"]["SessionToken"]
}
 
 
boto3.setup_default_session(**aws_credentials_assumed_role)
 
s3 = boto3.client('s3')
buckets_of_a = [bucket['Name'] for bucket in s3.list_buckets()['Buckets']]

```

当然，使用 Python 的话可以进一步封装，比如默认以帐号 B 登陆，然后执行一个函数 switch_role(role_arn) 后，后续的 boto3 client 就全部变成了 assumed role 的角色了

```python
import boto3
 
def switch_role(assume_role_arn):
    sts=boto3.client('sts')
    sts_res = sts.assume_role(RoleArn=assume_role_arn, RoleSessionName='new_session')
 
    new_credentials = {'aws' + re.sub('([A-Z]+)', r'_\1', key).lower(): value
                       for (key, value) in sts_res["Credentials"].items() if key != 'Expiration'}
 
    boto3.setup_default_session(**new_credentials)
    
switch_role('arn:aws:iam::123456789011:role/test-assumed-role')
 
s3 = boto3.client('s3')
buckets_of_a = [bucket['Name'] for bucket in s3.list_buckets()['Buckets']]
```

把 sts_res['Credentials'] 转换为 session 要求的格式是简化，但是要注意以后 assume_role() 响应格式的变化有可能影响到程序的正常执行。

## 参考
https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html

https://yanbin.blog/how-to-assume-aws-iam-role/

https://blog.51cto.com/wzlinux/2462544
