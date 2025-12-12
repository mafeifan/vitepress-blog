Velero 是一个云原生的灾难恢复和迁移工具，它本身也是开源的, 采用 Go 语言编写，可以安全的备份、恢复和迁移Kubernetes集群资源和持久卷。

虽然我们知道K8s的集群数据是保存在ETCD上面，但很难针对单个namespace进行备份及恢复。

这里推荐使用Velero

## Velero 可以干什么

* 灾备场景，提供备份恢复k8s集群的能力
* 迁移场景，提供拷贝集群资源到其他集群的能力（复制同步开发，测试，生产环境的集群配置，简化环境配置）

另外各大公有云厂商提供了 Velero 插件，比如安装了[阿里云 velero ACK plugin](https://github.com/AliyunContainerService/velero-plugin) 可以直接将数据备份到阿里云对象存储上。

## Velero 的组成

Velero 由运行在集群上的服务端和一个运行在本地的命令行客户端组成。

## 与etcd的区别

与 Etcd 备份相比，直接备份 Etcd 是将集群的全部资源备份起来。而 Velero 就是可以对 Kubernetes 集群内对象级别进行备份。除了对 Kubernetes 集群进行整体备份外，Velero 还可以通过对 Type、Namespace、Label 等对象进行分类备份或者恢复。

## 备份原理和流程图

* 本地 Velero 客户端发送备份指令。
* Kubernetes 集群内就会创建一个 Backup 对象。
* BackupController 监测 Backup 对象并开始备份过程。
* BackupController 会向 API Server 查询相关数据。
* BackupController 将查询到的数据备份到远端的对象存储。

![](https://pek3b.qingstor.com/hexo-blog/20220310205710.png)

## 安装

这里，我已经有AWS账号并创建了S3存储桶，可以直接使用[Velero插件](https://github.com/vmware-tanzu/velero-plugin-for-aws#setup)

创建一个配置文件，里面放可以操作S3的AWS凭证信息

```bash
$ cat > ~/.credentials-velero << EOF
[default]
accessKeyID: AKIAIOSFODNN7EXAMPLE
secretAccessKey: *****SECRET*****
EOF

# 安装 velero

$ export BUCKET=finley007
$ export REGION=ap-northeast-1

$ velero install \
    --provider aws \
    --plugins velero/velero-plugin-for-aws:v1.4.0 \
    --bucket $BUCKET \
    --backup-location-config region=$REGION \
    --snapshot-location-config region=$REGION \
    --secret-file ./.credentials-velero

# 等待状态变为running

Velero is installed! ⛵ Use 'kubectl logs deployment/velero -n velero' to view the status.    
```


## 备份及恢复

```bash
# 测试备份，这里我只备份命名空间为secure的资源，里面就跑了一个Pod

$ k get po -n secure
NAME       READY   STATUS    RESTARTS   AGE
busybox1   1/1     Running   23         5d21h

$ velero backup create nginx-backup --include-namespaces secure --wait

Backup request "nginx-backup" submitted successfully.
Waiting for backup to complete. You may safely press ctrl-c to stop waiting - your backup will continue in the background.
...
Backup completed with status: Completed. You may check for more information using the commands `velero backup describe nginx-backup` and `velero backup logs nginx-backup`
```

打开S3页面查看备份结果

![](https://pek3b.qingstor.com/hexo-blog/20220310221227.png)

```bash

# 测试恢复,恢复之前我已经把里面的Pod删除了
$ k delete po busybox1 -n secure
$ velero restore create --from-backup nginx-backup --wait

Restore request "nginx-backup-20220310221931" submitted successfully.
Waiting for restore to complete. You may safely press ctrl-c to stop waiting - your restore will continue in the background.
.
Restore completed with status: Completed. You may check for more information using the commands `velero restore describe nginx-backup-20220310221931` and `velero restore logs nginx-backup-20220310221931`.

k get po -n secure
NAME       READY   STATUS    RESTARTS   AGE
busybox1   1/1     Running   0          5s
```

> 注意：velero restore 的行为不是覆盖，恢复不会覆盖已有的资源，只恢复当前集群中不存在的资源。已有的资源不会回滚到之前的版本，如需要回滚，需在restore之前提前删除现有的资源。

## 更多命令

```bash
# 查看备份位置
$ velero get backup-locations

NAME      PROVIDER   BUCKET/PREFIX   PHASE       LAST VALIDATED                  ACCESS MODE   DEFAULT
default   aws        finley007       Available   2022-03-10 22:23:28 +0800 CST   ReadWrite     true

# 查看已有恢复
velero get restores

# 查看 velero 插件
velero get plugins

# 删除 velero 备份
velero backup delete nginx-backup

# 持久卷备份
velero backup create nginx-backup-volume --snapshot-volumes --include-namespaces nginx-example

# 持久卷恢复
velero restore create --from-backup nginx-backup-volume --restore-volumes

# 创建集群所有namespaces备份，但排除 velero,metallb-system 命名空间
velero backup create all-ns-backup --snapshot-volumes=false --exclude-namespaces velero,metallb-system

# 周期性定时备份
# 每日3点进行备份
$ velero schedule create <SCHEDULE NAME> --schedule "0 3 * * *"

# 每日3点进行备份，备份保留48小时，默认保留30天
$ velero schedule create <SCHEDULE NAME> --schedule "0 3 * * *" --ttl 48

# 每6小时进行一次备份
$ velero create schedule <SCHEDULE NAME> --schedule="@every 6h"

# 每日对 web namespace 进行一次备份
$ velero create schedule <SCHEDULE NAME> --schedule="@every 24h" --include-namespaces web


```

## 迁移场景
```bash
# 在集群1上做一个备份：
$ velero backup create <BACKUP-NAME> --snapshot-volumes

# 在集群2上做一个恢复：
$ velero restore create --from-backup <BACKUP-NAME> --restore-volumes

# velero 清理
$ kubectl delete namespace/velero clusterrolebinding/velero
$ kubectl delete crds -l component=velero
```

Velero 作为一个免费的开源组件，其能力基本可以满足容器服务的灾备和迁移的场景，推荐用户将velero日常备份作为运维的一部分，未雨绸缪，防患未然。

## 参考

https://github.com/vmware-tanzu/velero

https://www.imooc.com/article/310069

https://os.51cto.com/article/693587.html

https://www.yp14.cn/2020/06/23/K8S%E5%A4%87%E4%BB%BD-%E6%81%A2%E5%A4%8D-%E8%BF%81%E7%A7%BB%E7%A5%9E%E5%99%A8-Velero/
