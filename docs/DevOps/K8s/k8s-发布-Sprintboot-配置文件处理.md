## 

springboot 的配置文件是 application.yml
里面会有连接数据库的配置信息，在仓库里明文显示是不行的

部署到k8s里要替换掉，url, username, password 等




```yaml
server:
  port: 8040
spring:
  application:
    name: demo
  jackson:
    default-property-inclusion: non_null
    locale: zh
    time-zone: GMT+8
    date-format: yyyy-MM-dd HH:mm:ss
  datasource:
    druid:
      url: jdbc:mysql://localhost:23306/demo?characterEncoding=UTF-8&serverTimezone=GMT%2B8&useSSL=false&allowMultiQueries=true
      username: root
      password: root

```

## 使用环境变量替换

1. 首先创建secret，包含键值对，值会自动经过base64处理
```
kind: Secret
apiVersion: v1
metadata:
  name: demo-secret
  namespace: demo
data:
  rds_conn_str: >-
    amRiYzpteXNFyYWN0ZXJFbmNvZGluZz1VVEYtOCZ1c2VTU0w9ZmFsc2UmdXNlSkRCQ0NvbXBsaWFudFRpbWV6b25lU2hpZnQ9dHJ1ZSZhbGxvd011bHRpUXVlcmllcz10cnVl
  rds_password: aDg2YkNBOUZQOA==
  rds_username: a2Zwcy1ydw==
type: Opaque
```

2. 修改 deployment

env 部分是从secret中读取键，对应的值存到环境变量中，这时候登录容器，就是可以查看到环境变量RDS_CONN_STR，RDS_USERNAME和RDS_PASSWORD

然后在args中，使用$(RDS_CONN_STR)，$(RDS_USERNAME)，$(RDS_PASSWORD)覆盖掉application.yml中的值

```
    spec:
      containers:
        - name: demo
          image: >-
            demo-image:latest
          command:
            - java
            - '-jar'
          args:
            - '-Dfile.encoding=UTF-8'
            - '-Dspring.profiles.active=pt'
            - '-Dspring.datasource.url=$(RDS_CONN_STR)'
            - '-Dspring.datasource.username=$(RDS_USERNAME)'
            - '-Dspring.datasource.password=$(RDS_PASSWORD)'
            - /opt/app/app.jar
          env:
            - name: RDS_CONN_STR
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_conn_str
            - name: RDS_USERNAME
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_username
            - name: RDS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_password
```

更进一步

```
    spec:
      containers:
        - name: demo
          image: >-
            demo-image:latest
          command:
            - java
            - '-jar'
          args:
            - '-Dfile.encoding=UTF-8'
            - '-Dspring.profiles.active=pt'
            - /opt/app/app.jar
          env:
            - name: SPRING.DATASOURCE.URL
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_conn_str
            - name: SPRING.DATASOURCE.USERNAME
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_username
            - name: SPRING.DATASOURCE.PASSWORD
              valueFrom:
                secretKeyRef:
                  name: demo-secret
                  key: rds_password
```



## 使用新的配置文件替换，配置文件存到secret中

1. 把整个application.yml 存到secret中

2. deployment 添加环境变量

```yaml
  spec:
    containers:
      - name: your-app
        image: your-image:tag
        command:
          - java
          - '-jar'
        args:
          - '-Dfile.encoding=UTF-8'
          - '-Dspring.config_location=$(SPRING_CONFIG_LOCATION)'
        ports:
          - containerPort: 8080
        env:
          - name: SPRING_CONFIG_LOCATION
            value: "file:/path/to/application.yaml"
        volumeMounts:
            - name: config-volume
              mountPath: /path/to/application.yaml
    volumes:
      - name: config-volume
        secret:
          secretName: demo-secret
```


