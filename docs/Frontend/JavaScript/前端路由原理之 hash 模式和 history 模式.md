早期的路由都是后端实现的，直接根据 url 来 reload 页面，页面变得越来越复杂服务器端压力变大，
随着 ajax 的出现，页面实现非 reload 就能刷新数据，也给前端路由的出现奠定了基础。我们可以通过记录 url 来记录 ajax 的变化，从而实现前端路由。

本文主要讲两种主流方式实现前端路由。


## Hash 模式

浏览器提供了一些 api 可以让我们获取到URL中带“#”的标识。比如 URL.hash、location.hash。

如 网址 `https://www.vip.com/#drop-item-2` 
通过`location.hash`可以获取`#drop-item-2`

同时我们可以通过 hashchange 事件来监听hash值的改变，这样就能通过事件监听 url 中 hash 的改变从而改变特定页面元素的显示内容，从而实现前端路由。

简单实现代码如下：


```html
<body>
<div id="app">
  <a href="/home">home</a>
  <a href="/about">about</a>

  <div class="router-view"></div>
</div>
<script>
  // 1.获取路由显示元素
  const routerViewEl = document.querySelector('.router-view');

  // 2.监听 hashchange 事件
  window.addEventListener('hashchange', () => {
    // 3.判断 hash 的改变值，修改路由显示元素的 innerHTMl
    switch (location.hash) {
      case '#/home':
        routerViewEl.innerHTML = 'Home';
        break;
      case '#/about':
        routerViewEl.innerHTML = 'about';
        break;
      default:
        routerViewEl.innerHTML = 'default';
    }
  });
</script>
</body>
```

另外一个例子

切换hash，执行对应名称的方法，达到修改背景色的目的

<iframe height="300" style="width: 100%;" scrolling="no" title="front end router" src="https://codepen.io/mafeifan/embed/eYRWVXq?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/mafeifan/pen/eYRWVXq">
  front end router</a> by finley (<a href="https://codepen.io/mafeifan">@mafeifan</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## History API

[History 接口](https://developer.mozilla.org/zh-CN/docs/Web/API/History)是 HTML5 新增的, 它有六种模式改变 URL 而不刷新页面。

* pushState:使用新的路径；
* replaceState：替换原来的路径；
* popState：路径的回退；
* go：向前或向后改变路径；
* forward：向前改变路径；
* back：向后改变路径；

其中比较重要的两个 api 是 pushState 和 replaceState 是比较重要的，是实现 history 模式的重要 api。

这两个 API 都接收三个参数，分别是

* 状态对象（state object） — 一个JavaScript对象，与用pushState()方法创建的新历史记录条目关联。无论何时用户导航到新创建的状态，popstate事件都会被触发，并且事件对象的state属性都包含历史记录条目的状态对象的拷贝。
* 标题（title） — FireFox浏览器目前会忽略该参数，虽然以后可能会用上。考虑到未来可能会对该方法进行修改，传一个空字符串会比较安全。或者，你也可以传入一个简短的标题，标明将要进入的状态。
* 地址（URL） — 新的历史记录条目的地址。浏览器不会在调用pushState()方法后加载该地址，但之后，可能会试图加载，例如用户重启浏览器。新的URL不一定是绝对路径；如果是相对路径，它将以当前URL为基准；传入的URL与当前URL应该是同源的，否则，pushState()会抛出异常。该参数是可选的；不指定的话则为文档当前URL。

首先我们用 pushState 来简单实现下，代码如下：

```html
<body>
<div id="app">
  <a href="/home">home</a>
  <a href="/about">about</a>

  <div class="router-view"></div>
</div>
<script>
  // 1.获取路由显示元素
  const routerViewEl = document.querySelector('.router-view');

  // 2.获取所有路由跳转元素
  const aEls = document.getElementsByTagName('a');
  // 3.遍历所有 a 元素，注册事件监听点击
  for (let aEl of aEls) {
    aEl.addEventListener('click', (e) => {
      // 4.阻止默认跳转
      e.preventDefault();
      // 5.获取 href 属性
      const href = aEl.getAttribute('href');
      // 6.执行 history.pushState
      history.pushState({}, '', href);
      // 
      // history.replaceState({}, '', href);

      // 7.判断 pathname 路径的改变
      switch (location.pathname) {
        case '/home':
          routerViewEl.innerHTML = 'Home';
          break;
        case '/about':
          routerViewEl.innerHTML = 'about';
          break;
        default:
          routerViewEl.innerHTML = 'default';
      }
    });
  }
</script>
</body>
```


如果把代码改成 replaceState 实现。那么就不能操作浏览器上面的前进后退操作。


## 对比

hash 方案更常见些，也是前端框架，如Vue，Angular的默认路由模式，
hash模式的缺点就是路径比较丑，总是多了一个#！，优点是浏览器兼容性强

history模式是，URL就像一个正常的url，例如`http://yoursite.com/user/id`，更顺眼些。
缺点是需要后台配置支持，否则可能会出现404的情况

所以呢，使用history模式要在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。

具体[配置方法](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

## 参考

https://segmentfault.com/a/1190000007238999

https://www.cnblogs.com/cqkjxxxx/p/15253331.html

https://router.vuejs.org/zh/guide/essentials/history-mode.html
