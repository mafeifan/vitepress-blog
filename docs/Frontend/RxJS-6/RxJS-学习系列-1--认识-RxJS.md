## 存在的问题
在网页的世界存取任何资源都是非同步(Async)的，比如说我们希望拿到一个档案，要先发送一个请求，然后必须等到档案回来，再执行对这个档案的操作。这就是一个非同步的行为，而随著网页需求的复杂化，我们所写的 JavaScript 就有各种针对非同步行为的写法，例如使用 callback 或是 Promise 对象甚至是新的语法糖 async/await —— 但随著应用需求越来越复杂，编写非同步的代码仍然非常困难。

### 非同步常见的问题

*   竞态条件 (Race Condition)
*   内存泄漏 (Memory Leak)
*   复杂的状态 (Complex State)
*   异常处理 (Exception Handling)

### [竞争条件 Race Condition](https://link.jianshu.com?t=https%3A%2F%2Fgoo.gl%2FGlNLYl)

每当我们对同一个资源同时做多次的非同步存取时，就可能发生 Race Condition 的问题。比如说我们发了一个 Request 更新使用者资料，然后我们又立即发送另一个 Request 取得使用者资料，这时第一个 Request 和第二个 Request 先后顺序就会影响到最终接收到的结果不同，这就是 Race Condition。

### [内存泄漏 Memory Leak](https://link.jianshu.com?t=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMemory_leak)

Memory Leak 是最常被大家忽略的一点。原因是在传统网站的行为，我们每次换页都是整页重刷，并重新执行 JavaScript，所以不太需要理会内存的问题！但是当我们希望将网站做得像应用时，这件事就变得很重要。例如做 [SPA](https://link.jianshu.com?t=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FSingle-page_application) (单页应用) 网站时，我们是透过 JavaScript 来达到切换页面的内容，这时如果有对 DOM 注册监听事件，而没有在适当的时机点把监听的事件移除，就有可能造成 Memory Leak 内存泄漏。比如说在 A 页面监听 body 的 scroll 事件，但页面切换时，没有把 scroll 的监听事件移除。

### Complex State

当有非同步行为时，应用程式的状态就会变得非常复杂！比如说我们有一支付费用户才能播放的影片，首先可能要先抓取这部影片的资讯，接著我们要在播放时去验证使用者是否有权限播放，而使用者也有可能再按下播放后又立即按了取消，而这些都是非同步执行，这时就会各种复杂的状态需要处理。

### Exception Handling

JavaScript 的 try/catch 可以捕捉同步的例外，但非同步的程式就没这么容易，尤其当我们的非同步行为很复杂时，这个问题就愈加明显。

## 各种不同的 API

我们除了要面对非同步会遇到的各种问题外，还需要烦恼很多不同的 API

*   DOM Events
*   XMLHttpRequest
*   fetch
*   WebSockets
*   Server Send Events
*   Service Worker
*   Node Stream
*   Timer

上面列的 API 都是非同步的，但他们都有各自的 API 及写法！如果我们使用 RxJS，上面所有的 API 都可以通过 RxJS 来处理，就能用同样的 API 操作 (RxJS 的 API)。

这里我们举一个例子，假如我们想要监听点击事件(click event)，但点击一次之后不再监听。

**原生 JavaScript**

var handler = (e) => {
    console.log(e);
    document.body.removeEventListener('click', handler); // 结束监听
}

// 注册监听
document.body.addEventListener('click', handler);

**使用 Rx 大概的样子**
```javascript
Rx.Observable
    .fromEvent(document.body, 'click') // 注册监听
    .take(1) // 只取一次
    .subscribe(console.log);
```
大致上能看得出来我们在使用 RxJS 后，不管是针对 DOM Event 还是上面列的各种 API 我们都可以通过 RxJS 的 API 来做操作，像是范例中用 take(n) 来设定只取一次，之后就释放内存。
## RxJS 基本介绍
RxJS 是一套藉由 Observable sequences 来组合非同步行为和事件基础程序的类库！
> 可以把 RxJS 想成处理 非同步行为 的 Lodash。

> Rx 最早是由微软开发的 LinQ 扩展出来的开源程序，之后主要由社群的工程师贡献，有多种语言支援，也被许多科技公司所採用，如 Netflix, Trello, Github, Airbnb...等。

> ReactiveX.io (官网)给的定义是，Rx 是一个使用可观察数据流进行异步编程的编程接口，ReactiveX 结合了观察者模式、迭代器模式和函数式编程的精华！

## RxJS 使用场景及注意事项
RxJS 提供大量的操作符，用于处理不同的业务需求。对于同一个场景来说，可能实现方式会有很多种，需要在写代码之前仔细斟酌。由于 RxJS 的抽象程度很高，所以，可以用很简短代码表达很复杂的含义，这对开发人员的要求也会比较高，需要有比较强的归纳能力。
