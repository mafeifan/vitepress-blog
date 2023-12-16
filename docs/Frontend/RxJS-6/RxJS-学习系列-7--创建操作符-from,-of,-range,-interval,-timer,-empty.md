> 学好 RxJS 的关键是对 Operators (操作符)的灵活使用，操作符大多是纯函数，我们使用操作符创建，转换，过滤，组合，错误处理，辅助操作 Observables。具体[参见](http://reactivex.io/documentation/operators.html)
不同的操作符有不同的使用场景，有些名字容易混淆，可以对比的学习。

下面介绍几个可以创建 Observable 的运算符，具体的介绍请问官网
例子：https://codepen.io/mafeifan/pen/eQKNvN

```
  const {from, of, range, interval, timer, empty} = rxjs;

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
  // from 接收数组
  // 如果是字符串，会打印每一个字符
  from('foo').subscribe(observer);

  // Set, any iterable object
  const s = new Set(['foo', window]);
  from(s).subscribe(observer);

  // Promise
  const source = from(new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('Hello RxJS!');
      },3000)
    }));

  source.subscribe(observer);
  // 传啥输出啥
  /*
  Next: 1
  Next: 2
  Next: 3
  */
  of(1, 2, 3).subscribe(observer);

  // Next: 4,5,6
  of([4, 5, 6]).subscribe(observer);

  // https://rxjs-dev.firebaseapp.com/api/index/function/range
  // 从10开始递增+1连续发射两次， 输出 10, 11
  /*
    Next: 10,
    Next: 11
  */
  range(10, 2).subscribe(observer);

  // 从0开始计数，每间隔num ms秒发射一次
  const num = 1000;
  interval(num).subscribe(observer);

  // 延迟2秒发射
  timer(2000).subscribe(observer);

  // 不会执行 next，直接执行 complete
  empty().subscribe({
    next: () => console.log(`empty`),
    complete: () => console.log('empty Complete!')
  });

  // 延迟5秒发射, 间隔1秒发射一次
  const subscription = timer(5000, 1000).subscribe(observer);
```
