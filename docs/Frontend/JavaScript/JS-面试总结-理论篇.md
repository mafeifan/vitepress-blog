### 防抖和节流
* debounce 防抖：类似游戏施法条，读条过程中再按技能，就会重新读条
* throttle 节流：一直按技能键，但是单位时间内只有一次生效

### JS为什么是单线程？
由于浏览器可以渲染DOM，JS也可以修改DOM结构，未避免冲突，JS执行的时候，浏览器DOM渲染会停止。
两段JS不能同时执行。
> 虽然 HTML5 中新引入的webworker支持多线程，但是不能访问DOM

### 浏览器允许的并发资源数限制，如何突破?
不同浏览器的并发请求数目限制不同
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-284ff99a9fc922bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

因为浏览器的并发请求数目限制是针对同一域名的。
* 所以可以多设置子个域名来突破限制，比如简书的图片子域名`upload-images.jianshu.io`，
* 把资源文件放到CDN上，如`https://cdn2.jianshu.io/assets/web-f5f4ced5c8b8a95fc8b4.js`

### 单线程的解决方案，异步
和PHP不一样，写的代码顺序和执行的顺序是不一致的，PHP是同步。
```javascript
console.log(100)
// 等其他JS代码执行完才开始执行
setTimeout(()=> {
 console.log(200)
}, 10000)

console.log(300)
```
类似的ajax也是
```javascript
console.log(100)
// 等其他JS代码执行完才开始执行
$.ajax({
   url: 'xxx',
   success: res => {
      console.log(res)
   }
})
console.log(300)
```
这样有个弊端，可读性差

### event loop 事件轮询
* 同步代码，直接执行
* 异步函数先放到异步队列中，待同步函数执行完毕，轮询执行异步队列的函数
* 触发异步函数有 setTimeout，setImmediate，setInterval


实例1
```
setTimeout(() => console.log(1), 100)
setTimeout(() => console.log(2))
console.log(3)
```
显示顺序是: 3 2 1
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-0450453b908032c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实例2
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-576eec8887000e66.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

显示顺序: d c a b 或 d c a b
这是由于ajax的success回调函数被放入异步队列的时间是不确定的，当然如果是本地测试，有可能的顺序是 d a...
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-3a0e9435dd388e77.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 关于$ajax的底层
jquery的 $ajax 实际上是对 [XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest) 对象的封装
```javascript
xmlhttp.open( "GET", "some/ur/1", true );
xmlhttp.onreadystatechange = function( data ) {
    if ( xmlhttp.readyState === 4 ) {
        console.log( data );
    }
};
xmlhttp.send( null );
```
底层的XmlHttpRequest对象发起请求，设置回调函数用来处理XHR的readystatechnage事件。
然后执行XHR的send方法。在XHR运行中，当其属性readyState改变时readystatechange事件就会被触发，
*只有在XHR从远端服务器接收响应结束时回调函数才会触发执行*。

### jQuery的$ajax的async 参数设置同步或异步的本质是？
关于[$ajax](https://api.jquery.com/jQuery.ajax/) 中的 async 参数
async默认的设置值为true，这种情况为异步方式，就是说当ajax发送请求后，在等待server端返回的这个过程中，前台会继续执行ajax块后面的脚本，直到server端返回正确的结果才会去执行success。
其本质是 [xhrReq.open(method, url, async)](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/open)

### JS 异常有做上报处理吗？是什么实现的
* 捕获异常的方法通过使用 try...catch
```javascript
try {
    var a = 1;
    var b = a + c;
} catch (e) {
    // 捕获处理
    console.log(e); // ReferenceError: c is not defined
}
```
缺点：增加代码量和维护性，不适用于整个项目的异常捕获。
* window.onerror
相比try catch来说window.onerror提供了全局监听异常的功能：
```javascript
window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
    console.log('errorMessage: ' + errorMessage); // 异常信息
    console.log('scriptURI: ' + scriptURI); // 异常文件路径
    console.log('lineNo: ' + lineNo); // 异常行号
    console.log('columnNo: ' + columnNo); // 异常列号
    console.log('error: ' + error); // 异常堆栈信息
};

console.log(a);
```
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e0916fe24ed7df34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

提交异常
```javascript
window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
    // 构建错误对象
    var errorObj = {
        errorMessage: errorMessage || null,
        scriptURI: scriptURI || null,
        lineNo: lineNo || null,
        columnNo: columnNo || null,
        stack: error && error.stack ? error.stack : null
    };

    if (XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/middleware/errorMsg', true); // 上报给node中间层处理
        xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
        xhr.send(JSON.stringify(errorObj)); // 发送参数
    }
}
```

* Vue 的捕获异常
在MVVM框架中如果你一如既往的想使用window.onerror来捕获异常，那么很可能会竹篮打水一场空，或许根本捕获不到，因为你的异常信息被框架自身的异常机制捕获了。使用Vue.config.errorHandler这样的Vue全局配置，可以在Vue指定组件的渲染和观察期间未捕获错误的处理函数。这个处理函数被调用时，可获取错误信息和Vue实例。
```javascript
Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  // 只在 2.2.0+ 可用
}
```
* React 的 异常处理 -- Error Boundary
同样的在react也提供了异常处理的方式，在 React 16.x 版本中引入了 Error Boundary
```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true });

        // 将异常信息上报给服务器
        logErrorToMyService(error, info); 
    }

    render() {
        if (this.state.hasError) {
            return '出错了';
        }

        return this.props.children;
    }
}
```
使用
```html
<ErrorBoundary>
    <MyWidget />
</ErrorBoundary>
```



## ES6部分


#### var 和 let的区别

let声明的变量只在它所在的代码块有效，不存在变量提升
let实际上为 JavaScript 新增了块级作用域

#### async, await
* async 返回一个`Promise`对象，可以用`then`方法添加回调函数
* 最好把`await`命令放到`try...catch`代码块中
* `await`命令只能放到`async`函数中

#### 箭头函数
函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。
箭头函数可以让this指向固定化，这种特性很有利于封装回调函数。

## 参考
https://www.cnblogs.com/luozhihao/p/8635507.html

https://es6.ruanyifeng.com/
