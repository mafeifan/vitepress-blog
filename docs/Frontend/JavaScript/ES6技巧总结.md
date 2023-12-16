####  展开运算符

合并功能

例1
```javascript
let state = { name: "jack" }
{...state, { name: "finley" }}
// 返回
{name: "finley"}
```
例2
```javascript
var arr1 = ['two', 'three'];
var arr2 = ['one', ...arr1, 'four', 'five'];
// 结果
["one", "two", "three", "four", "five"]
```

拷贝功能
```javascript
var arr = [1,2,3];
var arr2 = [...arr]; // 和arr.slice()差不多
arr2.push(4)
// arr2 此时变成 [1, 2, 3, 4]
// arr 不受影响

```
记住：数组中的对象依然是引用值，所以不是任何东西都“拷贝”过去了。

例3

```javascript
let ab = { ...a, ...b };
// 等同于
let ab = Object.assign({}, a, b);
// 实际上, 展开语法和 Object.assign() 行为一致, 执行的都是浅拷贝(只遍历一层)。 

{...{name: "finley"}, ...{name: "xx"}} 结果 {name: "xx"}
```

#### module 模块
用default导出的话，import时就不用大括号，因为default只有一个。

#### async 和 await

[async](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/async%E5%85%81%E8%AE%B8%E5%A3%B0%E6%98%8E%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0%E4%B8%BA%E4%B8%80%E4%B8%AA%E5%8C%85%E5%90%AB%E5%BC%82%E6%AD%A5%E6%93%8D%E4%BD%9C%E7%9A%84%E5%87%BD%E6%95%B0) 表示函数里有异步操作
[await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)  表示紧跟在后面的表达式需要等待结果。
async 函数返回一个 Promise 对象

例1
```
const demo = async function() {
     // await 后面接表达式
	await alert(1);
}
// async 函数返回一个 Promise 对象
demo().then(res => console.log(1))

```

#### 链判断运算符
在项目开发中，我们经常会遇到要取结构深层数据的情况，下面的一行代码就在所难免：
`const price = data.result.redPacket.price`

那么当某一个key不存在时，undefined.key就会报错，通常我们会优化成下面的样子：

`const price = (data && data.result && data.result.redPacket && data.result.redPacket.price)||'default'`

es6提供链判断运算符：

`const price = data?.result?.redPacket?.price||'default'`

这样即使某一个key不存在，也不会报错，只会返回undefined。

相关语法：

```javascript
a?.b // 等同于 a == null ? undefined : a.b
a?.[x] // 等同于 a == null ? undefined : a[x]
a?.b() // 等同于 a == null ? undefined : a.b()
a?.() // 等同于 a == null ? undefined : a()
```



## 参考

https://jelly.jd.com/article/604f04069c61f9014c21ad81
