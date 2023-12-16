## 异常处理

## -

[TOC]

## 账户问题

### 重置管理员密码

```bash
kubectl patch users <USERNAME> -p '{"spec":{"password":"<YOURPASSWORD>"}}' --type='merge' && kubectl annotate users <USERNAME> iam.kubesphere.io/password-encrypted-

# 请将命令中的 <USERNAME> 修改为实际的帐户名称，将 <YOURPASSWORD> 修改为实际的新密码。
```

### 检查密码是否正确

```bash
curl -u <USERNAME>:<PASSWORD> "http://`kubectl -n kubesphere-system get svc ks-apiserver -o jsonpath='{.spec.clusterIP}'`/api/v1/nodes"

```

## 创建

### 创建服务

#### Invalid Service "blog-mysql" is invalid: spec.clusterIPs[0]: Invalid value: "None": may not be set to 'None' for NodePort services

![image-20211221172022139](https://jiayao-bucket.oss-cn-guangzhou.aliyuncs.com/typora-images/20210816/20211221172026.png)

## 服务启动

### Caused by: org.quartz.impl.jdbcjobstore.LockException: Failure obtaining db row lock: Table 'mega-admin.QRTZ_LOCKS' doesn't exist

![image-20220124162044089](https://jiayao-bucket.oss-cn-guangzhou.aliyuncs.com/typora-images/20211201/20220124162046.png)

> 问题原因

微服务模块启动时，报表不存在，检测 mysql 后发现配置无异常，数据库中也有该表。仔细观察上面报错内容，发现其找的是大写字母的表名，这是由于 mysql 配置中未忽略大小写造成。

> 解决办法

在 mysql 的配置文件中`my.ini`，配置如下

```bash
...

[mysqld]
lower_case_table_names=1

...
```

> 查看是否生效

在 mysql 图形界面执行

```bash
SHOW VARIABLES LIKE '%case%'
```


### 流水线报错

```
java.net.ProtocolException: Expected HTTP 101 response but was '400 Bad Request'
	at okhttp3.internal.ws.RealWebSocket.checkResponse(RealWebSocket.java:229)
	at okhttp3.internal.ws.RealWebSocket$2.onResponse(RealWebSocket.java:196)
	at okhttp3.RealCall$AsyncCall.execute(RealCall.java:203)
	at okhttp3.internal.NamedRunnable.run(NamedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
io.fabric8.kubernetes.client.KubernetesClientException: container base is not valid for pod nodejs-qvtv0
```

原因agent的label要与step-container中保持一致
```
pipeline {
  agent {
      node {
        label 'nodejs'
      }
  }
  stage('打包镜像') {
    steps {
      container('nodejs') {
        sh 'docker build -f Dockerfile -t $ARTIFACT_IMAGE/$NAMESPACE/$PROJECT:prod-$BUILD_NUMBER .'
      }
    }
  }
}

```
