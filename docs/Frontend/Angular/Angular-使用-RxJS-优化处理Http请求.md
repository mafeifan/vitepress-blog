Angular自带有http模块可以方便的进行Http请求。不必像Vue那样安装配置axios。
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app/app.component.html'
})
export class AppComponent {

  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    // 发起一个get请求
    this.http.get('/api/people/1').subscribe(json => console.log(json));
  }
}

```
注意：上面的`this.http.get`... 处理HTTP最好放到单独的Service文件中，再注入到Component。这里为了演示没有这么做。

#### 优化有顺序依赖的多个请求
有些时候我们需要按顺序发起多个请求，根据第一个请求返回的结果中的某些内容，作为第二个请求的参数，比如下面代码。
```javascript
  ngOnInit() {
    this.http.get('/api/people/1').subscribe(character => {
      this.http.get(character.id).subscribe(homeworld => {
        character.homeworld = homeworld;
        this.loadedCharacter = character;
      });
    });
  }
```
上面的嵌套写法可读性不那么好，我们可以使用RxJS提供的`mergeMap`操作符来优化上述代码
```typescript
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app/app.component.html'
})
export class AppComponent {
  homeworld: Observable<{}>;
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    this.homeworld = this.http.get('/api/people/1')
    .pipe(
      mergeMap(character => this.http.get(character.homeworld))
    );
  }
}
```
mergeMap 操作符用于从内部的 Observable 对象中获取值，然后返回给父级流对象。
可以合并 Observable 对象

#### 处理并发请求
forkJoin 是 Rx 版本的 Promise.all()，即表示等到所有的 Observable 都完成后，才一次性返回值。
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from "rxjs/observable/forkJoin";

@Component({
  selector: 'app-root',
  templateUrl: 'app/app.component.html'
})
export class AppComponent {
  loadedCharacter: {};
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    let character = this.http.get('https://swapi.co/api/people/1');
    let characterHomeworld = this.http.get('http://swapi.co/api/planets/1');

    forkJoin([character, characterHomeworld]).subscribe(results => {
      // results[0] is our character
      // results[1] is our character homeworld
      results[0].homeworld = results[1];
      this.loadedCharacter = results[0];
    });
  }
}
```
[在线演示](https://stackblitz.com/edit/angular-jjp2oy)

#### 错误处理请求
使用 catchError  处理observable中的错误，需要返回一个新的 observable 或者直接抛出error

例1 ，在请求方法内部处理错误，若请求失败返回一个默认值，看起来用户也感知不到发生了错误
```typescript
  // http.service.ts
  getPostDetail(id) {
    return this.http
    .get<any>(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .pipe(
        // catchError 需要 returning a new observable or throwing an error.
        catchError(err => {
          // 如果发生错误，用缺省值，(尝试修改为错误地址)
          return of({
            userId: 1,
            id: 1,
            title: '-occaecati excepturi optio reprehenderit-',
            body: '-eveniet architecto-'
          });
        })
    )
  }
  // component 中调用
  getPostDetail() {
    this.postDetail$ = this.service.getPostDetail(1)
    .subscribe(val => {
      console.log(val);
    });
  }

```
例2 直接把错误抛出来，在外部处理错误，比如来个弹窗，提示告诉用户
```typescript
  getPostDetail(id) {
    return this.http
    .get<any>(`${this.endpoint}/posts2/${id}`)
      .pipe(
        // catchError  returning a new observable or throwing an error.
        catchError(err => {
          throw err;
        })
      )
  }

// 改造调用方法
  getPostDetail() {
    this.postDetail$ = this.service.getPostDetail(1)
      .subscribe(
        (next) => {
        },  
       // 这里接收内部抛出的错误
        err => {
          // 可以加入自己的错误处理逻辑，搞个弹窗，notify等
          console.log(err);
        }
      )
  }
```


#### 参考
[使用 RxJS 处理多个 Http 请求](https://segmentfault.com/a/1190000010088631)
