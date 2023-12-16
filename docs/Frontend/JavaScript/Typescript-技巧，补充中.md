### 1.  对象字面量的惰性初始化
在 JavaScript 中，像这样用字面量初始化对象的写法十分常见：

```
let foo = {};
foo.bar = 123;
foo.bas = 'Hello World';
```
但在 TypeScript 中，同样的写法就会报错：
```
let foo = {};
foo.bar = 123; // Error: Property 'bar' does not exist on type '{}'
foo.bas = 'Hello World'; // Error: Property 'bas' does not exist on type '{}'
```

这是因为 TypeScript 在解析 `let foo = {}` 这段赋值语句时，会进行“类型推断”：它会认为等号左边 `foo` 的类型即为等号右边 `{}` 的类型。
由于 `{}` 本没有任何属性，因此，像上面那样给 `foo` 添加属性时就会报错。

最好的解决方案就是在为变量赋值的同时，添加属性及其对应的值：
```
let foo = {
  bar: 123,
  bas: 'Hello World'
};
```
快速解决方案
```
let foo = {} as any;
foo.bar = 123;
foo.bas = 'Hello World';
```
折中的解决方案
当然，总是用 any 肯定是不好的，因为这样做其实是在想办法绕开 TypeScript 的类型检查。
那么，折中的方案就是创建 interface，这样的好处在于：

方便撰写类型文档
TypeScript 会参与类型检查，确保类型安全
请看以下的示例：
```
interface Foo {
  bar: number;
  bas: string;
}

let foo = {} as Foo;
foo.bar = 123;
foo.bas = 'Hello World';
// 使用 interface 可以确保类型安全，比如我们尝试这样做：
foo.bar = 'Hello Stranger'; // 错误：你可能把 `bas` 写成了 `bar`，不能为数字类型的属性赋值字符串
```
如果实在不想写interface，为避免`object.p`找不到属性，可以尝试使用 `object['p']`即对象的数组取值写法，

### 2. 关于interface
TS 中的 interface 接口和 Java，PHP等语言中的接口不太一样。
在 TS 中接口可以确保类拥有指定的结构。
```
interface LoggerInterface {
   log(arg: any) : void;
}

class Logger implements LoggerInterface {
  log (arg) {
      console.log(arg);
  }
}
```

也可以使用接口来约束对象
```
interface Person {
    name: string;
    // 只能在对象刚刚创建的时候修改其值
    readonly age: number;
    // 可选属性
    hobby?: string;
}

let zhangsan = {} as Person;
```
错: `zhangsan.age = 10;`  age 是只读属性，只能get不能set
对:  `let zhangsan = {age: 10} as Person;`

错: `let zhangsan = {nickname: 'xx'} as Person;`   nickname不属于Person类型。

> readonly vs const
最简单判断该用readonly还是const的方法是看要把它做为变量使用还是做为一个属性。 做为变量使用的话用 const，若做为属性则使用readonly。

有时候我们希望一个接口允许有任意的属性，可以使用如下方式：
```
interface Person {
    name: string;
    readonly age: number;
    hobby?: string;
    [propName: string]: any;
}
```
使用 [propName: string] 定义了任意属性取 string 类型的值。
需要注意的是，一旦定义了任意属性，那么确定属性和可选属性都必须是它的子属性：
所以 `let zhangsan = { name: 'xx', age: 18, nickname: 'xx'} as Person;` 不会报错。
也可以这么写 `let lisi: Person = {
    name: 'lisi',
    age: 20
}`
这个功能在有些地方很有用，比如一个组件的config对象类型。可允许传入任意名称的属性。当然属性值得是字符串。

### 3.  枚举类型
当我们需要定义一组有共同特点的变量，可以使用枚举类型。
比如我们要实现下面的页面，这个页面有两处地方要实现点击切换视图的效果，一个是包含Ad Creative，Images和Videos分类的Tab，一个是显示方式Grid还是table。
点击不同的按钮，页面切换不同的效果。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9a48948affd06ae0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-10545116200db60e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

代码实现
```
export enum DisplayTab {
  Creative,
  Image,
  Video,
}

export enum DisplayMode {
  Table,
  Grid,
}
```
默认下 DisplayTab.Creative 等于 0，即起始从0开始。
也可以改变起始值
```
export enum DisplayTab {
  Creative = 3,
  Image, // 4
  Video,  // 5
}
```

### 4.  使用泛型提高重用性

比如后台的API中返回的格式是规定的
```
{
  success: true,
  data: [{id:1, name: 'aa'}, {id:2, name: 'bb'}]
}
```
刚开始我们可能会这么写，为每一个API的返回定义一种类型
```
interface AccountInfo {
  'id': number;
  'name': string;
}

//  success 和 data 具有普遍性，应该进一步封装
interface AccountInfoResp {
  success: boolean;
  data: AccountInfo;
}

getAccountInfo(id) {
    return this.http.get<AccountInfoResp>(`/api/accounts/info/${id}`);
}

```
使用泛型进行优化
T 代表我们传入的类型
```
// 可以提取到一个result.ts文件
export interface Result<T> {
  success?: boolean;
  data?: T;
}

getAccountInfo(bid) {
    return this.http.get<Result<AccountInfo>>(`/api/accounts/xhr/info`);
}
```



## 参考
[深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/)
