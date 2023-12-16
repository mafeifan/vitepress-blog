## 队列
队列存储着即将被应用消费掉的消息。队列跟交换机共享某些属性，但是队列也有一些另外的属性。

|名称|含义|
| ----------- | -----|
|Name(名称)	|队列名称|
|Durable(持久)	|Broker重启后，队列是否继续存在|
|Exclusive(独占)	|仅由一个连接使用，当该连接关闭时将删除队列|
|Auto-delete(自动删除)|	当最后一个consumer断开连接后自动删除|
|Arguments	|可选参数|

## 队列名称
队列名称可以由client(publisher／consumer)定义，也可以由Broker定义，当需要Broker定义队列名称时，队列名称传空字符串即可，后续操作时队列名称也需传空字符串，队列的名字为utf-8编码， 最长不超过255字节，队列名称以“amq”开头的是保留名称，供Broker内部使用，强行使用将返回403错误码

## 队列持久
持久队列存储到磁盘，因此可以在Broker重新启动后继续运行。不持久的队列称为暂存队列。并非所有场景都要求队列持久。

定义队列时，需要传入很多参数
```php
public function queue_declare(
        $queue = '',
        $passive = false,
        $durable = false,
        $exclusive = false,
        $auto_delete = true,
        $nowait = false,
        $arguments = array(),
        $ticket = null
    )
```

* 第一个参数：队列名，不填系统会自动创建
* 第二个参数：被动
* 第三个参数：持久化

## 持久化
RabbitMQ的队列和消息存放于内存中，在出现任何异常情况，导致RabbitMQ异常中止，内存中的数据将会丢失。
若要在RabbitMQ从异常恢复后仍然保存有异常中止前的消息，就需将消息持久化，即将消息同时保存于磁盘中。
RabbitMQ可将消息保存到Erlang自带的Mnesia数据库中，当RabbitMQ重启之后会读取该数据库。
声明队列的方法中，“durable”参数即指定队列是否是持久化的。使消息持久化，需要队列和消息都是持久化的，并且通常交换机也应该是持久化的。
RabbitMQ的默认交换机“(AMQP default)”是持久化的，对于与其绑定的队列，将队列声明为持久化的队列，并发送持久化的消息，即可将消息持久化。
登录Web管理界面，可以看到，队列中依然保存着重启前的消息。队列列表中，特性（Features）列的“D”即表示该队列是持久化的（Durable）。

## 排他
对于排他队列，只有创建它的连接有权访问，连接断开后，排他队列将自动删除。这种队列适用于一个队列仅对应一个客户端收发消息的场景。
在声明队列时，将exclusive参数设置为true即可声明一个排他队列。可通过以下程序验证排他队列的性质
进入Web管理界面，Queues中Features列的“Excl”即表明该队列是排他的

如果排他队列正在运行，尝试再运行一个队列会报如下错误：
`405 RESOURCE_LOCKED - cannot obtain exclusive access to locked queue`

`$channel->queue_declare($queue, false, true, false, false); `

## 自动删除
若队列的autoDelete（自动删除）属性开启，当队列的最后一个消费者断开时，该队列会被自动删除。
声明一个队列，autoDelete参数设置为true，进入Web管理界面，可以看到，队列列表中出现了被创建的自动删除队列，Features列的“AD”即表明该队列是自动删除的。

此外，我们可以确保即使RabbitMQ重启了，消息队列不会丢失，在生产者端设置：
```php
// 设置RabbitMQ重启后也不会丢失队列，或者设置为'delivery_mode' => 2
$msg = new AMQPMessage($data, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]); 
$channel->basic_publish($msg, '', $queue);
```

现在我们建立生产者文件sender.php，我们假设服务端已经安装好RabbitMQ，并且开放好对应端口。

```php
<?php
/**
 * @Author: Helloweba
 * @sender.php
 * @消息生产者-分发任务
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$queue = 'worker';

//$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$connection = new AMQPStreamConnection(
    '192.168.0.100', 
    56720, 
    'helloweba',  //user
    'helloweba',  //password
    'test'  //vhost
);
$channel = $connection->channel();

$channel->queue_declare($queue, false, true, false, false); //第3个参数设置为true，表示让消息队列持久化

for ($i = 0; $i < 100; $i++) { 
    $arr = [
        'id' => 'message_' . $i,
        'order_id' => str_replace('.', '' , microtime(true)) . mt_rand(10, 99) . $i,
        'content' => 'helloweba-' . time()
    ];
    $data = json_encode($arr);
    $msg = new AMQPMessage($data, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]); ////设置RabbitMQ重启后也不会丢失队列，或者设置为'delivery_mode' => 2
    $channel->basic_publish($msg, '', $queue);

    echo 'Send message: ' . $data . PHP_EOL;
}

$channel->close();
$connection->close();
```

上述代码中，我们模拟了生产者向队列中发送了100条订单消息。

## 消息接收

消费者是指完成消息的接收和处理的客户端程序，消费者就如同生产线上的操作工人，他们按照操作规程从传送带上取出产品后有序的完成后续工作任务。

实际项目中，如果消费者处理消息能力不够时，就要开启多个消费者来消费队列中的消息。
默认情况下，RabbitMQ将会把队列中的消息平均分配给每个消费者。
如果消费者要对分配到的消息任务处理时间很长（耗时任务），那么处理消息任务的时候就有可能会遇到意外。
比如某个消费者断电了，或者出故障了，那它正在处理的消息会怎么办？这里就是RabbitMQ的消息确认机制，为了保证数据不丢失，RabbitMQ会将未处理完的消息分配给下一个消费者处理。

此外RabbitMQ还可以设置公平分配消息任务，不会给某个消费者同时分配多个消息处理任务，因为消费者无法同时处理多个消息任务。
换句话说，RabbitMQ在处理和确认消息之前，不会向消费者发送新的消息，而是将消息分发给下一个不忙的消费者。

我们现在建立消费者文件receiver.php，代码如下：

```php
<?php
/**
 * @Author: Helloweba
 * @receiver.php
 * @消息消费者-接收端
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;

$queue = 'worker';

//$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$connection = new AMQPStreamConnection('192.168.0.100', 56720, 'helloweba', 'helloweba', 'test');
$channel = $connection->channel();

$channel->queue_declare($queue, false, true, false, false);

echo ' [*] Waiting for messages. To exit press CTRL+C' . PHP_EOL;

$callback = function($msg){
    echo " Received message：", $msg->body, PHP_EOL;
    sleep(1);  //模拟耗时执行
    $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
};

// 处理和确认完消息后再消费新的消息
$channel->basic_qos(null, 1, null);

// 第4个参数值为false表示启用消息确认 
$channel->basic_consume($queue, '', false, false, false, false, $callback); 

while(count($channel->callbacks)) {
    $channel->wait();
}

$channel->close();
$connection->close();
```

## 模拟测试

现在我们运行多个消费者终端，可以打开多个ssh客户端，client1和client2运行：

`php receive.php`

然后再开个终端，运行生产者：

`php sender.php`

由于消费者是阻塞运行的，他们会一直等待队列中的消息，当有消息就会去取出来处理。
我们可以模拟将其中某个客户端中断，即断开某个消费者。然后再看消息是不是被其他消费者接收处理了。同样我们可以模拟将客户端全部重启，看看队列中的消息是否没有丢失。

当client1中断连接RabbitMQ后，再次运行连接RabbitMQ，在client2中看到的消息处理情况，注意看图中的消息id。

client1:
![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210315185224.png)

client2:
![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210315185326.png)

