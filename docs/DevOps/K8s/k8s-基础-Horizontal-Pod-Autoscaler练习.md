## 解决痛点

当流量突然增大,会导致CPU使用率或内存突然增高,为保证业务不中断,可以通过设置自动调整的Horizontal Pod Autoscaler 来解决这个问题。

HPA (Horizontal Pod Autoscaler) 可以根据 CPU 利用率自动扩缩 ReplicationController、 Deployment、ReplicaSet 或 StatefulSet 中的 Pod 数量

## 原理

使用HPA,必须先安装[metrics-server服务](https://github.com/kubernetes-sigs/metrics-server)
工作原理: 使用metrics-server持续采集所有Pod副本的指标数据,HPA Controller 通过metrics-server提供的API获取这些数据,基于用户自定义的扩缩容规则进行计算,得到目标副本数量。

如果得出结果与当前副本数不符,HPA Controller向副本控制器发起scale操作，调转

然后通过HPA来调整副本数量

## 创建测试用的 deployment 和 service

其中 hpa-example 镜像只包含了一个index.php,模拟 CPU 密集型计算,内容如下:

```php
<?php
  $x = 0.0001;
  for ($i = 0; $i <= 1000000; $i++) {
    $x += sqrt($x);
  }
  echo "OK!";
?>
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  replicas: 1
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: mirrorgooglecontainers/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m

---

apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

## 创建水平自动伸缩器 Horizontal Pod Autoscaler 
```bash
# 大致来说,HPA 将（通过 Deployment）增加或者减少 Pod 副本的数量以保持所有 Pod 的平均 CPU 利用率在 50% 左右。
# 由于每个 Pod 请求 200 毫核的 CPU,这意味着平均 CPU 用量为 100 毫核。
$ kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=3

$ kubectl get hpa -w

NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         3         1          17s

# 打开另一个终端发起更多请求,模拟压力测试,提高CPU负载
$ kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://php-apache; done"

# 这时，由于请求增多,CPU 利用率已经升至请求值的 305%。 可以看到,Deployment 的副本数量已经增长到了3：
k get deployment -w
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
php-apache   2/3     3            2           10m

# 停掉模拟请求,deployment副本数会在数分钟内自动将至为1
```

## 多项度量维度

上面的例子,只有一个度量维度,即CPU利用率。 如果需要更多的度量维度,可以使用平均值

## 参考

https://kubernetes.io/zh/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/