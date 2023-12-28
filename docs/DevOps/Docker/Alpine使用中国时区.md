```
FROM alpine:lts

# 替换为阿里源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 设置时区为上海
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata
```

还有一种方法是映射宿主机的`/etc/localtime`文件到容器内，权限设置为只读，当然宿主机的时区要配置正确

K8s的写法是

```
volumes:
  - name: host-time
    hostPath:
      path: /etc/localtime
      type: ''
containers:
  - name: frontend
    image: $IMAGE_NAME:$BUILD_NUMBER
    ports:
      - name: tcp-80
        containerPort: 80
        protocol: TCP
    resources: {}
    volumeMounts:
      - name: host-time
        readOnly: true
        mountPath: /etc/localtime
```
