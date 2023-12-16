## 作用
数据键值对，作为Pod的配置文件或环境变量。

configmap的数据可以来自三种类型：字面量，文件和目录

```bash
mkdir primary
echo g > primary/green
echo r > primary/red
echo y > primary/yellow
echo k > primary/black
echo "known as key" >> primary/black
echo blue > favorite

kubectl create configmap colors \
     --from-literal=text=black  \
     --from-file=./favorite  \
     --from-file=./primary/
     
kubectl get configmap colors
kubectl get configmap colors -o yaml
```

## configMap作为环境变量传入Pod

simpleshell.yaml
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shell-demo
spec:
  containers:
  - name: nginx
    image: nginx
    env:
      - name: ilike
        valueFrom:
          configMapKeyRef:
            name: colors
            key: favorite
```

```bash
kubectl create -f simpleshell.yaml
kubectl exec shell-demo -- /bin/bash -c 'echo $ilike'
kubectl delete pod shell-demo
```

也可以把全部的文件内容作为环境变量传入Pod。稍微修改下simpleshell2.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shell-demo2
spec:
  containers:
  - name: nginx
    image: nginx
#    env:
#      - name: ilike
#        valueFrom:
#          configMapKeyRef:
#            name: colors
#            key: favorite
    envFrom:
      - configMapRef:
          name: colors
```

`kubectl exec shell-demo -- /bin/bash -c 'env'`

## 作为挂载卷

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: redis-conf
  namespace: iot-ningxia
  annotations:
    kubesphere.io/creator: admin
data:
  redis.conf: |-
    appendonly yes
    port 6379
    bind 0.0.0.0
```

挂载到StatefulSet的Pod中
```yaml
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: redis
  namespace: iot-ningxia
  labels:
    app: redis
  annotations:
    kubesphere.io/creator: mafei
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      volumes:
        - name: volume-redis-conf
          configMap:
            name: redis-conf
      containers:
        - name: redis
          image: 'redis:6'
          command:
            - redis-server
          args:
            - /etc/redis/redis.conf
          ports:
            - name: tcp-6379
              containerPort: 6379
              protocol: TCP
          volumeMounts:
            - name: volume-redis-conf
              readOnly: true
              mountPath: /etc/redis
          imagePullPolicy: IfNotPresent
```
