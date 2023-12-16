## key的设计原则

key的一个格式约定：object-type:id:field。用":"分隔域，用"."作为单词间的连接，如"comment:12345:reply.to"。
不推荐含义不清的key和特别长的key。

一般的设计方法如下： 
1. 把表名转换为key前缀 如, tag: 
2. 第2段放置用于区分区key的字段--对应mysql中的主键的列名,如userid 
3. 第3段放置主键值,如2,3,4...., a , b ,c 4: 第4段,写要存储的列名

例如用户表 user, 转换为key-value存储：

```bash
set user:userid:9:username lisi
set user:userid:9:password 111111
set user:userid:9:email lisi@163.com
```

例如，查看某个用户的所有信息为：
`keys user:userid:9*`

如果另一个列也常常被用来查找，比如username，则也要相应的生成一条按照该列为主的key-value，例如：
`set user:username:lisi:userid 9`
此时相当于RDBMS中在username上加索引，我们可以根据 `username:lisi:uid`,查出`userid=9`，再查`user:9:password/email` ...

## 注意事项
* 从业务需求逻辑和内存的角度，尽可能的设置key存活时间。
* 程序应该处理如果redis数据丢失时的清理redis内存和重新加载的过程。
* 只要有可能的话，就尽量使用散列键而不是字符串键来储存键值对数据，因为散列键管理方便、能够避免键名冲突、并且还能够节约内存
* 尽量使用批量操作命令，如用mget、hmget而不是get和hget，对于set也是如此，lpush向一个list一次性导入多个元素，而不用lset一个个添加
* 尽可能的把redis和APP SERVER部署在一个网段甚至一台机器。
* 由于redis单线程的，所以长时间的排序操作会阻塞其他client的请求
* 对于数据量较大的集合，不要轻易进行删除操作，这样会阻塞服务器，一般采用重命名+批量删除的策略

列表：
```bash
# Rename the key
newkey = "gc:hashes:" + redis.INCR("gc:index")
redis.RENAME("my.list.key", newkey)

# Trim off elements in batche of 100s
while redis.LLEN(newkey) > 0
  redis.LTRIM(newkey, 0, -99)
end
```

集合：
```bash
# Rename the key
newkey = "gc:hashes:" + redis.INCR("gc:index")
redis.RENAME("my.set.key", newkey)

# Delete members from the set in batches of 100
cursor = 0
loop
  cursor, members = redis.SSCAN(newkey, cursor, "COUNT", 100)
  if size of members > 0
    redis.SREM(newkey, members)
  end
  if cursor == 0
    break
  end
end
```

排序集合：
```bash
# Rename the key
newkey = "gc:hashes:" + redis.INCR("gc:index")
redis.RENAME("my.zset.key", newkey)

# Delete members from the sorted set in batche of 100s
while redis.ZCARD(newkey) > 0
  redis.ZREMRANGEBYRANK(newkey, 0, 99)
end
```

Hash:
```bash
# Rename the key
newkey = "gc:hashes:" + redis.INCR( "gc:index" )
redis.RENAME("my.hash.key", newkey)

# Delete fields from the hash in batche of 100s
cursor = 0
loop
  cursor, hash_keys = redis.HSCAN(newkey, cursor, "COUNT", 100)
  if hash_keys count > 0
    redis.HDEL(newkey, hash_keys)
  end
  if cursor == 0
    break
  end
end
```

## 参考
http://shouce.jb51.net/redis-all-about/
