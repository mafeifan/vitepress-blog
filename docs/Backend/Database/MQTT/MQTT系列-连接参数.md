正如我们所了解的，MQTT解耦了发布者和订阅者，所以任何客户端都只与中间人（broker）建立连接。在深入了解连接细节之前，让我们先搞清楚客户端和中间人的概念。

## 客户端
我们所说的客户端泛指MQTT的客户端，包含发布者和订阅者，分别负责发布消息和订阅消息。
（通常情况下，一个MQTT实体同时具备发布者和订阅者两重功能）。
任何包含了MQTT运行库并且通过任意网路类型连接到MQTT broker的且具备微控制器的设备都称为MQTT客户端。

它可以是一个用于测试的小型设备，包含一个小型计算机系统，同时可以接入无线网络，最重要的是其支持TCP/IP协议从而允许MQTT在其上运行。

在客户端上实现MQTT协议非常直观方便，基于此，可以说MQTT非常适合小型设备。

MQTT客户端运行库支持大部分编程语言和平台，例如，Android，Arduino，C，C++，C#，Go，iOS，Java，Javascript，.Net。

完整的支持列表可以[参考](https://github.com/mqtt/mqtt.org/wiki/libraries)

## 中间人（Broker）
和MQTT客户端协作的另一部分是MQTT broker，其被称为发布/订阅协议的心脏部分。
根据具体的实现不同，一个broker可以支持数以千计的客户端并发连接。

broker的主要职责是接受所有消息，并将其过滤后分发给不同的消息订阅者。

它也可以根据订阅内容和未送达的消息来保持持久的会话。

broker的另一个职责是验证和授权客户端。在大多数时候，broker是可扩展的，我们可以将其整合进后台系统，整合进系统显得尤为重要，因为大多数时候，broker只是一个网络通信系统的组件。

我们之前的一篇文章提到订阅所有消息并不是很好的选择。

总而言之，broker是一个中心交换机，交换所有数据。因此高扩展性，可集成到后台系统，易于监控当然还包括不出错误对broker来说尤为重要。

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210716153712.png)

各个broker对比，[参见](http://www.bewindoweb.com/244.html)

客户端以一个CONNECT消息初始化连接
让我们来看一下MQTT连接消息，正如前面提到的，客户端发送消息给broker以初始化连接。

如果CONNET消息是畸形的，或者由建立socket连接到发送消息中间等待的时间过长，broker都会关闭连接。
这是一个较好的避免恶意客户端攻击服务器的处理方式。一个正常的客户端将会按照下面的内容发送连接消息。

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210716155130.png)

此外，CONNECT消息还包含了一些其他信息，这些信息与MQTT库的制定者有更多关系，实际使用者则不必关心，如果你感兴趣，请参考[官方MQTT 3.1.1](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) 说明
下面让我们逐个了解一下这些信息的含义。

## ClientId
ClientId是连接到broker的每个MQTT客户端的唯一标识符。根据场景不同，broker制定的ID规则也可以不同。
broker使用此标识符来识别客户端以及客户端的当前状态。
如果你不需要broker记录客户端的状态，也可以发送一个空的ClientId，这样将会创建一个无状态的连接，此功能适用于MQTT 3.1.1版本。
这样做的一个前提条件是cleanSession字段需要置为true，否则连接将会被拒绝。

## Clean Session
Clean session 字段表明客户端是否想与broker建立持久的会话。
一个持久的会话（cleanSession为false）意味着，当使用QoS级别为1或2时，broker将会存储所有的客户端订阅的消息，和尚未送达的消息。
如果cleanSession为true时，broker不会存储任何客户端订阅的消息，并会将之前所存的内容清空。

## Username/Password
MQTT允许发送用户名和密码来鉴定和授权客户端身份。然而，如果未使用TLS加密，用户名和密码将会以明文的方式传输。
我们强烈建议使用安全传输协议来传输用户名和密码。HiveMQ broker也支持使用SSL验证客户端身份，此时用户名和密码不再必须。

## Will Message（遗嘱）
遗嘱是MQTT的一大特色，它允许broker在发现一台设备意外断开时发送通告给其他相关设备。
客户端在建立CONNECT连接时会将遗嘱打包在消息体里。如果这个客户端在没有通知的情况下意外断开连接，broker将会发送遗嘱消息给其他关联设备。我们将会在单独一章讨论此话题。

## KeepAlive（心跳）
心跳是指客户端周期性地发送PING请求给broker，broker也会应答此心跳，这种机制可以保证双方知道对方是否还在线。我们将会在单独一章讨论此话题。

最主要的是所有消息都由MQTT客户端向broker建立连接，有一些定制化的库文件还会附加其他选项，例如规定消息如何排序和存储等。

## Broker以CONNACK消息应答
当broker收到一个CONNECT消息时，broker有义务应答一个CONNACK消息，CONNACK只包含两个数据字段，一个是Session present flag（当前会话标志），另一个是Return code（返回码）。

## Session Present Flag（当前会话标志）
当前会话标识可以表明broker是否在之前已经和客户端建立过持久会话。
如果客户端连上来并且将cleanSession字段置为true，那么当前会话标志将始终为false，因为会话都已经被清空了。
如果客户端在连上来时将cleanSession置为false，那么flag的状态决定于当前针对此客户端是否有可用的会话。
如果有已有存储的会话消息，那么false将会为true，否则为false。这个flag标志在MQTT 3.1.1中被添加，以帮助客户端来确定是否需要订阅主题或判断当前是否有待处理的消息。


## 参考

https://www.jianshu.com/p/ff77386467e1
