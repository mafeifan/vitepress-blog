有耐心和英文还可以的同学可以下载官方的[电子书](https://www.confluent.io/thank-you/resources/kafka-the-definitive-guide-v2/)

单机测试

## 安装 zookeeper 

环境 Ubuntu18.04
```bash
$ tar -zxf apache-zookeeper-3.8.0-bin.tar.gz
$ mv apache-zookeeper-3.5.9-bin /usr/local/zookeeper
$ mkdir -p /var/lib/zookeeper
$ cp > /usr/local/zookeeper/conf/zoo.cfg << EOF
> tickTime=2000
> dataDir=/var/lib/zookeeper
> clientPort=2181
> EOF
```

```bash
# 可选
$ export JAVA_HOME=/usr/java/jdk-11.0.10
# 启动zookeeper
$ /usr/local/zookeeper/bin/zkServer.sh start

# 现在可以通过连接到客户端端口并发送四个字母的命令srvr来验证ZooKeeper是否在独立模式下正确运行。 这将返回运行服务器的基本ZooKeeper信息:

telnet localhost 2181
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
srvr
Zookeeper version: 3.8.0-5a02a05eddb59aee6ac762f7ea82e92a68eb9c0f, built on 2022-02-25 08:49 UTC
Latency min/avg/max: 0/0.0/0
Received: 1
Sent: 0
Connections: 1
Outstanding: 0
Zxid: 0x0
Mode: standalone
Node count: 5
Connection closed by foreign host.
```

## 安装 kafka
```bash
$ tar -zxf mv kafka_2.13-3.1.0.tgz
$ mv kafka_2.13-3.1.0.tgz /usr/local/kafka
$ mkdir /tmp/kafka-logs
# 启动 kafka
$ /usr/local/kafka/bin/kafka-server-start.sh -daemon /usr/local/kafka/config/server.properties

# 创建名为test的topic
$ /usr/local/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --replication-factor 1 --partitions 1 --topic test

Created topic test.
# 查看topic
$ /usr/local/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic test

Topic: test	TopicId: GKrnmzgsTbSQNslvtKWkBw	PartitionCount: 1	ReplicationFactor: 1	Configs: segment.bytes=1073741824
	Topic: test	Partition: 0	Leader: 0	Replicas: 0	Isr: 0

# 生产消息到test主题(使用Ctrl-C停止生产者):
$ /usr/local/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test
> test1
> test2

# 新开一个终端，消费来自test主题的消息:
$ /usr/local/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning
```

## 疑问

消费者跟生产者不在同一台机器上该如何连接

./bin/kafka-console-consumer.sh --bootstrap-server 49.232.138.70:9092 --topic test --from-beginning
[2022-03-16 22:22:50,436] WARN [Consumer clientId=console-consumer, groupId=console-consumer-26123] Connection to node 0 (localhost.localdomain/127.0.0.1:9092) could not be established. Broker may not be available. (org.apache.kafka.clients.NetworkClient)
[2022-03-16 22:22:50,537] WARN [Consumer clientId=console-consumer, groupId=console-consumer-26123] Connection to node 0 (localhost.localdomain/127.0.0.1:9092) could not be established. Broker may not be available. (org.apache.kafka.clients.NetworkClient)

在内网部署及访问kafka时，只需要配置listeners参数即可，比如

listeners=PLAINTEXT://192.168.133.11:9092

按照官网的参数说明，此时advertised.listeners默认值等于listeners参数的值，并被发布到zookeeper中，供客户端访问使用。
此时kafka服务、broker之间通信都是使用192.168.133.11:9092

在内网部署kafka服务，并且生产者或者消费者在外网环境时，需要添加额外的配置，比如

advertised_listeners 监听器会注册在 zookeeper 中；

总结：advertised_listeners 是对外暴露的服务端口，kafka组件之间通讯用的是 listeners。

其实listeners是真正决定kafka启动时候的监听端口。advertised_listeners可以看做类似nginx的端口代理。