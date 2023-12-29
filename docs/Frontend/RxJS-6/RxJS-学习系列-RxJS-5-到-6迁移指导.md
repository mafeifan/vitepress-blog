原文：
https://rxjs-dev.firebaseapp.com/guide/v6/migration
转载地址：
https://segmentfault.com/a/1190000014956260
节选
### 修改import路径
建议TypeScript开发人员使用rxjs-tslint来重构import路径。
RxJS团队设计了以下规则来帮助JavaScript开发人员重构import路径：

* rxjs: 包含创建方法，类型，调度程序和工具库。

import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
* rxjs/operators: 包含所有的管道操作符

import { map, filter, scan } from 'rxjs/operators';
* rxjs/webSocket: 包含websocket subject实现.

import { webSocket } from 'rxjs/webSocket';
* rxjs/ajax: 包含Rx ajax实现.

import { ajax } from 'rxjs/ajax';
* rxjs/testing: 包含RxJS的测试工具库.

import { TestScheduler } from 'rxjs/testing';

### 使用管道操作而不是链式操作
请按照如下步骤将您的链式操作替换为管道操作：

* 从rxjs-operators中引入您需要的操作符

> 注意：由于与Javascript保留字冲突，以下运算符名字做了修改：do -> tap, catch ->
catchError, switch -> switchAll, finally -> finalize

import { map, filter, catchError, mergeMap } from 'rxjs/operators';

* **使用pipe()包裹所有的操作符方法**。确保所有操作符间的.被移除，转而使用,连接。
记住！！！有些操作符的名称变了！！！
以下为升级示例：
```javascript
// Rxjs5写法，操作符链
source
  .map(x => x + x)
  .mergeMap(n => of(n + 1, n + 2)
    .filter(x => x % 1 == 0)
    .scan((acc, x) => acc + x, 0)
  )
  .catch(err => of('error found'))
  .subscribe(printResult);

// Rxjs写法，需要用pipe包一下所有的操作符

source.pipe(
  map(x => x + x),
  mergeMap(n => of(n + 1, n + 2).pipe(
    filter(x => x % 1 == 0),
    scan((acc, x) => acc + x, 0),
  )),
  catchError(err => of('error found')),
).subscribe(printResult);
```
注意我们在以上代码中嵌套使用了pipe()。
Ben Lesh在[ng-conf 2018](https://www.ng-conf.org/sessions/introducing-rxjs6/)上解释了[为什么我们应该使用管道操作符](https://youtu.be/JCXZhe6KsxQ?t=2m30s)。

### 其他RxJs6弃用
Observable.if and Observable.throw
Observable.if已被iif()取代，Observable.throw已被throwError()取代。您可使用rxjs-tslint将这些废弃的成员方法修改为函数调用。

代码示例如下：
```javascript
OBSERVABLE.IF > IIF()
// deprecated
Observable.if(test, a$, b$);

// use instead

iif(test, a$, b$);
OBSERVABLE.ERROR > THROWERROR()
// deprecated
Observable.throw(new Error());

//use instead

throwError(new Error());
```
#### 已弃用的方法
根据迁移指南，以下方法已被弃用或重构：

* merge
```javascript
import { merge } from 'rxjs/operators';
a$.pipe(merge(b$, c$));
// becomes
import { merge } from 'rxjs';
merge(a$, b$, c$);
```
* concat
```javascript
import { concat } from 'rxjs/operators';
a$.pipe(concat(b$, c$));
// becomes
import { concat } from 'rxjs';
concat(a$, b$, c$);
```
* combineLatest
```javascript
import { combineLatest } from 'rxjs/operators';
a$.pipe(combineLatest(b$, c$));
// becomes
import { combineLatest } from 'rxjs';
combineLatest(a$, b$, c$);
```
* race
```javascript
import { race } from 'rxjs/operators';
a$.pipe(race(b$, c$));
// becomes
import { race } from 'rxjs';
race(a$, b$, c$);
```
* zip
```javascript
import { zip } from 'rxjs/operators';
a$.pipe(zip(b$, c$));
// becomes
import { zip } from 'rxjs';
zip(a$, b$, c$);
```

### 总结
RxJS 6带来了一些重大改变，但是通过添加rxjs-compat软件包可以缓解这一问题，该软件包允许您在保持v5代码运行的同时逐渐迁移。对于Typescript用户，其他中包括大多数Angular开发人员，tslint提供了大量的自动重构功能，使转换变得更加简单。

任何升级与代码修改都会引入一些bug到代码库中。因此请务必测试您的功能以确保您的终端用户最终接受到相同的质量体验。

>  个人备注，现在网上大部分教程还是rxjs5的，rxjs6变化还是蛮大的，学习时候要留意区别。
