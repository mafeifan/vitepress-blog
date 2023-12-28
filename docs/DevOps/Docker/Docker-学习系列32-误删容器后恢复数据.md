以一个网上的例子说下恢复数据。
有一个wordpress站点是用docker-compose部署的，内容为

## 事故缘由
```yaml
version: "2.3"

services:
  wordpress:
    image: wordpress
    restart: always
    ports:
      - "127.0.0.1:8090:80"
    environment:
      WORDPRESS_DB_PASSWORD: root
  mysql:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
```

为了给容器添加healthcheck，添加了以下几行
```yaml
@@ -8,6 +8,12 @@
       - "127.0.0.1:8090:80"
     environment:
       WORDPRESS_DB_PASSWORD: root
+    healthcheck:
+      test: "curl -f http://127.0.0.1"
+      interval: 30s
+      timeout: 5s
+      retries: 1
+      start_period: 10s
   mysql:
     image: mysql:5.7
     restart: always
```


由于此前多次重启机器，容器均会自动重启（`restart: always`），放低了警惕，没有考虑到更新 docker-compose.yml 后重启服务会删除之前容器。

于是运行了 docker-compose down && docker-compose up -d，此时原容器被删除了（访问 127.0.0.1 显示 Wordpress 安装界面，使用 mysql 工具打开数据库显示 wordpress 数据库为空）。

## 数据找回

这时候不要慌，`/var/lib/docker/volumes/` 下查找是否有尚未删除的 volume。
查看了一下每个 volume，发现了两个 wordpress 目录和一个 mysql 目录。最终通过 mtime 确定了两个最后修改于当日的 volume，且 cd 进去后发现确实一个是 Wordpress，一个是 MySQL


1. 复制 volume 数据到 named volume。我使用了 [docker_clone_volume.sh](https://github.com/gdiepen/docker-convenience-scripts/blob/master/docker_clone_volume.sh)，这个 Shell Script 创建了一个 Alpine 容器，将原 volume 和新 volume 挂载到容器内，使用 cp -av src dst 直接复制。
2. 修改 docker-compose.yml 文件挂载新的 named volume

```yaml
@@ -14,8 +14,17 @@
       timeout: 5s
       retries: 1
       start_period: 10s
 +    volumes:
 +      - wordpress:/var/www/html
   mysql:
     image: mysql:5.7
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: root
 +    volumes:
 +      - mysql:/var/lib/mysql
 +volumes:
 +  wordpress:
 +    external: true
 +  mysql:
 +    external: true
```

3. 重启并恢复服务 docker-compose up -d

## 总结

1. 运维角度最好从 Docker 级别也做好备份
2. 对于有状态的服务，比如站点目录，和数据库数据目录，创建volume，并定时备份
3. volume放到宿主机也是100%安全，可以备份到云服务对象存储
