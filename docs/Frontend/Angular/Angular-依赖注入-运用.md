首先介绍 Angular 中依赖注入的相关概念:

### Service 服务
[Service](https://angular.cn/guide/architecture-services) 的表现形式是一个class，可以用来在组件中复用
比如 Http 请求获取数据，日志处理，验证用户输入等都写成Service，供组件使用。

```typescript
import { Injectable } from '@angular/core';
// 在 Angular 中，要把一个类定义为服务，就要用 `@Injectable` 装饰器来提供元数据

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class LoggerService {
  warn(msg) { 
    return console.warn(msg); 
  }
}

```
### Injector 注入器
一般不用自己手动注入，Angular 会在启动过程中为你创建全应用级注入器以及所需的其它注入器。

### Provider 提供商
是一个对象，告诉 Injector 应该如何获取或创建依赖。

打开Angular看下面的代码片段 app.module.ts
```typescript
@NgModule({
  declarations: [
    ....
  ],
  imports: [
    ....
  ],
  // providers 告诉 Angular 应用哪些对象需要依赖注入
  // providers 是个数组，每一项都是provider
  providers: [
    //  简写，等价 {provider: LoggerService, useClass: LoggerService}
    LoggerService,
    { 
       provide: RequestCache, 
       useClass: RequestCacheWithLocalStorage 
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UrlInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
```

### DI token(令牌)
provide 属性提供了provider 的token，也叫令牌，表示在构造函数中指定的类型。
也就是说，当constructor(private productService: ProductService){...} 指定了ProductService，就会去找token是productService的provider。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e0c7e676cf107d65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### Provider 的几种写法
1.  useClass
 `providers: [{provide: ProductService, useClass: ProductService} ]`
的简写是
`providers: [ ProductService ]`
useClass属性指定实例化方式，表示是 new 一个 ProductService，如果`userClass" AnotherProductService` 真正实例化的就是 AnotherProductService。
2. userFactory
除了useClass写法，还可以使用 userFactory 工厂方法，这个方法返回的实例作为构造函数中productService参数的内容。
`providers: [{provide: ProductService, userFactory: () => {}} ]`
这样可以根据条件具体实例化某对象，更加灵活
```typescript
providers: [{
  provide: ProductService, 
  userFactory: () => {
    let logger = new LoggerService();
    let dev = Math.random() > 0.5;
    if (dev) {
      return new ProductService(logger);
    } else {
      return new AnotherProductService(logger);
   }
  }
}, LoggerService ]
```
上面的写法有个弊端LoggerService和ProductService耦合太强
进一步优化，利用deps参数，指工厂声明所依赖的参数。
```typescript
providers: [{
    provide: ProductService, 
    userFactory: (logger: LoggerService) => {
      let dev = Math.random() > 0.5;
      if (dev) {
        return new ProductService(logger);
      } else {
        return new AnotherProductService(logger);
     }
    },
    deps: [ LoggerService ]
  }, 
  LoggerService
]
```
再次优化，定义第三个提供器，token是IS_DEV_ENV，值是具体的false
```typescript
providers: [{
    provide: ProductService, 
    // 注入的 顺序和deps对应
    userFactory: (logger: LoggerService, isDev) => {
      if (isDev) {
        return new ProductService(logger);
      } else {
        return new AnotherProductService(logger);
     }
    },
    deps: [ LoggerService, 'IS_DEV_ENV' ]
  }, 
  LoggerService,
  {provide: 'IS_DEV_ENV', useValue: false}
]
```
一般来说可以创建一个类型为对象的提供器供注入
```typescript
providers: [{
    provide: ProductService, 
    // 注入的 顺序和deps对应
    userFactory: (logger: LoggerService, appConfig) => {
      if (appConfig.isDev) {
        return new ProductService(logger);
      } else {
        return new AnotherProductService(logger);
     }
    },
    deps: [ LoggerService, 'APP_CONFIG' ]
  }, 
  LoggerService,
  { provide: 'APP_CONFIG', useValue: {isDev: false }}
]
```

### 提供器的作用域

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a37ba3f3dfbed696.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

provide声明在App模块中，则对所有模块可见

provide声明在某组件中，只对该组件及其子组件可见。其他组件不可以注入。
当声明在组件和模块中的提供器具有相同的token时，声明在组件中的提供器会覆盖模块中的那个提供器。

### @Injectable 装饰器
表示FooService可以通过构造函数注入其他服务
举个例子，如果注释掉
```typescript
// @Injectable({
//   providedIn: 'root'
// })
```
就会报错
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-4f119ed6952a8c3b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-8315605b71ca31e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 为什么在组件中没有写@Injectable也能直接注入service？
我们知道定义组件要写@Component装饰器，定义管道要写@Pipe装饰器，他们都是Injectable的子类。
同时Component又是Directive的子类，所以所有的组件都是指令。

### 手动注入
```typescript
import { Component, OnInit, Injector } from '@angular/core';
import { LoggerService } from '../_service/logger.service';

@Component({
  selector: 'app-di',
  templateUrl: './di.component.html',
  styleUrls: ['./di.component.styl']
})
export class DIComponent implements OnInit {
  logger: LoggerService;
  // 手动注入
  constructor(
    private injector: Injector
  ) {
    this.logger = injector.get(LoggerService);
  }

  ngOnInit() {
    this.logger.log()
  }
}

```
