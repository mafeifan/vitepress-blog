1. 效果如下

[https://stackblitz.com/edit/base-dialog](https://stackblitz.com/edit/base-dialog)

点击按钮，出现弹窗，背后还有遮盖层，弹窗的内容可以自定义

2. 打开一个全新的 Angular 项目，然后执行创建组件命令
`ng g c --name base-dialog`
得到三个初始化的文件
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-585eaf3bcce06985.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 首先制作遮盖层，就是铺满整个屏幕的div
`base-dialog.component.html`
```
<div class="modal-overlay" *ngIf="visible"></div>
```
对应的样式 `base-dialog.component.scss`
```
.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1200;
  background-color: rgba(0, 0, 0, 0.3);
  touch-action: none;  /* 不触发任何事件 */
  -ms-touch-action: none;
}
```

效果：遮盖整个屏幕
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-610898eab7cdd783.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

默认情况下，遮盖层是不显示的

```typescript
  @Input() dialogTitle = '';
  /*
  * 显示/隐藏
  * */
  _visible = false;
  constructor() { }

  ngOnInit() {
  }

  show() {
    this._visible = true;
  }

  close() {
    this._visible = false;
  }
```

4. 制作弹窗Dialog区域
```html
<div class="overlay"></div>
<div class="dialog-container">
  <div class="dialog-content">
    <div class="dialog-header">{{dialogTitle}}</div>
    <div class="dialog-body">
      <ng-content select=".dialog-body"></ng-content>
    </div>
    <div class="dialog-footer">
      <ng-content select=".dialog-footer"></ng-content>
    </div>
  </div>
</div>
```
补充样式
```scss
.overlay {
  ....
}
.dialog-container {
  position: fixed;
  z-index: 1300;
  left: 50%;
  top: 50%;
  background-color: #fff;
  .dialog-content {
    border-radius: 8px;
    padding: 10px;
  }
  .dialog-body {
  }
  .dialog-footer {
    text-align: right;
  }
}

```
这里有一个细节是`base-dialog`的`z-index`一定要大于`overlay`的，已保证dialog能显示在遮盖层上方。

5. 打开`app.component.html`, 加入下面的代码
```html
<button (click)="dialogRef.show()">Show</button>

<app-my-dialog class="dialog-container"  dialogTitle="这是标题" #dialogRef>
  <ng-container class="dialog-body">
    <div>
      <p>这是内容</p>
    </div>
  </ng-container>
  <ng-container class="dialog-footer">
    <button (click)="dialogRef.close()">关闭</button>
  </ng-container>
</app-my-dialog>
```
* dialogRef 是这个组件的引用别名
* `<ng-container class="dialog-body">` 类似Vue中的插槽，之内的html会替换组件内部的`<ng-content select=".dialog-body"></ng-content>`
效果如下，点击show按钮，显示弹窗，点击弹窗中的关闭按钮，恢复原样。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-49c407ee12e64483.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6. 其实大部分功能已经完成了，剩下的是样式美化和添加一些额外功能，比如现在是居中显示，示例中加入了从底部显示，用到了CSS3中的动画。
