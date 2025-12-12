原文：https://medium.com/@mirokoczka/3-ways-to-communicate-between-angular-components-a1e3f3304ecb

这个教程适合初学者看，这里介绍的是最常见的三种通信方式。
如图，下面的页面里有个名为side-bar的组件，组件内部有个toggle方法，可以控制显示或隐藏，这个需要其他组件来调用toggle的方法。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-898700d3f6b5dec2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们可以通过以下三种方式来实现：
1. 传递一个组件的引用给另一个组件
2. 通过子组件发送EventEmitter和父组件通信
3. 通过service通信

每个例子都会有StackBlitz在线演示地址

#### 1. 传递一个组件的引用给另一个组件
[Demo1](https://stackblitz.com/edit/angular-communication-1)
[模板引用变量](https://angular.cn/guide/template-syntax#template-reference-variables--var-)
> 模板引用变量通常用来引用模板中的某个 DOM 元素，它还可以引用 Angular 组件或指令或Web Component。
使用井号 (#) 来声明引用变量。 #phone 的意思就是声明一个名叫 phone 的变量来引用 <input> 元素

这种方式适合组件间有依赖关系。
app component
```
<app-side-bar-toggle [sideBar]="sideBar"></app-side-bar-toggle>
<app-side-bar #sideBar></app-side-bar>
```
[app.component.html](https://gist.github.com/mkoczka/9c74507b59a89e8e90ae63f9d08eba5a#file-app-component-html)

```
@Component({
  selector: 'app-side-bar-toggle',
  templateUrl: './side-bar-toggle.component.html',
  styleUrls: ['./side-bar-toggle.component.css']
})
export class SideBarToggleComponent {

  @Input() sideBar: SideBarComponent;

  @HostListener('click')
  click() {
    this.sideBar.toggle();
  }
}
```
[side-bar-toggle.component.ts](https://gist.github.com/mkoczka/9c74507b59a89e8e90ae63f9d08eba5a#file-side-bar-toggle-component-ts)

```
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

  @HostBinding('class.is-open')
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
```

#### 2.  通过子组件发送EventEmitter和父组件通信
[Demo2](https://stackblitz.com/edit/angular-communication-2)
这种方式利用事件传播，需要在子组件中写
[app.component.html](https://gist.github.com/mkoczka/0eb7a2af1ae4efb67178d981d9f03ebf#file-app-component-html)

```
<app-side-bar-toggle (toggle)="toggleSideBar()"></app-side-bar-toggle>
<app-side-bar [isOpen]="sideBarIsOpened"></app-side-bar>
```
[app.component.ts](https://gist.github.com/mkoczka/0eb7a2af1ae4efb67178d981d9f03ebf#file-app-component-ts)
```
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  sideBarIsOpened = false;

  toggleSideBar(shouldOpen: boolean) {
    this.sideBarIsOpened = !this.sideBarIsOpened;
  }
}
```

[side-bar-toggle.component.ts](https://gist.github.com/mkoczka/0eb7a2af1ae4efb67178d981d9f03ebf#file-side-bar-toggle-component-ts)

```
@Component({
  selector: 'app-side-bar-toggle',
  templateUrl: './side-bar-toggle.component.html',
  styleUrls: ['./side-bar-toggle.component.css']
})
export class SideBarToggleComponent {

  @Output() toggle: EventEmitter<null> = new EventEmitter();

  @HostListener('click')
  click() {
    this.toggle.emit();
  }
}
```
[side-bar.component.ts](https://gist.github.com/mkoczka/0eb7a2af1ae4efb67178d981d9f03ebf#file-side-bar-component-ts)

```
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

  @HostBinding('class.is-open') @Input()
  isOpen = false;
}
```
#### 3. 通过service进行通信
[Demo3](https://stackblitz.com/edit/angular-communication-3)
这里需要新建side-bar.service，我们把toggle方法写到service文件中，
然后将service注入到side-bar-toggle.component和side-bar-toggle.component，前者调用toggle方法，发送事件流，后者订阅事件

[app.component.html](https://gist.github.com/mkoczka/2b990523999c82a7c0e4c5db1d1b02a9#file-app-component-html)

```
<app-side-bar-toggle></app-side-bar-toggle>
<app-side-bar></app-side-bar>
```
[side-bar-toggle.component.ts](https://gist.github.com/mkoczka/2b990523999c82a7c0e4c5db1d1b02a9#file-side-bar-toggle-component-ts)

```
@Component({
  selector: 'app-side-bar-toggle',
  templateUrl: './side-bar-toggle.component.html',
  styleUrls: ['./side-bar-toggle.component.css']
})
export class SideBarToggleComponent {

  constructor(
    private sideBarService: SideBarService
  ) { }

  @HostListener('click')
  click() {
    this.sideBarService.toggle();
  }
}
```
[side-bar.component.ts](https://gist.github.com/mkoczka/2b990523999c82a7c0e4c5db1d1b02a9#file-side-bar-component-ts)

```
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

  @HostBinding('class.is-open')
  isOpen = false;

  constructor(
    private sideBarService: SideBarService
  ) { }

  ngOnInit() {
    this.sideBarService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }
}
```

[side-bar.service.ts](https://gist.github.com/mkoczka/2b990523999c82a7c0e4c5db1d1b02a9#file-side-bar-service-ts)

```
@Injectable()
export class SideBarService {

  isOpen = false;

  @Output() change: EventEmitter<boolean> = new EventEmitter();

  toggle() {
    this.isOpen = !this.isOpen;
    this.change.emit(this.isOpen);
  }
}
```
