## 第一个示例
注册事件监听器的常规写法。
```javascript
var button = document.querySelector('button');
button.addEventListener('click', () => console.log('Clicked!'));
```
使用 RxJS 的话，创建一个 observable 来代替（基于最新的Rxjs6版本写法）
```html
<script src='https://cdn.bootcss.com/rxjs/6.5.1/rxjs.umd.js'></script>
<script>
const { fromEvent } = rxjs;

const button = document.querySelector('button');
fromEvent(button, 'click')
  .subscribe(() => console.log('Clicked!'));
</script>
```

上面例子中的`fromEvent`就是基于Event 建立 Observable，fromEvent 的第一个参数要传入 DOM 对象，第二个参数传入要监听的事件名。
创建 Observable 有很多操作符
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4d9152d109b45dc5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

使用`Create`操作符从头开始创建一个Observable， 这个接收一个回调函数，把observer作为参数

```javascript
  // Observer 是一个对象，这个对象具有三个方法，分别是 next, error, complete
  // 建立 Observable 最简单方法是用 create 方法
  // create 接收一个回调函数，把 observer 作为参数
  const observer = {
    next: value => {
      console.log(`observer:` + value)
    },
    error: error => {
      console.log('Error:', error);
    },
    complete: () => {
      console.log('complete');
    }
  }

  var observable = rxjs.Observable
    .create(observer => {
      observer.next('Jerry');
      observer.next('Anna');
      observer.complete();
      observer.next('not work');
    })

  // 建立观察者来订阅 observable
  // 订阅一个 Observable 就像是执行一个 function
  observable.subscribe(
    observer
  )
```

`from`操作符：将对象、字符串，数组，promise 等其他类型转换为Observable。
请自己敲一遍看结果。
```javascript
  const {from} = rxjs;

  function f() {
    return from(arguments);
  }

  const observer = {
    next: value => {
      console.log('Next: ' + value);
    },
    error: error => {
      console.log('Error:', error);
    },
    complete: () => {
      console.log('Complete');
    }
  }

  // Array Like Object
  f(1, 2, 3).subscribe(observer);

  // string
  from('foo').subscribe(observer);

  // Set, any iterable object
  const s = new Set(['foo', window]);
  from(s).subscribe(observer);

  // Promise
  const source = from(new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Hello RxJS!');
      }, 3000)
    }))

  source.subscribe(observer);
```
