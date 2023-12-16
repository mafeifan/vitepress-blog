学习本节前，建议先看[上一节](https://www.jianshu.com/p/0c2762368f80)
实际上这三个以Map结尾的操作符都是简写。
共同特点：传入一个返回 Observable 的 Function。

switchMap  = map + switchAll
mergeMap  = map + mergeMap
concatMap = map + concatMap

我们可以使用mergeMap优化上节的例子
```
  fromEvent(document.body, 'click')
    .pipe(
      map(e => {
        return interval(1000)
           .pipe(
              take(3)
            )
      }),
      mergeAll()
    )
    .subscribe(val => console.log(val));

  // 简写

  fromEvent(document.body, 'click')
    .pipe(
      mergeMap(e => {
        return interval(1000)
          .pipe(
            take(3)
          )
      }),
    )
    .subscribe(val => console.log(val));
```

### 使用场景
switchMap: input的搜索框，typehead，当有新的输入舍去之前的请求，switchMap 同一时间只维护一个内部订阅。记忆switch切换新的。
mergeMap：同时维护多个活动的内部订阅，第二个参数传入数字，可以控制并发数量。如果需要考虑顺序性，concatMap 会是更好的选择。为防止内存泄漏，如果将 observable 映射成内部的定时器或 DOM 事件流。如果仍然想用 mergeMap 的话，应该利用另一个操作符来管理内部订阅的完成，比如 take 或 takeUntil。
concatMap：合并observable，前一个内部 observable 完成后才会订阅下一个。
