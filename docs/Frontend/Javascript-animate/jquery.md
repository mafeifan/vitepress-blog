使用jQuery创建动画是件非常容易的事情，只需要掌握提供的animate API

### animate API

[官网解释 animate api](https://api.jquery.com/animate/#animate-properties-options)
```javascript
$(selector).animate({params},[speed],[easing],[fn]);
```   

* params: 一组包含作为动画属性和终值的样式属性和及其值的集合
* speed: 可以填三种预定速度之一的字符串("slow" 600ms,"normal" 400ms, "fast" 200ms)或者直接填毫秒数值，默认400
* easing: 要使用的擦除效果的名称(需要插件支持). 默认jQuery提供"linear" 和 "swing".
* fn: 在动画完成时执行的函数，每个元素执行一次
 
例子，点击按钮让这个元素偏移一定像素
```javascript
$("button").click(function(){
  $("div").animate({left:'250px'});
}); 
```
 
### slideUp 等二次封装的方法

其中，jQuery还提供了方便的方法,其实是语法糖,对animate方法的二次封装

hide，show分别修改元素的display属性为none和block

slideUp(收缩高度),slideDown(还原高度),本质是随时间修改元素的高度

fadeIn(淡入), fadeOut(淡出)，本质是随时间修改元素的opacity属性

详细的例子可以[见w3school](https://www.w3school.com.cn/jquery/jquery_animate.asp)

jQuery自带效果有限，可以使用 [jQuery Easing Plugin](http://gsgd.co.uk/sandbox/jquery/easing/)
另外[jQuery UI](https://jqueryui.com/hide/) 提供了更多的特效，如颤动，心跳，爆炸等

### animate 队列

jQuery的animate还支持队列，逐帧播放

```javascript
$("button").click(function(){
  var div=$("div");
  div.animate({left:'100px'},"slow");
  div.animate({fontSize:'3em'},"slow");
});
```

### loop 循环播放
借助animate API最后一个callback参数，可以轻松实现无尽播放动画的效果。

```html
<iframe height="265" style="width: 100%;" scrolling="no" title="jquery animation loop" src="https://codepen.io/mafeifan/embed/ExPJpRo?height=265&theme-id=light&default-tab=html,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/mafeifan/pen/ExPJpRo'>jquery animation loop</a> by finley
  (<a href='https://codepen.io/mafeifan'>@mafeifan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
```


### 使用场景
1. 不支持loop
2. 不支持滚动条滚动播放
