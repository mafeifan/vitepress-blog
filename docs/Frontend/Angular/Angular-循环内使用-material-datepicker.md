material datepicker 需要用到模板变量，如果需要在循环出来datepicker可以这么干
1. 直接把 *ngFor 中的index传给[matDatepicker]，用来引用组件
2. `*ngFor="let editItem of budget.edits; index as j;index as k;"` j是组件的引用，k是循环索引。支持这种写法，把k传到方法里，方便操作哪一个日期组件。
[实例](https://stackblitz.com/edit/angular-material-multi-datepicker)
看代码
```
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-muldatepicker',
  templateUrl: './muldatepicker.component.html',
  styleUrls: ['./muldatepicker.component.styl']
})
export class MuldatepickerComponent implements OnInit {
  result = {
    budgets: []
  };

  constructor() {
  }

  ngOnInit() {
    this.result = {
      'budgets': [{
        id: 1,
        edits: [
          {
            'id': 10,
            'date': new Date('2019-01-01 00:00:00'),
            amount: 100,
          },
          {
            'id': 11,
            'date': new Date('2019-01-18 00:00:00'),
            amount: 150,
          }
        ]
        },
        {
          id: 2,
          edits: [
            {
              'id': 21,
              'date': new Date('2019-02-10 00:00:00'),
              amount: 0,
            }
          ]
        }
      ]
    }
  }

  onAddOrUpdate() {
    console.log(arguments);
  }

}
```
模板
```
<pre>{{result.budgets|json}}</pre>
<mat-list *ngFor="let budget of result.budgets;index as i;">
  <div *ngFor="let editItem of budget.edits; index as j;index as k;">
    <mat-form-field>
      <input matInput [matDatepicker]="j" [(ngModel)]="editItem.date" placeholder="Choose a date">
      <mat-datepicker-toggle matSuffix [for]="j"></mat-datepicker-toggle>
      <mat-datepicker #j></mat-datepicker>
    </mat-form-field>
    <mat-form-field>
      <input type="number" min="0" matInput placeholder="amount" [(ngModel)]="editItem.amount">
    </mat-form-field>
    <button mat-icon-button color="primary" (click)="onAddOrUpdate(budget.id, editItem, i, k)">
      <mat-icon>edit</mat-icon>
    </button>
  </div>
</mat-list>
```
