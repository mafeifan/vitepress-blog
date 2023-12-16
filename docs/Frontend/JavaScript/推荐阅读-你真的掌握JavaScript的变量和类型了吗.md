原文链接：https://mp.weixin.qq.com/s/Z0jnNJlfOrXHdNDb8CM-ng
## 导读

变量和类型是学习`JavaScript`最先接触到的东西，但是往往看起来最简单的东西往往还隐藏着很多你不了解、或者容易犯错的知识，比如下面几个问题：

*   `JavaScript`中的变量在内存中的具体存储形式是什么？

*   `0.1+0.2`为什么不等于`0.3`?发生小数计算错误的具体原因是什么？

*   `Symbol`的特点，以及实际应用场景是什么？

*   `[] == ![]`、`[undefined] == false`为什么等于`true`?代码中何时会发生隐式类型转换？转换的规则是什么？

*   如何精确的判断变量的类型？

如果你还不能很好的解答上面的问题，那说明你还没有完全掌握这部分的知识，那么请好好阅读下面的文章吧。

本文从底层原理到实际应用详细介绍了`JavaScript`中的变量和类型相关知识。

## 一、JavaScript数据类型

ECMAScript标准规定了`7`种数据类型，其把这`7`种数据类型又分为两种：原始类型和对象类型。

**原始类型**

*   `Null`：只包含一个值：`null`

*   `Undefined`：只包含一个值：`undefined`

*   `Boolean`：包含两个值：`true`和`false`

*   `Number`：整数或浮点数，还有一些特殊值（`-Infinity`、`+Infinity`、`NaN`）

*   `String`：一串表示文本值的字符序列

*   `Symbol`：一种实例是唯一且不可改变的数据类型

(在`es10`中加入了第七种原始类型`BigInt`，现已被最新`Chrome`支持)

**对象类型**

*   `Object`：自己分一类丝毫不过分，除了常用的`Object`，`Array`、`Function`等都属于特殊的对象

## 二、为什么区分原始类型和对象类型

### 2.1 不可变性

上面所提到的原始类型，在`ECMAScript`标准中，它们被定义为`primitive values`，即原始值，代表值本身是不可被改变的。

以字符串为例，我们在调用操作字符串的方法时，没有任何方法是可以直接改变字符串的：

```
var str = 'ConardLi';
str.slice(1);str.substr(1);
str.trim(1);
str.toLowerCase(1);
str[0] = 1;
console.log(str);  
// ConardLi
```

在上面的代码中我们对`str`调用了几个方法，无一例外，这些方法都在原字符串的基础上产生了一个新字符串，而非直接去改变`str`，这就印证了字符串的不可变性。

那么，当我们继续调用下面的代码：

```
str += '6';
console.log(str);  
// ConardLi6
```

你会发现，`str`的值被改变了，这不就打脸了字符串的不可变性么？其实不然，我们从内存上来理解：

在`JavaScript`中，每一个变量在内存中都需要一个空间来存储。

内存空间又被分为两种，栈内存与堆内存。

栈内存：

*   存储的值大小固定

*   空间较小

*   可以直接操作其保存的变量，运行效率高

*   由系统自动分配存储空间

`JavaScript`中的原始类型的值被直接存储在栈中，在变量定义时，栈就为其分配好了内存空间。

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-bc1320c29cae77f7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

由于栈中的内存空间的大小是固定的，那么注定了存储在栈中的变量就是不可变的。

在上面的代码中，我们执行了`str += '6'`的操作，实际上是在栈中又开辟了一块内存空间用于存储`'ConardLi6'`，然后将变量`str`指向这块空间，所以这并不违背`不可变性的`特点。

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-cabe683bdd16f68e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 2.2 引用类型

堆内存：

*   存储的值大小不定，可动态调整

*   空间较大，运行效率低

*   无法直接操作其内部存储，使用引用地址读取

*   通过代码进行分配空间

相对于上面具有不可变性的原始类型，我习惯把对象称为引用类型，引用类型的值实际存储在堆内存中，它在栈中只存储了一个固定长度的地址，这个地址指向堆内存中的值。

```
var obj1 = {name:"ConardLi"}
var obj2 = {age:18}
var obj3 = function(){...}
var obj4 = [1,2,3,4,5,6,7,8,9]
```

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-5aefda71ecd07b3e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 由于内存是有限的，这些变量不可能一直在内存中占用资源，这里推荐下这篇文章JavaScript中的垃圾回收和内存泄漏，这里告诉你`JavaScript`是如何进行垃圾回收以及可能会发生内存泄漏的一些场景。

当然，引用类型就不再具有`不可变性`了，我们可以轻易的改变它们：

```
obj1.name = "ConardLi6";obj2.age = 19;obj4.length = 0;console.log(obj1); //{name:"ConardLi6"}console.log(obj2); // {age:19}console.log(obj4); // []
```

以数组为例，它的很多方法都可以改变它自身。

*   `pop()` 删除数组最后一个元素，如果数组为空，则不改变数组，返回undefined，改变原数组，返回被删除的元素

*   `push()`向数组末尾添加一个或多个元素，改变原数组，返回新数组的长度

*   `shift()`把数组的第一个元素删除，若空数组，不进行任何操作，返回undefined,改变原数组，返回第一个元素的值

*   `unshift()`向数组的开头添加一个或多个元素，改变原数组，返回新数组的长度

*   `reverse()`颠倒数组中元素的顺序，改变原数组，返回该数组

*   `sort()`对数组元素进行排序，改变原数组，返回该数组

*   `splice()`从数组中添加/删除项目，改变原数组，返回被删除的元素

下面我们通过几个操作来对比一下原始类型和引用类型的区别：

### 2.3 复制

当我们把一个变量的值复制到另一个变量上时，原始类型和引用类型的表现是不一样的，先来看看原始类型：

```
var name = 'ConardLi';
var name2 = name;name2 = 'code秘密花园';
console.log(name); 
// ConardLi;
```

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-c994a015cd331cf7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

内存中有一个变量`name`，值为`ConardLi`。我们从变量`name`复制出一个变量`name2`，此时在内存中创建了一个块新的空间用于存储`ConardLi`，虽然两者值是相同的，但是两者指向的内存空间完全不同，这两个变量参与任何操作都互不影响。

复制一个引用类型：

```
var obj = {name:'ConardLi'};
var obj2 = obj;
obj2.name = 'code秘密花园';
console.log(obj.name); 
// code秘密花园
```

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-650b33f0096626d9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当我们复制引用类型的变量时，实际上复制的是栈中存储的地址，所以复制出来的`obj2`实际上和`obj`指向的堆中同一个对象。因此，我们改变其中任何一个变量的值，另一个变量都会受到影响，这就是为什么会有深拷贝和浅拷贝的原因。

### 2.4 比较

当我们在对两个变量进行比较时，不同类型的变量的表现是不同的：

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-aec290ffc09101b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
var name = 'ConardLi';
var name2 = 'ConardLi';
console.log(name === name2); 
// truevar obj = {name:'ConardLi'};
var obj2 = {name:'ConardLi'};
console.log(obj === obj2); // false
```

对于原始类型，比较时会直接比较它们的值，如果值相等，即返回`true`。

对于引用类型，比较时会比较它们的引用地址，虽然两个变量在堆中存储的对象具有的属性值都是相等的，但是它们被存储在了不同的存储空间，因此比较值为`false`。

### 2.5 值传递和引用传递

借助下面的例子，我们先来看一看什么是值传递，什么是引用传递：

```
let name = 'ConardLi';
function changeValue(name){  
   name = 'code秘密花园';
}
changeValue(name);
console.log(name);
```

执行上面的代码，如果最终打印出来的`name`是`'ConardLi'`，没有改变，说明函数参数传递的是变量的值，即值传递。如果最终打印的是`'code秘密花园'`，函数内部的操作可以改变传入的变量，那么说明函数参数传递的是引用，即引用传递。

很明显，上面的执行结果是`'ConardLi'`，即函数参数仅仅是被传入变量复制给了的一个局部变量，改变这个局部变量不会对外部变量产生影响。

```
let obj = { name:'ConardLi' };
function changeValue(obj){  
   obj.name = 'code秘密花园';
}
changeValue(obj);
console.log(obj.name); 
// code秘密花园
```

上面的代码可能让你产生疑惑，是不是参数是引用类型就是引用传递呢？

首先明确一点，`ECMAScript`中所有的函数的参数都是按值传递的。

同样的，当函数参数是引用类型时，我们同样将参数复制了一个副本到局部变量，只不过复制的这个副本是指向堆内存中的地址而已，我们在函数内部对对象的属性进行操作，实际上和外部变量指向堆内存中的值相同，但是这并不代表着引用传递，下面我们再按一个例子：

```
let obj = {};
function changeValue(obj){  
  obj.name = 'ConardLi';  
  obj = {
     name:'code秘密花园'
  };
}
changeValue(obj);
console.log(obj.name); // ConardLi
```

可见，函数参数传递的并不是变量的`引用`，而是变量拷贝的副本，当变量是原始类型时，这个副本就是值本身，当变量是引用类型时，这个副本是指向堆内存的地址。所以，再次记住：

> `ECMAScript`中所有的函数的参数都是按值传递的。

## 三、分不清的null和undefined

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-19f51a9f1707c589?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在原始类型中，有两个类型`Null`和`Undefined`，他们都有且仅有一个值，`null`和`undefined`，并且他们都代表无和空，我一般这样区分它们：

**null**

表示被赋值过的对象，刻意把一个对象赋值为`null`，故意表示其为空，不应有值。

所以对象的某个属性值为`null`是正常的，`null`转换为数值时值为`0`。

**undefined**

表示“缺少值”，即此处应有一个值，但还没有定义，

如果一个对象的某个属性值为`undefined`，这是不正常的，如`obj.name=undefined`，我们不应该这样写，应该直接`delete obj.name`。

`undefined`转为数值时为`NaN`(非数字值的特殊值)

`JavaScript`是一门动态类型语言，成员除了表示存在的空值外，还有可能根本就不存在（因为存不存在只在运行期才知道），这就是`undefined`的意义所在。对于`JAVA`这种强类型语言，如果有`"undefined"`这种情况，就会直接编译失败，所以在它不需要一个这样的类型。

## 四、不太熟的Symbol类型

`Symbol`类型是`ES6`中新加入的一种原始类型。

> 每个从Symbol()返回的symbol值都是唯一的。一个symbol值能作为对象属性的标识符；这是该数据类型仅有的目的。

下面来看看`Symbol`类型具有哪些特性。

### 4.1 Symbol的特性

**1.独一无二**

直接使用`Symbol()`创建新的`symbol`变量，可选用一个字符串用于描述。当参数为对象时，将调用对象的`toString()`方法。

```
var sym1 = Symbol();  
// Symbol() var sym2 = Symbol('ConardLi');  
// Symbol(ConardLi)var sym3 = Symbol('ConardLi');  
// Symbol(ConardLi)
var sym4 = Symbol({name:'ConardLi'}); 
// Symbol([object Object])console.log(sym2 === sym3);  // false
```

我们用两个相同的字符串创建两个`Symbol`变量，它们是不相等的，可见每个`Symbol`变量都是独一无二的。

如果我们想创造两个相等的`Symbol`变量，可以使用`Symbol.for(key)`。

> 使用给定的key搜索现有的symbol，如果找到则返回该symbol。否则将使用给定的key在全局symbol注册表中创建一个新的symbol。

```
var sym1 = Symbol.for('ConardLi');
var sym2 = Symbol.for('ConardLi');
console.log(sym1 === sym2); // true
```

**2.原始类型**

注意是使用`Symbol()`函数创建`symbol`变量，并非使用构造函数，使用`new`操作符会直接报错。

```
new Symbol(); // Uncaught TypeError: Symbol is not a constructor
```

我们可以使用`typeof`运算符判断一个`Symbol`类型：

```
typeof Symbol() === 'symbol'typeof Symbol('ConardLi') === 'symbol'
```

**3.不可枚举**

当使用`Symbol`作为对象属性时，可以保证对象不会出现重名属性，调用`for...in`不能将其枚举出来，另外调用`Object.getOwnPropertyNames、Object.keys()`也不能获取`Symbol`属性。

> 可以调用Object.getOwnPropertySymbols()用于专门获取Symbol属性。

```
var obj = {  
  name:'ConardLi',  
  [Symbol('name2')]:'code秘密花园'
}
Object.getOwnPropertyNames(obj); // ["name"]
Object.keys(obj); // ["name"]
for (var i in obj) {   
  console.log(i); // name
}
Object.getOwnPropertySymbols(obj)  // [Symbol(name)]
```

### 4.2 Symbol的应用场景

下面是几个`Symbol`在程序中的应用场景。

**应用一：防止XSS**

在`React`的`ReactElement`对象中，有一个`$$typeof`属性，它是一个`Symbol`类型的变量：

```
var REACT_ELEMENT_TYPE =  
(typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) 
||  0xeac7;
```

`ReactElement.isValidElement`函数用来判断一个React组件是否是有效的，下面是它的具体实现。

```
ReactElement.isValidElement = function (object) {  
  return typeof object === 'object' && object !== null 
&& object.$$typeof === REACT_ELEMENT_TYPE;
};
```

可见`React`渲染时会把没有`$$typeof`标识，以及规则校验不通过的组件过滤掉。

如果你的服务器有一个漏洞，允许用户存储任意`JSON`对象， 而客户端代码需要一个字符串，这可能会成为一个问题：

```
// JSON
let expectedTextButGotJSON = {  
  type: 'div',  
  props: {    
    dangerouslySetInnerHTML: {      
    __html: '/* put your exploit here */'    
  }, 
 },
};
let message = { text: expectedTextButGotJSON };
<p> {message.text}</p>
```

而`JSON`中不能存储`Symbol`类型的变量，这就是防止`XSS`的一种手段。

**应用二：私有属性**

借助`Symbol`类型的不可枚举，我们可以在类中模拟私有属性，控制变量读写：

```
const privateField = Symbol();
class myClass {  
constructor(){    
  this[privateField] = 'ConardLi';  
}  
getField(){    
    return this[privateField];  
}  
setField(val){    
  this[privateField] = val;  
  }
}
```

**应用三：防止属性污染**

在某些情况下，我们可能要为对象添加一个属性，此时就有可能造成属性覆盖，用`Symbol`作为对象属性可以保证永远不会出现同名属性。

例如下面的场景，我们模拟实现一个`call`方法：

```
Function.prototype.myCall  =  function  (context)  {      
  if  (typeof this  !==  'function')  {        
    return undefined;  // 用于防止 Function.prototype.myCall() 直接调用      
  }      
  context = context || window;      
  const fn = Symbol();      
  context[fn] = this;     
  const args = [...arguments].slice(1);      
  const result = context[fn](...args);      
  delete context[fn];     
  return result;    
}
		
```

我们需要在某个对象上临时调用一个方法，又不能造成属性污染，`Symbol`是一个很好的选择。

## 五、不老实的Number类型

为什么说`Number`类型不老实呢，相信大家都多多少少的在开发中遇到过小数计算不精确的问题，比如`0.1+0.2!==0.3`，下面我们来追本溯源，看看为什么会出现这种现象，以及该如何避免。

下面是我实现的一个简单的函数，用于判断两个小数进行加法运算是否精确：

```
    function judgeFloat(n, m) {
      const binaryN = n.toString(2);
      const binaryM = m.toString(2);
      console.log(`${n}的二进制是    ${binaryN}`);
      console.log(`${m}的二进制是    ${binaryM}`);
      const MN = m + n;
      const accuracyMN = (m * 100 + n * 100) / 100;
      const binaryMN = MN.toString(2);
      const accuracyBinaryMN = accuracyMN.toString(2);
      console.log(`${n}+${m}的二进制是${binaryMN}`);
      console.log(`${accuracyMN}的二进制是    ${accuracyBinaryMN}`);
      console.log(`${n}+${m}的二进制再转成十进制是${to10(binaryMN)}`);
      console.log(`${accuracyMN}的二进制是再转成十进制是${to10(accuracyBinaryMN)}`);
      console.log(`${n}+${m}在js中计算是${(to10(binaryMN) === to10(accuracyBinaryMN)) ? '' : '不'}准确的`);
    }
    function to10(n) {
      const pre = (n.split('.')[0] - 0).toString(2);
      const arr = n.split('.')[1].split('');
      let i = 0;
      let result = 0;
      while (i < arr.length) {
        result += arr[i] * Math.pow(2, -(i + 1));
        i++;
      }
      return result;
    }
    judgeFloat(0.1, 0.2);
    judgeFloat(0.6, 0.7);
```
![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4cacaaab9ea38a60?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 5.1 精度丢失

计算机中所有的数据都是以`二进制`存储的，所以在计算时计算机要把数据先转换成`二进制`进行计算，然后在把计算结果转换成`十进制`。

由上面的代码不难看出，在计算`0.1+0.2`时，`二进制`计算发生了精度丢失，导致再转换成`十进制`后和预计的结果不符。

### 5.2 对结果的分析—更多的问题

`0.1`和`0.2`的二进制都是以1100无限循环的小数，下面逐个来看JS帮我们计算所得的结果：

**0.1的二进制**：

```
0.0001100110011001100110011001100110011001100110011001101
```

**0.2的二进制**：

```
0.001100110011001100110011001100110011001100110011001101
```

**理论上讲，由上面的结果相加应该：**：

```
0.0100110011001100110011001100110011001100110011001100111
```

**实际JS计算得到的0.1+0.2的二进制**

```
0.0100110011001100110011001100110011001100110011001101
```

看到这里你可能会产生更多的问题：

> 为什么 js计算出的 0.1的二进制 是这么多位而不是更多位？？？
> 
> 为什么 js计算的（0.1+0.2）的二进制和我们自己计算的（0.1+0.2）的二进制结果不一样呢？？？
> 
> 为什么 0.1的二进制 + 0.2的二进制 != 0.3的二进制？？？

### 5.3 js对二进制小数的存储方式

小数的`二进制`大多数都是无限循环的，`JavaScript`是怎么来存储他们的呢？

在ECMAScript®语言规范中可以看到，`ECMAScript`中的`Number`类型遵循`IEEE 754`标准。使用64位固定长度来表示。

事实上有很多语言的数字类型都遵循这个标准，例如`JAVA`,所以很多语言同样有着上面同样的问题。

所以下次遇到这种问题不要上来就喷`JavaScript`…

有兴趣可以看看下这个网站http://0.30000000000000004.com/，是的，你没看错，就是http://0.30000000000000004.com/！！！

### 5.4 IEEE 754

`IEEE754`标准包含一组实数的二进制表示法。它有三部分组成：

*   符号位

*   指数位

*   尾数位

三种精度的浮点数各个部分位数如下：

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-c27871083c821744?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "image")

<figcaption style="margin: 10px 0px 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important; font-size: 0.7em; color: rgb(153, 153, 153); line-height: inherit; text-align: center;">image</figcaption>

`JavaScript`使用的是64位双精度浮点数编码，所以它的`符号位`占`1`位，指数位占`11`位，尾数位占`52`位。

下面我们在理解下什么是`符号位`、`指数位`、`尾数位`，以`0.1`为例：

它的二进制为：`0.0001100110011001100...`

为了节省存储空间，在计算机中它是以科学计数法表示的，也就是

`1.100110011001100...` X 2-4

如果这里不好理解可以想一下十进制的数：

`1100`的科学计数法为`11` X 102

所以：

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-97cb514efa3f24d5?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "image")

<figcaption style="margin: 10px 0px 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important; font-size: 0.7em; color: rgb(153, 153, 153); line-height: inherit; text-align: center;">image</figcaption>

`符号位`就是标识正负的，`1`表示`负`，`0`表示`正`；

`指数位`存储科学计数法的指数；

`尾数位`存储科学计数法后的有效数字；

所以我们通常看到的二进制，其实是计算机实际存储的尾数位。

### 5.5 js中的toString(2)

由于尾数位只能存储`52`个数字，这就能解释`toString(2)`的执行结果了：

如果计算机没有存储空间的限制，那么`0.1`的`二进制`应该是：

```
0.00011001100110011001100110011001100110011001100110011001...
```

科学计数法尾数位

```
1.1001100110011001100110011001100110011001100110011001...
```

但是由于限制，有效数字第`53`位及以后的数字是不能存储的，它遵循，如果是`1`就向前一位进`1`，如果是`0`就舍弃的原则。

0.1的二进制科学计数法第53位是1，所以就有了下面的结果：

```
0.0001100110011001100110011001100110011001100110011001101
```

`0.2`有着同样的问题，其实正是由于这样的存储，在这里有了精度丢失，导致了`0.1+0.2!=0.3`。

事实上有着同样精度问题的计算还有很多，我们无法把他们都记下来，所以当程序中有数字计算时，我们最好用工具库来帮助我们解决，下面是两个推荐使用的开源库：

*   number-precision

*   mathjs/

### 5.6 JavaScript能表示的最大数字

由与`IEEE 754`双精度64位规范的限制：

`指数位`能表示的最大数字：`1023`(十进制)

`尾数位`能表达的最大数字即尾数位都位`1`的情况

所以JavaScript能表示的最大数字即位

`1.111...`X 21023 这个结果转换成十进制是`1.7976931348623157e+308`,这个结果即为`Number.MAX_VALUE`。

### 5.7 最大安全数字

JavaScript中`Number.MAX_SAFE_INTEGER`表示最大安全数字,计算结果是`9007199254740991`，即在这个数范围内不会出现精度丢失（小数除外）,这个数实际上是`1.111...`X 252。

我们同样可以用一些开源库来处理大整数：

*   node-bignum

*   node-bigint

其实官方也考虑到了这个问题，`bigInt`类型在`es10`中被提出，现在`Chrome`中已经可以使用，使用`bigInt`可以操作超过最大安全数字的数字。

## 六、还有哪些引用类型

> 在`ECMAScript`中，引用类型是一种数据结构，用于将数据和功能组织在一起。

我们通常所说的对象，就是某个特定引用类型的实例。

在`ECMAScript`关于类型的定义中，只给出了`Object`类型，实际上，我们平时使用的很多引用类型的变量，并不是由`Object`构造的，但是它们原型链的终点都是`Object`，这些类型都属于引用类型。

*   `Array` 数组

*   `Date` 日期

*   `RegExp` 正则

*   `Function` 函数

### 6.1 包装类型

为了便于操作基本类型值，`ECMAScript`还提供了几个特殊的引用类型，他们是基本类型的包装类型：

*   `Boolean`

*   `Number`

*   `String`

注意包装类型和原始类型的区别：

```
true === new Boolean(true); // false
123 === new Number(123); // false
'ConardLi' === new String('ConardLi'); // false
console.log(typeof new String('ConardLi')); // object
console.log(typeof 'ConardLi'); // string
```

> 引用类型和包装类型的主要区别就是对象的生存期，使用new操作符创建的引用类型的实例，在执行流离开当前作用域之前都一直保存在内存中，而自基本类型则只存在于一行代码的执行瞬间，然后立即被销毁，这意味着我们不能在运行时为基本类型添加属性和方法。

```
var name = 'ConardLi'
name.color = 'red';
console.log(name.color); // undefined
```

### 6.2 装箱和拆箱

*   装箱转换：把基本类型转换为对应的包装类型

*   拆箱操作：把引用类型转换为基本类型

既然原始类型不能扩展属性和方法，那么我们是如何使用原始类型调用方法的呢？

每当我们操作一个基础类型时，后台就会自动创建一个包装类型的对象，从而让我们能够调用一些方法和属性，例如下面的代码：

```
var name = "ConardLi";
var name2 = name.substring(2);
```

实际上发生了以下几个过程：

*   创建一个`String`的包装类型实例

*   在实例上调用`substring`方法

*   销毁实例

也就是说，我们使用基本类型调用方法，就会自动进行装箱和拆箱操作，相同的，我们使用`Number`和`Boolean`类型时，也会发生这个过程。

从引用类型到基本类型的转换，也就是拆箱的过程中，会遵循`ECMAScript规范`规定的`toPrimitive`原则，一般会调用引用类型的`valueOf`和`toString`方法，你也可以直接重写`toPeimitive`方法。一般转换成不同类型的值遵循的原则不同，例如：

*   引用类型转换为`Number`类型，先调用`valueOf`，再调用`toString`

*   引用类型转换为`String`类型，先调用`toString`，再调用`valueOf`

若`valueOf`和`toString`都不存在，或者没有返回基本类型，则抛出`TypeError`异常。

```
const obj = {
  valueOf: () => { console.log('valueOf'); return 123; },
  toString: () => { console.log('toString'); return 'ConardLi'; },
};
console.log(obj - 1);   // valueOf   122
console.log(`${obj}ConardLi`); // toString  ConardLiConardLi

const obj2 = {
  [Symbol.toPrimitive]: () => { console.log('toPrimitive'); return 123; },
};
console.log(obj2 - 1);   // valueOf   122

const obj3 = {
  valueOf: () => { console.log('valueOf'); return {}; },
  toString: () => { console.log('toString'); return {}; },
};
console.log(obj3 - 1);  
// valueOf  
// toString
// TypeError
```

除了程序中的自动拆箱和自动装箱，我们还可以手动进行拆箱和装箱操作。我们可以直接调用包装类型的`valueOf`或`toString`，实现拆箱操作：

```
var num = new Number("123");  
console.log( typeof num.valueOf() ); //number
console.log( typeof num.toString() ); //string
```

## 七、类型转换

因为`JavaScript`是弱类型的语言，所以类型转换发生非常频繁，上面我们说的装箱和拆箱其实就是一种类型转换。

类型转换分为两种，隐式转换即程序自动进行的类型转换，强制转换即我们手动进行的类型转换。

强制转换这里就不再多提及了，下面我们来看看让人头疼的可能发生隐式类型转换的几个场景，以及如何转换：

### 7.1 类型转换规则

如果发生了隐式转换，那么各种类型互转符合下面的规则：

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9b777cfcd203dfe9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 7.2 if 语句和逻辑语句

在`if`语句和逻辑语句中，如果只有单个变量，会先将变量转换为`Boolean`值，只有下面几种情况会转换成`false`，其余被转换成`true`：

```
null
undefined
''
NaN
0
false
```

### 7.3 各种运数学算符

我们在对各种非`Number`类型运用数学运算符(`- * /`)时，会先将非`Number`类型转换为`Number`类型;

```
1 - true // 0
1 - null //  1
1 * undefined //  NaN
2 * ['5'] //  10
```

注意`+`是个例外，执行`+`操作符时：

*   1.当一侧为`String`类型，被识别为字符串拼接，并会优先将另一侧转换为字符串类型。

*   2.当一侧为`Number`类型，另一侧为原始类型，则将原始类型转换为`Number`类型。

*   3.当一侧为`Number`类型，另一侧为引用类型，将引用类型和`Number`类型转换成字符串后拼接。

```
123 + '123' // 123123   （规则1）
123 + null  // 123    （规则2）
123 + true // 124    （规则2）
123 + {}  // 123[object Object]    （规则3）
```

### 7.4 ==

使用`==`时，若两侧类型相同，则比较结果和`===`相同，否则会发生隐式转换，使用`==`时发生的转换可以分为几种不同的情况（只考虑两侧类型不同）：

*   **1.NaN**

`NaN`和其他任何类型比较永远返回`false`(包括和他自己)。

```
NaN == NaN // false
```

*   **2.Boolean**

`Boolean`和其他任何类型比较，`Boolean`首先被转换为`Number`类型。

```
true == 1  // true 
true == '2'  // false
true == ['1']  // true
true == ['2']  // false
```

> 这里注意一个可能会弄混的点：`undefined、null`和`Boolean`比较，虽然`undefined、null`和`false`都很容易被想象成假值，但是他们比较结果是`false`，原因是`false`首先被转换成`0`：

```
undefined == false // false
null == false // false
```

*   **3.String和Number**

`String`和`Number`比较，先将`String`转换为`Number`类型。

```
123 == '123' // true'' == 0 // true
```

*   **4.null和undefined**

`null == undefined`比较结果是`true`，除此之外，`null、undefined`和其他任何结果的比较值都为`false`。

```
null == undefined // true
null == '' // false
null == 0 // false
null == false // false
undefined == '' // false
undefined == 0 // false
undefined == false // false
```

*   **5.原始类型和引用类型**

当原始类型和引用类型做比较时，对象类型会依照`ToPrimitive`规则转换为原始类型:

```
  '[object Object]' == {} // true
  '1,2,3' == [1, 2, 3] // true
```

来看看下面这个比较：

```
[] == ![] // true
```

`!`的优先级高于`==`，`![]`首先会被转换为`false`，然后根据上面第三点，`false`转换成`Number`类型`0`，左侧`[]`转换为`0`，两侧比较相等。

```
[null] == false // true
[undefined] == false // true
```

根据数组的`ToPrimitive`规则，数组元素为`null`或`undefined`时，该元素被当做空字符串处理，所以`[null]、[undefined]`都会被转换为`0`。

所以，说了这么多，推荐使用`===`来判断两个值是否相等…

### 7.5 一道有意思的面试题

一道经典的面试题，如何让：`a == 1 && a == 2 && a == 3`。

根据上面的拆箱转换，以及`==`的隐式转换，我们可以轻松写出答案：

```
const a = {
   value:[3,2,1],
   valueOf: function () {return this.value.pop(); },
} 
```

## 八、判断JavaScript数据类型的方式

### 8.1 typeof

**适用场景**

`typeof`操作符可以准确判断一个变量是否为下面几个原始类型：

```
typeof 'ConardLi'  // string
typeof 123  // number
typeof true  // boolean
typeof Symbol()  // symbol
typeof undefined  // undefined
```

你还可以用它来判断函数类型：

```
typeof function(){}  // function
```

**不适用场景**

当你用`typeof`来判断引用类型时似乎显得有些乏力了：

```
typeof [] // object
typeof {} // object
typeof new Date() // object
typeof /^\d*$/; // object
```

除函数外所有的引用类型都会被判定为`object`。

另外`typeof null === 'object'`也会让人感到头痛，这是在`JavaScript`初版就流传下来的`bug`，后面由于修改会造成大量的兼容问题就一直没有被修复…

### 8.2 instanceof

`instanceof`操作符可以帮助我们判断引用类型具体是什么类型的对象：

```
[] instanceof Array // true
new Date() instanceof Date // true
new RegExp() instanceof RegExp // true
```

我们先来回顾下原型链的几条规则：

*   1.所有引用类型都具有对象特性，即可以自由扩展属性

*   2.所有引用类型都具有一个`**proto**`（隐式原型）属性，是一个普通对象

*   3.所有的函数都具有`prototype`（显式原型）属性，也是一个普通对象

*   4.所有引用类型`**proto**`值指向它构造函数的`prototype`

*   5.当试图得到一个对象的属性时，如果变量本身没有这个属性，则会去他的`**proto**`中去找

`[] instanceof Array`实际上是判断`Foo.prototype`是否在`[]`的原型链上。

所以，使用`instanceof`来检测数据类型，不会很准确，这不是它设计的初衷：

```
[] instanceof Object // truefunction(){}  instanceof Object // true
```

另外，使用`instanceof`也不能检测基本数据类型，所以`instanceof`并不是一个很好的选择。

### 8.3 toString

上面我们在拆箱操作中提到了`toString`函数，我们可以调用它实现从引用类型的转换。

> 每一个引用类型都有`toString`方法，默认情况下，`toString()`方法被每个`Object`对象继承。如果此方法在自定义对象中未被覆盖，`toString()` 返回 `"[object type]"`，其中`type`是对象的类型。

```
const obj = {};obj.toString() // [object Object]
```

注意，上面提到了`如果此方法在自定义对象中未被覆盖`，`toString`才会达到预想的效果，事实上，大部分引用类型比如`Array、Date、RegExp`等都重写了`toString`方法。

我们可以直接调用`Object`原型上未被覆盖的`toString()`方法，使用`call`来改变`this`指向来达到我们想要的效果。

![image](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d253867e43d6bf5b?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 8.4 jquery

我们来看看`jquery`源码中如何进行类型判断：

```
var class2type = {};
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

type: function( obj ) {
    if ( obj == null ) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[Object.prototype.toString.call(obj) ] || "object" :
        typeof obj;
}

isFunction: function( obj ) {
        return jQuery.type(obj) === "function";
}
```

原始类型直接使用`typeof`，引用类型使用`Object.prototype.toString.call`取得类型，借助一个`class2type`对象将字符串多余的代码过滤掉，例如`[object function]`将得到`array`，然后在后面的类型判断，如`isFunction`直接可以使用`jQuery.type(obj) === "function"`这样的判断。

## 参考

*   http://www.ecma-international.org/ecma-262/9.0/index.html

*   https://while.dev/articles/explaining-truthy-falsy-null-0-and-undefined-in-typescript/

*   https://github.com/mqyqingfeng/Blog/issues/28

*   https://juejin.im/post/5bc5c752f265da0a9a399a62

*   https://juejin.im/post/5bbda2b36fb9a05cfd27f55e

*   《JS高级程序设计》

## 小结

希望你阅读本篇文章后可以达到以下几点：

*   了解`JavaScript`中的变量在内存中的具体存储形式，可对应实际场景

*   搞懂小数计算不精确的底层原因

*   了解可能发生隐式类型转换的场景以及转换原则

*   掌握判断`JavaScript`数据类型的方式和底层原理
