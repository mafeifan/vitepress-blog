### Kubernetes Basics: Commands, Deployments, Services, Secrets, ConfigMaps.

Pods is the smallest unit you can manage in Kubernetes.

Pods live in Nodes. 

One to One App <====> Pod
 
You basically create deployments, not pods.

Service is basically an IP address attached to your pods.

StatefulSet --> For database, elastic search, mongodb, anything that has Data. You shouldn't use Deployment with Stateful apps.

Ingress is used to route traffic to the k8s cluster.

Volumes is used for data persistence.

Secrets is used to hold sensitive information.

ConfigMap is used to hold app configurations.

You need to install 3 things on worker nodes: 1. Docker, 2. Kubelet, 3. Kubeproxy

etcd is the cluster brain (on master node). It's a key value store of the cluster state.



To create a secret/vault in Kubernetes:

    echo -n 12345 | base64
    echo -n elliot | base64

    elliot@allsafe:~/K8S$ cat secret.yml
    apiVersion: v1
    kind: Secret 
    metadata:
      name: mongodb-secret
    type: Opaque
    data:
      mongo-user: ZWxsaW90
      mongo-pass: MTIzNDU=

    elliot@allsafe:~/K8S$ kubectl apply -f secret.yml
    secret/mongodb-secret unchanged
    elliot@allsafe:~/K8S$ kubectl get secret
    NAME                  TYPE                                  DATA   AGE
    default-token-7drl6   kubernetes.io/service-account-token   3      22h
    mongodb-secret        Opaque 

You can put the deployment and service configuration in one YAML File as follows:

```
elliot@allsafe:~/K8S$ cat mongo-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-user
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-pass

---

apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```

Take a look at the mongo express deployment:

```
elliot@allsafe:~/K8S$ cat mongo-express.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-express
  labels:
    app: mongo-express
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo-express
  template:
    metadata:
      labels:
        app: mongo-express
    spec:
      containers:
        - name: mongo-express
          image: mongo-express
          ports:
            - containerPort: 8081
          env:
            - name: ME_CONFIG_MONGODB_ADMINUSERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-user
            - name: ME_CONFIG_MONGODB_ADMINPASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-pass
            - name: ME_CONFIG_MONGODB_SERVER
              valueFrom:
                configMapKeyRef:
                  name: mongodb-configmap
                  key: database_url

```


Take a look at the Mongo ConfigMap:

```
elliot@allsafe:~/K8S$ cat mongo-config-map.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongodb-configmap
data:
  database_url: mongodb-service
```

Now check the logs, you will see Mongo Express is listening for incoming connections:

```
elliot@allsafe:~/K8S$ kubectl logs mongo-express-75d49f9c65-2gp9c
Welcome to mongo-express
------------------------


(node:8) [MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprec
ated, and will be removed in a future version. To use the new Server Discover and Monitorin
g engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
Mongo Express server listening at http://0.0.0.0:8081
Server is open to allow connections from anyone (0.0.0.0)
basicAuth credentials are "admin:pass", it is recommended you change this in your config.js
!
```

Now we need to access Mongo Express from a browser so we will add an external Service (LoadBalancer), add to the end of deployment:

```
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-express-service
spec:
  selector:
    app: mongo-express
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 8081
      targetPort: 8081
      nodePort: 30000
```

Check for the external services now and notice the type (LoadBalancer) is running:

```
elliot@allsafe:~/K8S$ kubectl get services
NAME                    TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
kubernetes              ClusterIP      10.96.0.1        <none>        443/TCP          47h
mongo-express-service   LoadBalancer   10.110.34.241    <pending>     8081:30000/TCP   3m21s
mongodb-service         ClusterIP      10.105.108.240   <none>        27017/TCP        130m
```

Finally to open Mongo Express in the browser:

```
elliot@allsafe:~/K8S$ minikube service mongo-express-service
```

![Image](https://i.ibb.co/QFZXMss/Capture.png)

### Kubernetes NameSpaces

```
elliot@allsafe:~/K8S$ kubectl get namespace
NAME              STATUS   AGE
default           Active   3d2h
kube-node-lease   Active   3d2h
kube-public       Active   3d2h
kube-system       Active   3d2h
```

```
elliot@allsafe:~/K8S$ kubectl describe namespace kube-system
Name:         kube-system
Labels:       kubernetes.io/metadata.name=kube-system
Annotations:  <none>
Status:       Active

No resource quota.

No LimitRange resource.
```

How to create a namespace using cli?

```
elliot@allsafe:~/K8S$ kubectl create namespace myspace
namespace/myspace created
elliot@allsafe:~/K8S$ kubectl get namespace
NAME              STATUS   AGE
default           Active   3d2h
kube-node-lease   Active   3d2h
kube-public       Active   3d2h
kube-system       Active   3d2h
myspace           Active   4s
```

To see which namespace a configmap belongs to:

```
kubectl describe mongodb-configmap
kubectl get configmap -o yaml
```

You can specify which namespace a configmap can belong to:

```
elliot@allsafe:~/K8S$ cat mongo-config-map.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongodb-configmap
  namespace: myspace
data:
  database_url: mongodb-service

elliot@allsafe:~/K8S$ kubectl apply -f mongo-config.map.yml

elliot@allsafe:~/K8S$ kubectl get configmap -n myspace
NAME                DATA   AGE
kube-root-ca.crt    1      25m
mongodb-configmap   1      6m34s
```

### Kubernetes Ingress

It's much better than external service ( instead of http:12.12.12.12:8080 we have https:/hello-app.com)

You first have to install addson for ingress:

```
elliot@allsafe:~$ minikube addons enable ingress
```

We will do an ingress example using the kubernetes-dashboard. List everything in the kubernetes-dashboard namespace:

```
elliot@allsafe:~$ kubectl get all -n kubernetes-dashboard
NAME                                             READY   STATUS    RESTARTS   AGE
pod/dashboard-metrics-scraper-7976b667d4-pbgjk   1/1     Running   0          94s
pod/kubernetes-dashboard-6fcdf4f6d-c6llq         1/1     Running   0          94s

NAME                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/dashboard-metrics-scraper   ClusterIP   10.102.171.188   <none>        8000/TCP   94s
service/kubernetes-dashboard        ClusterIP   10.97.224.147    <none>        80/TCP     94s

NAME                                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/dashboard-metrics-scraper   1/1     1            1           94s
deployment.apps/kubernetes-dashboard        1/1     1            1           94s

NAME                                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/dashboard-metrics-scraper-7976b667d4   1         1         1       94s
replicaset.apps/kubernetes-dashboard-6fcdf4f6d         1         1         1       94s
```

Minimal Ingress Configuration:

```
elliot@allsafe:~/K8S$ cat dashboard-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dashboard-ingress
  namespace: kubernetes-dashboard
spec:
  rules:
    - host: dashboard.com
      http:
        paths:
          - path: /testpath
            pathType: Prefix
            backend:
              service:
                name: kubernetes-dashboard
                port:
                  number: 80

elliot@allsafe:~/K8S$ kubectl apply -f dashboard-ingress.yaml
ingress.networking.k8s.io/dashboard-ingress unchanged
```

See it's working now:

```
elliot@allsafe:~/K8S$ kubectl get ingress -n kubernetes-dashboard
NAME                CLASS    HOSTS           ADDRESS        PORTS   AGE
dashboard-ingress   <none>   dashboard.com   192.168.49.2   80      81s
```

Then put that entry in /etc/hosts:

```
root@allsafe:~# echo "192.168.49.2       dashboard.com" >> /etc/hosts
```
```
elliot@allsafe:~/K8S$ kubectl describe ingress dashboard-ingress -n kubernetes-dashboard
Name:             dashboard-ingress
Namespace:        kubernetes-dashboard
Address:          192.168.49.2
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
Rules:
  Host           Path  Backends
  ----           ----  --------
  dashboard.com
                 /testpath   kubernetes-dashboard:80 (172.17.0.5:9090)
Annotations:     <none>
Events:
  Type    Reason  Age                From                      Message
  ----    ------  ----               ----                      -------
  Normal  Sync    14m (x2 over 14m)  nginx-ingress-controller  Scheduled for sync
```


### Helm - Package Manager

The same idea of Ansible roles. 

Helm packages are called charts, and they consist of a few YAML configuration files and some templates that are rendered into Kubernetes manifest files. Here is the basic directory structure of a chart.

Example chart directory:

```
package-name/
  charts/
  templates/
  Chart.yaml
  LICENSE
  README.md
  requirements.yaml
  values.yaml
```

These directories and files have the following functions:

```charts/:``` Manually managed chart dependencies can be placed in this directory, though it is typically better to use requirements.yaml to dynamically link dependencies.

```templates/:``` This directory contains template files that are combined with configuration values (from values.yaml and the command line) and rendered into Kubernetes manifests. The templates use the Go programming language’s template format.

```Chart.yaml:``` A YAML file with metadata about the chart, such as chart name and version, maintainer information, a relevant website, and search keywords.

```LICENSE:``` A plaintext license for the chart.

```README.md:``` A readme file with information for users of the chart.

```requirements.yaml:``` A YAML file that lists the chart’s dependencies.

```values.yaml:``` A YAML file of default configuration values for the chart.

Important Helm Commands.

Installing Helm on Ubuntu:

```wget https://get.helm.sh/helm-v3.4.1-linux-amd64.tar.gz```


To get helm version:

```$ helm version```

Search for a chart in the hub:

```helm search hub nginx```

### Kubernetes Volumes

![PVC](https://i.ibb.co/g4w6J5M/Screenshot-2021-09-03-162816.png)



