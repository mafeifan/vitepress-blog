本节会讲到
1. 什么是观察者（Observer）模式及代码实现
2. 什么是 Iterator (迭代器) 模式及代码实现
3. 什么是 Observable

## 观察者模式
发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状
态发生改变时，所有依赖于它的对象都将得到通知。在 JavaScript 开发中，我们一般用事件模型
来替代传统的发布—订阅模式。 

####  现实中的发布－订阅模式 
不论是在程序世界里还是现实生活中，发布—订阅模式的应用都非常之广泛。我们先看一个
现实中的例子。 
小明最近看上了一套房子，到了售楼处之后才被告知，该楼盘的房子早已售罄。好在售楼MM 告诉小明，不久后还有一些尾盘推出，开发商正在办理相关手续，手续办好后便可以购买。但到底是什么时候，目前还没有人能够知道。 于是小明记下了售楼处的电话，以后每天都会打电话过去询问是不是已经到了购买时间。除了小明，还有小红、小强、小龙也会每天向售楼处咨询这个问题。一个星期过后，售楼 MM 决定辞职，因为厌倦了每天回答 1000 个相同内容的电话。 
当然现实中没有这么笨的销售公司，实际上故事是这样的：小明离开之前，把电话号码留在了售楼处。售楼 MM 答应他，新楼盘一推出就马上发信息通知小明。小红、小强和小龙也是一样，他们的电话号码都被记在售楼处的花名册上，新楼盘推出的时候，售楼 MM 会翻开花名册，遍历上面的电话号码，依次发送一条短信来通知他们。

####  现实中的发布－订阅模式 
在刚刚的例子中，发送短信通知就是一个典型的发布—订阅模式，小明、小红等购买者都是
订阅者，他们订阅了房子开售的消息。售楼处作为发布者，会在合适的时候遍历花名册上的电话
号码，依次给购房者发布消息。 
可以发现，在这个例子中使用发布—订阅模式有着显而易见的优点。 
*  购房者不用再天天给售楼处打电话咨询开售时间，在合适的时间点，售楼处作为发布者会通知这些消息订阅者。 
* 购房者和售楼处之间不再强耦合在一起，当有新的购房者出现时，他只需把手机号码留在售楼处，售楼处不关心购房者的任何情况，不管购房者是男是女还是一只猴子。  而售楼处的任何变动也不会影响购买者，比如售楼 MM 离职，售楼处从一楼搬到二楼，这些改变都跟购房者无关，只要售楼处记得发短信这件事情。 

第一点说明发布—订阅模式可以广泛应用于异步编程中，这是一种替代传递回调函数的方案。
比如，我们可以订阅 ajax 请求的 error、success 等事件。 或者如果想在动画的每一帧完成之后做一些事情，那我们可以订阅一个事件，然后在动画的每一帧完成之后发布这个事件。在异步编程中使用发布—订阅模式，我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。 

第二点说明发布—订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布—订阅模式让两个对象松耦合地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响。

####  DOM 事件
实际上，只要我们曾经在 DOM 节点上面绑定过事件函数，那我们就曾经使用过发布—订阅
模式，来看看下面这两句简单的代码发生了什么事情： 
```
document.body.addEventListener( 'click', function(){ 
    alert(2); 
}, false ); 
 
document.body.click();    // 模拟用户点击 
```
在这里需要监控用户点击 document.body 的动作，但是我们没办法预知用户将在什么时候点击。所以我们订阅 document.body 上的 click 事件，当 body 节点被点击时，body 节点便会向订阅者发布这个消息。这很像购房的例子，购房者不知道房子什么时候开售，于是他在订阅消息后等待售楼处发布消息。 
当然我们还可以随意增加或者删除订阅者，增加任何订阅者都不会影响发布者代码的编写：
``` 
document.body.addEventListener( 'click', function(){ 
    alert(2); 
}, false ); 
 
document.body.addEventListener( 'click', function(){
    alert(3); 
}, false ); 
 
document.body.addEventListener( 'click', function(){ 
    alert(4); 
}, false ); 
 
document.body.click();    // 模拟用户点击 
```

#### 实现 观察者模式
分别用 es5 和 es6 实现
下面是es5写法
```
function Producer() {

    // 这个 if 只是避免使用者不小心把 Producer 当作函式来调用
    if(!(this instanceof Producer)) {
      throw new Error('请用 new Producer()!');
      // 仿 ES6 行为可用： throw new Error('Class constructor Producer cannot be invoked without 'new'')
    }

    this.listeners = [];
}

// 加入监听的方法
Producer.prototype.addListener = function(listener) {
    if(typeof listener === 'function') {
        this.listeners.push(listener)
    } else {
        throw new Error('listener 必须是 function')
    }
}

// 移除监听的方法
Producer.prototype.removeListener = function(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
}

// 发送通知的方法
Producer.prototype.notify = function(message) {
    this.listeners.forEach(listener => {
        listener(message);
    })
}
```
es6版本
```
class Producer {
    constructor() {
        this.listeners = [];
    }
    addListener(listener) {
        if(typeof listener === 'function') {
            this.listeners.push(listener)
        } else {
            throw new Error('listener 必须是 function')
        }
    }
    removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1)
    }
    notify(message) {
        this.listeners.forEach(listener => {
            listener(message);
        })
    }
}
```
有了上面的方法，可以实例化了
```
var egghead = new Producer(); 
// new 出一个 Producer 实例叫 egghead

function listener1(message) {
    console.log(message + 'from listener1');
}

function listener2(message) {
    console.log(message + 'from listener2');
}

egghead.addListener(listener1); // 注册监听
egghead.addListener(listener2);

egghead.notify('A new course!!') // 当某件事情方法时，执行

```
会输出
```
a new course!! from listener1
a new course!! from listener2
```
每当 egghead.notify 执行一次，listener1 跟 listener2 就会被通知，而这些 listener 可以额外被添加，也可以被移除！
虽然我们的实现很简单，但它很好的说明了 Observer Pattern 如何在事件(event)跟监听者(listener)的互动中做到去藕合(decoupling)。

## 迭代器模式 Iterator Pattern
迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。
迭代器模式可以把迭代的过程从业务逻辑中分离出来，在使用迭代器模式之后，即使不关心对象的内部构造，也可以按顺序访问其中的每个元素。 

JavaScript 原有的表示“集合”的数据结构，主要是数组（Array）和对象（Object），ES6 又添加了Map和Set。这样就有了四种数据集合，用户还可以组合使用它们，定义自己的数据结构，比如数组的成员是Map，Map的成员是对象。这样就需要一种统一的接口机制，来处理所有不同的数据结构。

遍历器（Iterator）就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。
迭代器 Iterator 本质是一个指针(pointer)对象。
Iterator 的遍历过程是这样的。
（1）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。
先让我们来看看原生的 JS 要怎么建立 iterator
```
var arr = [1, 2, 3];

var iterator = arr[Symbol.iterator]();

iterator.next();
// { value: 1, done: false }
iterator.next();
// { value: 2, done: false }
iterator.next();
// { value: 3, done: false }
iterator.next();
// { value: undefined, done: true }
```

#### 自己实现 Iterator
```
function IteratorFromArray(arr) {
    if(!(this instanceof IteratorFromArray)) {
        throw new Error('请用 new IteratorFromArray()!');
    }
    this._array = arr;
    this._cursor = 0;   
}

IteratorFromArray.prototype.next = function() {
    return this._cursor < this._array.length ?
        { value: this._array[this._cursor++], done: false } :
        { done: true };
}
```
es6版本
```
class IteratorFromArray {
    constructor(arr) {
        this._array = arr;
        this._cursor = 0;
    }

    next() {
        return this._cursor < this._array.length ?
        { value: this._array[this._cursor++], done: false } :
        { done: true };
    }
}
```
迭代器模式虽然很单纯，但同时带来了两个优势，第一它渐进式取得数据的特性可以拿来做延迟运算(Lazy evaluation)，让我们能用它来处理数据结构。第二因为 iterator 本身是序列，所以可以实现所有数组的运算方法像 map, filter... 等！
```
class IteratorFromArray {
    constructor(arr) {
        this._array = arr;
        this._cursor = 0;
    }

    next() {
        return this._cursor < this._array.length ?
        { value: this._array[this._cursor++], done: false } :
        { done: true };
    }

    map(callback) {
        const iterator = new IteratorFromArray(this._array);
        return {
            next: () => {
                const { done, value } = iterator.next();
                return {
                    done: done,
                    value: done ? undefined : callback(value)
                }
            }
        }
    }
}

var iterator = new IteratorFromArray([1,2,3]);
var newIterator = iterator.map(value => value + 3);

newIterator.next();
// { value: 4, done: false }
newIterator.next();
// { value: 5, done: false }
newIterator.next();
// { value: 6, done: false }
```
#### 补充: 延迟运算(Lazy evaluation)
延迟运算，或说 call-by-need，是一种运算策略(evaluation strategy)，简单来说我们延迟一个表达式的运算时机直到真正需要它的值在做运算。
以下我们用 generator 实作 iterator 来举一个例子
```
function* getNumbers(words) {
        for (let word of words) {
            if (/^[0-9]+$/.test(word)) {
                yield parseInt(word, 10);
            }
        }
    }

    const iterator = getNumbers('30 天精通 RxJS (04)');

    iterator.next();
    // { value: 3, done: false }
    iterator.next();
    // { value: 0, done: false }
    iterator.next();
    // { value: 0, done: false }
    iterator.next();
    // { value: 4, done: false }
    iterator.next();
    // { value: undefined, done: true }
}
```
这么我们写了一个函数用来抓取字串中的数字，在这个函数中我们用 for...of 的方式来取得每个字符并用正则表示式来判断是不是数值，如果为真就转成数值并回传。当我们把一个字串丢进 getNumbers 函式时，并没有马上运算出字串中的所有数字，必须等到我们执行 next() 时，才会真的做运算，这就是所谓的延迟运算(evaluation strategy)
## Observable
在了解 Observer 跟 Iterator 后，不知道大家有没有发现其实 Observer 跟 Iterator 有个共通的特性，就是他们都是渐进式(progressive) 的取得数据，差别只在于 Observer 是生产者(Producer)推送数据(push)，而 Iterator 是消费者(Consumer)拉数据(pull)!

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-48b8319d3a3ad25c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Observable 其实就是这两个 Pattern 思想的结合，Observable 具备生产者推送数据的特性，同时能像数组，拥有数组处理数据的方法(map, filter...)！

下节讲 如何创建 Observable 。

参考：
http://es6.ruanyifeng.com/#docs/iterator
