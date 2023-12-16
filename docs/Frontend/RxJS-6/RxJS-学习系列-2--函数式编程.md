上篇说 ReactiveX.io (官网)给的定义是，Rx 是一个使用可观察数据流进行异步编程的编程接口，ReactiveX 结合了观察者模式、迭代器模式和函数式编程的精华！

## 什么是 函数式编程 Functional Programming
简单说 Functional Programming 核心思想就是做运算处理，并用 function 来思考问题，例如像以下的算数运算式：
例如像以下的算数运算式：
`(5 + 6) - 1 * 3`

我们可以写成
```
const add = (a, b) => a + b
const mul = (a, b) => a * b
const sub = (a, b) => a - b

sub(add(5, 6), mul(1, 3))
```

我们把每个运算包成一个个不同的 function，并用这些 function 组合出我们要的结果，这就是最简单的 Functional Programming。

函数式编程是一种编程范式，最主要的特征是，函数是第一等公民。
### 特点：
1. 函数可以被赋值给变量
`var hello = function() {}`
2. 函数能被当作参数传入
`fetch('www.google.com').then(function(response) {}) // 匿名 function 被传入 then()`
3. 函数能被当作返回值
```
var a = function(a) {
    return function(b) {
      return a + b;
    }; 
    // 可以回传一个 function
}
```
4. 函数式编程强调 function 要保持纯粹，只做运算并返回一个值，没有其他额外的行为。
**纯函数** (Pure function 是指 一个 function 给予相同的参数，永远会回传相同的返回值，并且没有任何显著的副作用(Side Effect))
```
var arr = [1, 2, 3, 4, 5];

arr.slice(0, 3); // [1, 2, 3]

arr.slice(0, 3); // [1, 2, 3]

arr.slice(0, 3); // [1, 2, 3]
```
这里可以看到 slice 不管执行几次，返回值都是相同的，并且除了返回一个值(value)之外并没有做任何事，所以 slice 就是一个 pure function。
```
var arr = [1, 2, 3, 4, 5];

arr.splice(0, 3); // [1, 2, 3]

arr.splice(0, 3); // [4, 5]

arr.slice(0, 3); // []
```
这里我们换成用 splice，因为 splice 每执行一次就会影响 arr 的值，导致每次结果都不同，这就很明显不是一个 pure function。

##  函数式编程好处
* 可读性高
```
[9, 4]
.concat([8, 7]) // 合并数组
.sort()  // 排序
.filter(x => x > 5) // 过滤出大于 5 的
```
* 可维护性高
因为纯函数等特性，执行结果不依赖外部状态，且不会对外部环境有任何操作
* 易于平行/并行处理
因为我们基本上只做运算不碰 I/O，再加上没有 Side Effect 的特性，所以较不用担心死锁等问题。
这节我们了解了函数式编程，下节讲下观察者模式
