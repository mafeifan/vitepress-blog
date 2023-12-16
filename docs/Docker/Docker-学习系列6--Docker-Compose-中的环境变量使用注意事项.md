学习技能光看不做是不行的，强烈推荐按照教程敲一遍
https://docs.docker.com/compose/gettingstarted/

Compose项目由 Python编写 ，实现上调用了 Docker服务提供的 API来对容器进行管理。 因此只要所操作的平台支持 Docker，就可以在其上利用 Compose来进行编排管理。

本人提炼出了几点技巧：

1. 多用 `docker-compose config` 
命令校验和查看配置信息，
当修改了`docker-compose.yml`文件，不要急于执行`docker-compose up`启动，可以先检查下配置。很多时候是yml格式不规范导致的。
2. `docker-compose up` 包含了构建镜像，创建服务，启动服务等一系列操作。一般配好文件执行这个命令就可以了。
3. 使用`.env`环境变量配置文件
一些敏感信息如，数据库密码等不建议写死到`docker-compose.yml`中，可以写在`.env`环境配置文件中(使用Laravel的同学对这个文件肯定不陌生)。

因为`docker-compose.yml`一般跟随项目受版本控制，`.env`可以不受版本控制。


优化前：

* docker-compose.yml
```yaml
  mysql:
      build: ./docker-build/mysql
      ports:
        - "33060:3306"
      volumes:
        - ./docker-build/mysql/data:/var/lib/mysql
      environment:
        MYSQL_ROOT_PASSWORD: 123456
```

优化后：

* docker-compose.yml
* .env

同级目录建立`.env`文件
```yaml
  mysql:
      build: ./docker-build/mysql
      ports:
        - "33060:3306"
      volumes:
        - ./docker-build/mysql/data:/var/lib/mysql
      environment:
       # 先从.env找DOCKER_MYSQL_PASSPORD，找不到使用后面的默认值
        MYSQL_ROOT_PASSWORD: ${DOCKER_MYSQL_PASSPORD-123456}
```
.env
```
# define env var default value.
DOCKER_MYSQL_PASSPORD=root
```
4. 使用`docker-compose.yml`中的env_file语法

service节点下支持 env_file属性，即环境变量从额外的文件中读取。
如下面的例子，如果local.env和common.env有相同key。则下面的优先级高。
```yaml
  php:
      build:
        context: ./docker-build/php
        args:
          - INSTALL_COMPOSER=${PHP_INSTALL_COMPOSER}
          - INSTALL_MONGO=${PHP_INSTALL_MONGO}
          - INSTALL_REDIS=${PHP_INSTALL_REDIS}
          - INSTALL_XDEBUG=${PHP_INSTALL_XDEBUG}
      ports:
        - "9001:9000"
      links:
        - "mysql"
      volumes:
        - .:/www
      env_file:
        - ./common.env
        - ./local.env
```
假设 `local.env` 中内容是`A:1`，`common.env` 是 `A:2`
```yaml
      environment:
        A: 3
      env_file:
        - ./common.env
        - ./local.env
```
最终生效的是 `A:3`

5. 配置不同场景下的环境变量
我们可以把不同场景下的环境变量定义在不同的 shell 脚本中并导出，
然后在执行 `docker-compose` 命令前先执行 source 命令把 shell 脚本中定义的环境变量导出到当前的 shell 中。
通过这样的方式可以减少维护环境变量的地方，下面的例子中我们分别在 `docker-compose.yml` 文件所在的目录创建 `test.sh` 和 `prod.sh`。

`test.sh` 的内容如下：
```bash
#!/bin/bash
# define env var default value.
export IMAGETAG=web:v1
export APPNAME=HelloWorld
export AUTHOR=Nick Li
export VERSION=1.0
```

`prod.sh` 的内容如下：
```bash
#!/bin/bash
# define env var default value.
export IMAGETAG=webpord:v1
export APPNAME=HelloWorldProd
export AUTHOR=Nick Li
export VERSION=1.0LTS
```
在测试环境下，执行下面的命令：
```bash
$ source test.sh
$ docker-compose config
```
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-32568b72759201b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时 docker-compose.yml 中的环境变量应用的都是测试环境相关的设置。
而在生产环境下，执行下面的命令：
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-eae5c194a7265e94.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时 docker-compose.yml 中的环境变量应用的都是生产环境相关的设置。

6. 环境变量的优先级
docker-compose.yml 文件中引用的环境变量，它们的优先级如下：
* Compose file
* Shell environment variables
* Environment file
* Dockerfile
* Variable is not defined

首先，在 docker-compose.yml 文件中直接设置的值优先级是最高的。
然后是在当前 shell 中 export 的环境变量值。
接下来是在环境变量文件中定义的值。
再接下来是在 Dockerfile 中定义的值。
最后还没有找到相关的环境变量就认为该环境变量没有被定义。

额外内容，使用 extends 继承扩展docker-compose.yml
基于其他模板文件进行扩展 。 例如，我们已经有了一个 webapp 服务，定义一个基础模板文件为 common.yml，如下所示:
`common.yml`:
```yaml
webapp
  build : . /webapp 
  environment:
    - DEBUG=false
    - SEND EMAILS=false
```
再编写一个新的 development .yml 文件，使用 common.yml 中的 webapp 服务进行扩展:

`development.yml`:
```yaml
web:
  extends:
    file: common .yml
    service: webapp 
    ports :
      - "8000:8000" 
    links:
      - db environment:
      - DEBUG=true 
  db:
    image : postgres
```
后者会自动继承common.yml中的webapp服务及环境变量定义。 使用extends需要注意以下两点:
* 要避免出现循环依赖，例如 A 依赖 B, B 依赖 C, C 反过来依赖 A 的情况 。
* extends 不会继承 links 和 volumes_from 中定义的容器和数据卷资源 。 一般情况下，推荐在基础模板中只定义一些可以共享的镜像和环境变量，在扩展模板中
具体指定应用变量、链接、数据卷等信息 。

::: tip
 [RUN vs CMD vs ENTRYPOINT](https://www.cnblogs.com/CloudMan6/p/6875834.html) 的区别
1. Dockerfile中，在基础镜像上安装软件使用 RUN
2. CMD命令是当Docker镜像被启动后Docker容器将会默认执行的命令。一个Dockerfile中只能有一个CMD命令。通过执行`docker run $image $other_command`启动镜像可以重载CMD命令。
3. 使用 docker-compose run 命令可以在服务上运行一次性命令，如 `docker-compose run web env` 查看服务为web的环境变量
:::

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-6592bccf4e94da2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 参考：
* https://www.cnblogs.com/sparkdev/p/9826520.html
* https://docs.docker.com/compose/reference/envvars/
* https://docs.docker.com/compose/environment-variables/
