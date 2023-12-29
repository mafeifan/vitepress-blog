这节讲非常重要同时非常容易混淆的合并操作符，从名字上次都是合并，但是区别还是蛮大的，我会尽量结合Marble Diagram（弹珠图）解释清楚。
### concat
首先登场的是concat，用来连接多个 observable。并顺序依次执行
特点：按照顺序，前一个 observable 完成了再订阅下一个 observable 并发出值
注意事项：此操作符可以既有静态方法，又有实例方法
Marble Diagram：
```
source : ----0----1----2|
source2: (3)|
source3: (456)|
            concat()
example: ----0----1----2(3456)|
```
例子：
```javascript
    const { concat } = rxjs.operators;
    const { of } = rxjs;

    const sourceOne = of(1, 2, 3);
    const sourceTwo = of(4, 5, 6);
    const sourceThree = of(7, 8);

    // 先发出 sourceOne 的值，当完成时订阅 sourceTwo
    // 输出: 1,2,3,4,5,6,7,8
    // 特点： 必须先等前一个 observable 完成(complete)，才会继续下一个
    sourceOne
      .pipe(
        concat(sourceTwo, sourceThree)
      )
      .subscribe(val =>
        console.log('Example: Basic concat:', val)
      );

    //  等价写法， 把 concat 作为静态方法使用，这样更直观
    rxjs
      .concat(sourceOne, sourceTwo)
      .subscribe(val =>
        console.log(val)
      );
```

### merge
特点：merge 把多个 observable 同时处理，这跟 concat 一次处理一个 observable 是完全不一样的，由于是同时处理行为会变得较为复杂。
merge 的逻辑有点像是 OR(||)，就是当两个 observable 其中一个被触发时都可以被处理，这很常用在一个以上的按钮具有部分相同的行为。
同样 既有静态方法，又有实例方法
```javascript
    rxjs
      .merge(
        interval(500).pipe(take(3)),
        interval(300).pipe(take(6)),
      )
      .subscribe(val =>
        console.log(val)
      );


    sourceOne
      .pipe(
        merge(sourceTwo)
      )
      .subscribe(val =>
        console.log(val)
      );
```
Marble Diagram:
```
source : ----0----1----2|
source2: --0--1--2--3--4--5|
            merge()
example: --0-01--21-3--(24)--5|
```
例如一个影片播放器有两个按钮，一个是暂停(II)，另一个是结束播放(口)。这两个按钮都具有相同的行为就是影片会被停止，只是结束播放会让影片回到 00 秒，这时我们就可以把这两个按钮的事件 merge 起来处理影片暂停这件事。
```javascript
var stopVideo = rxjs.merge(stopButton, endButton);
stopVideo.subscribe(() => {
    // 暂停播放影片
})
```

### concatAll
有时我们的 Observable 送出的元素又是一个 observable，就像是二维数组，数组里面的元素是数组，这时我们就可以用 concatAll 把它摊平成一维数组，大家也可以直接把 concatAll 想成把所有元素 concat 起来。
特点：摊平 Observable
```javascript
    // 我们每点击一次 body 就会立刻送出 1,2,3
    fromEvent(document.body, 'click')
      .pipe(
        // 内部发出值是 observable 类型
        map(e => of(1,2,3)),
        // 取 observable 的值
        concatAll(),
      )
      .subscribe(val =>
        console.log(val)
      );
```
