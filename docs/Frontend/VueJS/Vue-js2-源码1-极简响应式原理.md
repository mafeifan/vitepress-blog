[Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

```html
<!DOCTYPE html>
<html>
<body>
<div id="app">
	<input type="text" id="txt">
	<p id="show"></p>
</div>
<script type="text/javascript">
var obj = {}

Object.defineProperty(obj, 'txt', {
// get: function () {
//   return obj
// },
set: function (newValue) {
  document.getElementById('txt').value = newValue
  document.getElementById('show').innerHTML = newValue
}
})
document.getElementById('txt').addEventListener('keyup', function (e) {
	obj.txt = e.target.value
})

</script>
</body>
</html>
```

DevTools中随便输入 `obj.txt = '12321z@2'`，页面两处会相应的发生变化。

#### 参考
https://www.cnblogs.com/kidney/p/8018226.html
