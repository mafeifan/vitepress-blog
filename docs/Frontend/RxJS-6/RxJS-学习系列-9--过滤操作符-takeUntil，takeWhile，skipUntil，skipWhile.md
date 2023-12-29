take 取开头的N个值，需要传入数字类型
takeUntil，takeWhile 都是 take的变种
takeUntil 接收的是 Observable 类型，当这个Observable发出值才完成
takeWhile 接收的是 function ，一旦返回值为false 就完成

skip 跳过开头的N个值，需要传入数字类型
skipUntil，skipWhile 都是 skip 的变种
skipUntil 接收的是 Observable 类型，当这个Observable发出值才完成
skipWhile 接收的是 function ，一旦返回值为false 就完成

总结：take 和 skip 互逆
```html
<script src='../lib/rxjs6.3.3.umd.js'></script>
<script>
    // https://rxjs-cn.github.io/learn-rxjs-operators/operators/filtering/filter.html
    // filter
    // 发出符合给定条件的值

    const { from, interval, timer } = rxjs;
    const { filter, take, last, startWith, skip, takeUntil, takeWhile, skipWhile } = rxjs.operators;


    interval(1000)
      .pipe(
        // timer(5000) 是等待5s发出值
        // takeUntil 只取timer(5000)开始发出之前的那些值
        takeUntil(timer(5000))
      )
      // 输出 0，1，2，3
      .subscribe(val => console.log(val));

    interval(1000)
      .pipe(
        // timer(5000) 是等待5s发出值
        // takeWhile 只取timer(5000)开始发出之前的那些值
        takeWhile((val) => val < 5)
      )
      // 输出 -0，-1，-2，-3, -4
      .subscribe(val => console.log(`-${val}`));
</script>
```

来看下skip操作，我们只替换take为skip，显示的内容刚好相反
```javascript
    const { from, interval, timer } = rxjs;
    const { filter, take, last, startWith, skip, takeUntil, takeWhile, skipWhile, skipUntil } = rxjs.operators;

    interval(1000)
      .pipe(
        // timer(5000) 是等待5s发出值
        // skipUntil 舍弃timer(5000)开始发出之前的那些值
        skipUntil(timer(5000))
      )
      // 从 4 开始输出 每秒1发送一次，4, 5, 6, 7...
      .subscribe(val => console.log(val));


    interval(1000)
      .pipe(
        // timer(5000) 是等待5s发出值
        // skipWhile 舍弃timer(5000)开始发出之前的那些值
        // 输出
        skipWhile((val) => val < 5)
      )
      // 从 -5 开始输出 每秒1发送一次，如 -5, -6, -7 ...
      .subscribe(val => console.log(`-${val}`));
```
