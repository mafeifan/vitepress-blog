bind的受体是对象，返回的是个新的函数。
我们知道this总是指向调用他的对象。但是有时候我们希望‘固化’这个this。
也就是无论怎么调用这个返回的函数都有同样的this值。
这就是bind的作用。

### 语法
`fun.bind(thisArg[, arg1[, arg2[, ...]]])`

##### 参数
`thisArg`

当绑定函数被调用时，该参数会作为原函数运行时的 this 指向。当使用new操作符调用绑定函数时，该参数无效。
this将永久地被绑定到了bind的第一个参数，无论这个函数是如何被调用的。

`arg1, arg2, ...`

当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。

##### 返回值
返回由指定的this值和初始化参数改造的原函数拷贝

### 例1
```javascript
window.color = 'red';
var o = {color: 'blue'};

function sayColor(){
  alert(this.color);
}
var func = sayColor.bind(o);
// 输出 "blue", 因为传的是对象 o，this 始终指向 o
func();

var func2 = sayColor.bind(this);
// 输出 "red", 因为传的是this，在全局作用域中this代表 window。等于传的是 window。
func2();
```

### 例2
注意：bind只生效一次
```javascript
function f(){
  return this.a;
}

//this被固定到了传入的对象上
var g = f.bind({a:"azerty"});
console.log(g()); // azerty

var h = g.bind({a:'yoo'}); //bind只生效一次！
console.log(h()); // azerty

var o = {a:37, f:f, g:g, h:h};
console.log(o.f(), o.g(), o.h()); // 37, azerty, azerty
```

### 例3
```javascript
var myObj = {
    specialFunction: function () {
    },
    anotherSpecialFunction: function () {
    },
    getAsyncData: function (cb) {
        cb();
    },
    render: function () {
       // 注意这里，写成 this.specialFunction() 会报错
        var that = this;
        this.getAsyncData(function () {
            that.specialFunction();
            that.anotherSpecialFunction();
        });
    }
};

myObj.render();

// 使用 bind 优化
// 当myObj 调用，this就指向了myObj
render: function () {
    this.getAsyncData(function () {
        this.specialFunction();
        this.anotherSpecialFunction();
    }.bind(this));
}
```

### 例4
使用bind可少写匿名函数

```javascript
<button>Clict Me!</button>
<script>
var logger = {
  x: 0,
  updateCount: function(){
    this.x++;
    console.log(this.x);
  }
}


// document.querySelector('button').addEventListener('click', function(){
//   logger.updateCount();
// });
// 优化后
// 因为bind返回就是新的函数，不用再写匿名函数了。
document.querySelector('button').addEventListener('click', logger.updateCount.bind(logger))
```


### 参考
* https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
* https://www.smashingmagazine.com/2014/01/understanding-javascript-function-prototype-bind/#what-problem-are-we-actually-looking-to-solve
