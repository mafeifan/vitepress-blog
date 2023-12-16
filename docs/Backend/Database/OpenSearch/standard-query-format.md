ES 或 opensearch 通用的查询格式

```json
{
  "query": {
    "bool": {
      "filter": [
        {
          "match_all": {}
        },
        {
          "match_phrase": 
          {
            "metadata.ss_address.keyword": "无锡凯旸置业有限公司, 214028, 无锡"
          }
        },
        {
          "exists": {
            "field": "metadata.ss_address.keyword"
          }
        },
        {
          "range": {
            "metadata.ts": {
              "format": "strict_date_optional_time",
              "gte": "2022-07-10T02:03:26.766Z",
              "lte": "2022-07-10T02:18:26.766Z"
            }
          }
        }
      ],
      "must": [],
      "must_not": [],
      "should": []
    }
  },
  "script_fields": {},
  "size": 50,
  "sort": [
    {
      "metadata.ts": {
        "order": "desc"
      }
    }
  ],
  "_source": {
    "excludes": []
  }
}
```
