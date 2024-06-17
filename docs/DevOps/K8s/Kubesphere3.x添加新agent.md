kubesphere自带的CI/CD工具是Jenkins，Jenkins是master-agent主从架构的，Jenkins流水线是跑在agent上面。

kubesphere自带的本身提供了nodejs,maven,go,base等4种agent，[参见](https://kubesphere.io/zh/docs/devops-user-guide/how-to-use/choose-jenkins-agent/)，对应于不同的语言构建。

但是nodejs的版本是9，我希望是目前比较流行的16版本。

所以我打算新添加一个agent。

## 前置条件
* kubesphere管理员
* kubesphere开启Jenkins界面后台访问
* 熟悉Jenkins的kubernetes插件

## 制作agent镜像

对照着[官方的Dockerfile](https://github.com/kubesphere/devops-agent/blob/v3.2.0/nodejs/Dockerfile)和[base](https://github.com/kubesphere/devops-agent/blob/v3.2.0/base/Dockerfile)制作新的agent

```dockerfile
FROM kubespheredev/builder-base:v3.1.0

ENV NODE_VERSION 16.13.0

RUN ARCH=x64 \
  # gpg keys listed at https://github.com/nodejs/node#release-keys
  && set -ex \
  && for key in \
    4ED778F539E3634C779C87C6D7062848A1AB005C \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    74F12602B6F1C4E913FAA37AD3A89613643B6201 \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
    108F52B48DB57BB0CC439B2997B01419BD92F80A \
    B9E2F5981AA6E0CD28160D9FF13993A75599653C \
  ; do \
    gpg --batch --keyserver sks.srv.dumain.com --recv-keys "$key"; \
  done \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  && yum install -y nodejs gcc-c++ make bzip2 GConf2 gtk2 chromedriver chromium xorg-x11-server-Xvfb

# Yarn
ENV YARN_VERSION 1.22.17
RUN curl -f -L -o /tmp/yarn.tgz https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz && \
	tar xf /tmp/yarn.tgz && \
	mv yarn-v${YARN_VERSION} /opt/yarn && \
	ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn && \
	yarn config set cache-folder /root/.yarn

# https://www.npmjs.com/package/npm-config-china
RUN yarn config set registry https://registry.npmmirror.com -g
RUN npm config set registry https://registry.npmmirror.com

CMD ["node","-v"]
```

镜像我托管在了https://hub.docker.com/repository/docker/finleyma/node16

## 配置jenkins agent

登录kubesphere，进入【配置中心】-【配置】，搜索 jenkins-casc-config ，修改配置。此文件是Jenkins的配置文件，描述了安装Jenkins时要顺带哪些插件和插件配置
在clouds-kubernetes-templates添加的新的agent描述信息
当然你也可以复制nodejs的配置信息
```
  - name: "nodejs16"
    namespace: "kubesphere-devops-worker"
    label: "nodejs16"
    nodeUsageMode: "EXCLUSIVE"
    idleMinutes: 0
    containers:
    - name: "nodejs16"
      image: "registry.cn-zhangjiakou.aliyuncs.com/finleyma/jenkins-agent-node16"
      command: "cat"
      args: ""
      ttyEnabled: true
      privileged: false
      resourceRequestCpu: "100m"
      resourceLimitCpu: "4000m"
      resourceRequestMemory: "100Mi"
      resourceLimitMemory: "8192Mi"
    - name: "jnlp"
      image: "jenkins/jnlp-slave:3.27-1"
      command: "jenkins-slave"
      args: "^${computer.jnlpmac} ^${computer.name}"
      resourceRequestCpu: "50m"
      resourceLimitCpu: "500m"
      resourceRequestMemory: "400Mi"
      resourceLimitMemory: "1536Mi"
    workspaceVolume:
      emptyDirWorkspaceVolume:
        memory: false
    volumes:
    - hostPathVolume:
        hostPath: "/var/run/docker.sock"
        mountPath: "/var/run/docker.sock"
    - hostPathVolume:
        hostPath: "/var/data/jenkins_nodejs_yarn_cache"
        mountPath: "/root/.yarn"
    - hostPathVolume:
        hostPath: "/var/data/jenkins_nodejs_npm_cache"
        mountPath: "/root/.npm"
    - hostPathVolume:
        hostPath: "/var/data/jenkins_sonar_cache"
        mountPath: "/root/.sonar/cache"
    yaml: "spec:\r\n  affinity:\r\n    nodeAffinity:\r\n      preferredDuringSchedulingIgnoredDuringExecution:\r\n      - weight: 1\r\n        preference:\r\n          matchExpressions:\r\n          - key: node-role.kubernetes.io/worker\r\n            operator: In\r\n            values:\r\n            - ci\r\n  tolerations:\r\n  - key: \"node.kubernetes.io/ci\"\r\n    operator: \"Exists\"\r\n    effect: \"NoSchedule\"\r\n  - key: \"node.kubernetes.io/ci\"\r\n    operator: \"Exists\"\r\n    effect: \"PreferNoSchedule\"\r\n  containers:\r\n  - name: \"nodejs16\"\r\n    resources:\r\n      requests:\r\n        ephemeral-storage: \"1Gi\"\r\n      limits:\r\n        ephemeral-storage: \"10Gi\"\r\n  securityContext:\r\n    fsGroup: 1000\r\n "
```


::: warning
`java.net.ProtocolException: Expected HTTP 101 response but was '400 Bad Request'`
当遇到这个错误，是因为容器名不一致导致的，Pod template中containers/name 和 yaml/spec/containers/name 要设为一致，一开始我一个设的nodejs16另一个设置的nodejs
:::


打开你的Jenkins，点击“Manage Jenkins->Configuration as Code->Apply new configuration”。
等待一会儿，如果没有报错，则配置完成。可以点击此页下的“View Configuration”检查配置是否生效。
如果还没生效，Path中填写`/var/jenkins_home/casc_configs/jenkins.yaml` 重新apply

![](http://pek3b.qingstor.com/hexo-blog/20211116183447.png)

## 检查agent

Manage Jenkins - Manage Nodes and Clouds - Configure Clouds

发现nodejs16配置项已经有了，内容就是之前yaml中描述的那样

![](http://pek3b.qingstor.com/hexo-blog/20211116183522.png)

## 参考
https://github.com/kubesphere/devops-agent/blob/v3.2.0/nodejs/Dockerfile

https://segmentfault.com/a/1190000039311627

https://kubesphere.io/zh/docs/devops-user-guide/how-to-use/jenkins-setting/

https://kubesphere.com.cn/forum/d/3384-kubespheredevopsdotnet-core
