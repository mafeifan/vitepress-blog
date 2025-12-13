翻译自原文：[https://netbasal.com/whats-new-in-rxjs-v6-5-d0d74a6752ac](https://netbasal.com/whats-new-in-rxjs-v6-5-d0d74a6752ac)


RxJS 已于上月2019.4.23发布。
来看下带来了哪些新功能

#### New Fetch Observable
基于原生的 [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API，RxJS 进行了封装并提供了 fromFetch 方法，也就是利用原生的fetch发http请求并返回为Observable 类型。而且还支持通过基于原生的[FetchController](https://developer.mozilla.org/zh-CN/docs/Web/API/FetchController) 实现取消发送中的请求。

在线例子：[https://stackblitz.com/edit/fromfetch](https://stackblitz.com/edit/fromfetch)


```
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

const users$ = fromFetch('https://reqres.in/api/users').pipe(
  switchMap(response => {
    if (response.ok) {
      return response.json();
    } else {
      return of({ error: true, message: `Error ${response.status}` });
    }
  }),
  catchError((error) => of({ error: true, message: error.message }))
);


users$.subscribe({ next(data) { ... }, complete() { ... } });
```
#### forkJoin 增强

forkJoin 类似 promise.all() 用于同时处理多个 Observable
在v6.5中可以支持传入对象类型了
```
import { forkJoin, timer } from 'rxjs';
import { take, mapTo } from 'rxjs/operators';

const source = forkJoin({
  todos: timer(500).pipe(mapTo([{ title: 'RxJS'}])),
  user: timer(500).pipe(mapTo({ id: 1 }))
});

source.subscribe({
  next({ todos, user }) { }
});
```

此外，不再支持 forkJoin(a, b, c, d) 形式，建议传入数组，如 forkJoin([a, b, c, d])。
译者注： 增强了可读性
```
// DEPRECATED 
forkJoin(of(1), of(2)).subscribe();

// use an array instead
forkJoin([of(1), of(2)]).subscribe();
```
在线例子：[https://stackblitz.com/edit/forkjoin-65](https://stackblitz.com/edit/forkjoin-65)

### Partition Observable

Partition 能够将 source observable 分成两个 observables， 一个利用放满足时的预测值，一个是不满足时候的值。

比如页面中，当鼠标点击 h1 标题区域才是我们想要的值，点击其他区域我们依然做处理。

```
import { fromEvent, partition } from 'rxjs';

const clicks$ = fromEvent(document, 'click');

const [clicksOnH1$, clicksElsewhere$] =
  partition(clicks$, event => event.target.tagName === 'H1');


clicksOnH1$.subscribe({
  next() { console.log('clicked on h1') }
});

clicksElsewhere$
  .subscribe({
    next() {
      console.log('Other clicked')
    }
  });
```
在线例子：[https://stackblitz.com/edit/partition-65](https://stackblitz.com/edit/partition-65)

### combineLatest 被废弃
combineLatest 目前只会保留 `combineLatest([a, b, c])` 这一种使用方法，原因可以看[这里](https://github.com/reactivex/rxjs/commit/6661c79).

### Schedulers

添加 scheduled 函数来创建 a scheduled observable of values。from、range等其他方法被废弃

```
import { of, scheduled, asapScheduler } from 'rxjs';

console.log(1);

// DEPRECATED
// of(2, asapScheduler).subscribe({
//   next(value) {
//     console.log(value);
//   }
// });

scheduled(of(2), asapScheduler).subscribe({
  next(value) {
    console.log(value);
  }
});

console.log(3)
```
输出结果是 1 3 2
在线例子：[https://stackblitz.com/edit/scheduled65](https://stackblitz.com/edit/scheduled65)

> 关于 Schedulers 的使用我会在后续文章中介绍
