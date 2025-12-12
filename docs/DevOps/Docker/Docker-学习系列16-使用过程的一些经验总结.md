1. COPY 和 ADD 命令具有相同的特点：只复制目录中的内容而不包含目录自身。
比如 backend 目录的结构如下：
```yaml
 --- backend
     -- model
     -- controller
```
如果执行
```bash
WORKDIR /app
COPY backend .
```
容器内app底下会是model和controller目录，并不是backend目录。
如果要拷贝整个目录，应该：
`COPY backend ./backend`

2. 如果修改了 Dockerfile，记得要重新执行build，即生成新的镜像。这样启动后才能看到效果。

3. 打包node项目中的node_modules问题。
某node项目结构:
```
src
node_modules
package.json
package-lock.json
```
dockerfile部分代码
```
FROM node:8.12-alpine
RUN mkdir -p /app
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
...
```
我们在容器内生成了项目所依赖的node_modules文件。这是docker的build阶段。
之后在run启动阶段时，在mouted共享目录时要特别小心，如果挂载整个项目，容器内的node_modules会被项目中的覆盖。
最好把需要挂载的文件单独放到一个目录中。

4. 关于项目目录是挂载好，还是COPY ADD好，stackoverflow上有人也[问过](https://stackoverflow.com/questions/27735706/docker-add-vs-volume)
* COPY/ADD 文件是镜像的一部分，在docker构建阶段执行。比较适合项目的生产环境，比如自动化。对于成熟稳定的项目，把编译后的可以直接运行的代码打包进镜像内也利于分发。
* volumn 是在docker运行阶段，本地文件变化能方便的反应到容器中，比较适合项目的开发阶段。
要根据实际情况，挂载可以节省空间，便于修改。如果是想文件COPY到容器，每次修改文件都需要重新制作镜像。

5. 关于 docker-compose，对于镜像的版本，数据库密码等不建议直接写死到 docker-compose.yml 中，可以新建.env文件。
docker-compose部分
```yaml
  mysql:
      build: ./docker-build/mysql
      ports:
        - "33060:3306"
      volumes:
        - ./docker-build/mysql/data:/var/lib/mysql
      environment:
        MYSQL_ROOT_PASSWORD: ${DOCKER_MYSQL_PASSPORD-123456}
```
.env文件
`DOCKER_MYSQL_PASSPORD=mypassord`
比如下面的`${DOCKER_MYSQL_PASSPORD-123456}`表示优先去`.env`文件找定义的key值，如果没有则使用默认值，即123456。
docker-compose.yml 受版本控制，.env不受。更多细节[参考](https://docs.docker.com/compose/env-file/)

6. 在 Laravel 项目中，如果数据库跑在容器里，在宿主机直接执行`php aritsan`是不行的，

需要进到容器里执行，或者在宿主机执行`docker-compose exec  <mycontainer> php artisan`或者是`docker exec -it  <mycontainer>  php artisan`

7. 如果php项目用的nginx的php-fpm容器，想重启php-fpm，容器内使用`kill -USR2 1`，容器外执行`docker exec -it <mycontainer> kill -USR2 1`\

8. docker-compose down要慎用，他会销毁所有容器和网络等。如果你之前在容器里修改过文件，都会没有。当然docker也不推荐直接在容器动手脚，建议写个shell脚本，启动之后在容器内执行。

9. 还是 mysql 数据库问题，如果容器启动了 mysql，之后通过配置修改了密码，可能会造成重新连接后死活显示"Access denied"。
这是因为如果建立了共享卷volume，里面存的还是老的user信息，需要`docker-compose rm -v` 清除卷然后重连。

10. 删除日志 `find /var/lib/docker/containers/ -type f -name "*.log" -delete`

11. 删除所有停止的容器 `docker rm $(docker ps -a -q)`

12. Docker 提供了方便的 `docker system prune` 命令来删除那些已停止的容器、dangling 镜像、未被容器引用的 network 和构建过程中的 cache.
安全起见，这个命令默认不会删除那些未被任何容器引用的数据卷，如果需要同时删除这些数据卷，你需要显式的指定 --volumns 参数。比如你可能想要执行下面的命令：
`docker system prune --all --force --volumns`

> 注意，使用 --all 参数后会删除所有未被引用的镜像而不仅仅是 dangling 镜像。

> 何为 dangling images，其实可以简单的理解为未被任何镜像引用的镜像。比如在你重新构建了镜像后，那些之前构建的且不再被引用的镜像层就变成了 dangling images

我们还可在不同在子命令下执行 prune，这样删除的就是某类资源：
```bash
docker container prune # 删除所有退出状态的容器
docker volume prune # 删除未被使用的数据卷
docker image prune # 删除 dangling 或所有未被使用的镜像
```

13. docker diff 容器名或ID，可以查看容器发生的文件系统的变化信息
 如下图，我在容器里新建了个demo.txt文件，在docker diff中可以查看出来
A 添加， C 修改， D 删除
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-82443f79715cc69e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

参考：http://blog.51cto.com/13954634/2294107
