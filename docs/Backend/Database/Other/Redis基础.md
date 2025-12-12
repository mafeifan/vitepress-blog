这篇 [文章](https://juejin.im/post/5b516dc75188251af363492d) 讲的不错，我把文章里的图抄过来了。
Redis的安装使用都非常容易，关键是设计及使用场景的运用。

## 导图
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e8db2989410fa02a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1a58be74bca8319d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-723872eb6588657c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5个类型

string(字符串)、list(链表)、set(集合)、zset(有序集合)和 hash(散列表)

## 命令

### 字符串

优点：二进制安全，意味着该类型可以接受任何格式的数据，如JPEG图像数据或Json对象描述信息等。
在Redis中字符串类型的Value最多可以容纳的数据长度是512M。

```bash
# 选择一个数据库
> select 2
OK
> keys *
(empty array)
> set name finley
OK
> keys *
1) "name"
> get name
"finley"
> exists name
(integer) 1
> strlen name
(integer) 9
> set name "finley"
OK
> strlen name
(integer) 6
> set age 18
OK
> incr age
(integer) 19
> get age
"19"
# 从当前数据库中随机选择的一个key
> randomkey
"age"
# 重命名一个key
> rename name name2
OK
> get name
(nul)
> get name2
"finley"
# 追加字符串, 返回新字符串值的长度。
> append name hello
(integer) 11
> get name
"finleyhello"
> getrange name 6 10
"hello"
> set json '{"name":"finley","age":18}'
OK
# 设置多个键值
> mset name finley age 18
OK
> mget name age
1) "finley"
2) "18"
# 设置指定Key的过期时间为10秒。
> setex mykey 10 "hello"
OK
# 通过ttl命令查看一下指定Key的剩余存活时间(秒数)，0表示已经过期，-1表示永不过期。
> ttl mykey 
(integer) 4
```

### 列表（List）
类似JS中的数组。
List类型是按照插入顺序排序的字符串链表.
如果我们是在链表的两头插入或删除元素，这将会是非常高效的操作.
如果元素插入或删除操作是作用于链表中间，那将会是非常低效的.

### 散列类型（Hash）

```bash
> hset car:2 color "白色" name "奥迪" price 90
(integer) 3
> hmget car:2 name price
1) "\xe5\xa5\xa5\xe8\xbf\xaa"
2) "90"
> hgetall car:2
1) "color"
2) "\xe7\x99\xbd\xe8\x89\xb2"
3) "name"
4) "\xe5\xa5\xa5\xe8\xbf\xaa"
5) "price"
6) "90"
```


### Sorted Set（有序集合）
```bash
> zadd myzset 79 Jack 56 Lucy 93 Finley
(integer) 3
# 0表示第一个成员，-1表示最后一个成员。
# WITHSCORES选项表示返回的结果中包含每个成员及其分数，否则只返回成员。
> zrange myzset 0 -1 WITHSCORES
1) "Lucy"
2) "56"
3) "Jack"
4) "79"
5) "Finley"
6) "93"
# 获取成员Finley在Sorted-Set中的位置索引值。0表示第一个位置。
> zrank myzset Finley
(integer) 2
# 获取成员Finley的分数。返回值是字符串形式。
> zscore myzset Finley
"93"
# 将成员Finley的分数增加2，并返回该成员更新后的分数。
> zincrby myzset 2 Finley
"95"
# 将成员Finley的分数增加-20，并返回该成员更新后的分数。
> zincrby myzset -20 Finley
"75"
# 查看在更新了成员的分数后是否正确。
> zrange myzset 0 -1 WITHSCORES
1) "Lucy"
2) "56"
3) "Finley"
4) "75"
5) "Jack"
6) "79"
# 以位置索引从高到低的方式获取并返回此区间内的成员。
> zrevrange myzset 0 -1 WITHSCORES
1) "Jack"
2) "79"
3) "Finley"
4) "75"
5) "Lucy"
6) "56"
# 删除分数满足表达式1 <= score <= 100的成员，并返回实际删除的数量
> zremrangebyscore myzset 1 100
(integer) 3
> del myzet
(empty array)
```
