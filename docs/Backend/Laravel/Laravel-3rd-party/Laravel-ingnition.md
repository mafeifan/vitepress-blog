Laravel6中的异常详情页面很强大，新增了很多实用功能。看起来如下：

> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/AE8FD945BE6F686A4D85C17947C30A1D.jpg)

根据官网介绍：
Laravel 自带了 [Ignition](https://github.com/facade/ignition)，这是一个由 Freek Van der Herten 与 Marcel Pociot 创建的关于异常详情页面的新的开源项目。相较之前的版本，Ignition 具有许多优势，比如改进的错误页面 Blade 文件与行号处理、对常见问题的运行时解决、代码编辑、异常共享以及改进的用户体验。

主要有以下特点：
1.可以与Telescope集成，如果你的项目同时也安装了Telescope，右上角的链接可以定位到Telescope的异常记录中

> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/762195B0-00B2-47FA-9FA3-1D75EB952E45.png)

2.如果是某些拼写导致的错误，ignition会给出建议提醒，例如上面的 "Did you mean home.table?"

3.分享功能，如果你希望把该错误分享给项目其他组员，点击"Share"，然后点击剪切板图标，会得到一个分享地址，类似
https://flareapp.io/share/17xDBK7b，可以把该地址分享给他人，默认该地址任何人都可以看到。
如果是私有项目，可以点击"Open share admin"这样可以随时删除该分享地址。

> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/233778AC0E1BE6A8B322E084631713FB.jpg)

4.在Stack trace，也就是堆栈追踪页面，鼠标放到代码行中，后面会出现编辑图标，点击就可以用PHPStorm打开该文件，并定位到该行，其原理是 URL schema
应用内跳转
比如浏览器打开的地址是`phpstorm://open?file=%2FUsers%2Fmafei%2Fsites%2Flara6-golf%2Fvendor%2Flaravel%2Fframework%2Fsrc%2FIlluminate%2FView%2FFileViewFinder.php&line=131`
就会启动phpstorm，打开文件`/Users/mafei/sites/lara6-golf/vendor/laravel/framework/src/Illuminate/View/FileViewFinder.php`
并定位到131行
