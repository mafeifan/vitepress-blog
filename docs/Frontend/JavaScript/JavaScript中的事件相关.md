## 冒泡与捕获的由来

我们知道HTML中的元素是可以嵌套的，形成类似于树的层次关系。比如下面的代码：

```html
<div id="outA" style="height:300px;width:300px;padding:50px;background:gray;">A  
    <div id="outB" style="height:200;width:200px;padding:50px;background:blue;"> B 
		<div id="outC" style="height:100px;width:100px;background:yellow;">C</div>   
    </div> 
</div>
```

然后效果如下：

![image.png](https://www.mafeifan.com/images/0821_event/1.png)


如果点击了最里面的outC，那么外层的outB和outC算不算被点击了呢？很显然算，不然就没有必要区分事件冒泡和事件捕获了，这一点各个浏览器厂家也没有什么疑义。假如outA、outB、outC都注册了click类型事件处理函数，当点击outC的时候，触发顺序是A-->B-->C，还是C-->B-->A呢？

如果浏览器采用的是事件冒泡，那么触发顺序是C-->B-->A，由内而外，像气泡一样，从水底浮向水面；如果采用的是事件捕获，那么触发顺序是A-->B-->C，从上到下，像石头一样，从水面落入水底。

一般来说事件冒泡机制，用的更多一些，所以在IE8以及之前，IE只支持事件冒泡。IE9+/FF/Chrome这2种模型都支持，可以通过`addEventListener((type, listener, useCapture)`的useCapture来设定，useCapture=false代表着事件冒泡，useCapture=true代表着采用事件捕获。


## DOM事件流

假如我们在outC元素上同时绑定了冒泡和捕获两种阶段的事件
```javascript
  window.onload = function(){     
    var outC = document.getElementById("outC");    
      
    // 目标(自身触发事件,是冒泡还是捕获无所谓)  
    outC.addEventListener('click',function(){alert("target1");},false);  
    outC.addEventListener('click',function(){alert("target2");},true);        
  };  
```


是冒泡先执行还是会捕获先执行呢。答案：对于自身触发事件,是冒泡还是捕获无所谓。先注册的先执行，后注册的后执行。

另外要理解DOM事件流，DOM事件流：将事件分为三个阶段：捕获阶段、目标阶段、冒泡阶段。先调用捕获阶段的处理函数，其次调用目标阶段的处理函数，最后调用冒泡阶段的处理函数。

更近一步，给三个div都绑定冒泡和捕获事件。想想，如果分别点击ABC三个div，执行顺序是什么呢？
```javascript
  window.onload = function(){  
      var outA = document.getElementById("outA");    
      var outB = document.getElementById("outB");    
      var outC = document.getElementById("outC");    
        
      // 目标(自身触发事件,是冒泡还是捕获无所谓)  
      outC.addEventListener('click',function(){alert("target2");},true);  
      outC.addEventListener('click',function(){alert("target1");},false);  
        
      // 事件冒泡  
      outA.addEventListener('click',function(){alert("bubble1");},false);  
      outB.addEventListener('click',function(){alert("bubble2");},false);  
        
      // 事件捕获  
      outA.addEventListener('click',function(){alert("capture1");},true);  
      outB.addEventListener('click',function(){alert("capture2");},true); 
  }; 
```

点击C

分析：
捕获阶段：从最外层到元素C，先执行各个元素上的点击事件capture1->capture2
目标阶段：C上绑定了两个单击事件，按绑定顺序依次执行target2->target1
冒泡阶段：从内到外bubble2->bubble1

最终的执行顺序: capture1->capture2->target2->target1->bubble2->bubble1

点击B，执行顺序: capture1->bubble2->capture2->bubble1
点击A，执行顺序: bubble1->capture1

## 阻止事件冒泡和捕获

默认情况下，多个事件处理函数会按照DOM事件流模型中的顺序执行。如果子元素上发生某个事件，不需要执行父元素上注册的事件处理函数，那么我们可以停止捕获和冒泡，避免没有意义的函数调用。
IE8以及以前可以通过 `window.event.cancelBubble=true`阻止事件的继续传播；IE9+/FF/Chrome通过event.stopPropagation()阻止事件的继续传播。

修改代码
```javascript
  // 目标  
  outC.addEventListener('click',function(event){  
      alert("target");  
      event.stopPropagation();  
  },false);  

  // 事件冒泡  
  outA.addEventListener('click',function(){alert("bubble");},false);  

  // 事件捕获  
  outA.addEventListener('click',function(){alert("capture");},true);     
```

当点击outC的时候，只会打印出capture->target，不会打印出bubble。因为当事件传播到outC上的处理函数时，通过stopPropagation阻止了事件的继续传播，所以不会继续传播到冒泡阶段。

继续修改代码

```javascript
	// 目标  
	outC.addEventListener('click',function(event){ alert("target");}, false);  

	// 事件冒泡  
	outA.addEventListener('click',function(){ alert("bubble");}, false);  

	// 事件捕获  
	outA.addEventListener('click',function(event){ 
		alert("capture"); 
		event.stopPropagation();
	}, true);           
```

当点击outC的时候，只会打印出capture而没有触发outC上的事件处理函数。
因为outA上的捕获事件是先执行的，触发了里面event.stopPropagation()就不会再执行任何传播事件了。

## 引申 
preventDefault, stopPropagation, stopImmediatePropagation和return false的区别

preventDefault, stopPropagation, stopImmediatePropagation都是event提供的方法

### [event.stopPropagation](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation)
event.stopPropagation阻止捕获和冒泡阶段中当前事件的进一步传播。

### [event.preventDefault](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault)

如果事件可取消，则取消该事件，而不停止事件的进一步传播。
它可以阻止事件触发后默认动作的发生。

可用来阻止input框非法内容的输入，checkbox被选中等

::: warning
注意：preventDefault 方法不会阻止该事件的进一步冒泡。stopPropagation 方法才有这样的功能.
:::


### [event.stopImmediatePropagation](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation)

这个方法会做两件事情： 

Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.

第一件事：阻止绑定在事件触发元素的其他同类事件的运行，看下面的例子就很明白：

```javascript
$("p").click(function(event) {
  event.stopImmediatePropagation();
});
$("p").click(function(event) {
  // 不会执行以下代码
  $(this).css("background-color", "#f00");
});
```

第二件事，阻止事件传播到父元素，这跟stopPropagation的作用是一样的。

stopImmediatePropagation比stopPropagation多做了第一件事情，这就是他们之间的区别。

::: warning
注意：不要用return false;来阻止event的默认行为，原因[见](http://www.cnblogs.com/dannyxie/p/5642727.html)

:::

### 关于 addEventListener 和 on
使用on后面的会覆盖前面事件，而addEventListener不会
比如页面上有 `<div id="box">追梦子</div>`

```javascript
window.onload = function(){
  var box = document.getElementById("box");
  box.onclick = function(){
    console.log("我是box1");
  }
  box.onclick = function(){
    box.style.fontSize = "18px";
    console.log("我是box2");
  }
}
```
运行结果："我是box2"

```javascript
window.onload = function(){
  var box = document.getElementById("box");
  box.addEventListener("click",function(){
    console.log("我是box1");
  })
  box.addEventListener("click",function(){
    console.log("我是box2");
  })
}
```
运行结果：我是box1, 我是box2

关于addEventListener的第三个参数，true代表捕获阶段处理, false代表冒泡阶段处理。不写默认false。

### 参考
https://developer.mozilla.org/zh-CN/docs/Web/API/event
http://www.cnblogs.com/dannyxie/p/5642727.html
