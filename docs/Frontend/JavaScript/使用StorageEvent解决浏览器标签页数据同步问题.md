localStorage 大家应该都不会陌生，可以记录一些非敏感的网站数据，比如购物车内的商品数量。
但是有个问题是，如果用户用浏览器打开了多个Tab。在一个 Tab 中添加一个商品到购物车，其他 Tab 的购物车数量并不会发生变化。
这时候可以考虑使用 [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
当修改了(localStorage或sessionStorage)数据时，会触发此事件。

使用StorageEvent非常简单，代码如下：
```
window.addEventListener('storage', () => {
  // When local storage changes, dump the list to
  // the console.
  console.log(JSON.parse(window.localStorage.getItem('sampleList')));    
});
```
其他写法：
```
window.onstorage = () => {
  // When local storage changes, dump the list to
  // the console.
  console.log(JSON.parse(window.localStorage.getItem('sampleList')));    
};
```
购物车的完整例子，你可以开多个tab实验：
[https://jsbin.com/radekilosu/1/edit?html,css,js,output](https://jsbin.com/radekilosu/1/edit?html,css,js,output)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-cba1808d6be4635a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

另外事件e上还带有很多信息，方便做更多控制。

字段 | 含义
-|-
key	|发生变化的storageKey |
newValue | 变换后新值|
oldValue	| 变换前原值 |
storageArea | 相关的变化对象|
url	|触发变化的URL，如果是frameset内，则是触发帧的URL|

关于兼容性：最新的火狐，Chrome，Edge的支持，IE未知

