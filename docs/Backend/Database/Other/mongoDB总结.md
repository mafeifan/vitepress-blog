版本3.6.x
## 配置
1. windows建议安装service方式，省的每次通过命令行启动server端。
2. 对比mysql
大部分人都有mysql的使用经验，对比着学习也是种不错的方法。
具体区别见[官方文档](https://docs.mongodb.com/manual/reference/sql-comparison/) 非常详细。
1. 比如mongo里没有table和row的概念，而是对应的collection和document。
2. mongo非常灵活，当执行插入语句，如果collection不存在会自动创建，
如 `db.people.insertOne( { user_id: "bcd001", age: 45, status: "A" } )`
不存在会自动创建名为people的collection。

## 导入导出
1. 导出有 mongoexport和mongodump工具。
mongodump和mongodrestore对应
mongoexport和mongoimport对应
mongoexport 必须指定collection，但是可以导出来json或csv格式可读性好，使用 mongodump 可直接将整个库都导出来。
先 `.\mongoexport.exe --help`
* 假设要导出database是blog，collection是post。
`.\mongoexport.exe -d blog -c post -o D:/post.json`
* 导出整个库`mongodump.exe --db riot`，每个collection对应一个bson和metadata.json格式文件

## 角色 权限
1. 角色控制
为某库添加可读可写的角色
```
use admin;
db.createUser(
   {
     user: "riot",
     pwd: "riot",
     roles: [ { role: "readWrite", db: "riot" } ]
   }
)
```
2. 查看某角色的权限信息
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4a3121c1bda44842.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
https://docs.mongodb.com/manual/reference/command/usersInfo/#examples
3. 检查某用户是否可以登录某数据库 ，先use进该库，然后 `db.auth('user', 'pass')`
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-c9b9d9fc394cba39.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 工具
客户端工具我就推荐一个 Studio 3T
理由：
1. 比官方自带的强大很多，有点类似 Navicat，导入导出，复制表，用户分配权限什么的都带
2. 非商业用途免费使用

