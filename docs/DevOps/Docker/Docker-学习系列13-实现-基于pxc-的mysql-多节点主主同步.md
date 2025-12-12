### 背景
MySQL本身是开源的，有些公司或社区基于MySQL发布了新的分支，如有名的MariaDB。

在介绍 Percona 之前，首要要介绍的是XtraDB存储引擎，在MYSQL中接触比较多的是MyISAM 和 InnoDB这两个存储引擎。

MySQL 4 和 5 使用默认的 MyISAM 存储引擎安装每个表。从5.5开始，MySQL已将默认存储引擎从 MyISAM 更改为 InnoDB。MyISAM 没有提供事务支持，而 InnoDB 提供了事务支持。与 MyISAM 相比，InnoDB 提供了许多细微的性能改进，并且在处理潜在的数据丢失时提供了更高的可靠性和安全性。

Percona Server由领先的MySQL咨询公司Percona发布。Percona Server是一款独立的数据库产品，其可以完全与MySQL兼容，可以在不更改代码的情况了下将存储引擎更换成XtraDB 。

Percona XtraDB Cluster 完全兼容MySQL。

### 常见MySQL集群方案

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-b3a31222b9e4f607.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### Percona XtraDB Cluster优缺点
优点：
1.当执行一个查询时，在本地节点上执行。因为所有数据都在本地，无需远程访问。
2.无需集中管理。可以在任何时间点失去任何节点，但是集群将照常工作。
3.良好的读负载扩展，任意节点都可以查询。

缺点：
1.加入新节点，开销大。需要复制完整的数据。
2.不能有效的解决写缩放问题，所有的写操作都将发生在所有节点上。
3.有多少个节点就有多少重复的数据。

### 基于Docker的实现流程
1. 拉镜像 `docker pull percona/percona-xtradb-cluster:5.7`
2. 镜像名字有点长，起个短点的
`docker tag percona/percona-xtradb-cluster:5.7 pxc`
3. 出于安全考虑，针对PXC集群实例创建内部网络
创建的时候通过参数指定IP段和子网掩码，Docker默认使用的IP 172.17.0.1，我们换个别的。
`docker network create --subnet=172.18.0.0/24 pxc-network`
4. 创建第一个节点
`docker run -d -p 33010:3306 -e MYSQL_ROOT_PASSWORD=root -e CLUSTER_NAME=pxc_cluster --name=pxc_node1 --net=pxc-network   --ip=172.18.0.2 pxc`
执行 docker logs pxc_node1 
查看执行状态，如果看到 mysqld: ready for connections.
就可以使用navicat等工具测试连接。
5. 创建第二个数据库节点，并加入到第一个集群中，注意多了 CLUSTER_JOIN 参数
`docker run -d -p 33011:3306 -e MYSQL_ROOT_PASSWORD=root -e CLUSTER_NAME=pxc_cluster -e CLUSTER_JOIN=pxc_node1 --name=pxc_node2 --net=pxc-network   --ip=172.18.0.3 pxc`
6. 创建第三个数据库节点，并加入到第一个集群中，注意多了 CLUSTER_JOIN 参数
`docker run -d -p 33012:3306 -e MYSQL_ROOT_PASSWORD=root -e CLUSTER_NAME=pxc_cluster -e CLUSTER_JOIN=pxc_node1 --name=pxc_node3 --net=pxc-network   --ip=172.18.0.4 pxc`
7. 接下来可以创建第N个节点，注意参数如容器名称 --name 和映射的端口别冲突；
8. 测试：本地连接这三个节点，在其中一个创建demo数据，其他节点都自动同步数据过去了
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a15a5fd679269219.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 注意
1. 启动第一个节点后记得使用docker logs查看启动状态，然后使用navicat等工具测试连接，等第一个mysql运行成功后再运行第二个容器。否则第二个起不来，需要重新启动容器。
2. 如果停掉某一节点 `docker stop pxc_node1` 再启动时 `docker start pxc_node1` 可能会发现连接不上了。这时候可以删除容器，重新运行，命令类似 `docker run -d -p 33010:3306 -e MYSQL_ROOT_PASSWORD=root -e CLUSTER_NAME=pxc_cluster -e CLUSTER_JOIN=pxc_node2 --name=pxc_node1 --net=pxc-network  --172.18.0.2 pxc`

### 参考
* https://www.percona.com/doc/percona-xtradb-cluster/LATEST/install/docker.html
* https://www.percona.com/doc/percona-xtradb-cluster/5.7/index.html
