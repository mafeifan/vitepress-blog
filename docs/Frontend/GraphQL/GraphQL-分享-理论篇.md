前阵子在公司内部分享了[GraphQL](https://github.com/mafeifan/learn-graphql)，今天抽空总结并补充一下：

目前项目开发比较流行的是前台后分离模式，后台提供接口，前台调用接口，接口书写遵循流行的RESTful API规范

* REST 由 Roy Thomas Fielding 在他2000年的博士论文中提出的。 
* REST，即 Representational State Transfer(表述性状态传递) 的缩写。 
* 如果一个架构符合 REST 原则, 就称它为 RESTful 架构

### RESTful API 特点
* 每一个 URI 代表一种资源； 
* 充分利用 HTTP 协议本身语义； 
* 客户端和服务器器之间，传递这种资源的某种表现层； 
* 客户端通过四个 HTTP 动词，对服务器器端资源进行操作，实现 " 表现层状态转化 " 。

### RESTful API 缺陷
* 一个接口仅操作单一资源 
* 各个资源是独立的，完成一个页面需要调用多个接口 
* 数据冗余，灵活性差 
* 需专门维护文档 (v1, v2)

有时候打开某个页面，我们需要调用多个接口。
有时候我们不需要的字段后台也给我们返回了，这是由后台控制的。

而GraphQL可以完美的解决上面的问题
### GraphQL是….
* Facebook 2012年开发，2015年开源 
* 应用层的API查询语言 
* 在服务端的运行数据查询语言的[规范](http://facebook.github.io/graphql/October2016/#sec-Language) (我建议你先抽半个小时浏览下心里有个大概)

### GraphQL的特点
* 强类型
* 单一入口
* 一个请求获取所有所需资源
* 内省系统

### 为什么叫GraphQL
图（Graph）是一种复杂的非线性结构，在图结构中，每个元素都可以有零个或多个前驱，也可以有零个或多个后继，也就是说，元素之间的关系是任意的。

### 使用GraphQL 注意的问题
* 性能问题 (请求少了，但查询多了)
* GraphQL 在前端如何与视图层、状态管理方案结合 
* 安全, Limit, timeout N+1 查询

### 关于从规范里提炼的
* GraphQL是一种数据描述语言，而非编程语言，因此GraphQL缺乏用于描述数学表达式的标点符号。
* 注释只能用 # ，可以使用末尾的逗号提高可读性。
* GraphQL的命名是大小写敏感的，也就是说name，Name，和NAME是不同的名字。
*  一个文档可以包含多个操作和片段的定义。一个查询文档只有包含操作时，服务器才能执行。
* 如果一个文档只有一个操作，那这个操作可以不带命名或者简写，省略掉query关键字和操作名。

下一篇 [实战](/Frontend/GraphQL/GraphQL-分享-实战篇.html)



参考：
http://graphql.org/graphql-js/
