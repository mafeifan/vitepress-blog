介绍下Angular中组件中数据传递的几种方式，包括父传子，子传父，任何组件之间数据的传递。

#### 1. 父到子 -- Input
使用 [@Input()](https://angular.cn/api/core/Input) 装饰器 通过模板把数据传到子组件中

This is probably the most common and straightforward method of sharing data. It works by using the @Input() decorator to allow data to be passed via the template.

parent.component.ts

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-child [childMessage]="parentMessage"></app-child>
  `,
  styleUrls: ['./parent.component.css']
})
export class ParentComponent{
  parentMessage = "message from parent"
  constructor() { }
}
```

child.component.ts
```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
      Say {{ message }}
  `,
  styleUrls: ['./child.component.css']
})
export class ChildComponent {

  // https://angular.cn/api/core/Input
  // Input 装饰器，用来把某个类字段标记为输入属性，并提供配置元数据。 
  // 该输入属性会绑定到模板中的某个 DOM 属性。当变更检测时，Angular 会自动使用这个 DOM 属性的值来更新此数据属性。  
  @Input() childMessage: string;

  constructor() { }

}
```

#### 2. 子到父 -- ViewChild

[ViewChild](https://angular.cn/api/core/ViewChild) 装饰器可以将一个组件注入到另一个组件中，使得父组件访问子组件的属性和方法。
但是，需要注意的是，在初始化视图之前，子视图ViewChild是不可用的，这时，需要我们在父组件实现 ngAfterViewInit 生命周期钩子来接收来自子组件的数据。

ViewChild allows a one component to be injected into another, giving the parent access to its attributes and functions. One caveat, however, is that child won’t be available until after the view has been initialized. This means we need to implement the AfterViewInit lifecycle hook to receive the data from the child.

parent.component.ts
```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChildComponent } from "../child/child.component";

@Component({
  selector: 'app-parent',
  template: `
    Message: {{ message }}
    <app-child></app-child>
  `,
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements AfterViewInit {

  @ViewChild(ChildComponent) child;

  constructor() { }

  message:string;

  ngAfterViewInit() {
    this.message = this.child.message
  }
}
```

child.component.ts
```typescript
import { Component} from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
  `,
  styleUrls: ['./child.component.css']
})
export class ChildComponent {

  message = 'Hola Mundo!';

  constructor() { }

}
```

#### 3. 子到父 -- Output() 和 EventEmitter

当我们需要通过事件触发，提交表单将子组件数据传递给父组件时，使用[Output()](https://angular.cn/api/core/Output)装饰器和EventEmitter共享数据是不错的方法。
在父组件中，我们创建一个方法来接收消息，并将其设置为消息变量。
在子组件中，定义一个名称为messageEvent的变量，类型为EventEmitter，使用Output装饰器标记为输出属性，又定义了名为sendMessage的方法，当点击按钮时调用这个方法，向外发送数据。
父组件订阅了来自子组件发出的messageEvent。

Another way to share data is to emit data from the child, which can be listed to by the parent. This approach is ideal when you want to share data changes that occur on things like button clicks, form entires, and other user events.

In the parent, we create a function to receive the message and set it equal to the message variable.

In the child, we declare a messageEvent variable with the Output decorator and set it equal to a new event emitter. Then we create a function named sendMessage that calls emit on this event with the message we want to send. Lastly, we create a button to trigger this function.

The parent can now subscribe to this messageEvent that’s outputted by the child component, then run the receive message function whenever this event occurs.

parent.component.ts

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    Message: {{message}}
    <app-child (messageEvent)="receiveMessage($event)"></app-child>
  `,
  styleUrls: ['./parent.component.css']
})
export class ParentComponent {

  constructor() { }

  message:string;

  receiveMessage($event) {
    this.message = $event
  }
}
```

child.component.ts
```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
      <button (click)="sendMessage()">Send Message</button>
  `,
  styleUrls: ['./child.component.css']
})
export class ChildComponent {

  message: string = "Hola Mundo!"

  @Output() messageEvent = new EventEmitter<string>();

  constructor() { }

  sendMessage() {
    this.messageEvent.emit(this.message)
  }
}
```

#### 4. 使用Service在不相关的组件中共享数据

由于Service是单例的，可以在不相干的组件(兄弟组件，孙子组件)中传递数据，只需要把这个Service注入到用到的组件中。

如果需要保持同步数据，在此场景下，RxJS的BehaviorSubject非常好用。
优点如下：
1. 总是在订阅时返回当前值，不需要调用onnext
2. 提供getValue()方法来获取最后值作为原始数据
3. 确认组件总是收到最新值

在下面的例子中，
data.service.ts

首先创建一个私有BehaviorSubject类型的变量，名为messageSource，初始值为'default message'，又基于他创建了一个Observable类型的变量，
名为currentMessage。供在组件中使用。最后定义一个方法changeMessage来修改值。

parent.component.ts, sibling.component.ts

父组件、子组件和兄弟组件都是相同的处理。将DataService注入构造函数，然后订阅currentMessage，如果要修改值，只需调用changeMessage方法
这样其他组件会显示最新的修改值。


When passing data between components that lack a direct connection, such as siblings, grandchildren, etc, you should you a shared service. 
When you have data that should aways been in sync, I find the RxJS BehaviorSubject very useful in this situation.

You can also use a regular RxJS Subject for sharing data via the service, but here’s why I prefer a BehaviorSubject.

It will always return the current value on subscription - there is no need to call onnext
It has a getValue() function to extract the last value as raw data.
It ensures that the component always receives the most recent data.

In the service, we create a private BehaviorSubject that will hold the current value of the message. 
We define a currentMessage variable handle this data stream as an observable that will be used by the components. 
Lastly, we create function that calls next on the BehaviorSubject to change its value.

The parent, child, and sibling components all receive the same treatment. We inject the DataService in the constructor, then subscribe to the currentMessage observable and set its value equal to the message variable.

Now if we create a function in any one of these components that changes the value of the message. when this function is executed the new data it’s automatically broadcast to all other components.

data.service.ts
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

}
```


parent.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";

@Component({
  selector: 'app-parent',
  template: `
    {{message}}
  `,
  styleUrls: ['./sibling.component.css']
})
export class ParentComponent implements OnInit {

  message:string;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
  }

}
```

sibling.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";

@Component({
  selector: 'app-sibling',
  template: `
    {{message}}
    <button (click)="newMessage()">New Message</button>
  `,
  styleUrls: ['./sibling.component.css']
})
export class SiblingComponent implements OnInit {

  message:string;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
  }

  newMessage() {
    this.data.changeMessage("Hello from Sibling")
  }

}
```

::: warning
如果你发现sharedService不生效，尝试把service放到组件对应的module的provider中而不是组件的provider中
:::

```
@Component({
    providers: [SharedDataService]  <--- remove this line from both of your components, and add that line to your NgModule configuration instead
})

### 参考
* https://angularfirebase.com/lessons/sharing-data-between-angular-components-four-methods/
* https://stackoverflow.com/questions/40468172/how-to-share-data-between-components-using-a-service-properly
* https://stackoverflow.com/questions/42860896/angular-2-shared-data-service-is-not-working

