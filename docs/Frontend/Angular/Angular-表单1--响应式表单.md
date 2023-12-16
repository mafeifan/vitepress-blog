Angular 提供了两种不同的方法来通过表单处理用户输入：响应式表单和模板驱动表单。
本节先讲响应式表单。
最终实例[demo](https://stackblitz.com/edit/jianshu-async-reactive-form-builder-2?file=src/app/app.component.ts)
app-component.ts
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
      firstName: ['Jack', Validators.required],
      lastName: ['Jones', Validators.required],
      about: []
    });
  }

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}

```
app-component.html
```html
<form [formGroup]="form" (ngSubmit)="submit()">
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
```
#### 需要注意的几点：
1. 使用响应式表单，需要组件所在的module引入[ReactiveFormsModule](https://angular.cn/api/forms/ReactiveFormsModule) 该module提供了很多指令。比如已Accessor结尾的，如`NumberValueAccessor` 是专门处理<input type=number>, `RadioControlValueAccessor` 处理 <input type=radio>等等。
2. 模板中表单元素需要绑定FormControlName属性与TS中定义的FormControl匹配。
TS中的定义表单可以使用FormControl，如果嫌麻烦，有更简便的FormBuilder.group
```typescript
this.personForm = this.formBuilder.group({
  username: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  age: ['', Validators.required],
  ...
});
// 也可以写成
this.personForm = new FormGroup({
  username:  new FormControl('',  Validators.required),
  email:  new FormControl('', Validators.required),
});
```
3. 表单元素上面不要同时出现formControlName和ngModel
如 `<input  formControlName="first" [(ngModel)]="value">`。使用`formControlName`实际已经隐含绑定了ngModel。
