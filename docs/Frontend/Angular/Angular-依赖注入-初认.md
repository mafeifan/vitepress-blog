### 服务与依赖注入

服务是什么概念？可以简单地认为它是一个功能模块，重要在于它是单例对象，并且可以注入到其他的地方使用。

依赖注入(Dependency Injection 简称 DI)是来自后端的概念，其实就是自动创建一个实例，省去每次需要手动创建的麻烦。
 
在 Angular 中定义一个服务很简单，主要在类之前加上 @Injectable 装饰器的功能。这是最常见的依赖注入方式 useClass，其他具体参见[这里](https://angular.cn/guide/dependency-injection)。
```typescript
import { Injectable } from '@angular/core';  

@Injectable() 
export class Service {
    counter: number = 0;
    
    getData(){
        return this.counter++;
    }
}
```
然后在模块的providers中声明：
```typescript
import { Service } from './service';
...

@NgModule({
    imports: [
        ...
    ],
    declarations: [
        ...
    ],
    providers: [ Service ],  // 注入服务
    bootstrap: [...]
})
export class AppModule {
}
```
使用的时候需要在构造器中建立关联：
```typescript
import { Component } from '@angular/core'; 
import { Service } from './service';
...

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(public service: Service) {
        // this.service被成功注入
        // 相当于 this.service = new Service(); 
        // 然后可以调用服务
        this.service.getData();
    }
}
```
由于该服务是在模块中注入，所以该模块中的所有组件使用这个服务时，使用的都是**同一个实例**。

除了在模块中声明，还可以在组件中声明。假设AppComponent下还有组件HomeComponent，此时我们在AppComponent中注入这个服务：
```typescript
import { Component } from '@angular/core'; 
import { Service } from './service';
...

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ Service ],  // 注入服务
})
export class AppComponent {
    constructor(public service: Service) {
        // this.service被成功注入
        // 相当于 this.service = new Service(); 
        // 然后可以调用服务
        this.service.getData();
    }
}
```
如果HomeComponent也使用了这个服务，那它使用的将是同一个实例。这个可以从Service中的数据变化来看出。

Angular还有个分层依赖注入的概念，也就是说，你可以为任一组件创建自己独立的服务。就像上面的例子，如果想要HomeComponent不和它的父组件同使用一个服务实例的话，只要在该组件中重新注入即可：
```typescript
...
@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [ Service ],  // 重新注入服务
})
export class HomeComponent {
    ...
}
```

对于前后端的接口，通常会写成服务。下面说下请求后端数据这块应该怎么写。在模块这节中提过，http有专门的HttpModule模块处理请求。首先要在模块中导入HttpModule，然后引入http服务，调用相应的请求方法即可。

```typescript
import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';
  
@Injectable()
export class HttpService {
  constructor(private http: Http) {}
 
  getFromServer(): any {
    return this.http.get(`/data`)
  }
}
```
