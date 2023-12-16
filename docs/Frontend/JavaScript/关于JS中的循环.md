JS 中的循环有`for...in`， `for...of`和`forEach`


1. forEach遍历数组的时候是无法通过break或return false来中断。
```javascript
var arr = [3, 5, 7];

arr.forEach(value => {
  console.log(value);
  if (value == 5) {
    // 无效
    return false;
  }
});
// 结果是：
// 3
// 5
// 7
```

可以使用for...of
```javascript
var arr = [3, 5, 7];

for (let value of arr) {
  console.log(value);
  if (value === 5) {
    break;
  }
}
// 结果是：
// 3
// 5
```

for...of循环可以使用的范围包括数组、Set 和 Map 结构、某些类似数组的对象（比如arguments对象、DOM NodeList 对象）、后文的 Generator 对象，以及字符串。
```javascript
let str = 'boo';

for (let value of str) {
  console.log(value);
}
// 结果是：
// "b"
// "o"
// "o"
```
### 总结
1. 对于对象遍历，用for...in
2. 对于数组遍历，如果不需要知道索引，for..of迭代更合适，因为还可以中断；如果需要知道索引，则forEach()更合适；
3. 对于字符串，类数组，arguments对象、DOM NodeList 对象等只要部署了Symbol.iterator属性，用for...of循环遍历它的成员。

> iterator 就是迭代器或遍历器，任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。具体[参见](http://es6.ruanyifeng.com/#docs/iterator)

> 用 for...of 遍历对象需要配合 Object.keys / Object.values / Object.entries
```javascript
let obj = {name: 'xx', age: 18}
for(let [key, value] of Object.entries(obj)) {
   console.log(key, value);
}
```

### 参考

https://www.zhangxinxu.com/wordpress/2018/08/for-in-es6-for-of/

http://es6.ruanyifeng.com/#docs/iterator#for---of-%E5%BE%AA%E7%8E%AF
