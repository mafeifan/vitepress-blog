https://github.com/kabary/kubernetes-cka/wiki/CKA-Killer-20-Questions

To make vim use 2 spaces for a tab edit `~/.vimrc` to contain:

```
set tabstop=2
set expandtab
set shiftwidth=2
```

To enable bash completion:

```echo 'source <(kubectl completion bash)' >>~/.bashrc```

### Question 1: Contexts

1. You have access to multiple clusters from your main terminal through kubectl contexts. Write all those context names into `/opt/course/1/contexts`.

1. Next write a command to display the current context into `/opt/course/1/context_default_kubectl.sh`, the command should use kubectl.

1. Finally write a second command doing the same thing into `/opt/course/1/context_default_no_kubectl.sh`, but without the use of kubectl.

### Solution:

```k8s@terminal:~$ kubectl config get-contexts > /opt/course/1/contexts```

```k8s@terminal:~$ echo "kubectl config current-context"> /opt/course/1/context_default_kubectl.sh```

```k8s@terminal:~$ cat  ~/.kube/config | grep current > /opt/course/1/context_default_kubectl.sh```

### Question 2: Schedule Pod on Master Node

 Use context: kubectl config use-context k8s-c1-H

Create a single Pod of image httpd:2.4.41-alpine in Namespace default. The Pod should be named pod1 and the container should be named pod1-container. This Pod should only be scheduled on a master node, do not add new labels any nodes.

Shortly write the reason on why Pods are by default not scheduled on master nodes into /opt/course/2/master_schedule_reason

### Solution:

```
k8s@terminal:~$ kubectl describe node cluster1-master1  | grep -i taint 
Taints:             node-role.kubernetes.io/master:NoSchedule

k8s@terminal:~$ kubectl get node cluster1-master1 --show-labels
```

```
k8s@terminal:~$ cat 2.yaml 
apiVersion: v1
kind: Pod
metadata:
  namespace: default
  name: pod1
spec:
  containers:
    - image: httpd:2.4.41-alpine
      name: pod1-container
      command: ["sleep", "3600"]
  tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
  nodeSelector:
    node-role.kubernetes.io/master: ""
```

Finally the short reason why Pods are not scheduled on master nodes by default:

```
# /opt/course/2/master_schedule_reason

master nodes usually have a taint defined
```

### Question 3: Scale down StatefulSet

Use context: kubectl config use-context k8s-c1-H

There are two Pods named o3db-* in Namespace project-c13. 

C13 management asked you to scale the Pods down to one replica to save resources. Record the action.

```
k8s@terminal:~$ kubectl get statefulsets.apps -n project-c13
NAME   READY   AGE
o3db   2/2     139d


k8s@terminal:~$ kubectl scale  statefulset --record --replicas=1 -n project-c13 o3db 
statefulset.apps/o3db scaled

8s@terminal:~$ kubectl get statefulsets.apps -n project-c13
NAME   READY   AGE
o3db   1/1     139d
```



### Question 4: Pod Ready if Service is reachable

Use context: kubectl config use-context k8s-c1-H

Do the following in Namespace default. Create a single Pod named ready-if-service-ready of image nginx:1.16.1-alpine. Configure a LivenessProbe which simply runs true. Also configure a ReadinessProbe which does check if the url http://service-am-i-ready:80 is reachable, you can use wget -T2 -O- http://service-am-i-ready:80 for this. Start the Pod and confirm it isn't ready because of the ReadinessProbe.

Create a second Pod named am-i-ready of image nginx:1.16.1-alpine with label id: cross-server-ready. The already existing Service service-am-i-ready should now have that second Pod as endpoint.

Now the first Pod should be in ready state, confirm that.

### Solution:


```
k8s@terminal:~$ cat pod4.yml 
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: ready-if-service-ready
  name: ready-if-service-ready
spec:
  containers:
  - image: nginx:1.16.1-alpine
    name: ready-if-service-ready
    resources: {}
    livenessProbe:
      exec:
        command:
          - echo
          - hi
    readinessProbe:
      exec:
        command:
          - wget
          - -T2
          - -O-
          - http://service-am-i-ready:80
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

```
k8s@terminal:~$ cat pod42.yml 
apiVersion: v1
kind: Pod
metadata:
  name: am-i-ready
  labels:
    id: cross-server-ready
spec:
  containers:
    - image: nginx:1.16.1-alpine
      name: amiready
```

### Question 5:  Kubectl sorting

Use context: kubectl config use-context k8s-c1-H

There are various Pods in all namespaces. Write a command into /opt/course/5/find_pods.sh which lists all Pods sorted by their AGE (metadata.creationTimestamp).

Write a second command into /opt/course/5/find_pods_uid.sh which lists all Pods sorted by field metadata.uid. Use kubectl sorting for both commands.

### Solution:

```
k8s@terminal:~$ echo "kubectl get pods --all-namespaces --sort-by .metadata.creationTimestamp" > /opt/course/5/find_pods.sh 
```

```
k8s@terminal:~$ kubectl get pods --all-namespaces --sort-by .metadata.uid 
```
### Question 6: Storage, PV, PVC, Pod volume

Use context: kubectl config use-context k8s-c1-H

Create a new PersistentVolume named safari-pv. It should have a capacity of 2Gi, accessMode ReadWriteOnce, hostPath /Volumes/Data and no storageClassName defined.

Next create a new PersistentVolumeClaim in Namespace project-tiger named safari-pvc . It should request 2Gi storage, accessMode ReadWriteOnce and should not define a storageClassName. The PVC should bound to the PV correctly.

Finally create a new Deployment safari in Namespace project-tiger which mounts that volume at /tmp/safari-data. The Pods of that Deployment should be of image httpd:2.4.41-alpine.

### Solution:

```
k8s@terminal:~$ cat pv6.yml 
apiVersion: v1
kind: PersistentVolume
metadata:
  name: safari-pv 
  labels:
    type: local
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/Volumes/Data"

k8s@terminal:~$ cat pvc6.yml 
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: safari-pvc
  namespace: project-tiger
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi

k8s@terminal:~$ cat dep6.yml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: safari
  namespace: project-tiger
spec:
  replicas: 1
  selector: 
    matchLabels: 
      app: task6
  template:
    metadata:
      labels:
        app: task6
    spec:
      volumes:
        - name: myvol6
          persistentVolumeClaim:
            claimName: safari-pvc
      containers:
        - name: pod6-cont
          image: httpd:2.4.41-alpine
          volumeMounts:
            - mountPath: "/tmp/safari-data"
              name: myvol6
```

### Question 7: Node and Pod Resource Usage

Use context: kubectl config use-context k8s-c1-H

The metrics-server hasn't been installed yet in the cluster, but it's something that should be done soon. Your college would already like to know the kubectl commands to:

1. show node resource usage
1. show Pod and their containers resource usage

Please write the commands into /opt/course/7/node.sh and /opt/course/7/pod.sh.

### Solution:

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/#%E6%97%A0%E6%B3%95%E5%9C%A8-kubeadm-%E9%9B%86%E7%BE%A4%E4%B8%AD%E5%AE%89%E5%85%A8%E5%9C%B0%E4%BD%BF%E7%94%A8-metrics-server

k8s@terminal:~$ kubectl top  node

k8s@terminal:~$ kubectl top pod --containers=true
```
### Question 8: Get Master Information

Use context: kubectl config use-context k8s-c1-H

Ssh into the master node with ssh cluster1-master1. Check how the master components kubelet, kube-apiserver, kube-scheduler, kube-controller-manager and etcd are started/installed on the master node. Also find out the name of the DNS application and how it's started/installed on the master node.

Write your findings into file /opt/course/8/master-components.txt. The file should be structured like:

```
# /opt/course/8/master-components.txt
kubelet: [TYPE]
kube-apiserver: [TYPE]
kube-scheduler: [TYPE]
kube-controller-manager: [TYPE]
etcd: [TYPE]
dns: [TYPE] [NAME]
```
`Choices of [TYPE] are: not-installed, process, static-pod, pod`

### Solution:

```
k8s@terminal:~$ ssh cluster1-master1

root@cluster1-master1:~# ps -ef | grep -i kubelet

root@cluster1-master1:/var/lib/kubelet# cat /var/lib/kubelet/config.yaml  | grep -i static
staticPodPath: /etc/kubernetes/manifests

root@cluster1-master1:/var/lib/kubelet# ls /etc/kubernetes/manifests/
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler-special.yaml  kube-scheduler.yaml

root@cluster1-master1:~# kubectl get all -A  | grep -i dns
kube-system       pod/coredns-558bd4d5db-nvhgx                   1/1     Running            0          139d
kube-system       pod/coredns-558bd4d5db-tl6rl                   1/1     Running            0          139d
kube-system   service/kube-dns             ClusterIP   10.96.0.10       <none>        53/UDP,53/TCP,9153/TCP   139d
kube-system       deployment.apps/coredns                2/2     2            2           139d
kube-system       replicaset.apps/coredns-558bd4d5db                2         2         2       139d
```

```
kubelet: [PROCESS]
kube-apiserver: [Static POD]
kube-scheduler: [Static POD]
kube-controller-manager: [Static POD]
etcd: [Static POD]
dns: [POD] [COREDNS]
```

### Question 9:  Kill Scheduler, Manual Scheduling

Task weight: 5%

Use context: kubectl config use-context k8s-c2-AC

Ssh into the master node with ssh cluster2-master1. Temporarily stop the kube-scheduler, this means in a way that you can start it again afterwards.

Create a single Pod named manual-schedule of image httpd:2.4-alpine, confirm its started but not scheduled on any node.

Now you're the scheduler and have all its power, manually schedule that Pod on node cluster2-master1. Make sure it's running.

Start the kube-scheduler again and confirm its running correctly by creating a second Pod named manual-schedule2 of image httpd:2.4-alpine and check if it's running on cluster2-worker1.

### Solution:

```
root@cluster2-master1:~# kubectl get pods -n kube-system | grep sched
kube-scheduler-cluster2-master1            1/1     Running   0          139d
```

To kill the scheduler, move it from the manifests directory (as it's basically a static pod):

```
root@cluster2-master1:~# mv /etc/kubernetes/manifests/kube-scheduler.yaml /etc/kubernetes/
```

And it shall be stopped:

```
root@cluster2-master1:~# kubectl get pods -n kube-system | grep sched
```
Now create the Pod:

```
root@cluster2-master1:~# kubectl run manual-schedule --image=httpd:2.4-alpine
pod/manual-schedule created

root@cluster2-master1:~# kubectl get pods
NAME              READY   STATUS    RESTARTS   AGE
manual-schedule   0/1     Pending   0          5s
```

```
root@cluster2-master1:~# kubectl get pod manual-schedule -o yaml > 9.yml
```

```
root@cluster2-master1:~# kubectl replace --force -f 9.yml 
pod "manual-schedule" deleted
pod/manual-schedule replaced

root@cluster2-master1:~# kubectl get pods -o wide
NAME              READY   STATUS    RESTARTS   AGE   IP          NODE               NOMINATED NODE   READINESS GATES
manual-schedule   1/1     Running   0          52s   10.32.0.4   cluster2-master1   <none>           <none>
```

Start the scheduler again:

```
root@cluster2-master1:~# mv /etc/kubernetes/kube-scheduler.yaml  /etc/kubernetes/manifests/

root@cluster2-master1:~# kubectl get pods -A | grep -i sched
default       manual-schedule                            1/1     Running   0          113s
kube-system   kube-scheduler-cluster2-master1            0/1     Running   0          13s


root@cluster2-master1:~# kubectl run  manual-schedule2 --image httpd:2.4-alpine 
pod/manual-schedule2 created

root@cluster2-master1:~# kubectl get pods -o wide
NAME               READY   STATUS             RESTARTS   AGE     IP          NODE               NOMINATED NODE   READINESS GATES
manual-schedule    1/1     Running            0          4m16s   10.32.0.4   cluster2-master1   <none>           <none>
manual-schedule2   1/1     Running            0          4s      10.44.0.2   cluster2-worker1   <none>           <none>
```


### Question 10: RBAC ServiceAccount Role RoleBinding

Use context: kubectl config use-context k8s-c1-H

Create a new ServiceAccount processor in Namespace project-hamster. Create a Role and RoleBinding, both named processor as well. These should allow the new SA to only create Secrets and ConfigMaps in that Namespace.


### Solution: 

```
k8s@terminal:~$ kubectl create serviceaccount processor --namespace project-hamster


k8s@terminal:~$ cat role10.yml 
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: project-hamster
  name: processor
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["secrets", "configmaps"]
  verbs: ["create"]

k8s@terminal:~$ cat rolebind10.yml 
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: processor
  namespace: project-hamster
subjects:
- kind: ServiceAccount
  name: processor # "name" is case sensitive
roleRef:
  kind: Role #this must be Role or ClusterRole
  name: processor # this must match the name of the Role or ClusterRole you wish to bind to
  apiGroup: rbac.authorization.k8s.io
```


To test it:

```
k8s@terminal:~$ kubectl -n project-hamster auth can-i create secret --as system:serviceaccount:project-hamster:processor
yes

k8s@terminal:~$ kubectl -n project-hamster auth can-i create configmaps --as system:serviceaccount:project-hamster:processor
yes

k8s@terminal:~$ kubectl -n project-hamster auth can-i create pod --as system:serviceaccount:project-hamster:processor
no
```


### Question 11: DaemonSet on all Nodes

Use context: kubectl config use-context k8s-c1-H

Use Namespace project-tiger for the following. Create a DaemonSet named ds-important with image httpd:2.4-alpine and labels id=ds-important and uuid=18426a0b-5f59-4e10-923f-c0e078e82462. The Pods it creates should request 10 millicore cpu and 10 megabytes memory. The Pods of that DaemonSet should run on all nodes.


### Solution:

```
k8s@terminal:~$ cat q11.yml 
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ds-important
  namespace: project-tiger
  labels:
    id: ds-important
    uuid: 18426a0b-5f59-4e10-923f-c0e078e82462
spec:
  selector:
    matchLabels:
      id: ds-important
      uuid: 18426a0b-5f59-4e10-923f-c0e078e82462
  template:
    metadata:
      labels:
        id: ds-important
        uuid: 18426a0b-5f59-4e10-923f-c0e078e82462
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: ds-cont
        image: httpd:2.4-alpine
        resources:
          limits:
            memory: 10Mi
          requests:
            cpu: 10m
            memory: 10Mi
```

### Question 12: Deployment on all Nodes

Use context: kubectl config use-context k8s-c1-H

Use Namespace project-tiger for the following. Create a Deployment named deploy-important with label id=very-important (the pods should also have this label) and 3 replicas. It should contain two containers, the first named container1 with image nginx:1.17.6-alpine and the second one named container2 with image kubernetes/pause.

There should be only ever one Pod of that Deployment running on one worker node. We have two worker nodes: cluster1-worker1 and cluster1-worker2. Because the Deployment has three replicas the result should be that on both nodes one Pod is running. The third Pod won't be scheduled, unless a new worker node will be added.

In a way we kind of simulate the behaviour of a DaemonSet here, but using a Deployment and a fixed number of replicas.


### Solution:

```
k8s@terminal:~$ cat q12.yml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-important
  namespace: project-tiger
  labels:
    id: very-important
spec:
  replicas: 3
  selector:
    matchLabels:
      id: very-important
  template:
    metadata:
      labels:
        id: very-important
    spec:
      containers:
      - image: nginx:1.17.6-alpine
        name: container1
      - image: kubernetes/pause
        name: container2
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
               - key: id
                 operator: In
                 values:
                 - very-important
            topologyKey: kubernetes.io/hostname
```

```
k8s@terminal:~$ kubectl get pods -n project-tiger -o wide -l id=very-important
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE               NOMINATED NODE   READINESS GATES
deploy-important-658db6465d-84dp9   0/2     Pending   0          48s   <none>       <none>             <none>           <none>
deploy-important-658db6465d-9kn64   2/2     Running   0          48s   10.44.0.20   cluster1-worker1   <none>           <none>
deploy-important-658db6465d-fgg59   2/2     Running   0          48s   10.47.0.26   cluster1-worker2   <none>           <none>
```
### Question 13: Multi Containers and Pod shared Volume

Use context: kubectl config use-context k8s-c1-H

Create a Pod named multi-container-playground in Namespace default with three containers, named c1, c2 and c3. There should be a volume attached to that Pod and mounted into every container, but the volume shouldn't be persisted or shared with other Pods.

Container c1 should be of image nginx:1.17.6-alpine and have the name of the node where its Pod is running on value available as environment variable MY_NODE_NAME.

Container c2 should be of image busybox:1.31.1 and write the output of the date command every second in the shared volume into file date.log. You can use while true; do date >> /your/vol/path/date.log; sleep 1; done for this.

Container c3 should be of image busybox:1.31.1 and constantly write the content of file date.log from the shared volume to stdout. You can use tail -f /your/vol/path/date.log for this.

Check the logs of container c3 to confirm correct setup.

### Solution:

```
k8s@terminal:~$ cat q13.yml 
apiVersion: v1
kind: Pod
metadata: 
  name: multi-container-playground
spec:
  containers:
    - image: nginx:1.17.6-alpine
      name: c1
      env:
        - name: MY_NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
      volumeMounts: 
        - mountPath: /vol
          name: vol
    - image: busybox:1.31.1
      name: c2
      command: ["sh", "-c", "while true; do date >> /vol/date.log; sleep 1; done"]
      volumeMounts: 
        - mountPath: /vol
          name: vol
    - image: busybox:1.31.1
      name: c3
      command: ["sh", "-c", "tail -f /vol/date.log"]
      volumeMounts: 
        - mountPath: /vol
          name: vol
  volumes:
    - name: vol
      emptyDir: {}
  restartPolicy: Always
```

```
k8s@terminal:~$ kubectl exec -it multi-container-playground -c c2 -- ps -ef 
PID   USER     TIME  COMMAND
    1 root      0:00 sh -c while true; do date >> /vol/date.log; sleep 1; done
  534 root      0:00 sleep 1
  535 root      0:00 ps -ef
```

```
k8s@terminal:~$ kubectl exec -it multi-container-playground -c c2 -- head /vol/date.log
Tue Sep 21 18:13:53 UTC 2021
Tue Sep 21 18:13:54 UTC 2021
Tue Sep 21 18:13:55 UTC 2021
Tue Sep 21 18:13:56 UTC 2021
Tue Sep 21 18:13:57 UTC 2021
Tue Sep 21 18:13:58 UTC 2021
Tue Sep 21 18:13:59 UTC 2021
Tue Sep 21 18:14:00 UTC 2021
Tue Sep 21 18:14:01 UTC 2021
Tue Sep 21 18:14:02 UTC 2021
```
```
k8s@terminal:~$ kubectl exec -it multi-container-playground -c c1 -- env 
```
### Question 14: Find out Cluster Information

Use context: kubectl config use-context k8s-c1-H

You're ask to find out following information about the cluster k8s-c1-H:

How many master nodes are available?
How many worker nodes are available?
What is the Pod CIDR of cluster1-worker1?
What is the Service CIDR?
Which Networking (or CNI Plugin) is configured and where is its config file?
Which suffix will static pods have that run on cluster1-worker1?
Write your answers into file /opt/course/14/cluster-info, structured like this:

```
# /opt/course/14/cluster-info
1: [ANSWER]
2: [ANSWER]
3: [ANSWER]
4: [ANSWER]
5: [ANSWER]
6: [ANSWER]
```

### Solution: 

Q1 & Q2. 

```
k8s@terminal:~$ kubectl get nodes
NAME               STATUS   ROLES                  AGE    VERSION
cluster1-master1   Ready    control-plane,master   140d   v1.21.0
cluster1-worker1   Ready    <none>                 140d   v1.21.0
cluster1-worker2   Ready    <none>                 140d   v1.21.0
```

Q3.

```
k8s@terminal:~$ kubectl describe node cluster1-worker1 | grep -i cidr
PodCIDR:                      10.244.1.0/24
PodCIDRs:                     10.244.1.0/24
```

Q4. 

```
root@cluster1-master1:~# cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -i range
    - --service-cluster-ip-range=10.96.0.0/12
```

Q5.

```
root@cluster1-master1:~# ls -l /etc/cni/net.d/
total 4
-rw-r--r-- 1 root root 318 May  4 10:41 10-weave.conflist
```

Q6. 

```
The suffix is the node hostname with a leading hyphen. It used to be -static in earlier Kubernetes versions.
```

```
# /opt/course/14/cluster-info
1: [One]
2: [Two]
3: [10.244.1.0/24]
4: [10.96.0.0/12]
5: [weave, /etc/cni/net.d/10-weave.conflist]
6: [-cluster1-worker1]
```


### Question 15: Cluster Event Logging

Use context: kubectl config use-context k8s-c2-AC

Write a command into /opt/course/15/cluster_events.sh which shows the latest events in the whole cluster, ordered by time. Use kubectl for it.

Now kill the kube-proxy Pod running on node cluster2-worker1 and write the events this caused into /opt/course/15/pod_kill.log.

Finally kill the main docker container of the kube-proxy Pod on node cluster2-worker1 and write the events into /opt/course/15/container_kill.log.

Do you notice differences in the events both actions caused?


### Solution:

```
k8s@terminal:~$ cat /opt/course/15/cluster-events.sh 
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

```
k8s@terminal:~$ kubectl get pods -A -o wide | grep worker1

k8s@terminal:~$ kubectl delete pod -n kube-system kube-proxy-67qkp  
pod "kube-proxy-67qkp" deleted

k8s@terminal:~$ kubectl get events -A --sort-by=.metadata.creationTimestamp > /opt/course/15/pod_kill.log 
k8s@terminal:~$ cat /opt/course/15/pod_kill.log 
NAMESPACE     LAST SEEN   TYPE     REASON             OBJECT                  MESSAGE
kube-system   2m43s       Normal   Killing            pod/kube-proxy-67qkp    Stopping container kube-proxy
kube-system   2m37s       Normal   SuccessfulCreate   daemonset/kube-proxy    Created pod: kube-proxy-f7nr8
kube-system   2m37s       Normal   Scheduled          pod/kube-proxy-f7nr8    Successfully assigned kube-system/kube-proxy-f7nr8 to cluster2-worker1
kube-system   2m36s       Normal   Pulled             pod/kube-proxy-f7nr8    Container image "k8s.gcr.io/kube-proxy:v1.21.0" already present on machine
kube-system   2m36s       Normal   Created            pod/kube-proxy-f7nr8    Created container kube-proxy
kube-system   2m35s       Normal   Started            pod/kube-proxy-f7nr8    Started container kube-proxy
default       2m35s       Normal   Starting           node/cluster2-worker1   Starting kube-proxy.
```


```
k8s@terminal:~$ ssh cluster2-worker1

root@cluster2-worker1:~# docker ps -a

root@cluster2-worker1:~# docker kill k8s_kube-proxy_kube-proxy-f7nr8_kube-system_4e715479-78b7-4616-a29d-5b3295ed5677_0 
```

Comparing the events we see that when we deleted the whole Pod there were more things to be done, hence more events. For example was the DaemonSet in the game to re-create the missing Pod. Where when we manually killed the main container of the Pod, the Pod would still exist but only its container needed to be re-created, hence less events.

### Question 16: Namespaces and Api Resources

Use context: kubectl config use-context k8s-c1-H

Create a new Namespace called cka-master.

Write the names of all namespaced Kubernetes resources (like Pod, Secret, ConfigMap...) into /opt/course/16/resources.txt.

Find the project-* Namespace with the highest number of Roles defined in it and write its name and amount of Roles into /opt/course/16/crowded-namespace.txt.

### Solution:

```
k8s@terminal:~$ kubectl create namespace cka-master
```

```
k8s@terminal:~$ kubectl api-resources --namespaced=true -o name > /opt/course/16/resources.txt
```

```
k8s@terminal:~$ kubectl get roles -n project-c14 --no-headers | wc -l
300

#/opt/course/16/crowded-namespace.txt
project-c14 with 300 resources
```


### Question 17: Find Container of Pod and check logs

Use context: kubectl config use-context k8s-c1-H

In Namespace project-tiger create a Pod named tigers-reunite of image httpd:2.4.41-alpine with labels pod=container and container=pod. Find out on which node the Pod is scheduled. Ssh into that node and find the docker container(s) belonging to that Pod.

Write the docker IDs of the container(s) and the process/command these are running into /opt/course/17/pod-container.txt.

Finally write the logs of the main docker container (from the one you specified in your yaml) into /opt/course/17/pod-container.log using the docker command.


### Solution:


```
k8s@terminal:~$ cat q17.yml 
apiVersion: v1
kind: Pod
metadata:  
  name: tigers-reunite
  namespace: project-tiger
  labels:
    pod: container
    container: pod
spec:
  containers:
    - image: httpd:2.4.41-alpine
      name: cont17
  restartPolicy: Always
```

```
k8s@terminal:~$ kubectl get pod -n project-tiger -o wide
tigers-reunite                         1/1     Running   0          42s     10.47.0.27   cluster1-worker2 
```


```
root@cluster1-worker2:~# docker ps -a | grep -i tigers-reunite
b724938c82f8   54b0995a6305             "httpd-foreground"       2 minutes ago   Up 2 minutes                        k8s_cont17_tigers-reunite_project-tiger_9395b314-a5ca-4b9e-b8e2-957f664718c5_0
7c0595bee6a1   k8s.gcr.io/pause:3.4.1   "/pause"                 2 minutes ago   Up 2 minutes                        k8s_POD_tigers-reunite_project-tiger_9395b314-a5ca-4b9e-b8e2-957f664718c5_0


The Containers IDs:

b724938c82f8  && 7c0595bee6a1

The process/command:
httpd-foreground && /pause
```

```
root@cluster1-worker2:~# docker logs b724938c82f8
AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.47.0.27. Set the 'ServerName' directive globally to suppress this message
AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.47.0.27. Set the 'ServerName' directive globally to suppress this message
[Tue Sep 21 23:06:46.830126 2021] [mpm_event:notice] [pid 1:tid 140028133616968] AH00489: Apache/2.4.41 (Unix) configured -- resuming normal operations
[Tue Sep 21 23:06:46.830181 2021] [core:notice] [pid 1:tid 140028133616968] AH00094: Command line: 'httpd -D FOREGROUND'
```

### Question 18: Fix Kubelet

Use context: kubectl config use-context k8s-c3-CCC

There seems to be an issue with the kubelet not running on cluster3-worker1. Fix it and confirm that cluster3 has node cluster3-worker1 available in Ready state afterwards. Schedule a Pod on cluster3-worker1.

Write the reason of the is issue into /opt/course/18/reason.txt.

### Solution: 

```
k8s@terminal:~$ kubectl get nodes 
NAME               STATUS     ROLES                  AGE    VERSION
cluster3-master1   Ready      control-plane,master   141d   v1.21.0
cluster3-worker1   NotReady   <none>                 141d   v1.21.0
```

```
root@cluster3-worker1:~# systemctl status kubelet
root@cluster3-worker1:~# journalctl -u kubelet
```
Edit the file:

```
root@cluster3-worker1:~# vi /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
ExecStart=/usr/bin/kubelet
```

Then restart:

```
root@cluster3-worker1:~# systemctl daemon-reload
root@cluster3-worker1:~# systemctl restart kubelet
```

```
root@cluster3-master1:~# kubectl get nodes
NAME               STATUS   ROLES                  AGE    VERSION
cluster3-master1   Ready    control-plane,master   141d   v1.21.0
cluster3-worker1   Ready    <none>                 141d   v1.21.0
```

### Question 19: Create Secret and mount into Pod

Use context: kubectl config use-context k8s-c3-CCC

Do the following in a new Namespace secret. Create a Pod named secret-pod of image busybox:1.31.1 which should keep running for some time. It should be able to run on master nodes as well, create the proper toleration.

There is an existing Secret located at /opt/course/19/secret1.yaml, create it in the secret Namespace and mount it readonly into the Pod at /tmp/secret1.

Create a new Secret in Namespace secret called secret2 which should contain user=user1 and pass=1234. These entries should be available inside the Pod's container as environment variables APP_USER and APP_PASS.

Confirm everything is working.

### Solution:


Edit the secret1:

```
k8s@terminal:~$ cat /opt/course/19/secret1.yaml 
apiVersion: v1
data:
  halt: IyEgL2Jpbi9zaAojIyMgQkVHSU4gSU5JVCBJTkZPCiMgUHJvdmlkZXM6ICAgICAgICAgIGhhbHQKIyBSZXF1aXJlZC1TdGFydDoKIyBSZXF1aXJlZC1TdG9wOgojIERlZmF1bHQtU3RhcnQ6CiMgRGVmYXVsdC1TdG9wOiAgICAgIDAKIyBTaG9ydC1EZXNjcmlwdGlvbjogRXhlY3V0ZSB0aGUgaGFsdCBjb21tYW5kLgojIERlc2NyaXB0aW9uOgojIyMgRU5EIElOSVQgSU5GTwoKTkVURE9XTj15ZXMKClBBVEg9L3NiaW46L3Vzci9zYmluOi9iaW46L3Vzci9iaW4KWyAtZiAvZXRjL2RlZmF1bHQvaGFsdCBdICYmIC4gL2V0Yy9kZWZhdWx0L2hhbHQKCi4gL2xpYi9sc2IvaW5pdC1mdW5jdGlvbnMKCmRvX3N0b3AgKCkgewoJaWYgWyAiJElOSVRfSEFMVCIgPSAiIiBdCgl0aGVuCgkJY2FzZSAiJEhBTFQiIGluCgkJICBbUHBdKikKCQkJSU5JVF9IQUxUPVBPV0VST0ZGCgkJCTs7CgkJICBbSGhdKikKCQkJSU5JVF9IQUxUPUhBTFQKCQkJOzsKCQkgICopCgkJCUlOSVRfSEFMVD1QT1dFUk9GRgoJCQk7OwoJCWVzYWMKCWZpCgoJIyBTZWUgaWYgd2UgbmVlZCB0byBjdXQgdGhlIHBvd2VyLgoJaWYgWyAiJElOSVRfSEFMVCIgPSAiUE9XRVJPRkYiIF0gJiYgWyAteCAvZXRjL2luaXQuZC91cHMtbW9uaXRvciBdCgl0aGVuCgkJL2V0Yy9pbml0LmQvdXBzLW1vbml0b3IgcG93ZXJvZmYKCWZpCgoJIyBEb24ndCBzaHV0IGRvd24gZHJpdmVzIGlmIHdlJ3JlIHVzaW5nIFJBSUQuCgloZGRvd249Ii1oIgoJaWYgZ3JlcCAtcXMgJ15tZC4qYWN0aXZlJyAvcHJvYy9tZHN0YXQKCXRoZW4KCQloZGRvd249IiIKCWZpCgoJIyBJZiBJTklUX0hBTFQ9SEFMVCBkb24ndCBwb3dlcm9mZi4KCXBvd2Vyb2ZmPSItcCIKCWlmIFsgIiRJTklUX0hBTFQiID0gIkhBTFQiIF0KCXRoZW4KCQlwb3dlcm9mZj0iIgoJZmkKCgkjIE1ha2UgaXQgcG9zc2libGUgdG8gbm90IHNodXQgZG93biBuZXR3b3JrIGludGVyZmFjZXMsCgkjIG5lZWRlZCB0byB1c2Ugd2FrZS1vbi1sYW4KCW5ldGRvd249Ii1pIgoJaWYgWyAiJE5FVERPV04iID0gIm5vIiBdOyB0aGVuCgkJbmV0ZG93bj0iIgoJZmkKCglsb2dfYWN0aW9uX21zZyAiV2lsbCBub3cgaGFsdCIKCWhhbHQgLWQgLWYgJG5ldGRvd24gJHBvd2Vyb2ZmICRoZGRvd24KfQoKY2FzZSAiJDEiIGluCiAgc3RhcnR8c3RhdHVzKQoJIyBOby1vcAoJOzsKICByZXN0YXJ0fHJlbG9hZHxmb3JjZS1yZWxvYWQpCgllY2hvICJFcnJvcjogYXJndW1lbnQgJyQxJyBub3Qgc3VwcG9ydGVkIiA+JjIKCWV4aXQgMwoJOzsKICBzdG9wKQoJZG9fc3RvcAoJOzsKICAqKQoJZWNobyAiVXNhZ2U6ICQwIHN0YXJ0fHN0b3AiID4mMgoJZXhpdCAzCgk7Owplc2FjCgo6Cg==
kind: Secret
metadata:
  creationTimestamp: null
  name: secret1
  namespace: secret
```

Create the secret1:

```
k8s@terminal:~$ kubectl create -f /opt/course/19/secret1.yaml 
```

Create the other secret:
```
k8s@terminal:~$ kubectl create secret generic secret2 --from-literal=user=user1 --from-literal=pass=1234 --namespace=secret
```

Create the POD:

```
k8s@terminal:~$ cat q19pod.yml 
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
  namespace: secret
spec:
  containers: 
    - image: busybox:1.31.1
      name: cont19
      command: ["sleep", "3600"]
      volumeMounts:
        - name: whatever
          mountPath: "/tmp/secret1"
          readOnly: true
      env:
        - name: APP_USER
          valueFrom:
            secretKeyRef:
              name: secret2
              key: user
        - name: APP_PASS
          valueFrom:
            secretKeyRef:
              name: secret2
              key: pass
  tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
  volumes: 
    - name: whatever
      secret:
        secretName: secret1
```

Test it:

```
k8s@terminal:~$ kubectl exec -it secret-pod -n secret -- env | grep -i APP
APP_USER=user1
APP_PASS=1234

k8s@terminal:~$ kubectl exec -it secret-pod -n secret -- ls -l /tmp/secret1
total 0
lrwxrwxrwx    1 root     root            11 Sep 22 18:01 halt -> ..data/halt
```

### Question 20: Update Kubernetes Version and join cluster

Use context: kubectl config use-context k8s-c3-CCC

Your coworker said node cluster3-worker2 is running an older Kubernetes version and is not even part of the cluster. Update kubectl and kubeadm to the exact version that's running on cluster3-master1. Then add this node to the cluster, you can use kubeadm for this.

### Solution: 

```
root@cluster3-master1:~# kubectl get nodes
NAME               STATUS   ROLES                  AGE    VERSION
cluster3-master1   Ready    control-plane,master   141d   v1.21.0
cluster3-worker1   Ready    <none>                 141d   v1.21.0
```

```
root@cluster3-master1:~# kubelet --version
Kubernetes v1.21.0

root@cluster3-master1:~# kubeadm version
kubeadm version: &version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:30:03Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}

root@cluster3-master1:~# kubectl version
Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:31:21Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:25:06Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}
```

```
root@cluster3-worker2:~# apt-get install -y kubeadm=1.21.0-00 kubectl=1.21.0-00 
```

```
root@cluster3-master1:~# kubeadm token create --print-join-command
kubeadm join 192.168.100.31:6443 --token tmy9px.gmzclyvt0j1ghi33 --discovery-token-ca-cert-hash sha256:11bf0d439e7dfce0ee98d34d7333fc8933cde32e27c67b63a14dbd7c052d149b 
```

```
root@cluster3-worker2:~# kubeadm join 192.168.100.31:6443 --token tmy9px.gmzclyvt0j1ghi33 --discovery-token-ca-cert-hash sha256:11bf0d439e7dfce0ee98d34d7333fc8933cde32e27c67b63a14dbd7c052d149b 
[preflight] Running pre-flight checks
```

```
root@cluster3-master1:~# kubectl get nodes
NAME               STATUS   ROLES                  AGE     VERSION
cluster3-master1   Ready    control-plane,master   141d    v1.21.0
cluster3-worker1   Ready    <none>                 141d    v1.21.0
cluster3-worker2   Ready    <none>                 2m25s   v1.22.2
```

************************* Done **************************