这几天碰到一个需求，登录后要根据用户信息的不同跳转到不同的页面。
比如默认登录要求跳转到A页面，如果A的页面中表格数据是空则要求登录后要直接跳转到B页面。
如果在pageA的组件中的ngInit中判断，你会先看到pageA然后再跳到pageB，这样用户体验不太好。
这就要求在路由变化发生之前就要拿到后台返回的数据。这个时候我们可以使用Resolve
实现起来也比较简单
1. 新建Resolve文件，这里起名 FxAccountListResolverService
要求实现Resolve方法，该方法可以返回一个 Promise、一个 Observable 来支持异步方式，或者直接返回一个值来支持同步方式。
```
import { Injectable } from '@angular/core';
import { Router, Resolve, } from '@angular/router';
import { AccountService } from '../_services';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FxAccountListResolverService implements Resolve<any> {
  constructor(
    public service: AccountService,
    public router: Router,
  ) {
  }

  resolve() {
    return this.service.getAccountList()
      .pipe(map(response => {
        if (response.success) {
          if (response.data.length && response.data.length === 1) {
            this.router.navigate(['/pageB']);
          } else {
            return response.data;
          }
        } else {
          return [];
        }
      }));
  }
}
```

2. 修改路由，添加 resolve 配置
```
      {
        path: 'accounts',
        component: FxAccountListComponent,
        resolve: {
          data: FxAccountListResolverService,
        }
      },
```

3. 修改 FxAccountListComponent 中的 ngOnInit 
之前代码，我们是在组件中取数据，因为以为改成了从 resolve 中取数据
```
this.service.getAccountList().subscribe( (res: Account) => {
 // ...
});
```
改为如下，这里route.snapshot.data 就是后台返回的数据
import { ActivatedRoute, Router } from '@angular/router';
```
constructor(
    private route: ActivatedRoute,
) { }
ngOnInit() {
    let result = this.route.snapshot.data.data;
}
```

参考：[https://angular.cn/guide/router#resolve-pre-fetching-component-data](https://angular.cn/guide/router#resolve-pre-fetching-component-data)
