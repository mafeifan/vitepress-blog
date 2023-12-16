## 	Virtual Host
RabbitMQ服务端可建立多个虚拟主机（vhost），不同虚拟主机之间是隔离的，拥有自己独立的交换机、队列、绑定关系、用户权限等。
如此不同的系统或业务可使用不同的虚拟主机，方便解决用户权限管理、交换机和队列命名冲突等问题。

在RabbitMQ服务端安装完毕后，已默认配有名为“/”的虚拟主机。
虚拟主机相关的操作可使用rabbitmqctl工具进行。常用命令如下。

查看当前已建立的虚拟主机列表：
`sudo rabbitmqctl list_vhosts`

添加虚拟主机：
`sudo rabbitmqctl add_vhost vhostname`

删除虚拟主机：
`sudo rabbitmqctl delete_vhost vhostname`


## 绑定
绑定是交换机将消息路由给队列所遵循的规则

## 消息确认
当队列接到consumer的消息确认时将删除消息，消息确认分为两种：
1.consumer获取消息后自动确认
2.consumer获取消息后手动确认，或处理完成后手动确认

## 拒绝消息
consumer获取消息后如果处理失败，应该通知队列此消息被拒绝，并通知队列该消息是删除还是继续存放在队列，当队列只有一个consumer时，继续存放队列可能会造成队列和消费者间的死循环

## 预读取消息
对于存在多个consumer的队列，在consumer确认消息之前，设置可以向consumer分发消息的数量，可以简单的实现类似复杂均衡

## 消息属性
|属性名	|含义|
| ----------- | -----|
|Content type	|内容类型|
|Content encoding	|编码|
|Routing key	|路由键|
|Delivery mode	|投递模式（持久化 或 非持久化）|
|Message priority	|消息优先级|
|Message publishing timestamp	|发布时间戳|
|Expiration period	|消息有效期|
|Publisher application id	|Publisher的ID|

## 交换机类型
|交换机类型 |	预声明的默认名称 |
| ----------- | -----|
|Direct exchange（直连交换机）|	(Empty string) and amq.direct|
|Fanout exchange（扇型交换机）|	amq.fanout|
|Topic exchange（主题交换机）	|   amq.topic|
|Headers exchange（头交换机） |	amq.match (and amq.headers in RabbitMQ)|
	
## 交换机属性
|属性名	|含义|
| ----------- | -----|
|Name(名称)	|交换机名称|
|Durability(持久)|	Broker重启后，交换机是否还存在|
|Auto-delete(自动删除)	|当所有与之绑定的消息队列都完成了对此交换机的使用后，删掉它|
|Arguments(参数)	|可选，由插件和特定于代理的功能使用|

## 直连交换(单播)
队列通过路由键routing key(如k=R)绑定到交换机
当有新消息投递到直接交换时，如果k=R，交换机将其投递到使用k=R绑定的队列
> ![image.png](https://www.jmsite.cn/wp-content/uploads/2019/01/exchange-direct.png)

## 扇形交换(广播)
扇形交换将消息路由到绑定到它的所有队列，并忽略routing key
> ![image.png](https://www.jmsite.cn/wp-content/uploads/2019/01/exchange-fanout.png)

## 主题交换(多播)
主题交换基于消息路由键routing key，与交换机和队列间的绑定routing key进行匹配，将消息路由到一个或多个队列，主题交换通常用于实现类似各种发布/订阅模式。主题交换通常用于消息的多播路由

## 头交换机(多播)
头交换机通过消息的headers属性和与交换机绑定的routing key进行匹配，将消息路由到一个或多个队列，当"x-match"设置为“any”时，消息头的任意一个值被匹配就可以满足条件，而当"x-match"设置为“all”的时候，就需要消息头的所有值都匹配成功。
