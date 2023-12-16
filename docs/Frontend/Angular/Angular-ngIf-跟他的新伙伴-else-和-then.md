参考：https://angular.cn/api/common/NgIf

Angular 扩展了ngIf 指令， 加入了两个新伙伴 else 和 then。

ngIf 内的 expression 并会对 `expression` 进行求值，如果为真，则在原地渲染 `then` 模板，否则渲染 `else` 模板。通常：
*   `then` 模板就是 `ngIf` 中内联的模板 —— 除非你指定了另一个值。
*   `else` 模板是空白的 —— 除非你另行指定了。

### else
当表达式为false，用于显示的模板。
注意，`else` 绑定指向的是一个带有 `#elseBlock` 标签的 `<ng-template>` 元素。 该模板可以定义在此组件视图中的任何地方，但为了提高可读性，通常会放在 `ngIf` 的紧下方。

```
<button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
<div *ngIf="show; else elseBlock">to show</div>
<ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
```

### then
```
<div *ngIf="show; then thenBlock; else elseBlock">this is ignored</div>
<ng-template #primaryBlock>Primary text to show</ng-template>
<ng-template #secondaryBlock>Secondary text to show</ng-template>
<ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
```

### 总结：
你完全写一堆ngIf进行判断分支判断，这样会导致代码可读性比较差。
