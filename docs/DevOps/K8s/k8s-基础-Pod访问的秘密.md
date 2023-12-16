新建一个Pod

k run --image=nginx --port=80 pod1
k exec -it pod1 -- curl -s http://localhost:80

#
root@pod1:/var/run/secrets/kubernetes.io# tree
.
`-- serviceaccount
    |-- ca.crt -> ..data/ca.crt
    |-- namespace -> ..data/namespace
    `-- token -> ..data/token

1 directory, 3 files

* namespace内容就是pod所在的ns名称，default
* token 内容吗, 是和 default ns 的 token一致的

```
eyJhbGciOiJSUzI1NiIsImtpZCI6IlV3YVRlU216QlVRV2ZGZkhCcGhtZmcwLUtJLU5rdk9MYWdkMFFyWDdmbDAifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjoxNjc3NTc5MTM1LCJpYXQiOjE2NDYwNDMxMzUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJkZWZhdWx0IiwicG9kIjp7Im5hbWUiOiJwb2QxIiwidWlkIjoiZDEyOTFiYzEtMjI1MC00ZmVlLWJkN2ItYjk0YzdmYTdhZjE1In0sInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJkZWZhdWx0IiwidWlkIjoiNTYxN2EyYzYtMTA4OC00ZGNlLTk0MDUtMDU0NTJjODdiYmRlIn0sIndhcm5hZnRlciI6MTY0NjA0Njc0Mn0sIm5iZiI6MTY0NjA0MzEzNSwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6ZGVmYXVsdCJ9.3wa7U8pthVdyFCUHStaQ7KLW1Bu01uKFj1dGry-latvj7jZZyrBn_6ELW0akdH-lZ0Zbqq0zZsCxTL2sIA0aAibb8o1iyPdtVkeJPtqRZW9lZXkGpCVy9B9dpxzjO88D7Gd_Y0azBqNnE5XLocsOtht8foyI4qeDmbNT_5W3VMOHMcJYGfweK3PAS8P1GRkGgNj3zKZ8At_Dr9d4-toFUVwHvOsr49XMsUaORCnk8zujW_Aap0tK3sdeb58QIIwUL318Zg-goYx7lOojpPg9FIoIZJsYEG5a5iFbeWn1NDQrg_w7mIrDv3FJTrCmYbY0tn2OdNmrJ_tHjw4kbydAYQ
```
# 查看 default namespace 下的 default service account名称
kubectl get sa default -n default -o yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  creationTimestamp: "2022-02-28T05:58:01Z"
  name: default
  namespace: default
  resourceVersion: "450"
  uid: 5617a2c6-1088-4dce-9405-05452c87bbde
secrets:
- name: default-token-224g4

# 查看 secret 的内容
kubectl describe secret default-token-224g4

Name:         default-token-224g4
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: default
              kubernetes.io/service-account.uid: 5617a2c6-1088-4dce-9405-05452c87bbde

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1066 bytes
namespace:  7 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IlV3YVRlU216QlVRV2ZGZkhCcGhtZmcwLUtJLU5rdk9MYWdkMFFyWDdmbDAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tMjI0ZzQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjU2MTdhMmM2LTEwODgtNGRjZS05NDA1LTA1NDUyYzg3YmJkZSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.VRfS_Kbz_xEd1aFbJsJap1LnrUKIFRdMF3lei_ODZ2H5ao4EnKjccdCmWLZHOBHWKLBbtTKX0c4iHoHMxBgOF8WOK2NdUS90DsdIrHx0wwHe9r2dPeqyETz8QpEu6ahRs40Rz23o8T62wJZ_VU5dW38c2tYZyeFWV9UCiFCpTovouHvP5DYNzw-O31UCABtQzLKiy6R3pjl8f_Z0_RQgiPlBHM17n7Zmqt_9f8kOS7Uf2ofyZXVAZKCNo-bmy_uMcL-XIpt0tTqN_-1JlTOmsoh8Q6N75W-3PQ1P3f57lQKkK96vO_CsuD0u3_Kvt1wcPBa5QsqiuAIbKEUJlcjrtQ