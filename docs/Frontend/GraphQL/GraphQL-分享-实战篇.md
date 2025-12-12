三种基本操作 Query(a read‐only fetch), Mutation(a write followed by a fetch), Subscription(订阅，不常用，适合长连接业务)

## 1. 起步，用express实现最简单的例子
运行一个GraphQL API Server

 GraphiQL is a great tool for debugging and inspecting a server, so we recommend running it whenever your application is in development mode.
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ae8bf77deba55f92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

index.js
```javascript
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');
const app = express();
// 具体选项含义见文档
// https://github.com/graphql/express-graphql
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.listen(12580);
console.log("please open http://localhost:12580/graphql")
```

schema.js

```javascript
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('graphql');

const Query = new GraphQLObjectType({
  name: 'BlogSchema',
  description: 'Root of the Blog Schema',
  fields: () => ({
    echo: {
      type: GraphQLString,
      description: '回应你输入的内容',
      args: {
        message: {type: GraphQLString}
      },
      resolve: function(source, {message}) {
        return `hello: ${message}`;
      }
    },
  })
});


const Schema = new GraphQLSchema({
  query: Query,
});

module.exports = Schema;
```
注意点:
* 上篇讲过GraphQL只是一套规范，目前官方只提供了[JS版本](https://github.com/graphql/graphql-js/)，其他PHP，Go等其他语言都是社区实现的。
* 当只有一种操作，并且是query，可以省去query操作名关键字
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-2928b5b3ced22f6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 可以看到字段和字段参数要指定类型，因为GraphQL是强类型的。
* 因为指定了参数类型是string，输入时必须要用双引号
* 注意看调试面板的请求

GraphQL API server运行时，只要构造http请求就可以，传入不同的query参数，也能得到和在GraphiQL同样的结果
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f76b1204746cf6c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 2. 查询
#### 2.1 变量
所有声明的变量都必须是标量、枚举型或者输入对象类型。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-6d937f374056b15b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 默认变量
使用默认值
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-55957feac27c24e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-8e668183138b2727.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

覆盖默认值
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1b8eebdd9b7bfa3b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

类型后面带个感叹号表示参数必填
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1f3285a728d391fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 2.2 别名
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-39a33f88bdd5a0ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 2.3 片段
提取公众的部分
上面的查询，将共同的字段：id和name，提取成fragment
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a1a8b719b43f5dc5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 2.4 指令
GraphQL内置两个核心指令，`@skip` 和 `@include`
`@skip(if: Boolean)` 如果参数为 true，跳过此字段。
? 貌似参数必须要写默认值 ?
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-01a5121f75f1e147.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-76756467cbc651cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3. 修改 Mutation
[详见](https://github.com/mafeifan/learn-graphql/blob/master/src/5.mutation.js)

## 4. 分页
分页的原理：定义一个Edges类型，包含node和cursor字段，Node保存查询列表内容，Cursor记录分页。以下面的Github例子

## 5. GitHub GraphQL API

打开 https://developer.github.com/v4/explorer/
先打开右侧的Docs浏览所有Query，发现有个名为search的query
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-cb2163116690fab1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
他返回的是个 SearchResultItemConnection!类型，接着点进去

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-d86141339b1cfecc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

你会发现所有已Connection结尾的类型，其结果都包含pageInfo, edges, nodes

输入下面的内容，这个查询是返回包含"graphql"关键字的前三个仓库，并显示每个仓库的前3个issues的作者，头像信息。
```javascript 1.8
{
  search(first: 3, query: "graphql", type: REPOSITORY) {
    codeCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      
      node {
        
        ... on Repository {
          nameWithOwner
          issues(first: 3) {
            nodes {
              author {
                avatarUrl
                login
                resourcePath
                url
              }
              title
            }
          }
        }
      }
    }
  }
  rateLimit {
    cost
    limit
    nodeCount
    resetAt
    remaining
  }
}

```
返回的结果类似
```json
{
  "data": {
    "search": {
      "codeCount": 16287,
      "pageInfo": {
        "startCursor": "Y3Vyc29yOjE=",
        "endCursor": "Y3Vyc29yOjM=",
        "hasNextPage": true,
        "hasPreviousPage": false
      },
      "edges": [
        {
          "cursor": "Y3Vyc29yOjE=",
          "node": {
            "nameWithOwner": "facebook/graphql",
            "issues": {
              "nodes": [
                {
                  "author": {
                    "avatarUrl": "https://avatars0.githubusercontent.com/u/540892?v=4",
                    "login": "raymondfeng",
                    "resourcePath": "/raymondfeng",
                    "url": "https://github.com/raymondfeng"
                  },
                  "title": "Possibility of collaboration with LoopBack framework?"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars1.githubusercontent.com/u/825073?v=4",
                    "login": "luisobo",
                    "resourcePath": "/luisobo",
                    "url": "https://github.com/luisobo"
                  },
                  "title": "Pagination?"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars3.githubusercontent.com/u/71047?v=4",
                    "login": "KyleAMathews",
                    "resourcePath": "/KyleAMathews",
                    "url": "https://github.com/KyleAMathews"
                  },
                  "title": "Custom Sorting"
                }
              ]
            }
          }
        },
        {
          "cursor": "Y3Vyc29yOjI=",
          "node": {
            "nameWithOwner": "graphql-go/graphql",
            "issues": {
              "nodes": [
                {
                  "author": {
                    "avatarUrl": "https://avatars0.githubusercontent.com/u/78585?v=4",
                    "login": "sogko",
                    "resourcePath": "/sogko",
                    "url": "https://github.com/sogko"
                  },
                  "title": "Suggestion: Improve package discovery"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars2.githubusercontent.com/u/1064547?v=4",
                    "login": "ptomasroos",
                    "resourcePath": "/ptomasroos",
                    "url": "https://github.com/ptomasroos"
                  },
                  "title": "Why not wrap the C lib?"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars0.githubusercontent.com/u/1000404?v=4",
                    "login": "chris-ramon",
                    "resourcePath": "/chris-ramon",
                    "url": "https://github.com/chris-ramon"
                  },
                  "title": "Using graphql-go in other programs throws various errors."
                }
              ]
            }
          }
        },
        {
          "cursor": "Y3Vyc29yOjM=",
          "node": {
            "nameWithOwner": "Youshido/GraphQL",
            "issues": {
              "nodes": [
                {
                  "author": {
                    "avatarUrl": "https://avatars2.githubusercontent.com/u/2429244?v=4",
                    "login": "mrbarletta",
                    "resourcePath": "/mrbarletta",
                    "url": "https://github.com/mrbarletta"
                  },
                  "title": "How to manage a List of Posts"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars2.githubusercontent.com/u/2429244?v=4",
                    "login": "mrbarletta",
                    "resourcePath": "/mrbarletta",
                    "url": "https://github.com/mrbarletta"
                  },
                  "title": "No way to get requested fields of the object inside `resolve`"
                },
                {
                  "author": {
                    "avatarUrl": "https://avatars0.githubusercontent.com/u/971254?v=4",
                    "login": "larswolff",
                    "resourcePath": "/larswolff",
                    "url": "https://github.com/larswolff"
                  },
                  "title": "Minor documentation issue?"
                }
              ]
            }
          }
        }
      ]
    },
    "rateLimit": {
      "cost": 1,
      "limit": 5000,
      "nodeCount": 12,
      "resetAt": "2018-03-31T01:47:34Z",
      "remaining": 4995
    }
  }
}
```
* 每个node包含一个cursor游标，不是数字，是唯一字符串
* 如果想查下一页，直接修改query search，添加after参数。 `search(first: 3, after:"Y3Vyc29yOjM=", query: "graphql", type: REPOSITORY) {`
* 关于实现原理，[参考](https://github.com/NightCatSama/NightCat/blob/master/graphQL/pagination.js)

最后欢迎 clone 我的[仓库](https://github.com/mafeifan/learn-graphql/blob/master/src/5.mutation.js), 里面包含了所有例子。
