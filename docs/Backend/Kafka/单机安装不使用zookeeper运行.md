有耐心和英文还可以的同学可以下载官方的[电子书](https://www.confluent.io/thank-you/resources/kafka-the-definitive-guide-v2/)

单机测试

环境 Ubuntu18.04

```bash
# 可选
$ export JAVA_HOME=/usr/java/jdk-11.0.10

## 安装 kafka
```bash
$ tar -zxf mv kafka_2.13-3.1.0.tgz
$ mv kafka_2.13-3.1.0.tgz /usr/local/kafka
$ mkdir /tmp/kafka-logs

# 生成随机cluster id
$ ./bin/kafka-storage.sh random-uuid
1QZShiaqQQCN8XE797uesg

# 格式化存储目录，注意我们使用的是kraft中的配置文件

./bin/kafka-storage.sh format -t 1QZShiaqQQCN8XE797uesg -c ./config/kraft/server.properties
Formatting /tmp/kraft-combined-logs

# 启动 kafka
$ ./bin/kafka-server-start.sh ./config/kraft/server.properties

# 创建名为test的topic
$ ./bin/kafka-topics.sh --create --topic test --partitions 1 --replication-factor 1 --bootstrap-server localhost:9092

Created topic test.
# 查看topic
$ ./bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic test

Topic: test	TopicId: JyDAOV4AQ2mnCyD1Sh4DmA	PartitionCount: 1	ReplicationFactor: 1	Configs: segment.bytes=1073741824
	Topic: test	Partition: 0	Leader: 1	Replicas: 1	Isr: 1

# 生产消息到test主题(使用Ctrl-C停止生产者):
$ ./bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test
> test1
> test2

# 新开一个终端，消费来自test主题的消息:
# --from-beginning 是显示所有消息，而不是从最新的消息开始
$ ./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning
```

## python客户端


生产者
```python
# pip install kafka-python
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers='localhost:9092')
for i in range(5):
  future = producer.send('test', b'finley %d' % i)
  result = future.get(timeout=10)
  print(result)
```

消费者还是有问题

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

## 参考

https://github.com/dpkp/kafka-python