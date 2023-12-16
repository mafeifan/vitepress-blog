客户希望使用Ctrl+点击链接在新窗口打开新页面。
经过调查可以实现，具体方式：
1. 修改 `app-routing.module.ts` 开启hash模式
```
@NgModule({
  imports: [
    // 加入  {useHash: true}
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})
```
2. 然后修改相关的module文件，比如ad页面的链接需要支持，组件所属于app-ad.module.ts
则打开这个文件
```
import { NgModule } from '@angular/core';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';

......
@NgModule({
  ....
  // 加入这个提供器，
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
  ]
})
export class AppAdModule { }

```

[官方文档]([https://angular.cn/guide/router#appendix-locationstrategy-and-browser-url-styles](https://angular.cn/guide/router#appendix-locationstrategy-and-browser-url-styles)
) 有说明：
RouterModule.forRoot 函数把 LocationStrategy 设置成了 PathLocationStrategy，使其成为了默认策略。 你可以在启动过程中改写（override）它，来切换到 HashLocationStrategy 风格。

### 延伸 -- 关于前端路由
页面地址中的 # 叫 hash，可以通过[hashchange事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/hashchange_event)监听hash后面的地址内容发生变化。这个是Html5才有的API。也是各个前端路由类库的基础。
见[例子](https://codepen.io/mafeifan/pen/WWPxVw)

关于不刷新页面实现浏览器历史的前进后退，也是利用H5的[History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History)
this.route.push('login') 和 this.route.replace('login')  实际上是调用的是`History.pushState()` 和 `History.replaceState()` 
