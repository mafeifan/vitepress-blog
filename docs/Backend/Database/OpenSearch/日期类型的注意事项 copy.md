## 关于日期格式

#### ISO-8601标准格式

其中一种常见的格式形如：

* 2018-04-08T11:38:39+08:00  // 日期用'-'相隔，与时间用'T'连接
* 2018-04-08T11:38:39Z       // Z代表UTC时间，Z也可写成+00:00
* 2022-07-21T00:00:00.000Z
* 2022-07-21T00:00:00.000+08:00

创建 index 并指定字段

```
PUT /demo
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "keyword"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}
```

插入测试数据
```
POST demo/_doc
{
  "title": "lucy",
  "timestamp" : "2022-08-01T10:55:22.043+08:00"
}

POST demo/_doc
{
  "title": "jack",
  "timestamp" : "2022-08-01T11:55:22.043+08:00"
}

POST demo/_doc
{
  "title": "james",
  "timestamp" : "2022-08-01T12:17:22.043Z"
}

POST demo/_doc
{
  "title": "finley",
  // 不指定时区就是+00:00，跟 2022-08-01T13:17:22.043Z 效果一致。
  "timestamp" : "2022-08-01T13:17:22.043"
}
```

查询
```
GET demo/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-10m",
        "lte": "now",
        "time_zone": "Asia/Shanghai"
      }
    }
  }
}
```


我们发现，即便不指定time_zone也是可以的，这应该是opensearch配置了时区是浏览器时区的原因。

![](https://pek3b.qingstor.com/hexo-blog/20220801211150.png)

## 参考

https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html
