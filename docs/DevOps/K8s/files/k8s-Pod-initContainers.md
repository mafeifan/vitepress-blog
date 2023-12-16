initContainers 用来初始化Pod的容器

```yaml
      containers:
        - image: ccr.ccs.tencentyun.com/shuhe/nginx:stable
          imagePullPolicy: IfNotPresent
          name: container-nginx
          ports:
            - containerPort: 80
              name: tcp-80
              protocol: TCP
          resources: {}
          volumeMounts:
            - mountPath: /usr/share/nginx/html
              name: workdir
      initContainers:
        - command:
            - wget
            - -O
            - /work-dir/index.html
            - https://kuboard.cn
          image: busybox
          imagePullPolicy: IfNotPresent
          name: container-install
          volumeMounts:
            - mountPath: /work-dir
              name: workdir
```



