这节讲处理高阶 Observable 的操作符
所谓的 Higher Order Observable 就是指一个 Observable 发送出的元素还是一个 Observable，就像是二维数组一样，一个数组中的每个元素还是数组。如果用TypeScript中的泛型来表达就像是

`Observable<Observable<T>>`

通常我们需要的是第二层 Observable 送出的元素，所以我们希望可以把二维的 Observable 改成一维的，像是下面这样
`Observable<Observable<T>> => Observable<T>`

其实想要做到这件事有三个方法 switchAll、mergeAll 和 concatAll，其中 concatAll 我们在上节已经稍微讲过了，今天这篇文章会讲解这三个 operators 各自的效果跟差异。

先看各自最重要的特点：
* concatAll： 处理完前一个 observable 才会在处理下一个 observable。**依次按顺序执行一个个observable** 。
* switchAll：新的 observable 送出后直接处理新的 observable 不管前一个 observable 是否完成，每当有新的 observable 送出就会直接把旧的 observable 退订(unsubscribe)，**永远只处理最新的 observable!** 
> 注意：RxJS5 中叫switch，由于与Javascript保留字冲突，RxJS 6中对以下运算符名字做了修改：do -> tap, catch ->catchError, switch -> switchAll, finally -> finalize
* mergeAll：并且能够同时**并行处理所有的 observable**

看下面的例子，我们可以切换为 concatAll，mergeAll，switchAll 体验区别
```javascript
  const example = fromEvent(document.body, 'click')
    .pipe(
      // map 把送出的event事件转换为 Observable
      // 每次点击送出一个新的 Observable
      map(e => {
        // console.log(e);
        // 生成新的 Observable，点击一次输出0，1，2
        return interval(1000).pipe(take(3))
      }),
     
     // concatAll 比如快速点击三次，会按顺序输出三次0,1,2
     // switchAll 快速点击，只输出一次0,1,2，也就是说老的舍去只保留最新的
     // mergeAll 快速点击，会重复的输出多次0，1等。点击越多下，最后送出的频率就会越快。不会舍去，每次都会输出
      switchAll()
    );


  example.subscribe({
    next: (value) => { console.log(value); },
    error: (err)  => { console.log('Error: ' + err); },
    complete: ()  => { console.log('complete'); }
  });
```
