按照[官网文档](https://kubesphere.io/zh/docs/installing-on-kubernetes/hosted-kubernetes/install-kubesphere-on-eks/)安装好，
但是每次改点可插拔组件之后，面板的LB就变了，如果要防止这个情况出现，可以单独建一个LB

现象:文档说的是执行`kubectl edit ks-console`将 service 类型NodePort 更改为LoadBalancer，完成后保存文件
可是当修改可插拔组件后，ks-console service就又恢复成NodePort了

为彻底解决，可以新建一个LoadBalancer类型的service，既让他支持NodePort又支持LoadBalancer

```yaml
cat <<EOF | kubectl apply -f -
kind: Service
apiVersion: v1
metadata:
 name: ks-console-loadbalancer
 namespace: kubesphere-system
 labels:
   app: ks-console-loadbalancer
   tier: frontend
   version: v3.1.0
spec:
 ports:
   - name: nginx
     protocol: TCP
     port: 80
     targetPort: 8000
     nodePort: 30888
 selector:
   app: ks-console
   tier: frontend
 type: LoadBalancer
 sessionAffinity: None
EOF
```
