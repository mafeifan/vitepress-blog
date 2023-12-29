### 响应式表单
[`FormControl`](https://angular.cn/api/forms/FormControl) 的 `valueChanges` 属性和 `statusChanges` 属性包含了会发出变更事件的可观察对象。
[例子](https://stackblitz.com/edit/angular-form-rxjs-demo)
```javascript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { concat, merge, zip, combineLatest, race } from 'rxjs/index';
import { filter, map, startWith,  } from 'rxjs/internal/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  form: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      hobby: [''],
    });

    //  监听整个表单
    this.form.valueChanges
          .subscribe( res => console.log(res));
  }
}
```

HTML
```html
<form [formGroup]="form">
    username: <input type="text" name="username" formControlName="username">
    hobby: 
      <select name="hobby">
        <option value="sleep">sleep</option>
        <option value="play">play</option>
      </select>    
</form>
```
完善验证，只有通过验证才输出内容 filter 是rxjs提供的运算符

```javascript
    this.form.valueChanges
    .pipe(
      filter(() => this.form.valid)
    )
    .subscribe(res => console.log(res));
```

如果需要额外的逻辑，只需要在pipe添加相应的运算符。比如这里在结果里追加上次更新时间，字段名为lastTime
```javascript
    this.form.valueChanges
    .pipe(
      filter(() => this.form.valid)，
      map(data => {
        data.lastTime = new Date();
        return data
     })
    )
    .subscribe(res => console.log(res));
```

另一种写法，监听各个元素
```javascript
    // 如果要监听单个表单元素
    const username$ = this.form.get('username').pipe(startWith(this.form.get('username').value))
    const hobby$ = this.form.get('hobby').pipe(startWith(this.form.get('hobby').value))
    //  combineLatest，它会取得各个 observable 最后送出的值，再输出成一个值
    //  这个有个问题是只有合并的元素都产生值才会输出内容，所以在上面使用startWith赋初始化值
    combineLatest(username$, status$)
      .pipe(
        map(([username, status]) => ({username, status}))
      )
      .subscribe(res => console.log(res));

```

### 结合返回Observable的组件 Angular Material
[Angular Material]([https://material.angular.io](https://material.angular.io/)
) 是基于Angular的前端框架，国外使用度高。
他提供的组件有些方法返回的是Observable，比如Dialog的afterAllClosed，SnackBar的afterOpened, afterDismissed
比如某需要，提示消失1s后跳转页面
优化前的代码：
```javascript
this.snackbar.success(response);
setTimeout(function () {
    this.router.navigate([`/login`]);
}, 1000);
```
优化后的代码：
```typescript
import { delay } from 'rxjs/operators';
...
this.snack.success(response).afterDismissed()
  .pipe(delay(1000))
  .subscribe(() => {
    this.router.navigate([`/login`]);
  });
```
