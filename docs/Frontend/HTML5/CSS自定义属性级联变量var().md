### 语法

定义语法：--variableName: value;

变量名称（`variableName`）使用规范：

*   以"--"开头，后面可以是数字、字母、下划线、连字符、汉字等，但不能包含$、[、^、(、%等字符
*   大小写敏感（另:CSS中，书写属性名时大小写不敏感，但是书写选择器时大小写敏感）
*   定义只能出现在块{}内
*   可以使用**!important**修饰
*   作用域就是选择器的选定范围，作用域出现交叉时，同名变量覆盖规则取决于[选择器权重](https://www.w3.org/TR/CSS2/cascade.html#important-rules)

```
<style type="text/css">
  /* 这里定义的变量是全局的 */
  :root {
    --main-bg-color: brown;
    --1: red;
    --_: blue;
    --飞: green;
  }

/*  -fz1 相当于局部变量，在其他地方不能用 */
  p {
    --fz14: 14px;
    color: var(--1);
  }

  em {
    color: var(--飞);
    /* 第二个参数是默认值 */
    font-size: var(--fz14， 16px);
  }
</style>
```

#### 使用限制
*   CSS自定义属性变量是不能用作CSS属性名称的，比如：`var(--color): red`;
*   不能用作背景地址，比如：`url(var(--url))`；
*   由于var()后面会默认跟随一个空格，因此在其后面加单位是无效的，比如：`--size:20; font-size: var(--size)px`会解析成`font-size: 20 px`;

不能直接和数值单位连用
```
 .foo {
  --gap: 20;
  /* 无效 */
  margin-top: var(--gap)px;
}
```

使用 calc() 函数，将它们连接。
```
.foo {
  --gap: 20;
  margin-top: calc(var(--gap) * 1px);
}
```

### 兼容性
目前现代浏览器都支持
检测方法
1. 使用 [@supports](https://docs.webplatform.org/wiki/css/atrules/@supports)方法
```
@supports ( (--size: 0)) { 
   /* 支持 */
}
 
@supports ( not (--size: 0)) {
  /* 不支持 */
} 
```
2. 使用 JavaScript
```
 if (window.CSS && window.CSS.supports && window.CSS.supports('--size', 0)) {
   /* 支持 */
 }
```

### 作用域
与 CSS 的"层叠"（cascade）规则是一致的。
看[例子](https://codepen.io/mafeifan/pen/pXeXra)

### JavaScript 操作
```
varrootStyles = getComputedStyle(document.documentElement);
varvalue = rootStyles.getPropertyValue('--variableName');

// 获取某个元素中定义的属性变量 
value = element.style.getPropertyValue('--variableName');

// 设置变量
document.body.style.setProperty('--primary', '#7F583F');

// 读取变量
document.body.style.getPropertyValue('--primary').trim();
// '#7F583F'

// 删除变量
document.body.style.removeProperty('--primary');
```

操作前
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-68d6ac8771aecf06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

操作后
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-67ec33b8b16308eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 响应式布局
可以结合媒体查询实现不同的尺寸采用不同的变量值
```
/* 先定义一些变量，如主配色和次要配色 */
body {
    --primary: red;
    --secondary: blue;
}

/* 为元素应用配色 */
a {
  color: var(--primary);
  text-decoration-color: var(--secondary);
}

/* 当小屏幕使用另外一套配色方案 */
@media screen and (min-width: 768px) {
  body {
      --primary:  black;
      --secondary: orange;
  }
}
```

> ![示例](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a69dcd4f77849b46.gif?imageMogr2/auto-orient/strip)

### 参考
[https://www.cnblogs.com/bibibobo/p/6140659.html](https://www.cnblogs.com/bibibobo/p/6140659.html)
[http://www.ruanyifeng.com/blog/2017/05/css-variables.html](http://www.ruanyifeng.com/blog/2017/05/css-variables.html)

