## 场景
服务端每1分钟给客户端发消息，会造成一个问题，新来的订阅者最极端情况可能无法第一时间获取到信息，需要等1分钟。这样对体验非常不友好。

如何做到订阅后立马收到消息呢？

其实也简单，让服务器保留最后一条最新消息就行了，发送端发送消息的时候带上一个标志，服务端收到后，会把消息存储起来

**保留消息存在的意义是为了订阅者能够立即收到消息而无须等待发布者发布下一条消息。**

## 保留消息

#### 发送一条保留消息
从开发者的角度来说，发送一条保留消息是最简单直接的办法。你只需要将一条MQTT发布消息的保留标志（retained flag）置为true。每一个典型的客户端库文件都提供了一个简单方法来实现此操作。

对于paho客户端，发送时候带上`-r`参数就行了

`paho_c_pub -t presence --connection ws://192.168.100.1:8083/mqtt -r -m "test223334567"`

如果是用mqttx客户端发送，勾选retain即可
![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210716111540.png)

如果你是用MQTT X broker，我们可以设置保留的消息的存储类型，存到内存还是硬盘，保留数量，保留时间等等
[文档](https://docs.emqx.cn/broker/v4.3/advanced/retained.html#%E7%AE%80%E4%BB%8B)

#### 删除一条保留消息
保留消息虽然存储在服务端中，但它并不属于会话的一部分。也就是说，即便发布这个保留消息的会话终结，保留消息也不会被删除。

删除保留消息只有两种方式：

前文已经提到过的，客户端往某个主题发送一个 Payload 为空的保留消息，服务端就会删除这个主题下的保留消息。
消息过期间隔属性在保留消息中同样适用，如果客户端设置了这一属性，那么保留消息在服务端存储超过过期时间后就会被删除。


## 参考

https://www.jianshu.com/p/701ef52c62fd

https://www.emqx.com/zh/blog/message-retention-and-message-expiration-interval-of-emqx-mqtt5-broker

https://www.emqx.com/zh/blog/mqtt5-features-retain-message

https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages/

https://www.emqx.io/docs/zh/v4.3/advanced/retained.html#%E7%AE%80%E4%BB%8B