1. 默认text类型没有开启正排索引，也就没有聚合功能

若想实现聚合查询，需要把fielddata改为true, 但是text会被分词，最好还是使用keyword。

```json
{
  "properties": {
    "tags": {
      "type": "text",
      "fielddata": true
    }
  }
}
```

2. fielddata是基于内存的正排索引（快但耗资源），doc_values是基于磁盘的

3. 基于聚合结果的聚合
```json
{
  "size": 0,
  "aggs": {
    "<agg_name1>": {
      "<agg_type>": {
        "field": "<field_name1>"
      },
      "aggs": {
        "<agg_name2>": {
          "<agg_type>": {
            "field": "<field_name2>"
          }
        }
      }
    }
  }
}
```

4. 基于查询结果的聚合

```json
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        {
          "match_all": {}
        },
        {
          "range": {
            "metadata.ts": {
              "format": "strict_date_optional_time",
              "gte": "2022-07-08T00:32:25.354Z",
              "lte": "2022-07-10T02:32:25.354Z"
            }
          }
        }
      ],
      "must": [],
      "must_not": [],
      "should": []
    }
  },
  "aggs": {
    "<agg_name1>": {
      "<agg_type>": {
        "field": "<field_name1>",
        "order": {
          "_count": "desc"
        }
      },
      "aggs": {
        "<agg_name2>": {
          "<agg_type>": {
            "field": "<field_name2>",
            "order": {
              "_key": "desc"
            }
          }
        }
      }
    }
  }
}
```

举例：

```json
{
  "size": 0,
  "query": {
    "range": {
      "metadata.ts": {
        "format": "strict_date_optional_time",
        "gte": "2022-07-08T00:32:25.354Z",
        "lte": "2022-07-10T02:32:25.354Z"
      }
    }
  },
  "aggs": {
    "tags_bucket": {
      "terms": {
        "field": "tags.keyword"
      }
    }
  }
}
```


5. 基于聚合结果的过滤查询

对聚合的结果没有影响对，过滤的是hits中的原数据

```json
{
  "aggs": {
    "tags_bucket": {
      "terms": {
        "field": "tags.keyword"
      }
    }
  },
  "post_filter": {
    "term": {
      "tags.keyword": "性价比"
    }
  }
}
```

6. 高级排序

按照计算后的结果排序

![](http://pek3b.qingstor.com/hexo-blog/20220710174715.png)

7. 为Index patterns起ID

Index patterns的ID用于visualize的引用，建议自己指定，系统自己指定的是一个uuid，建议自动指定，这样识别度比较高。
我的做法是和 alias 或 index 名字一致

![](http://pek3b.qingstor.com/hexo-blog/20220729090252.png)

8. 修改Index patterns的Time Field

查询所有index-pattern
```
GET /.kibana_1/_search
```

修改指定index-pattern的Time field，注意替换`_id`
```
POST /.kibana_1/_update/index-pattern:<_id>
{
  "doc": {
    "index-pattern": {
      "timeFieldName" : "timestamp"
    }
  }
}
```

9. 关于 alias 注意的问题

alias 是 index 的别名，比如当前有两个index, demo-2022-07 和 demo-2022-08

创建 alias，只包含指定条件的记录
```
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "demo-2022-*",
        "alias": "demo-fault",
        "filter": {
          "bool": {
            "should": [
              {
                "match": {
                  "faultType": "fault"
                }
              }
            ]
          }
        }
      }
    }
  ]
}
```

然后我们就可以根据 alias 进行查询
```
GET /demo-fault/_search
```

但是如果我们又创建了新的index，名称为demo-2022-09，demo-fault是感知不到的。
我们需要重新执行创建 alias 动作。

解决办法是使用 [index-template](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html)

在index-template中指定aliases，这样每当产生新的index，就会自动套用index-template

```
PUT /_template/demo_template
{
    "template" : "demo*",
    "aliases" : {
        "demo-fault": { }
    }
}
```   

