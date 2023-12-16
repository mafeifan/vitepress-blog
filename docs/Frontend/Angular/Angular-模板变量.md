https://angular.cn/guide/template-syntax#template-reference-variables--var-

模板引用变量通常用来引用模板中的某个 DOM 元素，它还可以引用 Angular 组件或指令或Web Component。
注意：模板引用变量的作用范围是整个模板。 不要在同一个模板中多次定义同一个变量名，否则它在运行期间的值是无法确定的。

1. 模板变量可以循环


```html
  <div class="device-wrapper">
    <div
      class="device-item-wrapper"
      *ngFor="let device of listService.activeNode.items_mapping; let i = index"
      [ngStyle]="{ 'top.%': device.y * 100, 'left.%': device.x * 100 }"
    >
      <img
        [src]="'https://s2.ax1x.com/2019/12/23/lpUFje.png'"
        alt=""
        class="device"
        nz-tooltip
        [nzTooltipTitle]="titleTemplate"
      />
      <ng-template #titleTemplate>
        <p>{{ device.info.name }}</p>
        <p>{{ device.info.category }}</p>
      </ng-template>
    </div>
  </div>
```

2. 可以通过方法传给后台

demo.html
```html
  <fx-ad-group-private-deal *fxPermissions="['Internal Team Views']" #private_deal_editor
                            [cgid]="cid"
                            [private_deal]="formData.private_deal"
                            [private_deal_list]="formData.private_deal_list">
   </fx-ad-group-private-deal>
                            
      
  <fx-ad-group-targeting [ngClass]="{'hide': this.isSMB}" #targeting_editor [cgid]="cid" 
                               [data]="formData.targeting"
                               [is_create]="createOrEdit"
                               [audience_id]="formData?.content.audienceType.id">
  </fx-ad-group-targeting>                      

  <button mat-raised-button color="primary" [disabled]="totalForm.invalid"
        (click)="createAdGroup(private_deal_editor, targeting_editor )">
  Next
  </button>
```

demo.ts

```typescript
createAdGroup(private_deal_editor, targeting_editor) {
    if (private_deal_editor) {
        Object.assign(payload, private_deal_editor.getPayload());
        console.log(payload);
    }
    if (targeting_editor) {
        Object.assign(payload, targeting_editor.getPayload());
    }
}

```
