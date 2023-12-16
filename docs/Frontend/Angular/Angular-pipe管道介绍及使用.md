Angular 中的管道其实就是angularjs或vue中的过滤器，用来转换数据然后显示给用户。
本质上就是一个纯函数。

要创建一个管道，必须实现 [PipeTransform 接口](https://angular.cn/api/core/PipeTransform)。这个接口非常简单，只需要实现`transform`方法即可。
使用管道的几个注意事项：
1. 管道可以链式使用，还可以传参
`{{date | date: 'fullDate' | uppercase}}`
2. 管道分两种 纯(pure)管道与非纯(impure)管道
默认是pure的。
Angular 只有在它检测到输入值发生了纯变更时才会执行纯管道。 纯变更是指对原始类型值(String、Number、Boolean、Symbol)的更改， 或者对对象引用(Date、Array、Function、Object)的更改。
> 使用 impure 管道时候要小心，很可能触发非常频繁。
3. 也是出于性能的考虑。Angular并没有提供 angularjs 自带的 Filter 和 OrderBy 过滤器，Angular官方推荐把过滤和排序放到组件中实现，比如对外提供`filteredHeroes` 或 `sortedHeroes` 属性

Angular提供了json和async管道，我们来分析下源码
## 源码解析
##### json管道
/node_modules/@angular/common/esm5/src/pipes/json_pipe.js
非常简单，就一行话。
`JsonPipe.prototype.transform = function (value) { return JSON.stringify(value, null, 2); };`

##### async管道
这个是Angular特有的管道，可以多使用
其实会处理两种对象类型，Observable或Promise，简单说如果是Observable会执行subscription方法，如果是Promise会调用then方法。如果是Observable当组件销毁时执行unsubscribe方法取消订阅。
node_modules/@angular/common/esm5/src/pipes/async_pipe.js:11

### 参考
https://segmentfault.com/a/1190000008759314


