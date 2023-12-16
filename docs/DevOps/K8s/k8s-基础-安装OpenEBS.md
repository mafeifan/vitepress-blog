[OpenEBS](https://openebs.io/)是 Kubersphere 的默认存储类型。

帮忙创建快速、高持久、可靠和可伸缩的容器附加存储。

这里介绍在一个纯净的K8s集群中安装 OpenEBS。Linux 平台是 Ubuntu

OpenEBS 依赖 iSCSI 服务，默认未开启

```bash
# active iSCSI service
sudo cat /etc/iscsi/initiatorname.iscsi
systemctl status iscsid 

sudo systemctl enable --now iscsid

# 如果没有则安装 iscsi

sudo apt-get update
sudo apt-get install open-iscsi
sudo systemctl enable --now iscsid
```

![](http://pek3b.qingstor.com/hexo-blog/20220301180107.png)

OpenEBS 提供了三种存储引擎选择：Jiva，cStor 和 Local PV。

这里我们只介绍 Local PV
##  Local PV

其中  Local PV 默认的存储路径为 `/var/openebs/local`

```bash
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml

# Storage Class

```yaml
# local-hostpath-sc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: hostpath
      - name: BasePath
        value: /var/local-hostpath
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

```yaml
# local-hostpath-pvc.yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: local-hostpath-pvc
spec:
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```


```yaml
# local-hostpath-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-local-hostpath-pod
spec:
  volumes:
  - name: local-storage
    persistentVolumeClaim:
      claimName: local-hostpath-pvc
  containers:
  - name: hello-container
    image: busybox
    command:
       - sh
       - -c
       - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
    volumeMounts:
    - mountPath: /mnt/store
      name: local-storage
```

```bash
k exec -it hello-local-hostpath-pod --- cat /mnt/store/greet.txt

Tue Mar  1 13:17:43 UTC 2022 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
Tue Mar  1 13:22:46 UTC 2022 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
Tue Mar  1 13:27:47 UTC 2022 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
Tue Mar  1 13:32:48 UTC 2022 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
```

Pod 所在的节点，确实生成了类似 `/var/openebs/local/pvc-098878b6-32f2-4920-811c-d2f3064c44c0/greet.txt` 的目录。
我们的卷也可以在这个目录中找到。

## 参考

https://openebs.io/docs/user-guides/localpv-hostpath