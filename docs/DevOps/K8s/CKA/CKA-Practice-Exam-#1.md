### Question 1: Creating a Cluster

1. Use `kubeadm` to create a cluster: control.example.com is setup as the cluster controller and worker {1 .. 3} are setup as worker nodes. 
1. The task is complete if `kubectl get nodes` shows all nodes in a "ready" state.

## Solution:

```
[kabary@control ~]$ cat .vimrc
autocmd FileType yaml setlocal ts=2 sts=2 sw=2 expandtab
```

**Also enable Tab completion: See Kubernete Doc. Never memorize anything.**


```bash
[root@control ~]# kubeadm init
[kabary@control ~]$ mkdir .kube
[kabary@control ~]$ sudo cp /etc/kubernetes/admin.conf .kube/config
[kabary@control ~]$ sudo chown kabary:kabary .kube/config
[kabary@control ~]$ kubectl get nodes
NAME      STATUS     ROLES                  AGE    VERSION
control   NotReady   control-plane,master   4m7s   v1.22.1
[kabary@control ~]$ kubeadm token create --print-join-command

[root@wrk1 ~]# kubeadm join 10.0.0.4:6443 --token oz52ec.9k3hjygbzyb31o4l --discovery-token-ca-cert-hash sha256:fe28575edd59a51c76f3429f660d5ede5481b67c4795325b9372b1208dd95a69


[kabary@control ~]$ kubectl get nodes
NAME      STATUS   ROLES                  AGE     VERSION
control   Ready    control-plane,master   12m     v1.22.1
wrk1      Ready    <none>                 2m58s   v1.22.1
wrk2      Ready    <none>                 4m14s   v1.22.1
wrk3      Ready    <none>                 2m35s   v1.22.1
```

### Question 2: Creating a POD

Create a Pod that runs the latest version of the alpine image. This Pod should be configured to sleep 3600 seconds and it should be created in the mynamespace namespace. Make sure that the Pod is automatically restarted if it fails.

## Solution:

```
[kabary@control ~]$ cat question2.yml
apiVersion: v1
kind: Pod
metadata:
  name: q2-pod
  namespace: mynamespace
spec:
  containers:
    - name: q2-pod
      image: alpine:latest
      command:
        - sleep
        - "3600"
  restartPolicy: OnFailure

[kabary@control ~]$ kubectl create -f question2.yml
pod/q2-pod created

[kabary@control ~]$ kubectl get pods -n mynamespace
NAME     READY   STATUS    RESTARTS   AGE
q2-pod   1/1     Running   0          7s
```

### Question 3: Creating a Pod with an Init container

Configure a Pod that runs two containers. The first container should create the file `/data/runfile.txt`. 
The second container should only start once
this file has been created. 
The second container should run the sleep 10000 command as its task.

## Solution:

```
[kabary@control ~]$ cat question3.yml
apiVersion: v1
kind: Pod
metadata:
  name: q3-pod
spec:
  containers:
    - name: q3-pod
      image: busybox:latest
      command:
        - sleep
        - "10000"
  initContainers:
    - name: init-cont
      image: busybox:latest
      command: ['sh', '-c', 'mkdir /data; touch /data/runfile.txt; sleep 100']
```

### Question 4: Configuring Storage

Create a Persistent Volume that uses local host storage. This PV should be accessible from all namespaces. Run a Pod with the name pv-pod
that uses this persistent volume from the "myvol" namespace.

## Solution:

```
[kabary@control ~]$ kubectl create ns myvol

[kabary@control ~]$ cat pvq4.yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pvq4
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Recycle
  hostPath:
    path: /tmp

[kabary@control ~]$ cat pvcq4.yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvcq4
  namespace: myvol
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi

[kabary@control ~]$ cat podq4.yml
apiVersion: v1
kind: Pod
metadata:
  name: pv-pod
  namespace: myvol
spec:
  containers:
    - name: podq4
      image: nginx
      volumeMounts:
      - mountPath: "/var/www/html"
        name: mypd
  volumes:
    - name: mypd
      persistentVolumeClaim:
        claimName: pvcq4
```
 
### Question 5: Running a Pod Once

In the run-once namespace, run a Pod with the name xxazz-pod, using the alpine image and the command sleep 3600. Create the namespace if needed.
Ensure that the task in the Pod runs once, and after running it once, the Pod stops.

## Solution:

```
[kabary@control ~]$ cat q5.yml
apiVersion: v1
kind: Pod
metadata:
  name: xxazz-pod
  namespace: run-once
spec:
  containers:
    - name: alpinecont
      image: alpine
      command:
        - sleep
        - "3600"
  restartPolicy: Never
```

### Question 6: Managing Updates 

Create a Deployment that runs Nginx, based on the 1.14 version. After creating it, enable recording, and perform a rolling upgrade to upgrade the latest
version of Nginx. After successfully performing the upgrade, undo the upgrade again!
 
## Solution:

```
[kabary@control ~]$ cat q6.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14
        ports:
        - containerPort: 80
```

```
[kabary@control ~]$ kubectl create -f q6.yml
[kabary@control ~]$ kubectl --record deployment.apps/nginx-deployment set image deployment.v1.apps/nginx-deployment nginx=nginx:latest
[kabary@control ~]$ kubectl rollout history deployment nginx-deployment
[kabary@control ~]$ kubectl rollout undo deployment nginx-deployment
```



### Question 7: Using Labels

Find all Kubernetes objects in all namespaces that have the label k8s-app set to the value of kube-dns.

## Solution:

```

k get all -A --show-labels | grep "k8s-app=kube-dns" # 有可以，但是不标准， --selector 是专门用来筛选标签的

[kabary@control ~]$ kubectl get all --all-namespaces --selector k8s-app=kube-dns

```

### Question 8: Using ConfigMaps

Create a ConfigMap that defines the variable myuser=mypassword. Create a Pod that runs alpine, and uses this variable from the ConfigMap.
 
## Solution:

```
[kabary@control ~]$ kubectl create cm myconfig --from-literal myuser=mypass

[kabary@control ~]$ kubectl get cm myconfig -o yaml

[kabary@control ~]$ cat q8.yml
apiVersion: v1
kind: Pod
metadata:
  name: pod8
spec:
  containers:
  - name: pod8
    image: alpine
    command:
      - sleep
      -  "3600"
    env:
      - name: myuser
        valueFrom:
          configMapKeyRef:
            name: myconfig
            key: myuser
```


### Question 9: Running Parallel Pods

Create a solution that runs multiple Pods in parallel. The solution should start Nginx, and ensure that it is started on every node in the cluster
in a way that if a new node is added, an Nginx Pod is automatically added to that node as well.

## Solution:

```
[kabary@control ~]$ cat q9.yml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: question9
spec:
  selector:
    matchLabels:
      name: nginx-stuff
  template:
    metadata:
      labels:
        name: nginx-stuff
    spec:
      containers:
         - name: cont9
           image: nginx:latest

[kabary@control ~]$ kubectl create -f q9.yml

[kabary@control ~]$ kubectl get pods -o wide
```

### Question 10: Marking a Node as Unavailable

1. Mark node worker3 as unavailable. Ensure that all Pods are moved away from the local node and started again somewhere else. 
1. After successfully executing this task, make sure worker3 can be used again.

## Solution:

```
[kabary@control ~]$ kubectl get nodes
[kabary@control ~]$ kubectl drain wrk3
[kabary@control ~]$ kubectl uncordon wrk3
```
  
### Question 11: Using Maintenance Mode

1. Put the node worker2 in maintenace mode, such that no new Pods will be scheduled on it.
1. After successfully executing this task, undo it.


## Solution:

```
k8s@terminal:~$ kubectl cordon cluster1-worker1 
node/cluster1-worker1 cordoned

k8s@terminal:~$ kubectl get nodes 
NAME               STATUS                     ROLES                  AGE    VERSION
cluster1-master1   Ready                      control-plane,master   143d   v1.21.0
cluster1-worker1   Ready,SchedulingDisabled   <none>                 143d   v1.21.0
cluster1-worker2   Ready                      <none>                 143d   v1.21.0

k8s@terminal:~$ kubectl uncordon cluster1-worker1
node/cluster1-worker1 uncordoned

k8s@terminal:~$ kubectl get nodes 
NAME               STATUS   ROLES                  AGE    VERSION
cluster1-master1   Ready    control-plane,master   143d   v1.21.0
cluster1-worker1   Ready    <none>                 143d   v1.21.0
cluster1-worker2   Ready    <none>                 143d   v1.21.0
```

### Question 12: Backing up the Etcd Database

Create a backup of the Etcd database. API Version 3 is used for the current database. Write the backup to `/var/exam/etcd-backup`
 
## Solution:

```
[root@control ~]# yum whatprovides */etcdctl
[root@control ~]# yum install etcd
[root@control ~]# ps -ef | grep etcd
[root@control ~]# ETCDCTL_API=3 etcdctl  --cacert ca.crt --cert server.crt --key server.key --endpoints  https://127.0.0.1:2379 snapshot save /var/exam/etcd-backup
```

### Question 13: Using DNS

Start a Pod that runs the busybox image. Use the name busy33 for this Pod. Expose this Pod on cluster IP address. Configure the Pod 
and Service such that DNS name resolution is possible, and use the nslookup command to look up the names of both. Write the output of the 
DNS lookup command to the `/var/exam/dnsnames.txt`

## Solution:

```
[kabary@control ~]$ cat podq13.yml
apiVersion: v1
kind: Pod
metadata:
  name: busy33
  labels:
    app: busy33
spec:
  containers:
    - name: con13
      image: busybox:latest
      command:
        - sleep
        - "3600"

[kabary@control ~]$ kubectl expose pod busy33 --port 3333
service/busy33 exposed

[kabary@control ~]$ kubectl exec -it busy33 -- nslookup busy33
Server:         10.96.0.10
Address:        10.96.0.10:53

Name:   busy33.default.svc.cluster.local
Address: 10.110.185.9

[kabary@control ~]$ kubectl get svc
NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
busy33       ClusterIP   10.110.185.9   <none>        3333/TCP   2m44s

[kabary@control ~]$ kubectl get svc busy33 -o yaml
```

### Question 14: Configure a Node to Autostart a Pod (Static Pod)

Configure your node worker3 to automatically start a Pod that runs an Nginx webserver, using the name auto-web. Put the manifest file in 
`/etc/kubernetes/manifests`

## Solution:

```
[root@wrk3 ~]# cat /var/lib/kubelet/config.yaml  | grep -i static
staticPodPath: /etc/kubernetes/manifests

root@wrk3 manifests]# systemctl restart kubelet
[root@wrk3 manifests]# cat auto-web.yml
apiVersion: v1
kind: Pod
metadata:
  name: auto-web
  labels:
    role: auto-web
spec:
  containers:
    - name: web
      image: nginx
      ports:
        - name: web
          containerPort: 80
          protocol: TCP
[root@wrk3 manifests]# pwd
/etc/kubernetes/manifests

[root@wrk3 manifests]# exit
logout

[kabary@wrk3 ~]$ exit
logout
Connection to wrk3 closed.

[kabary@control ~]$ kubectl get pods | grep auto
auto-web-wrk3                      1/1     Running   0               46s
```
### Question 15: Finding the Pod with the Highest CPU Load

Find the Pod with the Highest CPU load and write its name to the file `/var/exam/cpu-pods.txt`

## Solution:

```
[kabary@control ~]$ kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

[kabary@control ~]$ kubectl get pods -n kube-system | grep metr
metrics-server-6dfddc5fb8-k6xv6   0/1     Running   0               56s

kubectl -n kube-system edit deployments.apps metrics-server

   - --kubelet-insecure-tls
   - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname

[kabary@control ~]$ kubectl top pod --all-namespaces
NAMESPACE     NAME                               CPU(cores)   MEMORY(bytes)
default       auto-web-wrk3                      0m           2Mi
default       busy33                             0m           0Mi
default       nginx-deployment-d9d8cf5c7-bzq6w   0m           1Mi
default       nginx-deployment-d9d8cf5c7-qbkxw   0m           1Mi
default       nginx-deployment-d9d8cf5c7-v67cf   0m           1Mi
default       pod8                               0m           0Mi
default       q3-pod                             0m           0Mi
default       question9-jnv6j                    0m           1Mi
default       question9-klsm2                    0m           1Mi
default       question9-tx7g7                    1m           1Mi
kube-system   coredns-78fcd69978-vhxjm           2m           15Mi
kube-system   coredns-78fcd69978-wd2p5           2m           16Mi
kube-system   etcd-control                       16m          319Mi
kube-system   kube-apiserver-control             49m          303Mi
kube-system   kube-controller-manager-control    16m          52Mi
kube-system   kube-proxy-dnkwv                   1m           14Mi
kube-system   kube-proxy-f9q2j                   1m           16Mi
kube-system   kube-proxy-hhgnt                   1m           16Mi
kube-system   kube-proxy-szrj8                   1m           16Mi
kube-system   kube-scheduler-control             4m           23Mi
kube-system   metrics-server-5cd859f5c-x6c2v     4m           19Mi
kube-system   weave-net-cfnfl                    2m           79Mi
kube-system   weave-net-dm4zb                    2m           74Mi
kube-system   weave-net-rpq9p                    2m           75Mi
kube-system   weave-net-szj2w                    2m           79Mi
```

### Question 16: Creating a NetworkPolicy

Run an nginx Pod in the default namespace. Also run a busybox Pod in the secure namespace. Create a NetworkPolicy that only allows access to the 
nginx Pod from the busybox Pod in the secure namespace and denies all other access. 

## Solution:

**Label the NameSpace for God Sake**

```
[kabary@control ~]$ cat netpool.yml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: only-allow-from-busybox-secure-ns
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          type: secure
      podSelector:
        matchLabels:
          type: monitoring1

[kabary@control ~]$ cat bbox.yml
apiVersion: v1
kind: Pod
metadata:
  name:  busyx1
  namespace: secure
  labels:
    type: monitoring1
spec:
  containers:
    - name: b11
      image: busybox:latest
      command: [ "sleep", "3600"]

[kabary@control ~]$ cat bbox2.yml
apiVersion: v1
kind: Pod
metadata:
  name:  busyx2
  namespace: secure
  labels:
    type: monitoring2
spec:
  containers:
    - name: b11
      image: busybox:latest
      command: [ "sleep", "3600"]

[kabary@control ~]$ kubectl create namespace secure

[kabary@control ~]$ kubectl label namespaces secure type=secure

[kabary@control ~]$ kubectl run --image=nginx:latest ngxpod

[kabary@control ~]$ kubectl label pod ngxpod app=web

[kabary@control ~]$kubectl expose pod ngxpod --port 80

[kabary@control ~]$ kubectl exec -n secure busyx2 -- wget --spider --timeout=1 ngxpod.default.svc.cluster.local

[kabary@control ~]$ kubectl exec -n secure busyx1 -- wget --spider --timeout=1 ngxpod.default.svc.cluster.local
```

### Question 17: Configuring a High Availability Cluster

Create a 5-node HA cluster, using 3 controller nodes and 2 worker nodes. 

## Solution:

1. Initialize the control plane: 

```
sudo kubeadm init --control-plane-endpoint "LOAD_BALANCER_DNS:LOAD_BALANCER_PORT" --upload-certs
```

2. Apply the CNI plugin of your choice:

```
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

3. Type the following and watch the pods of the control plane components get started:

```
kubectl get pod -n kube-system -w
```

4. Controllers now can join

Execute the join command that was previously given to you by the kubeadm init output on the first node. It should look something like this: 

```
sudo kubeadm join 192.168.0.200:6443 --token 9vr73a.a8uxyaju799qwdjv --discovery-token-ca-cert-hash sha256:7c2e69131a36ae2a042a339b33381c6d0d43887e2de83720eff5359e26aec866 --control-plane --certificate-key f8902e114ef118304e561c3ecd4d0b543adc226b7a07f675f56564185ffe0c07
```

5. Workers now can join