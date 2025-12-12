原文：https://developers.google.com/web/updates/2017/08/devtools-release-notes#await
### 1. 截图
以前截取网页我都用qq，直接ctrl+alt+a。现在chrome自带了截图功能，可以截取指定区域或者指定dom元素。

> ![screenshot.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1670641891e03758.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

截取指定区域：按ctrl+shift+c, 然后按住鼠标左键不放，选取网页区域，最后松手会下载截图的图片。
截取指定dom元素：右键检查元素，按ctrl+shift+P打开命令面板。输入"capture node"。然后回车，就会下载内容为指定元素的图片。

### 2. 新api

在console中，可以直接使用queryObjects查询特定的constructor
  * queryObjects(Promise). 返回所有的 Promises.
  * queryObjects(HTMLElement). 返回所有的 HTML elements.
  * queryObjects(foo),  foo是函数名。返回所有实例化new foo()后的对象。


### console
大部分人经常用 console.log() 
使用 keys(console) 打印所有方法，keys 和 values 类似 Object.keys，Object.values 只在调试面板有用。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e7b3d5b18fdfbe86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

各个方法的详细用法请查看 https://developers.google.com/web/tools/chrome-devtools/console/utilities

### $

看到$大家不要以为是jquery，其实是浏览器自带的一些api。这个在调试上就比较方便！

**$:返回第一个符合条件的元素，相当于document.querySelector**

**$$:返回所有符合条件的元素，相当于document.querySelectorAll**


#### 查找和监控事件

`getEventListeners`作用就是查找并获取选定元素的事件。用法如下

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-30bd00908293a6fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`monitorEvents`作用是监控你所选元素关联的所有事件，事件触发时，在控制台打印它们。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-55c3ee5385ef9fd7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-9cf8708da9619b50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`getEventListeners`和`monitorEvents`感觉在开发上用得并不多了，至少我没用过。但是感觉会有用，就提及一下

类似可以使用 `monitor` 来监控函数，每次调用该函数，就会打印出传入的参数。
```
var func1 = function(x, y, z) {
//....
};
```
输出：
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-29da5f9e0b125bfd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


参考：
* [14个你可能不知道的JavaScript调试技巧](https://segmentfault.com/a/1190000011857058)
https://developers.google.com/web/tools/chrome-devtools/console/utilities
[https://juejin.im/post/5d09c39ee51d4576bc1a0e07](https://juejin.im/post/5d09c39ee51d4576bc1a0e07)
