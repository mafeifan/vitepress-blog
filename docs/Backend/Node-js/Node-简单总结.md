* Node 单线程，远离多线程死锁，状态同步等问题。

* 利用异步io，让单线程远离阻塞，以更好的充分利用cpu。需要强调，这里得单线程仅仅是JS执行在单线程罢了。在node中，无论是*nix还是Windows平台，内部完成io任务的另有线程池。

* Node的循环机制，启动时又一个死循环，每执行一次循环体称为Tick。每次循环处理事件。如果事件存在回调则处理回调。接着处理下一个事件。

* 在Node中，事件来源有网络请求，文件io等。

事件循环时典型的生产者/消费者模型，异步io，网络请求是生产者，源源不断等为node提供不同的事件，这次事件被传递导对应的观察者那里，事件循环则从观察者那里取出事件并处理

* Node8起新增了 util.promisify() 方法，可以快捷的把原来的异步回调方法改成返回 Promise 实例。

举例1

```
const util = require('util');
const fs = require('fs');
const readFileAsync = util.promisify(fs.readFile);
fileResult = await readFileAsync(sourcePathFile);
```

举例2

```
/**
* 执行 shell 返回 Promise
*/
async function execShell(scriptPath) {
  const execFile = require('util').promisify(require('child_process').execFile);
  return await execFile('sh', [scriptPath]);
}
```



###

* module.exports 与 exports 的区别
先看下面的例子
```
**test.js**

var a = {name: 1}; 
var b = a;

console.log(a); 
console.log(b);

b.name = 2; 
console.log(a); 
console.log(b);

var b = {name: 3}; 
console.log(a); 
console.log(b);

运行 test.js 结果为：

{ name: 1 } 
{ name: 1 } 
{ name: 2 } 
{ name: 2 } 
{ name: 2 } 
{ name: 3 }

```
解释：a 是一个对象，b 是对 a 的引用，即 a 和 b 指向同一块内存，所以前两个输出一样。当对 b 作修改时，即 a 和 b 指向同一块内存地址的内容发生了改变，所以 a 也会体现出来，所以第三四个输出一样。当 b 被覆盖时，b 指向了一块新的内存，a 还是指向原来的内存，所以最后两个输出不一样。

同理 exports 是 module.exports 的引用。
当 module.exports 属性被一个新的对象完全替代时，也会重新赋值 exports
如果你觉得用不好可以只使用module.exports


### Event Loop
event loop是一个执行模型，在不同的地方有不同的实现。浏览器和NodeJS基于不同的技术实现了各自的 Event Loop。
可以简单理解为不断执行的死循环
浏览器的Event Loop是在 [html5](https://www.w3.org/TR/html5/webappapis.html#event-loops) 的规范中明确定义。
NodeJS的Event Loop是基于libuv实现的。可以参考 Node 的[官方文档](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)以及 libuv 的[官方文档](http://docs.libuv.org/en/v1.x/design.html)。
libuv已经对Event Loop做出了实现，而HTML5规范中只是定义了浏览器中Event Loop的模型，具体的实现留给了浏览器厂商。


### Events
Events 是 Node.js 中一个非常重要的 core 模块, 在 node 中有许多重要的 core API 都是依赖其建立的. 比如 Stream 是基于 Events 实现的, 而 fs, net, http 等模块都依赖 Stream, 所以 Events 模块的重要性可见一斑。

通过继承 EventEmitter 来使得一个类具有 node 提供的基本的 event 方法, 这样的对象可以称作 emitter，而触发(emit)事件的 cb 则称作 listener。与前端 DOM 树上的事件并不相同, emitter 的触发不存在冒泡, 逐层捕获等事件行为, 也没有处理事件传递的方法。

Node.js 中 Eventemitter 的 emit 是同步的。

例1：

```
const EventEmitter = require('events');
let emitter = new EventEmitter();

emitter.on('myEvent', () => {
  console.log('1');
});
emitter.on('myEvent', () => {
  console.log('2');
});
emitter.emit('myEvent');
```
执行结果是 1， 2

例2：
会发生死循环
```
const EventEmitter = require('events');
let emitter = new EventEmitter();

emitter.on('myEvent', () => {
  console.log('hi');
  emitter.emit('myEvent');
});

// 只出现一次
console.log("1")

emitter.emit('myEvent');

// 永远不会发生
console.log("down")
```
例3
在使用node的mongoose模块中，项目中有如下代码：
如何实现的呢？
```
const mongoose = require('mongoose');
// MongoDB connect
function mongoDBConnect() {
  mongoose.connect(`${config.mongo.url}${config.mongo.database}`);
  return mongoose.connection;
}

mongoDBConnect()
  .on('error', console.error.bind(console, 'connection error:'))
  .on('disconnected', () => console.log('mongodb disconnected'))
  .once('open', () => console.log('mongodb connection successful'));
```

翻了 [源码](https://github.com/Automattic/mongoose/blob/master/lib/connection.js)
最关键的一行是让Connection继承自EventEmitter。
`Connection.prototype.__proto__ = EventEmitter.prototype;`
```
const EventEmitter = require('events').EventEmitter;

// connectionState start
const STATES = Object.create(null);

const disconnected = 'disconnected';
const connected = 'connected';
const connecting = 'connecting';

STATES[0] = disconnected;
STATES[1] = connected;
STATES[2] = connecting;

STATES[disconnected] = 0;
STATES[connected] = 1;
STATES[connecting] = 2;
// connectionState end


function Connection() {
	this.states = STATES;
	this._readyState = STATES.disconnected;
}

// 这行非常关键，继承 EventEmitter
Connection.prototype.__proto__ = EventEmitter.prototype;

Object.defineProperty(Connection.prototype, 'readyState', {
  get: function() {
    return this._readyState;
  },
  set: function(val) {
    if (!(val in STATES)) {
      throw new Error('Invalid connection state: ' + val);
    }

    if (this._readyState !== val) {
      this._readyState = val;

      this.emit(STATES[val]);
    }
  }
});

Connection.prototype.onOpen = function() {
  this.readyState = STATES.connected;
  this.emit('open');
};

let conn = new Connection();

conn.on('connected', () => {
	console.log("1");
});

conn.on('open', () => {
	console.log("open!!");
});


conn.readyState = 1

conn.readyState = 2

conn.onOpen();
```
### 面试相关
https://elemefe.github.io/node-interview/#/sections/zh-cn/
