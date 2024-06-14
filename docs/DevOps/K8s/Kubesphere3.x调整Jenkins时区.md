以Kubersphere v3.2.0为例

搜索名称为 devops-jenkins的deployment,编辑yaml，在env添加`-Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai`

```yaml
      containers:
        - name: devops-jenkins
          image: 'kubesphere/ks-jenkins:v3.2.0-2.249.1'
          args:
            - '--argumentsRealm.passwd.$(ADMIN_USER)=$(ADMIN_PASSWORD)'
            - '--argumentsRealm.roles.$(ADMIN_USER)=admin'
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
            - name: slavelistener
              containerPort: 50000
              protocol: TCP
          env:
            - name: JAVA_TOOL_OPTIONS
              value: >-
                -Xms512m -Xmx512m -XX:MaxRAM=2g
                -Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai
```
