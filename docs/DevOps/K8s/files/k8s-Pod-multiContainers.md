initContainers 用来初始化Pod的容器

```yaml
      containers:
        - args:
            - infinity
          command:
            - sleep
          image: busybox
          imagePullPolicy: IfNotPresent
          name: busybox
          volumeMounts:
            - mountPath: /html
              name: html
        - image: ccr.ccs.tencentyun.com/shuhe/nginx:stable
          imagePullPolicy: IfNotPresent
          name: nginx
          ports:
            - containerPort: 80
              name: tcp-80
              protocol: TCP
          volumeMounts:
            - mountPath: /usr/share/nginx/html
              name: html
      restartPolicy: Always
      volumes:
        - emptyDir: {}
          name: html
```



