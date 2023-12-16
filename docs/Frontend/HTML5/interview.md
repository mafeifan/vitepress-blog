1. z-index 只对position属性值是非static的元素有效
2. position:absolute和position:fixed都会导致元素脱离文档流
3. flex:1 的含义，是`flex: 1 1 auto;`的缩写，`flex-grow:1; flex-shrink:1; flex-basis:1`

#### css中box-sizing的属性
应该如何计算一个元素的总宽度和总高度。

content-box  是默认值。如果你设置一个元素的宽为100px，那么这个元素的内容区会有100px 宽，并且任何边框和内边距的宽度都会被增加到最后绘制出来的元素宽度中。

border-box 告诉浏览器：你想要设置的边框和内边距的值是包含在width内的。
也就是说，如果你将一个元素的width设为100px，那么这100px会包含它的border和padding，内容区的实际宽度是width减去(border + padding)的值。
大多数情况下，这使得我们更容易地设定一个元素的宽高。


