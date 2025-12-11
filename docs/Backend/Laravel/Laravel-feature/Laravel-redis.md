## Redis 在 Laravel 项目中的使用场景

### 30 分钟未付款取消订单

初始方案，使用计划任务
```php
$unPaid = Order::where('created','<',time()-30*60) //创建时间在30分钟以前
->where('order_status',1) // 刚下单未支付
->get();
foreach ($unPaid as $order) {
    $order->cancel(); // 执行取消动作
}
```

频率是每分钟执行一次`$schedule->command('order:cancel')->everyMinute();`

弊端：
1. 很多查询是白白执行，不是每分钟都有订单会被取消
2. 锁表现象：如果数量很多，前一个任务还没执行完下一个任务又开始启动了，然后锁着表改不了数据。

使用Redis的监听事件方案

在订单确认成功之后，往 redis 里加入 key, 用 ORDER_CONFIRM:订单ID 这样的格式来，然后定义他 30 分钟后过期，我们监听这个键过期事件就好了。

流程：

1. 
`brew info redis` 查看redis配置文件，Linux一般在`/etc/redis.conf`
修改Redis的配置文件，加入`notify-keyspace-events "Ex"`
* E 表示 Keyevent事件
* x 过期事件

2. 
重启redis服务 `brew services restart redis`

3. 
打开两个终端，先在命令行里测试功能，一个命令行中
```bash
redis-cli
psubscribe __keyevent@0__:expired
```

另一个，存key，并设置过期时间

```bash
redis-cli
setex name 10 finley
```

过10s后会发现第一个终端有数据产生
大致是:

```bash
127.0.0.1:6379> psubscribe __keyevent@0__:expired
Reading messages... (press Ctrl-C to quit)
1) "pmessage"
2) "__keyevent@0__:expired"
3) "__keyevent@0__:expired"
4) "name"
```

4. 修改php代码

```php
$redis = new \Redis();
$redis->connect('127.0.0.1', '6379');
$redis->setOption(\Redis::OPT_READ_TIMEOUT, -1);
$cache_db = config('database.redis.default.database');
$pattern = '__keyevent@' . $cache_db . '__:expired';
$redis->psubscribe([$pattern], function ($redisInstance, $pattern, $channel, $msg) {
    print_r($redisInstance);
    // __keyevent@0__:expired
    // echo '[pattern]' . $pattern . '/n';
    // __keyevent@0__:expired
    // echo '[channel]' . $channel . '/n';
    // demolara_database_ORDER_CONFIRM:1
    // echo '[msg]'  . $msg . '/n';
    $id = Str::after($msg, ':');
    if ($id) {
        Order::find($id)->cancel();
    }
});
```


在控制器中，保存订单成功的后面，加上往redis存key的逻辑，为方便测试，先把时间设置短点

```php
$data = Order::where('created_at', '<', Carbon::now()
->subMinutes(30))
->get();
foreach ($data as $order) {
    \RedisManager::setEx('ORDER_CONFIRM:' . $order->id, 10, $order->id);
}
```


存数据后同时打开redis客户端，这里推荐`Another Redis DeskTop Manager`

```php
// 订阅接收端
\RedisManager::subscribe(['news'], function ($msg) {
    echo $msg;
    Log::warning($msg);
});

// 发送端
\RedisManager::publish('news', json_encode(['foo' => 'bar']));
```

### 购物车处理

需要存储用户ID(uid)，商品ID(gid)和商品数量(count)
存储格式: cartuid:gid:count
比如 cart:1:10:2
表示用户ID1添加了2件id为10的商品
用redis中的哈希比较方便

```
# 用户添加了两种商品，2个101，1个102
127.0.0.1:6379> hset cart:1 101 2 102 1
OK
127.0.0.1:6379> hkeys cart:1
1) "101"
2) "102"
127.0.0.1:6379> hget cart:1 101
1) "2"
127.0.0.1:6379>
```

```php
class Cart 
{

	private $prefix = 'cart:';

	private $redis = null;

	public function __construct()
	{
        $this->redis = new Redis();
        $this->redis->connect('127.0.0.1',6379);
    }

    public function userId()
    {
    	return 1;
    }

    public function addItem($goodId, $count)
    {
    	$key = $this->prefix . $this->userId();

    	$oldCount = $this->getItem($goodId);

        // 添加过该商品，累加个数
    	if ($oldCount) {
    		$newCount = $oldCount + $count;
			$this->redis->hset($key, $goodId, $newCount);
        // 首次添加商品，直接记录
    	} else {
    		$this->redis->hset($key, $goodId, $count);
    	}
    }

	public function getItem($goodId)
	{
		$key = $this->prefix . $this->userId();
		return $this->redis->hget($key, $goodId);
	}
}

$cart = new Cart();

$cart->addItem('103', 2);

$cart->addItem('103', 1);

$cart->addItem('105', 1);

$cart->addItem('106', 3);

$cart->addItem('106', -2);
```   

      
::: warning
根据Redis 4.0.0，HMSET被视为已弃用。请在新代码中使用HSET。              
:::


## 参考

https://learnku.com/articles/21488
