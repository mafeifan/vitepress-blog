## Setting up a Kubernetes Cluster (Module 1)

To create a new cluster, As the root user on the control node, run:

```[root@control ~]# kubeadm init```

and do not forget to save the discovery token as a shell script.

Now as the sysadmin user, run the following commands:

``` 
[kabary@control ~]$ mkdir .kube                                                                
[kabary@control ~]$ sudo cp -i /etc/kubernetes/admin.conf .kube/config  
[kabary@control ~]$ sudo chown kabary:kabary .kube/config
```
To check if the cluster is running:

```
[kabary@control ~]$ kubectl cluster-info     
```

Installing the network plugin (Weave):

```
[kabary@control ~]$ kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```
It will be installed in the kube-system namespace.

```
[kabary@control ~]$ kubectl get pods -n kube-system 
```

Now node should be ready:

```
[kabary@control ~]$ kubectl get nodes                           
```

Now go to all the worker nodes and run that discovery tocken command that you got from the ```kubeadm init``` result:

If you forget where is the discovery token, run the following command on the control node:

```
kubedm token create --print-join-command
```

Anyways .... 

```
[root@wrk1 ~]# kubeadm join 10.0.0.4:6443 --token 0ovvan.ycoe4yc1i0ujsxq1  --discovery-token-ca-cert-hash sha256:81d561a04e0c8ac63027bf60c2edf5d9d2bf5d3ab5fb09acad│
fb09c42753dd98

[root@wrk2 ~]# kubeadm join 10.0.0.4:6443 --token 0ovvan.ycoe4yc1i0ujsxq1  --discovery-token-ca-cert-hash sha256:81d561a04e0c8ac63027bf60c2edf5d9d2bf5d3ab5fb09acad│
fb09c42753dd98 

[root@wrk3 ~]# kubeadm join 10.0.0.4:6443 --token 0ovvan.ycoe4yc1i0ujsxq1  --discovery-token-ca-cert-hash sha256:81d561a04e0c8ac63027bf60c2edf5d9d2bf5d3ab5fb09acad│
fb09c42753dd98 
```

Now after joining, you should them all worker nodes have joined the cluster:

```
[kabary@control ~]$ kubectl get nodes
NAME      STATUS   ROLES                  AGE    VERSION
control   Ready    control-plane,master   33m    v1.22.1
wrk1      Ready    <none>                 108s   v1.22.1
wrk2      Ready    <none>                 80s    v1.22.1
wrk3      Ready    <none>                 65s    v1.22.1
```

Another nice command to see what is the open port of the cluster and such:

```
[kabary@control ~]$ kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.0.4:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
preferences: {}
users:
- name: kubernetes-admin
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```

## Managing Pods and Deployments (Module 2)

### Lesson 4: Understanding API Access and Commands

To verify what can and what you can't do:


```
[kabary@control ~]$ kubectl auth can-i create deployments
yes
```

```
[kabary@control ~]$ kubectl auth can-i create secret --as linda
no
```

To see what you can create in kubernetes, run the following command:

```
kubectl api-resources | wc -l
57
```

There are around 57 creatable resource on kubernetes.

To understand what a resource do, run the following command:

```
[kabary@control ~]$ kubectl explain ingresses
```

Also a very important command, to show api versions:

```
[kabary@control ~]$ kubectl api-versions
```

To allow auto completion (Exam Tip *):

```
echo 'source <(kubectl completion bash)' >>~/.bashrc
kubectl completion bash >/etc/bash_completion.d/kubectl
```

To make indentation 2 spaces in yaml files, do the following:

```
[kabary@control ~]$ cat .vimrc
autocmd Filetype yaml setlocal ts=2 sts=2 sw=2 expandtab
```

Example of a deploying a Pod:

```
[kabary@control cka]$ cat busybox.yaml
apiVersion: v1
kind: Pod
metadata:
  name: busybox2
  namespace: default
  labels:
    app: busybox
spec:
  containers:
  - name: busy
    image: busybox
    command:
      - sleep
      - "3600"
```

To create the deployment:

```
[kabary@control cka]$ kubectl apply -f busybox.yaml
pod/busybox2 created
```

To see the running pods:

```
[kabary@control cka]$ kubectl get pods
NAME       READY   STATUS    RESTARTS   AGE
busybox2   1/1     Running   0          35s
```

Investing what you can use under pod specs (Exam Tip*):

```
[kabary@control cka]$ kubectl explain pod.spec
```

Lesson 4 Lab: Use curl to explore which Pods are present in the kube-system namespace:

```
[kabary@control ~]$ kubectl proxy &
[kabary@control ~]$ curl http://localhost:8001/version
[kabary@control ~]$ curl http://localhost:8001/api/v1/namespaces/kube-system/pods
```
### Lesson 5: Running Pods by Using Deployments

To view the available namespaces:

```
[kabary@control ~]$ kubectl get ns
NAME              STATUS   AGE
default           Active   3h8m
kube-node-lease   Active   3h8m
kube-public       Active   3h8m
kube-system       Active   3h8m
```

To view all objects in all namespaces:

```
[kabary@control ~]$ kubectl get all --all-namespaces
```

To create a new space named dev:

```
[kabary@control ~]$ kubectl create ns dev
namespace/dev created
```

You also describe a namespace using the following command:

```
[kabary@control ~]$ kubectl describe ns dev
Name:         dev
Labels:       kubernetes.io/metadata.name=dev
Annotations:  <none>
Status:       Active

No resource quota.

No LimitRange resource.
```

To create a deployment:

```
[kabary@control ~]$ kubectl create deployment --image=nginx myngin
deployment.apps/myngin created
```

To view the deployment as a yaml file (Exam Tip*):

```
[kabary@control ~]$ kubectl get deployments.apps myngin -o yaml | less
```

You can even create a yaml file using a dry run (Exam Tip*):

```
kubectl create deployment --dry-run=client --image=nginx demo --output=yaml > demo.yaml
```

To scale your replicas:

```
[kabary@control ~]$ kubectl get deployments.apps
NAME     READY   UP-TO-DATE   AVAILABLE   AGE
myngin   1/1     1            1           8m35s
[kabary@control ~]$ kubectl scale deployment myngin --replicas=3
deployment.apps/myngin scaled
[kabary@control ~]$ kubectl get deployments.apps
NAME     READY   UP-TO-DATE   AVAILABLE   AGE
myngin   1/3     3            1           9m7s
```

You can also edit a deployment using the command:

```
[kabary@control ~]$ kubectl edit deployments.apps myngin
```

To show deployments or pods labels:

```
[kabary@control ~]$ kubectl get deployments.apps --show-labels
[kabary@control ~]$ kubectl get pods --show-labels
[kabary@control ~]$ kubectl get pa --show-labels
```

To see all rollouts revisions of your deployments:


```
[kabary@control ~]$ kubectl rollout history deployment
```

You can also view more details on a specific revision:

```
[kabary@control cka]$ kubectl rollout history deployment rolling-nginx --revision=1
deployment.apps/rolling-nginx with revision #1
Pod Template:
  Labels:       app=nginx
        pod-template-hash=7794bdf7b5
  Containers:
   nginx:
    Image:      nginx:1.8
    Port:       <none>
    Host Port:  <none>
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```


To go back to a specific revision:

```
[kabary@control cka]$ kubectl rollout undo deployment rolling-nginx --to-revision=1
deployment.apps/rolling-nginx rolled back
```

Init Containers (Two containers in the same Pod, one is init to that is doing something before the other container is started):

```
[kabary@control cka]$ cat init1.yaml
apiVersion: v1
kind: Pod
metadata:
  name: initpod
spec:
  containers:
  - name: after-init
    image: busybox
    command: ['sh', '-c', 'echo its running! && sleep 3600']
  initContainers:
  - name: init-myservice
    image: busybox
    command: ['sh', '-c', 'until nslookup myservice; do echo waiting for myservice; sleep 2; done;']
```

A DaemonSet ensures that all (or some) Nodes run a copy of a Pod. 

Lesson 5 Lab: Run a deployment that starts one nginx webserver on all the cluster nodes

```
[kabary@control ~]$ cat lab5.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx-everynode
  labels:
    k8s-app: nginx-logging
spec:
  selector:
    matchLabels:
      name: nginx-everynode
  template:
    metadata:
      labels:
        name: nginx-everynode
    spec:
      containers:
      - name: nginx-everynode
        image: nginx

```

Now deploy that DaemonSet:


```
[kabary@control ~]$ kubectl create -f lab5.yaml
daemonset.apps/nginx-everynode created

[kabary@control ~]$ kubectl get daemonsets
NAME              DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
nginx-everynode   3         3         3       3            3           <none>          43s
```

### Lesson 6: Managing Storage

Here we will create two containers in one Pod that will have access to a Shared Volume:

```
[kabary@control cka]$ cat shared-volume.yml
apiVersion: v1
kind: Pod
metadata:
  name: sharedvolume
spec:
  containers:
    - name: centos1
      image: centos:7
      command:
        - sleep
        - "60"
      volumeMounts:
        - mountPath: /centos1
          name: test
    - name: centos2
      image: centos:7
      command:
        - sleep
        - "60"
      volumeMounts:
        - mountPath: /centos2
          name: test
  volumes:
    - name: test
      emptyDir: {}
```

```
[kabary@control cka]$ kubectl exec sharedvolume -it -- bin/bash
Defaulted container "centos1" out of: centos1, centos2
[root@sharedvolume /]# ls
anaconda-post.log  centos1  etc   lib    media  opt   root  sbin  sys  usr
bin                dev      home  lib64  mnt    proc  run   srv   tmp  var
[root@sharedvolume /]# touch centos1/hello
```

To create a persistent volume (PV) Local:

```
[kabary@control cka]$ cat pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-volume
  labels:
    type: local
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mydata"

[kabary@control cka]$ kubectl create -f pv.yaml
persistentvolume/pv-volume created

[kabary@control cka]$ kubectl get persistentvolume
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-volume   2Gi        RWO            Retain           Available                                   103s
```

To create a persistent volume (PV) NFS:

```
[kabary@control cka]$ cat pv-nfs.yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /data
    server: myserver
    readOnly: false

[kabary@control cka]$ kubectl create -f pv-nfs.yml
persistentvolume/pv-nfs created

[kabary@control cka]$ kubectl get pv
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-nfs      1Gi        RWX            Retain           Available                                   5s
pv-volume   2Gi        RWO            Retain           Available                                   83m
```

Creating a PVC (to claim a volume):

```
[kabary@control cka]$ cat pvc.yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pv-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi


[kabary@control cka]$ kubectl apply -f pvc.yaml
persistentvolumeclaim/pv-claim created

[kabary@control cka]$ kubectl get pvc
NAME       STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pv-claim   Bound    pv-volume   2Gi        RWO                           16s
```


So in summary, a pod uses a PVC to claim a PV:


```
[kabary@control cka]$ cat pv-pvc-pod.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv-volume
spec:
  storageClassName: manual
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: local-pv-claim
  namespace: myvol
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: local-pv-pod
  namespace: myvol
spec:
  volumes:
    - name: local-pv-storage
      persistentVolumeClaim:
        claimName: local-pv-claim
  containers:
    - name: local-pv-container
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: local-pv-storage
```

Creating a ConfigMap:

```
[kabary@control cka]$ cat nginx-custom-config.conf
server {
    listen       8888;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
}


[kabary@control cka]$ kubectl create cm nginx-cm --from-file nginx-custom-config.conf
configmap/nginx-cm created

[kabary@control cka]$ kubectl get cm nginx-cm -o yaml
apiVersion: v1
data:
  nginx-custom-config.conf: |
    server {
        listen       8888;
        server_name  localhost;
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
    }
kind: ConfigMap
metadata:
  creationTimestamp: "2021-09-08T19:13:20Z"
  name: nginx-cm
  namespace: default
  resourceVersion: "137172"
  uid: de26dda9-ca7a-47c2-90bb-594eb5f5b99c
```

Now we can use that configmap in a pod as follows:

```
[kabary@control cka]$ cat nginx-cm.yml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-cm
  labels:
    role: web
spec:
  containers:
  - name: nginx-cm
    image: nginx
    volumeMounts:
    - name: conf
      mountPath: /etc/nginx/conf.d
  volumes:
  - name: conf
    configMap:
      name: nginx-cm
      items:
      - key: nginx-custom-config.conf
        path: default.conf
```

Now apply and see how it all works :) 

```
[kabary@control cka]$ kubectl create -f nginx-cm.yml
pod/nginx-cm created
[kabary@control cka]$ kubectl exec -it nginx-cm -- bin/bash
root@nginx-cm:/# cd /etc/nginx/
conf.d/         mime.types      nginx.conf      uwsgi_params
fastcgi_params  modules/        scgi_params
root@nginx-cm:/# cd /etc/nginx/conf.d/
root@nginx-cm:/etc/nginx/conf.d# cat default.conf
server {
    listen       8888;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
}
```

An example where you can create a configmap to define a variable rather than a file definition:

```
[kabary@control cka]$ cat mycm.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mycm
data:
  color: yellow

[kabary@control cka]$ kubectl create -f mycm.yml
configmap/mycm created
```

```
[kabary@control cka]$ cat pod-cm.yml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
    - name: test
      image: nginx
      env:
        - name: COLOR
          valueFrom:
            configMapKeyRef:
              name: mycm
              key: color
  restartPolicy: Never

[kabary@control cka]$ kubectl exec -it mypod -- sh
# echo $COLOR
yellow
#
```

Creating a Secret:

```
[kabary@control cka]$ kubectl create secret generic mysecret --from-literal=pass=pass --from-literal=user=ahmed
secret/mysecret created

[kabary@control cka]$ kubectl get secrets mysecret -o yaml
apiVersion: v1
data:
  pass: cGFzcw==
  user: YWhtZWQ=
kind: Secret
metadata:
  creationTimestamp: "2021-09-08T19:56:41Z"
  name: mysecret
  namespace: default
  resourceVersion: "141168"
  uid: 6f0656e0-4064-4800-bfef-59cb434f2f03
type: Opaque
```

And you can use it very similar to a configMap:

```
[kabary@control cka]$ kubectl explain pod.spec.containers.env.valueFrom.secretKeyRef
```

Lesson 6 Lab: Configure a 2 GiB Persistent storage solution that uses a permanent directory on the host that runs the pod. Configure a deployment that runs the httpd web server and mounts the storage on /var/www.

Here is the solution:

```
[kabary@control ~]$ cat lab6.yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mypv
spec:
  storageClassName: manual
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/lab6
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypvc
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: mypod6
spec:
  volumes:
    - name: local-storage
      persistentVolumeClaim:
        claimName: mypvc
  containers:
    - name: test6
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/var/www"
          name: local-storage
```


### Lesson 7: Managing Pod Networking

All pods are on the same network:

```
[kabary@control ~]$ kubectl exec busybox2 -- ip a s
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
12: eth0@if13: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1376 qdisc noqueue
    link/ether ea:ca:a4:4c:55:fc brd ff:ff:ff:ff:ff:ff
    inet 10.36.0.1/12 brd 10.47.255.255 scope global eth0
       valid_lft forever preferred_lft forever


[kabary@control ~]$ kubectl exec busybox2 -- ping 10.44.0.2
PING 10.44.0.2 (10.44.0.2): 56 data bytes
64 bytes from 10.44.0.2: seq=0 ttl=64 time=1.203 ms
64 bytes from 10.44.0.2: seq=1 ttl=64 time=2.877 ms
64 bytes from 10.44.0.2: seq=2 ttl=64 time=0.764 ms
64 bytes from 10.44.0.2: seq=3 ttl=64 time=1.001 ms
^C
```

ClusterIP:

![](https://miro.medium.com/max/1750/1*I4j4xaaxsuchdvO66V3lAg.png)

NodePort:

![](https://miro.medium.com/max/1750/1*CdyUtG-8CfGu2oFC5s0KwA.png)

LoadBalancer:

![](https://miro.medium.com/max/1750/1*P-10bQg_1VheU9DRlvHBTQ.png)

Ingress:

![](https://miro.medium.com/max/1750/1*KIVa4hUVZxg-8Ncabo8pdg.png)


```
[kabary@control cka]$ kubectl create deployment nginxsvc --image=nginx
deployment.apps/nginxsvc created

[kabary@control cka]$ kubectl scale deployment nginxsvc --replicas=3
deployment.apps/nginxsvc scaled

[kabary@control cka]$ kubectl expose deployment nginxsvc --port=80
service/nginxsvc exposed

[kabary@control cka]$ kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP   46h
myservice    ClusterIP   10.102.4.206    <none>        80/TCP    42h
nginxsvc     ClusterIP   10.108.19.164   <none>        80/TCP    4s

[kabary@control cka]$ kubectl describe svc nginxsvc
Name:              nginxsvc
Namespace:         default
Labels:            app=nginxsvc
Annotations:       <none>
Selector:          app=nginxsvc
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.108.19.164
IPs:               10.108.19.164
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.36.0.7:80,10.44.0.7:80,10.44.0.8:80
Session Affinity:  None
Events:            <none>

[kabary@control ~]$ curl http://10.108.19.164
```

Now let's make it NodePort (Just edit two lines):

```
[kabary@control ~]$ kubectl edit svc nginxsvc

  - nodePort: 32000
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: nginxsvc
  sessionAffinity: None
  type: NodePort

[kabary@control ~]$ kubectl edit svc nginxsvc
service/nginxsvc edited
```

Now you should be able to access the nginx webserver throught the ip address of the control node:

```
[kabary@control ~]$ curl http://10.0.0.4:32000
```













# Halfway Through :)



