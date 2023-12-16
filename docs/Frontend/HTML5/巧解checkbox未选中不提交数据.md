[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/checkbox) 已经说的很清楚，

注意： 若表单提交时，checkbox未勾选，则提交的值并非为value=unchecked；此时的值不会被提交到服务器

但是我们想实现不勾选也能提交到后台呢。
发现了一个利用hidden巧妙提交的办法。

```html
<form method="post">
	<input type="hidden" name="foo" value="0">
	<input type="checkbox" name="foo" id="foo" value="1">
    <input type="submit" value="submit">
</form>
```

生成这样的表单，当checkbox未选中的时候，提交的是hidden表单。值0就被提交到服务器了。
当checkbox都选中的时候，hidden和checkbox表单都被提交了，但是因为它们的name是一样的，所以hidden的值被checkbox覆盖了。所以就得到了数值1。

在PHP中，如果有多个name相同的表单，都可以post到服务器

### 参考
https://www.cnblogs.com/jcydd/p/10590440.html
