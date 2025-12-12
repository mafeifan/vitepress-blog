有时候我们想新建某类型文件的时候，默认出现一些基础代码，而不是空白的。
比如当新建一个 html 文件
基础代码是这样的：
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

</body>
</html>
```
同理，当新建php文件，我希望是这样：
```
<?php
/**
 * Created by PhpStorm
 * Author Finley Ma <公司邮箱地址>
 * Date: 2018/7/5
 * Time: 下午11:56
 */
```

其实 PHPStorm 已经预设了一些信息， Editor - File and Code Templates
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-19de985d4c779a2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关于 `#parse("PHP File Header.php")` 可以理解为一种语法指令

PHP File Header.php 在 Includes Tab 下面，一看就是方便复用的

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-6719c87219b57ef1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

比如，我在Files Tab下新建一个"JavaScript File", 内容照样填 `#parse("PHP File Header.php")`
这样，当新建一个JS文件的效果和PHP一样了。
