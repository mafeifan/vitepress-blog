原文链接：**[Never again be confused when implementing ControlValueAccessor in Angularforms](https://blog.angularindepth.com/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms-93b9eee9ee83)**

如果你正在做一个复杂项目，必然会需要自定义表单控件，这个控件主要需要实现`ControlValueAccessor`接口（译者注：该接口定义方法可参考**[API 文档说明](https://angular.io/api/forms/ControlValueAccessor)**，也可参考**[Angular 源码定义](https://github.com/angular/angular/blob/master/packages/forms/src/directives/control_value_accessor.ts)**）。网上有大量文章描述如何实现这个接口，但很少说到它在 Angular 表单架构里扮演什么角色，如果你不仅仅想知道如何实现，还想知道为什么这样实现，那本文正合你的胃口。

首先我解释下为啥需要`ControlValueAccessor`接口以及它在 Angular 中是如何使用的。然后我将展示如何封装第三方组件作为 Angular 组件，以及如何使用输入输出机制实现组件间通信（译者注：Angular 组件间通信输入输出机制可参考**[官网文档](https://angular.io/guide/component-interaction)**），最后将展示如何使用`ControlValueAccessor`来实现一种**针对 Angular 表单**新的数据通信机制。

## FormControl 和 ControlValueAccessor

如果你之前使用过 Angular 表单，你可能会熟悉**[FormControl](https://angular.io/api/forms/FormControl)**，Angular 官方文档将它描述为追踪单个表单控件**值和有效性**的实体对象。需要明白，不管你使用模板驱动还是响应式表单（译者注：即模型驱动），`FormControl`都总会被创建。如果你使用响应式表单，你需要显式创建`FormControl`对象，并使用`formControl`或`formControlName`指令来绑定原生控件；如果你使用模板驱动方法，`FormControl`对象会被**[`NgModel`](https://angular.io/api/forms/NgModel)**指令隐式创建（译者注：可查看 Angular 源码**[这一行](https://github.com/angular/angular/blob/master/packages/forms/src/directives/ng_model.ts#L113)**）：

```
@Directive({
  selector: '[ngModel]...',
  ...
})
export class NgModel ... {
  _control = new FormControl();   <---------------- here
```

不管`formControl`是隐式还是显式创建，都必须和原生 DOM 表单控件如`input,textarea`进行交互，并且很有可能需要自定义一个表单控件作为 Angular 组件而不是使用原生表单控件，而通常自定义表单控件会封装一个使用纯 JS 写的控件如**[`jQuery UI's Slider`](https://jqueryui.com/slider/)**。本文我将使用**原生表单控件**术语来区分 Angular 特定的`formControl`和你在`html`使用的表单控件，但你需要知道任何一个自定义表单控件都可以和`formControl`指令进行交互，而不是原生表单控件如`input`。

原生表单控件数量是有限的，但是自定义表单控件是无限的，所以 Angular 需要一种通用机制来**桥接**原生/自定义表单控件和`formControl`指令，而这正是**[`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor)**干的事情。这个对象桥接原生表单控件和`formControl`指令，并同步两者的值。官方文档是这么描述的（译者注：为清晰理解，该描述不翻译）：

> ControlValueAccessoracts as a bridge between the Angular forms API and a native element in the DOM.

任何一个组件或指令都可以通过实现`ControlValueAccessor`接口并注册为`NG_VALUE_ACCESSOR`，从而转变成`ControlValueAccessor`类型的对象，稍后我们将一起看看如何做。另外，这个接口还定义两个重要方法——`writeValue`和`registerOnChange`（译者注：可查看 Angular 源码**[这一行](https://github.com/angular/angular/blob/master/packages/forms/src/directives/control_value_accessor.ts)**）：

```
interface ControlValueAccessor {
  writeValue(obj: any): void
  registerOnChange(fn: any): void
  registerOnTouched(fn: any): void
  ...
}
```

`formControl`指令使用`writeValue`方法设置原生表单控件的值（译者注：你可能会参考**[L186](https://github.com/angular/angular/blob/master/packages/forms/src/directives/reactive_directives/form_control_directive.ts#L186)**和**[L41](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L41)**）；使用`registerOnChange`方法来注册由每次原生表单控件值更新时触发的回调函数（译者注：你可能会参考这三行，**[L186](https://github.com/angular/angular/blob/master/packages/forms/src/directives/reactive_directives/form_control_directive.ts#L186)**和**[L43](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L43)**，以及**[L85](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L85)**），**你需要把更新的值传给这个回调函数，这样对应的 Angular 表单控件值也会更新**（译者注：这一点可以参考 Angular 它自己写的`DefaultValueAccessor`的写法是如何把 input 控件每次更新值传给回调函数的，**[L52](https://github.com/angular/angular/blob/master/packages/forms/src/directives/default_value_accessor.ts#L52)**和**[L89](https://github.com/angular/angular/blob/master/packages/forms/src/directives/default_value_accessor.ts#L89)**）；使用`registerOnTouched`方法来注册用户和控件交互时触发的回调（译者注：你可能会参考**[L95](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L95)**）。

下图是`Angular 表单控件`如何通过`ControlValueAccessor`来和`原生表单控件`交互的（译者注：`formControl`和**你写的或者 Angular 提供的`CustomControlValueAccessor`**两个都是要绑定到 native DOM element 的指令，而`formControl`指令需要借助`CustomControlValueAccessor`指令/组件，来和 native DOM element 交换数据。）：

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-6472dba47b83db3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


再次强调，不管是使用响应式表单显式创建还是使用模板驱动表单隐式创建，`ControlValueAccessor`都总是和 Angular 表单控件进行交互。

Angular 也为所有原生 DOM 表单元素创建了`Angular`表单控件（译者注：Angular 内置的 ControlValueAccessor）：

| Accessor | Form Element |
| --- | --- |
| **[DefaultValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/default_value_accessor.ts#L47)** | input,textarea |
| **[CheckboxControlValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/checkbox_value_accessor.ts#L31)** | input[type=checkbox] |
| **[NumberValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/number_value_accessor.ts#L30)** | input[type=number] |
| **[RadioControlValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/radio_control_value_accessor.ts#L88)** | input[type=radio] |
| **[RangeValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/range_value_accessor.ts)** | input[type=range] |
| **[SelectControlValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/select_control_value_accessor.ts#L94)** | select |
| **[SelectMultipleControlValueAccessor](https://github.com/angular/angular/blob/master/packages/forms/src/directives/select_multiple_control_value_accessor.ts#L74)** | select[multiple] |

从上表中可看到，当 Angular 在组件模板中中遇到`input`或`textarea`DOM 原生控件时，会使用`DefaultValueAccessor`指令：

```
@Component({
  selector: 'my-app',
  template: `
      <input [formControl]="ctrl">
  `
})
export class AppComponent {
  ctrl = new FormControl(3);
}
```

所有表单指令，包括上面代码中的`formControl`指令，都会调用**[setUpControl](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L35)**函数来让表单控件和`DefaultValueAccessor`实现交互（译者注：意思就是上面代码中绑定的`formControl`指令，在其自身实例化时，会调用`setUpControl()`函数给同样绑定到`input`的`DefaultValueAccessor`指令做好安装工作，如**[L85](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L85)**，这样`formControl`指令就可以借助`DefaultValueAccessor`来和`input`元素交换数据了）。细节可参考`formControl`指令的代码：

```
export class FormControlDirective ... {
  ...
  ngOnChanges(changes: SimpleChanges): void {
    if (this._isControlChanged(changes)) {
      setUpControl(this.form, this);
```

还有`setUpControl`函数源码也指出了原生表单控件和 Angular 表单控件是如何数据同步的（译者注：作者贴的可能是 Angular v4.x 的代码，v5 有了点小小变动，但基本相似）：

```
export function setUpControl(control: FormControl, dir: NgControl) {

  // initialize a form control
  // 调用 writeValue() 初始化表单控件值
  dir.valueAccessor.writeValue(control.value);

  // setup a listener for changes on the native control
  // and set this value to form control
  // 设置原生控件值更新时监听器，每当原生控件值更新，Angular 表单控件值也更新
  valueAccessor.registerOnChange((newValue: any) => {
    control.setValue(newValue, {emitModelToViewChange: false});
  });

  // setup a listener for changes on the Angular formControl
  // and set this value to the native control
  // 设置 Angular 表单控件值更新监听器，每当 Angular 表单控件值更新，原生控件值也更新
  control.registerOnChange((newValue: any, ...) => {
    dir.valueAccessor.writeValue(newValue);
  });
```

只要我们理解了内部机制，就可以实现我们自定义的 Angular 表单控件了。

## 组件封装器

由于 Angular 为所有默认原生控件提供了控件值访问器，所以在封装第三方插件或组件时，需要写一个新的控件值访问器。我们将使用上文提到的 jQuery UI 库的**[slider](https://jqueryui.com/slider/)**插件，来实现一个自定义表单控件吧。

### 简单的封装器

最基础实现是通过简单封装使其能在屏幕上显示出来，所以我们需要一个`NgxJquerySliderComponent`组件，并在其模板里渲染出`slider`：

```
@Component({
  selector: 'ngx-jquery-slider',
  template: `
      <div #location></div>
  `,
  styles: ['div {width: 100px}']
})
export class NgxJquerySliderComponent {
  @ViewChild('location') location;
  widget;
  ngOnInit() {
    this.widget = $(this.location.nativeElement).slider();
  }
}
```

这里我们使用标准的`jQuery`方法在原生 DOM 元素上创建一个`slider`控件，然后使用`widget`属性引用这个控件。

一旦简单封装好了`slider`组件，我们就可以在父组件模板里使用它：

```
@Component({
  selector: 'my-app',
  template: `
      <h1>Hello {{name}}</h1>
      <ngx-jquery-slider></ngx-jquery-slider>
  `
})
export class AppComponent { ... }
```

为了运行程序我们需要加入`jQuery`相关依赖，简化起见，在`index.html`中添加全局依赖：

```
<script src="https://code.jquery.com/jquery-3.2.1.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css">
```

这里是安装依赖的**[源码](https://plnkr.co/edit/OyCXMLwVcWQelO1en9tR?p=preview)**。

### 交互式表单控件

上面的实现还不能让我们自定义的`slider`控件与父组件交互，所以还得使用输入/输出绑定来是实现组件间数据通信：

```
export class NgxJquerySliderComponent {
  @ViewChild('location') location;
  @Input() value;
  @Output() private valueChange = new EventEmitter();
  widget;

  ngOnInit() {
    this.widget = $(this.location.nativeElement).slider();   
    this.widget.slider('value', this.value);
    this.widget.on('slidestop', (event, ui) => {
      this.valueChange.emit(ui.value);
    });
  }

  ngOnChanges() {
    if (this.widget && this.widget.slider('value') !== this.value) {
      this.widget.slider('value', this.value);
    }
  }
}
```

一旦`slider`组件创建，就可以订阅`slidestop`事件获取变化的值，一旦`slidestop`事件被触发了，就可以使用输出事件发射器`valueChanges`通知父组件。当然我们也可以使用`ngOnChanges`生命周期钩子来追踪输入属性`value`值的变化，一旦其值变化，我们就将该值设置为`slider`控件的值。

然后就是父组件中如何使用`slider`组件的代码实现：

```
<ngx-jquery-slider
    [value]="sliderValue"
    (valueChange)="onSliderValueChange($event)">
</ngx-jquery-slider>
```

**[源码](https://plnkr.co/edit/bCrkvABQkRZXrnVvTW7D?p=preview)**在这里。

但是，我们想要的是，使用`slider`组件作为表单的一部分，并使用模板驱动表单或响应式表单的指令与其数据通信，那就需要让其实现`ControlValueAccessor`接口了。由于我们将实现的是新的组件通信方式，所以不需要标准的输入输出属性绑定方式，那就移除相关代码吧。（译者注：作者先实现标准的输入输出属性绑定的通信方式，又要删除，主要是为了引入**新的表单组件交互方式**，即`ControlValueAccessor`。）

## 实现自定义控件值访问器

实现自定义控件值访问器并不难，只需要两步：

1.  注册`NG_VALUE_ACCESSOR`提供者
2.  实现`ControlValueAccessor`接口

`NG_VALUE_ACCESSOR`提供者用来指定实现了`ControlValueAccessor`接口的类，并且被 Angular 用来和`formControl`同步，通常是使用组件类或指令来注册。所有表单指令都是使用`NG_VALUE_ACCESSOR`标识来注入控件值访问器，然后选择合适的访问器（译者注：这句话可参考这两行代码，**[L175](https://github.com/angular/angular/blob/master/packages/forms/src/directives/reactive_directives/form_control_directive.ts#L175)**和**[L181](https://github.com/angular/angular/blob/master/packages/forms/src/directives/reactive_directives/form_control_directive.ts#L181)**）。要么选择`DefaultValueAccessor`或者内置的数据访问器，否则 Angular 将会选择自定义的数据访问器，并且有且只有一个自定义的数据访问器（译者注：这句话参考**[`selectValueAccessor`源码实现](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L186)**）。

让我们首先定义提供者：

```
@Component({
  selector: 'ngx-jquery-slider',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: NgxJquerySliderComponent,
    multi: true
  }]
  ...
})
class NgxJquerySliderComponent implements ControlValueAccessor {...}
```

我们直接在组件装饰器里直接指定类名，然而 Angular 源码默认实现是放在类装饰器外面：

```
export const DEFAULT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};
@Directive({
  selector:'input',
  providers: [DEFAULT_VALUE_ACCESSOR]
  ...
})
export class DefaultValueAccessor implements ControlValueAccessor {}
```

放在外面就需要使用`forwardRef`，关于原因可以参考**[What is forwardRef in Angular and why we need it](https://blog.angularindepth.com/what-is-forwardref-in-angular-and-why-we-need-it-6ecefb417d48)**。当实现自定义`controlValueAccessor`，我建议还是放在类装饰器里吧（译者注：个人建议还是学习 Angular 源码那样放在外面）。

一旦定义了提供者后，就让我们实现`controlValueAccessor`接口：

```
export class NgxJquerySliderComponent implements ControlValueAccessor {
  @ViewChild('location') location;
  widget;
  onChange;
  value;

ngOnInit() {
    this.widget = $(this.location.nativeElement).slider(this.value);
   this.widget.on('slidestop', (event, ui) => {
      this.onChange(ui.value);
    });
}

writeValue(value) {
    this.value = value;
    if (this.widget && value) {
      this.widget.slider('value', value);
    }
  }

registerOnChange(fn) { this.onChange = fn;  }

registerOnTouched(fn) {  }
```

由于我们对用户是否与组件交互不感兴趣，所以先把`registerOnTouched`置空吧。在`registerOnChange`里我们简单保存了对回调函数`fn`的引用，回调函数是由`formControl`指令传入的（译者注：参考**[L85](https://github.com/angular/angular/blob/master/packages/forms/src/directives/shared.ts#L85)**），只要每次`slider`组件值发生改变，就会触发这个回调函数。在`writeValue`方法内我们把得到的值传给`slider`组件。

现在我们把上面描述的功能做成一张交互式图：

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-8bd2e8cc37f7ce0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果你把简单封装和`controlValueAccessor`封装进行比较，你会发现父子组件交互方式是不一样的，尽管封装的组件与`slider`组件的交互是一样的。你可能注意到`formControl`指令实际上简化了与父组件交互的方式。这里我们使用`writeValue`来向子组件写入数据，而在简单封装方法中使用`ngOnChanges`；调用`this.onChange`方法输出数据，而在简单封装方法中使用`this.valueChange.emit(ui.value)`。

现在，实现了`ControlValueAccessor`接口的自定义`slider`表单控件完整代码如下：

```
@Component({
  selector: 'my-app',
  template: `
      <h1>Hello {{name}}</h1>
      <span>Current slider value: {{ctrl.value}}</span>
      <ngx-jquery-slider [formControl]="ctrl"></ngx-jquery-slider>
      <input [value]="ctrl.value" (change)="updateSlider($event)">
  `
})
export class AppComponent {
  ctrl = new FormControl(11);

  updateSlider($event) {
    this.ctrl.setValue($event.currentTarget.value, {emitModelToViewChange: true});
  }
}
```
你可以查看程序的**[最终实现](https://plnkr.co/edit/c3tUH819er2gA9ertQS6?p=preview)**。

### Github
项目的**[Github 仓库](https://github.com/maximusk/custom-form-control-that-implements-control-value-accessor-and-wraps-jquery-slider)**。
