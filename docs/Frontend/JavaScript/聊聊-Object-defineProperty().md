传统情况下，定义JS对象的方法有: 
```
let obj = {};
let obj = new Object; 
let obj = Object.create();
```
如果我们直接为对象添加一个属性，比如 obj.a = 10 我们说 a 是 `普通属性`，他的值既可以被改变，也可以被删除，还可以被for..in 或 Object,keys 枚举遍历。

如果需要精确的添加或修改对象的属性。就可以使用`Object.defineProperty()`。
Object.defineProperty(obj, prop, descriptor) 接收三个参数:

obj:  要在其上定义属性的对象。
prop:  要定义或修改的属性的名称。
descriptor: 将被定义或修改的属性描述符。

**默认情况下，使用 Object.defineProperty() 添加的属性值是不可修改的。**

descriptor  是重点，它是个对象，包含的键值比较多；
我们可以这样：
```
// 在对象中添加一个属性与数据描述符的示例
Object.defineProperty(obj, "a", {
  value : 20,  // 属性 a 的初始化值是37
  writable : true,  // 可修改值内容
  enumerable : true, // 可枚举，默认 false
  configurable : true // 可删除，默认 false
});
```
这种效果和 obj.a = 20 一样
还可以这么写
```
var bValue;
Object.defineProperty(obj, "a", {
  get : function(){
    return bValue;
  },
  set : function(newValue){
    bValue = newValue;
  },
  writable : true,  // 可修改值内容
  enumerable : true, // 可枚举，默认 false
  configurable : true // 可删除，默认 false
});
o.a = 20;
```
set，get 叫做`存取描述符`，这时不能出现 value 或 write 键，因为会冲突.

### Writable 属性
默认 false
如下：
```
let obj = new Object;
obj.a = 10;
obj.a = 20;
console.log(obj.a) // 20

Object.defineProperty(obj, 'b', {}) // 属性 b 默认值为 'undefined'
obj.b = 20
console.log(obj.b) // 依然是 undefined，而且不会报错
```

### Enumerable 属性
默认 false
> enumerable定义了对象的属性是否可以在 for...in 循环和 Object.keys() 中被枚举。
```
var o = {};
Object.defineProperty(o, "a", { value : 1, enumerable:true });
Object.defineProperty(o, "b", { value : 2, enumerable:false });
Object.defineProperty(o, "c", { value : 3 }); // enumerable defaults to false
o.d = 4; // 如果使用直接赋值的方式创建对象的属性，则这个属性的enumerable为true

for (var i in o) {    
  console.log(i);  
}
// 打印 'a' 和 'd' (in undefined order)

Object.keys(o); // ["a", "d"]

o.propertyIsEnumerable('a'); // true
o.propertyIsEnumerable('b'); // false
o.propertyIsEnumerable('c'); // false
```
### Configurable  属性

> configurable特性表示对象的属性是否可以被删除，以及除value和writable特性外的其他特性是否可以被修改。

```
var o = {};
Object.defineProperty(o, "a", { get : function(){return 1;}, 
                                configurable : false } );

// throws a TypeError
Object.defineProperty(o, "a", {configurable : true}); 
// throws a TypeError
Object.defineProperty(o, "a", {enumerable : true}); 
// throws a TypeError (set was undefined previously) 
Object.defineProperty(o, "a", {set : function(){}}); 
// throws a TypeError (even though the new get does exactly the same thing) 
Object.defineProperty(o, "a", {get : function(){return 1;}});
// throws a TypeError
Object.defineProperty(o, "a", {value : 12});

console.log(o.a); // logs 1
delete o.a; // Nothing happens
console.log(o.a); // logs 1
```
