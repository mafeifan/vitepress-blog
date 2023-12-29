debounce 与 throttle是用户交互处理中常用到的性能提速方案，debounce用来实现防抖动，throttle用来实现节流（限频）
debounce  当调用动作n毫秒后，才会执行该动作，若在这n毫秒内又调用此动作则将重新计算执行时间。执行太快的话会忽略，直到慢到指定时刻才去执行。

throttle 预先设定一个执行周期，当调用动作的时刻大于等于执行周期则执行该动作，然后进入下一个新周期。

> debounce 和 throttle 他们两个的作用都是要降低事件的触发頻率，但行为上有很大的不同。throttle 比较像是控制行为的最高頻率，也就是说如果我们设定 1000 毫秒，那该事件频率的最大值就是每秒触发一次不会再更快，debounce 则比较像要等到一定的时间过了才会收到元素。

debounce:   接收一个返回Observable的方法，可以传入interval，timer等
debounce会根舍弃掉在两次输出之间小于指定时间的发出值。
debounceTime: 接收毫秒数，舍弃掉在两次输出之间小于指定时间的发出值。
适用场景：搜索栏输入关键词请求后台拿数据，防止频繁发请求。
debounceTime 比 debounce 使用更频繁

throttle 节流： 接收一个返回Observable的方法，可以传入interval，timer等
throttleTime： 接收毫秒数，经过指定的这个时间后发出最新值。



```javascript
    const { interval, timer } = rxjs;
    const { debounce } = rxjs.operators;

    // 每1秒发出值, 示例: 0...1...2
    const interval$ = interval(1000);
    // 每1秒都将 debounce 的时间增加200毫秒
    const debouncedInterval = interval$.pipe(debounce(val => timer(val * 200)));
    /*
      5秒后，debounce 的时间会大于 interval 的时间，之后所有的值都将被丢弃
      输出: 0...1...2...3...4......(debounce 的时间大于1秒后则不再发出值)
    */
    const subscribe = debouncedInterval.subscribe(val =>
        console.log(`Example Two: ${val}`)
    );
```

debounceTime 例子
```html
<body>
    <input type="text" id="example">
</body>
<script src='../lib/rxjs6.3.3.umd.js'></script>
<script>
    // https://rxjs-cn.github.io/learn-rxjs-operators/operators/filtering/debouncetime.html
    // debounceTime
    // 舍弃掉在两次输出之间小于指定时间的发出值
    // 此操作符在诸如预先知道用户的输入频率的场景下很受欢迎！

    const { fromEvent, timer } = rxjs;
    const { debounceTime, map } = rxjs.operators;

    const input = document.getElementById('example');

    // 对于每次键盘敲击，都将映射成当前输入值
    const example = fromEvent(input, 'keyup').pipe(map(i => i.currentTarget.value));

    // 在两次键盘敲击之间等待0.5秒方才发出当前值，
    // 并丢弃这0.5秒内的所有其他值
    const debouncedInput = example.pipe(debounceTime(500));

    // 输出值
    const subscribe = debouncedInput.subscribe(val => {
        console.log(`Debounced Input: ${val}`);
    });

</script>
```
