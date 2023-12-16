我们有一个小说系统，每天会有很多作者发布新的小说内容，而读者因为个人爱好可能只订阅他喜欢的类型的小说，比如历史类、玄幻类小说。小说系统每天会根据用户的口味推送相关的小说更新消息，这就用到了消息发布和订阅系统。

概念
我们先来了解几个概念：

## 交换器(Exchanges)
RabbitMQ消息传递模型的核心思想是，生产者不发送任何信息直接到队列。事实上，生产者甚至不知道消息是否会发送到任何队列。生产者只能向交换器发送消息（也叫交换机，默认交换器使用""空字符标记）。交换器需要知道如何处理接收的消息，将消息推入到指定的队列中，决定消息是否入列和抛弃。如下图，P表示消息发布者，X表示交换机，Q1和Q2表示不同的队列。


![](https://www.helloweba.net/attachments/contimg/2020/RabbitMQ_p.jpg)


## 交换类型
交换机有几种类型：direct, topic, headers 和 fanout。

* fanout：广播订阅，向所有的消费者发布消息。每个发到 fanout 类型交换器的消息都会分到所有绑定的队列上去。fanout 交换器不处理路由键，只是简单的将队列绑定到交换器上，每个发送到交换器的消息都会被转发到与该交换器绑定的所有队列上。很像子网广播，每台子网内的主机都获得了一份复制的消息。fanout 类型转发消息是最快的。

* direct：消息中的路由键（routing key）如果和 Binding 中的 binding key 一致， 交换器就将消息发到对应的队列中。路由键与队列名完全匹配，如果一个队列绑定到交换机要求路由键为“dog”，则只转发 routing key 标记为“dog”的消息，不会转发“dogA”，也不会转发“dogB”等等。它是完全匹配、单播的模式。

* topic：topic 交换器通过模式匹配分配消息的路由键属性，将路由键和某个模式进行匹配，此时队列需要绑定到一个模式上。它将路由键和绑定键的字符串切分成单词，这些单词之间用点隔开。它同样也会识别两个通配符：符号“#”和符号“*”。#匹配0个或多个单词，*匹配不多不少一个单词。

* headers 类型的交换器基本不用，本文忽略。

举例：以下代码，发布者向名叫msg的交换器发布广播消息，全体消费者都能收到相同的消息。
`$channel->exchange_declare('msg', 'fanout', false, false, false);`

## 绑定(Bindings)
交换器和队列之间的对应关系称为绑定，可以理解为，队列对来自此交换器的消息感兴趣。

以下代码表示将队列绑定到名叫article的交换器上。

`$channel->queue_bind($queue_name, 'article');`

## 路由键 
绑定可以采取额外的routing_key参数。避免混淆和`$channel::basic_publish`参数我们要叫它绑定key。这就是我们如何用键创建绑定的原因：
```php
$routerKey = 'abc';
$channel->queue_bind($queueName, $exchange, $routerKey);
```

## 消息发布
我们创建发布者文件`publish_direct.php`，指定交换机为`article`，类型为`direct`，我们只允许订阅了对应类型小说文章的消费者才可以消费对应的小说文章消息。
我们将向消费者发布四个类型的小说文章消息：fantasy(玄幻)，military(军事)，history(历史)，romance(言情)。

以下代码模拟了发布者发布100条随机消息：

```php
<?php
/**
 * @发布消息
 * @Author: Helloweba
 * @publish_direct.php
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$exchange = 'article';

$connection = new AMQPStreamConnection('192.168.0.100', 56720, 'helloweba', 'helloweba', 'test');
$channel = $connection->channel();

$channel->exchange_declare($exchange, 'direct', false, false, false);

for ($i = 0; $i < 100; $i++) { 
    $cate = ['fantasy', 'military', 'history', 'romance'];
    $key = array_rand($cate);

    $arr = [
        'id' => 'message_' . $i,
        'content' => 'helloweba '. $cate[$key]
    ];
    $data = json_encode($arr);
    $msg = new AMQPMessage($data);

    $channel->basic_publish($msg, $exchange, $cate[$key]);
    echo 'Send '.$cate[$key].' message: ' . $data . PHP_EOL;
}

$channel->close();
$connection->close();
```

消息订阅
现在我们建立订阅者文件`subscribe_direct.php`，指定交换机为`article`，路由键为`fantasy`，意为只订阅玄幻小说类消息，代码如下：

```php
require_once __DIR__ . '/../vendor/autoload.php';

use PhpAmqpLib\Connection\AMQPStreamConnection;

$exchange = 'article';
$routerKey = 'fantasy'; //只消费玄幻类消息

//$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$connection = new AMQPStreamConnection(
    'localhost',
    5673,
    'admin',  //user
    'admin'   //password
);

$channel = $connection->channel();

$channel->exchange_declare($exchange, 'direct', false, false, false);

list($queueName, ,) = $channel->queue_declare("", false, false, true, false);

$channel->queue_bind($queueName, $exchange, $routerKey);

echo " [*] Waiting for messages. To exit press CTRL+C" .PHP_EOL;
$callback = function ($msg) {
    //echo " Received message：", $msg->body, PHP_EOL;
    echo ' Received message：',$msg->delivery_info['routing_key'], ':', $msg->body, PHP_EOL;
    sleep(1);  //模拟耗时执行
};
$channel->basic_consume($queueName, '', false, true, false, false, $callback);

while ($channel->is_consuming()) {
    $channel->wait();
}

$channel->close();
$connection->close();

```

接着再新建订阅者文件`subscribe_direct_2.php`，复制粘贴`subscribe_direct.php`文件的代码，并将路由键改为`history`，意为只订阅历史小说类消息

模拟测试
好了，现在我们打开两个终端，分别执行两个订阅者程序：

`php subscribe_direct.php //client1订阅玄幻小说类消息`
`php subscribe_direct_2.php //client2订阅历史小说类消息`
再另开启一个终端，执行发布者程序：

`php publish_direct.php`

现在你应该可以看到如图效果：

client1，只订阅玄幻类（fantasy）消息:
![](https://www.helloweba.net/attachments/contimg/2020/rabbit_subscribe0.jpg)

client2，只订阅历史类（history）消息:
![](https://www.helloweba.net/attachments/contimg/2020/rabbit_subscribe1.jpg)
