## 功能介绍
Amazon EKS Pod Identity 是 AWS 对 EKS 原有的 IAM roles for service accounts (IRSA) 功能的补充，通过新增的 EKS Pod Identity 功能，
用户可以用更简便的方式实现为 Pod 安全的授予 AWS API 访问权限， 并且所有的配置管理操作都可以通过 AWS API 或者控制台完成。

## 使用方法

1. 新建个 IAM role，信任实体如下

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "pods.eks.amazonaws.com"
            },
            "Action": [
                "sts:AssumeRole",
                "sts:TagSession"
            ]
        }
    ]
}
```

分配策略比如:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::artifacts"
        }
    ]
}
```
2. EKS 集群需要安装 eks-pod-identity-agent 组件（支持通过控制台安装）。 

```bash
aws eks create-addon \
--cluster-name <CLUSTER_NAME> \
--addon-name eks-pod-identity-agent \
--addon-version v1.x.x-eksbuild.1
```

3. 创建 K8s Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: default
```

4. 然后，需要配置应用 Pod 所使用的 Service Account 与 AWS IAM 角色之间的关联关系， 允许使用该 Service Account 的应用扮演特定的 IAM 角色（支持通过控制台配置）。

```bash
aws eks create-pod-identity-association \
  --cluster-name <CLUSTER_NAME> \
  --namespace <NAMESPACE> \
  --service-account <SERVICE_ACCOUNT_NAME> \
  --role-arn <IAM_ROLE_ARN>
```

5. 最关键的，应用 Pod 需要更新使用最新的支持 EKS Pod Identity 特性的 [AWS SDK](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/pod-id-minimum-sdk.html)
比如应用 Pod 是 Java开发的，需要调用 S3 API，那么需要更新 pom.xml 文件，添加 AWS SDK,AWS SDK 中有一套获取凭证的[默认搜索逻辑](https://docs.aws.amazon.com/zh_cn/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain)
或者显示调用 EKS Pod Identity 依赖的[Container credential provide](https://docs.aws.amazon.com/zh_cn/sdkref/latest/guide/feature-container-credentials.html)


6. 运行应用 Pod, 我们来创建一个简单的应用 Pod

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      serviceAccountName: my-service-account
      containers:
      - name: my-app
        image: public.ecr.aws/aws-cli/aws-cli:2.32.12
        command:
          - sh
          - '-c'
          - while true; do sleep 3600; done
```

7. 测试,发现有S3桶内容返回,如果把 s3:ListBucket action 拿掉则报错, 测试通过

`kubectl exec -it deployment/my-app -- aws s3 ls s3://artifacts/`


## 工作流程

![](https://pek3b.qingstor.com/hexo-blog/2025/12/09/14-02-44-15dbc232151a3002aeb11797d03b794a-eks-pod-identity-5da771.png)

1. 当用户/Controller 向 apiserver 提交 Pod 时，会触发 [eks-pod-identity-webhook](https://github.com/aws/amazon-eks-pod-identity-webhook) 的 mutating webhook 流程。

2. eks-pod-identity-webhook 的 mutating webhook 流程会为 Pod 挂载 service account oidc token 文件以及配置环境变量 (AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE, AWS_CONTAINER_CREDENTIALS_FULL_URI ）。

通过 `kubectl describe pod my-app-77f6749799-f26hf` 可以看到

```
    Environment:
      AWS_STS_REGIONAL_ENDPOINTS:              regional
      AWS_DEFAULT_REGION:                      eu-west-1
      AWS_REGION:                              eu-west-1
      AWS_CONTAINER_CREDENTIALS_FULL_URI:      http://169.254.170.23/v1/credentials
      AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE:  /var/run/secrets/pods.eks.amazonaws.com/serviceaccount/eks-pod-identity-token
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-jtjst (ro)
      /var/run/secrets/pods.eks.amazonaws.com/serviceaccount from eks-pod-identity-token (ro)
```

打印 service account oidc token 文件，`kubectl exec -it deployment/my-app -- cat  /var/run/secrets/pods.eks.amazonaws.com/serviceaccount/eks-pod-identity-token`
是 JWT 格式的,找一个在线解密 https://www.jwt.io/ 获得

```
## header

{
  "alg": "RS256",
  "kid": "167335cb436b4080252a64e070f6d3153f896845"
}

## payload
iss (Issuer)：签发者
sub (Subject)：主题
aud (Audience)：接收者
exp (Expiration time)：过期时间
nbf (Not Before)：生效时间
iat (Issued At)：签发时间
jti (JWT ID)：编号

{
  "aud": [
    "pods.eks.amazonaws.com"
  ],
  "exp": 1765334133,
  "iat": 1765252458,
  "iss": "https://oidc.eks.eu-west-1.amazonaws.com/id/43E064763DAXXXXD18392C7FC9CBEA3A",
  "jti": "5e081212-fdf6-425c-9b32-c9a372112fd9",
  "kubernetes.io": {
    "namespace": "default",
    "node": {
      "name": "ip-172-31-77-99.eu-west-1.compute.internal",
      "uid": "797b365b-3491-47a6-a222-ba5acf3276d8"
    },
    "pod": {
      "name": "my-app-77f6749799-f26hf",
      "uid": "8768b78a-298a-4bf5-95b4-07a181ccbc2a"
    },
    "serviceaccount": {
      "name": "my-service-account",
      "uid": "92a8c128-7c32-4199-be85-1f2669cf7914"
    }
  },
  "nbf": 1765252458,
  "sub": "system:serviceaccount:default:my-service-account"
}
```

3. Pod 容器内的应用使用的 AWS SDK 将使用通过环境变量 AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE 获取的 service account oidc token 访问环境变量 AWS_CONTAINER_CREDENTIALS_FULL_URI 指向的地址 （http://169.254.170.23/v1/credentials）获取 AWS sts token。

```
curl $AWS_CONTAINER_CREDENTIALS_FULL_URI -H "Authorization: $(cat $AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE)" 2>/dev/null | jq

{
  "AccessKeyId": "ASXXXXXXXXXXXXX",
  "SecretAccessKey": "zEuXXXXXXXX",
  "Token": "IQoJb3JpXXXXXXX",
  "AccountId": "5XXXXXXXXXXX",
  "Expiration": "2025-12-09T09:54:37Z"
}
```

等效写法

```bash
TOKEN=`kubectl exec -it deployment/my-app -- cat  /var/run/secrets/pods.eks.amazonaws.com/serviceaccount/eks-pod-identity-token`
aws eks-auth assume-role-for-pod-identity --cluster-name cluter-name --token $TOKEN

{
    "subject": {
        "namespace": "default",
        "serviceAccount": "my-service-account"
    },
    "audience": "pods.eks.amazonaws.com",
    "podIdentityAssociation": {
        "associationArn": "arn:aws:eks:eu-west-1:47111xxxxx:podidentityassociation/cluster-name/a-avrgufuj****",
        "associationId": "a-avrgufuj****"
    },
    "assumedRoleUser": {
        "arn": "arn:aws:sts::47111xxxxx:assumed-role/my-role/cluter-name-c-my-app-77f-8c3ec6dc-97****",
        "assumeRoleId": "AROAW****:eks-cluster-eks-c-my-app-77f-8c3ec6dc-97****"
    },
    "credentials": {
        "sessionToken": "IQoJb3JpZ2luX2VjEO///////////wEaCWV1LX****",
        "accessKeyId": "ASIAW****",
        "expiration": "2025-12-09T20:23:17+08:00"
    }
}
```

4. AWS_CONTAINER_CREDENTIALS_FULL_URI 的值为 http://169.254.170.23/v1/credentials。 这个地址是固定的,是 EKS Pod Identity Agent 提供的本地 HTTP 端点。

> * 169.254.170.23: EKS Pod Identity Agent 的固定端点
> * 169.254.169.254: EC2 IMDS (Instance Metadata Service) 的固定端点

EKS Pod Identity Agent 作为 DaemonSet 运行在每个节点上,通过以下方式提供服务:
* HostNetwork 模式: Agent 使用主机网络
* 本地监听: 在节点上监听 169.254.170.23:80
* 所有 Pod 可访问: 节点上的所有 Pod 都可以访问这个 IP

eks-pod-identity-agent 收到请求后，将使用传递过来的 oidc token 访问 EKS 新增的 AssumeRoleForPodIdentity API 获取所需的 AWS sts token，然后将获取到的 sts token 返回给客户端。


5. 应用调用的 AWS SDK 使用获取到的 sts token 访问应用所需的 AWS 云产品 API。

## 简单描述：
* Pod 读取 JWT 令牌文件 (/var/run/secrets/pods.eks.amazonaws.com/serviceaccount/eks-pod-identity-token)
* AWS SDK 将令牌发送到 http://169.254.170.23/v1/credentials
* EKS Pod Identity Agent 验证令牌并调用 AWS STS
* 返回临时 AWS 凭证 (AccessKeyId, SecretAccessKey, SessionToken)


## 参考

https://mozillazg.com/2023/12/security-deep-dive-into-aws-eks-pod-identity-feature.html

https://securitylabs.datadoghq.com/articles/eks-pod-identity-deep-dive/
