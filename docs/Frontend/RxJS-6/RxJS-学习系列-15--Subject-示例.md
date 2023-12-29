这节举几个例子来加强 Subject  的理解

### 例1 理解 Subject 的组播
```javascript
const subject = new rxjs.Subject();

// subject.subscribe 可以理解成 Event.AddListener 注意只是注册不会去执行
// subscriber 1
subject.subscribe((data) => {
  console.log(data); // 0.24957144215097515 (random number)
});

// subscriber 2
subject.subscribe((data) => {
  console.log(data); // 0.24957144215097515 (random number)
});

// 执行每个注册的 Listener
// 注意 输出的随机数值是一样的
subject.next(Math.random());
```
>  Subject 是一个特殊的对象，即可以是数据生产者也同时是消费者，通过使用 Subject 作为数据消费者，可以使用它们将 Observables  从单播转换为多播。下面是一个例子:

### 例2 使用 Subject 将 Observables  从单播转换为多播
```javascript
const observable = rxjs.Observable
    .create((observer) => {
      observer.next(Math.random());
 });

const subject = new rxjs.Subject();

// subscriber 1
subject.subscribe((data) => {
    console.log(data); // 0.24957144215097515 (random number)
});

// subscriber 2
subject.subscribe((data) => {
    console.log(data); // 0.24957144215097515 (random number)
});

observable.subscribe(subject);
```


### 结合 Angular 中的例子 
##### 例1
实现文本框传送输入内容并防抖

部分关键代码, TS 部分
```javascript
nameChange$ = new Subject<string>();
// val 就是 input 输入的值
this.nameChange$.pipe(debounceTime(800)).subscribe(val => {
   //  交互后台
   this.service.searchName(val).subscribe(
    // ....
   );
});
```

模板
```html
 <input matInput type="text" placeholder="Search Keyword" name="keyword"
               (input)="nameChange$.next($event.target.value)" [(ngModel)]="formData.keyword">
```
Subject 实际上就是 Observer Pattern 的实现，他会在内部管理一份 observer 的清单，并在接收到值时遍历这份清单并送出值，所以我们可以直接用 subject 的 next 方法传送值，所有订阅的 observer 就会接收到值了。

#####  例2
使用 subject 可以实现局部刷新页面功能，假设有一List列表组件，单击列表中的某按钮弹出Model，操作完Model要刷新List数据。
我们可以按如下操作：
```javascript
// 第一步 先在 service 文件中定义一个 subject
export class ListService {
  listUpdated$ = new Subject();
}

// 第二步 在列表组件中 ，组件初始化时把要执行的事件放到 subject 中
// 非常类似 DOM addEventListener
export class ListComponent implements OnInit {
    ngOnInit() {
      this.service.listUpdated$.subscribe(() => {
        this.getListData();
      });
    }
   
   // 从后台获取数据的方法
   private getListData() {
   }
}

// 第三步 在需要的地方调用定义的subject
export class InfoModalComponent implements OnInit {
  onAddClick(): void {
    // 重新获取最新数据
    this.service.listUpdated$.next();
  }
}
```

### 总结：
1. Subject 是一个特殊的对象，即可以是数据生产者也同时是消费者，通过使用 Subject 作为数据消费者，可以使用它们将 Observables  从单播转换为多播。下面是一个例子:
2. Subject 很像 EventEmitter，用来维护注册的 Listener， 当对 Subject 调用 subscribe 时，不会执行发送数据，只是在 维护的 Observers 中注册新的 Observer。
