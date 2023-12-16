#### BehaviorSubject 
BehaviorSubject 是 Subject 的一个变种，他的特点是会存储当前值，

```
const subject = new rxjs.Subject();
subject.subscribe((next => {
  console.log(next);
}));
// 去掉下面的注释才会输出结果
// subject.next(1);
```
而 BehaviorSubject  一旦 subscribe 就会执行，可以在定义时要初始化值。

```
const subject = new rxjs.BehaviorSubject(0);
// 会输出 0
subject.subscribe((next => {
  console.log(next);
}));
```

#### ReplaySubject
在某些时候我们会希望 Subject 代表事件，但又能在新订阅时重新发送最后的几个元素，这时我们就可以用 ReplaySubject，范例如下
```
  const count = 1;
  const subject = new rxjs.ReplaySubject(count);

  var observerA = {
    next: value => console.log('A next: ' + value),
    error: error => console.log('A error: ' + error),
    complete: () => console.log('A complete!')
  }

  var observerB = {
    next: value => console.log('B next: ' + value),
    error: error => console.log('B error: ' + error),
    complete: () => console.log('B complete!')
  }

  subject.subscribe(observerA);
  subject.next(1);
  // "A next: 1"
  subject.next(2);
  // "A next: 2"
  subject.next(3);
  // "A next: 3"

  setTimeout(() => {
    subject.subscribe(observerB);
    // 根据传入 n 的不同
    // "B next: 2"
    // "B next: 3"
  },3000)
```
ReplaySubject(1) 不等同于 BehaviorSubject，BehaviorSubject 在建立时就会有起始值，比如 BehaviorSubject(0) 起始值就是 0，BehaviorSubject 是代表着状态而 ReplaySubject 只是事件的重放而已。

#### AsyncSubject
AsyncSubject 是最怪的一个变形，他有点像是 operator last，会在 subject 结束后送出最后一个值，范例如下
```
  const subject = new rxjs.AsyncSubject();

  var observerA = {
    next: value  => console.log('A next: ' + value),
    error: error => console.log('A error: ' + error),
    complete: () => console.log('A complete!')
  }

  var observerB = {
    next: value  => console.log('B next: ' + value),
    error: error => console.log('B error: ' + error),
    complete: () => console.log('B complete!')
  }

  subject.subscribe(observerA);
  // 执行 next 并不会输出值
  subject.next(1);
  subject.next(2);
  subject.next(3);
  // 必须执行 complete 才会输出值
  subject.complete();
  setTimeout(() => {
    subject.subscribe(observerB);
    // "B next: 2"
    // "B next: 3"
  },3000)
```
AsyncSubject 会在 Subject 结束后才送出最后一个值，其实这个行为跟 Promise 很像，都是等到事情结束后送出一个值，实际上我们非常少用到 AsyncSubject，绝大部分的时候都是使用 BehaviorSubject 跟 ReplaySubject 或 Subject。

#### 参考：
https://segmentfault.com/a/1190000005069851
https://ithelp.ithome.com.tw/articles/10188677
