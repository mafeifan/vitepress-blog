## RabbitMQ概念
	
| 名称           | 含义  |
| --------------|------|
| Broker        | 代理消息的服务器，具体指的是消息队列服务器实体 |
| Virtual Host  | 虚拟主机，对于多租户共享的服务器，为了实现用户间隔离彼此互不影响，broker里可以开设多个Virtual Host，用作不同用户的权限分离，相当于namespace命名空间或可以理解为mysql中的数据库 |
| Connection    | client(publisher／consumer)和broker之间的TCP连接。断开连接的操作只会在client进行，Broker不会断开连接，除非出现网络故障或broker服务出现问题 |
| Channel       | 消息通道，在Connection里，可建立多个channel，每个channel代表一个会话任务,channel之间彼此隔离，client和broker通过channel id识别channel |
| Exchange      | 交换机，使消息按照指定规则，路由到具体队列 |
| Queue         | 消息队列，存放消息的载体，等待消费者取出 |
| Binding       | 绑定，把exchange和queue按照路由规则绑定起来 |	
| Routing Key   | 路由关键字，exchange根据这个关键字进行消息投递 |	
| Producer      | 消息生产者，就是创建投递消息的程序 |			
| Consumer      | 消息消费者，就是获取消息的程序 |	

## 工作流程

![image.png](https://www.jmsite.cn/wp-content/uploads/2019/01/hello-world-example-routing.png)

1. publisher请求创建一个Connection，连接到Broker，打开一个channel
2. publisher声明一个exchange，并设置相关属性
3. publisher声明一个queue，并设置相关属性
4. publisher使用routing key，在exchange和queue之间建立好绑定关系
5. publisher投递消息到exchange
6. exchange通过routing key和绑定关系，将消息投递到queue
7. queue将消息分发给consumer
8. consumer获取到消息后进行消息确认或处理完成后消息确认，queue删除消息	

RabbitMQ的基本模型，模型中包括以下部分：生产者、交换机、队列和消费者。
生产者产生消息，并将消息发送至交换机，交换机根据一定的路由规则将消息发送至一个或多个消息队列中，消息的消费者从相应的消息队列中取数据，进行处理。
其中，交换机和队列位于RabbitMQ服务端，生产者和消费者属于RabbitMQ的客户端。

![](https://gitee.com/Finley/upic/raw/master/picGo/20210403231136.png)

RabbitMQ的客户端建立与服务端的Socket长连接（Connection），并在其上建立轻量级的连接——信道（Channel），大部分的业务操作是在信道中进行的。有文章有形象的比喻：若连接是一根光缆，则信道就是光缆中的光纤。

RabbitMQ安装部署完毕，会已经创建好一些交换机，进入Web管理界面->Exchanges页签

其中，默认交换机“(AMQP default)”最为特殊，它的名字是一个空字符串（””），不能被删除。所有创建的队列都会与之连接（称为“绑定”），且不能解绑。
绑定使用的路由键（Routing Key）即为队列的名称。

![](https://gitee.com/Finley/upic/raw/master/picGo/20210403231246.png)

## 示例说明
生产者（Producer）和消费者（Consumer）是消息队列的基本概念，生产者是指生产消息的一方，也是消息发送方，消费者就是消费消息的一方，也是消息接收方，队列就是存储消息的一个缓存区。

本节中，我们创建一个消息的发送方（生产者）、接收方（消费者）和与默认交换机绑定的队列，发送方通过默认交换机向该队列中发送一条消息，接收方从该队列中取出消息。

RabbitMQ支持多种编程语言的客户端，本文主要使用PHP

## 发送方

```php
<?php
/**
 * @sender.php
 * @消息生产者-发送端
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$queue = 'worker';

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');

// 一个Connection可以包含多个Channel
$channel = $connection->channel();

// 第3个参数设置为true，表示让消息队列持久化
$channel->queue_declare($queue, false, true, false, true);

for ($i = 0; $i < 10; $i++) {
    $arr = [
        'id' => 'message_' . $i,
        'order_id' => str_replace('.', '' , microtime(true)) . mt_rand(10, 99) . $i,
        'content' => 'helloweba-' . time()
    ];
    $data = json_encode($arr);
    // 设置rabbitmq 重启后也不会丢失队列，或者设置为'delivery_mode' => 2
    $msg = new AMQPMessage($data, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);
    $channel->basic_publish($msg, '', $queue);
    echo 'Send message: ' . $data . PHP_EOL;
}

$channel->close();
$connection->close();
```

## 接收方

```php
<?php
/**
 * @receiver.php
 * @消息消费者-接收端
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;

$queue = 'worker';

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');

$channel = $connection->channel();

$channel->queue_declare($queue, false, true, false, true);

echo ' [*] Waiting for messages. To exit press CTRL+C' . PHP_EOL;

$callback = function($msg){
    echo " Received message：", $msg->body, PHP_EOL;
    sleep(1);  //模拟耗时执行
    $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
};

// 处理和确认完消息后再消费新的消息
$channel->basic_qos(null, 1, null); //处理和确认完消息后再消费新的消息

// 第4个参数值为false表示启用消息确认
$channel->basic_consume($queue, '', false, false, false, false, $callback);

while(count($channel->callbacks)) {
    $channel->wait();
}

$channel->close();
$connection->close();
```

先运行接收端，再运行发送端
`php receiver.php`和 `php sender.php`

进到管理平台会发现Queues多了名为work的队列

![](https://gitee.com/Finley/upic/raw/master/picGo/20210407111622.png)

在队列详情页面，可以发布消息，接收端可以收到消息了

![](https://gitee.com/Finley/upic/raw/master/picGo/20210407111909.png)
