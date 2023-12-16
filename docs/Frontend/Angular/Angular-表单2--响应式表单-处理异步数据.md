[上一节](https://www.jianshu.com/p/94407e9405cd)中我们定义了一个响应式表单，其中表单数据是在定义的时候就初始化好的，但是很多时候数据需要异步获取，比如打开一个编辑页面，需要：
1. 请求HTTP拿到数据。
2. 根据数据修改表单中字段的值，最终体现在页面上。
我们改造上一节的例子，成为异步获取数据。
我们先创建service文件, 写一个loadUser方法，模拟HTTP请求
```typescript
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

// /api/users/1

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  about: string;
}

const fakeData = {
  id: 0,
  firstName: 'Cory',
  lastName: 'Rylan',
  about: 'Web Developer'
};

@Injectable()
export class UserService {
  constructor() { }

  loadUser() {
    return of<User>(fakeData).pipe(
      delay(2000)
    );
  }
}

```
组件中，调用该方法
```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { UserService, User } from './user.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form: FormGroup;
  user$: Observable<User>;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      about: []
    });

    this.user$ = this.userService.loadUser().pipe(
      // tap 返回的还是 Observable 这里我们不订阅，我们在模板中使用 async pipe 和 if else 语句实现有条件的显示表单
      tap(user => this.form.patchValue(user))
    );
    // .subscribe();
  }

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}

```
修改模板
```html
<form *ngIf="user$ | async; else loading" [formGroup]="form" (ngSubmit)="submit()">
  <label for="firstname">First Name</label>
  <input id="firstname" formControlName="firstName" />
  <div *ngIf="form.controls.firstName.errors?.required && form.controls.firstName.touched" class="error">
    *Required
  </div>

  <label for="lastname">Last Name</label>
  <input id="lastname" formControlName="lastName" />
  <div *ngIf="form.controls.lastName.errors?.required && form.controls.lastName.touched" class="error">
    *Required
  </div>

  <label for="about">About</label>
  <textarea id="about" formControlName="about"></textarea>

  <button [disabled]="!form.valid">Save Profile</button>
</form>

<ng-template #loading>
  Loading User...
</ng-template>
```
你会发现页面打开后一开始显示` Loading User...`过了大概2s后文字消失并显示表单。
