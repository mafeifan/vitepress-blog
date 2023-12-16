在setInterval和setTimeout中传入函数时，函数中的this会指向window对象。
```javascript
function LateBloomer() {
  this.petalCount = Math.ceil(Math.random() * 12) + 1;
}

// Declare bloom after a delay of 2 second
LateBloomer.prototype.bloom = function() {
  // 这个写法会报 I am a beautiful flower with undefined petals!
  // 原因：在setInterval和setTimeout中传入函数时，函数中的this会指向window对象
  window.setTimeout(this.declare, 2000);
  // 如果写成 window.setTimeout(this.declare(), 2000); 会立即执行，就没有延迟效果了。
};

LateBloomer.prototype.declare = function() {
  console.log('I am a beautiful flower with ' +
    this.petalCount + ' petals!');
};

var flower = new LateBloomer();
flower.bloom();  // 二秒钟后, 调用'declare'方法
```

#### 解决办法：
推荐用下面两种写法
1.  将bind换成call,apply也会导致立即执行，延迟效果会失效
`window.setTimeout(this.declare.bind(this), 2000);`
2. 使用es6中的箭头函数，因为在箭头函数中this是固定的。
// 箭头函数可以让setTimeout里面的this，绑定定义时所在的作用域，而不是指向运行时所在的作用域。
// 参考：[箭头函数](http://es6.ruanyifeng.com/#docs/function#箭头函数)
` `window.setTimeout(() => this.declare(), 2000);`
