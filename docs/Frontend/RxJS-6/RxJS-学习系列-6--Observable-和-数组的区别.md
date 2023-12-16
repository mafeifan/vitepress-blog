Observable  和 数组都有filter, map 等运算操作operators，具体的区别是什么？
主要是两点：

1. 延迟运算
2. 渐进式取值

## 延迟运算
延迟运算很好理解，所有 Observable 一定会等到订阅后才开始对元素做运算，如果没有订阅就不会有运算的行为
```
var source = Rx.Observable.from([1,2,3,4,5]);
var example = source.map(x => x + 1);
```
上面这段代码因为 Observable 还没有被订阅，所以不会真的对元素做运算，这跟数组的操作不一样，如下
```
var source = [1,2,3,4,5];
var example = source.map(x => x + 1); 
```
上面这段代码执行完，example 就已经取得所有元素的返回值了。

数组的运算都必须完整的运算出每个元素的返回值并组成一个新数组，再做下一个运算。

## 渐进式取值

数组的 operators 都必须完整的运算出每个元素的返回值并组成一个数组，再做下一个 operator 的运算，我们看下面这段程式码

```
var source = [1,2,3];
var example = source
  .filter(x => x % 2 === 0) // 这裡会运算并返回一个完整的数组
  .map(x => x + 1) // 这裡也会运算并返回一个完整的数组
```

上面这段代码，相信读者们都很熟悉了，大家应该都有注意到 `source.filter(...)`就会返回一整个新数组，再接下一个 operator 又会再返回一个新的数组，这一点其实在我们实现 map 跟 filter 时就能观察到

```
Array.prototype.map = function(callback) {
    var result = []; // 建立新数组
    this.forEach(function(item, index, array) {
        result.push(callback(item, index, array))
    });
    return result; // 返回新数组
}
```

每一次的 operator 的运算都会建立一个新的数组，并在每个元素都运算完后返回这个新数组，我们可以用下面这张动态图表示运算过程

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-872292e72dde44c6.gif?imageMogr2/auto-orient/strip)

Observable operator 的运算方式跟数组的是完全的不同，虽然 Observable 的 operator 也都会回传一个新的 observable，但因为元素是渐进式取得的关系，所以每次的运算是一个元素运算到底，而不是运算完全部的元素再返回。

```
var source = Rx.Observable.from([1,2,3]);
var example = source
  .filter(x => x % 2 === 0)
  .map(x => x + 1)

example.subscribe(console.log);

```

上面这段程式码运行的方式是这样的

1.  送出 `1` 到 filter 被过滤掉
2.  送出 `2` 到 filter 在被送到 map 转成 `3`，送到 observer `console.log` 印出
3.  送出 `3` 到 filter 被过滤掉

每个元素送出后就是运算到底，在这个过程中不会等待其他的元素运算。这就是渐进式取值的特性，不知道读者们还记不记得我们在讲 Iterator 跟 Observer 时，就特别强调这两个 Pattern 的共同特性是渐进式取值，而我们在实现 Iterator 的过程中其实就能看出这个特性的运作方式

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

var myIterator = new IteratorFromArray([1,2,3]);
var newIterator = myIterator.map(x => x + 1);
newIterator.next(); // { done: false, value: 2 }
```

虽然上面这段代码是一个非常简单的示范，但可以看得出来每一次 map 虽然都会返回一个新的 Iterator，但实际上在做元素运算时，因为渐进式的特性会使一个元素运算到底，Observable 也是相同的概念，我们可以用下面这张动态图表示运算过程

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4b20a6ebaaacdc16.gif?imageMogr2/auto-orient/strip)

渐进式取值的观念在 Observable 中其实非常的重要，这个特性也使得 Observable 相较于 Array 的 operator 在做运算时来的高效很多，尤其是在处理大量资料的时候会非常明显！
(想像一下我们今天要切五万个大蛋糕，你会选择切完一个请一个人拿走，还是全部切完再拿给所有人呢？哪个会比较有效率呢？)
