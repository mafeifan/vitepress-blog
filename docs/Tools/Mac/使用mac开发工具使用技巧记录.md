2021.07.30

新Mac买来了，如何配置软件安装配置流程

学习了几个思路：
1. ~/.zshrc 放到 github gist
2. 几个小工具

磁盘文件分析 http://www.derlien.com/
![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210730101650.png)
窗口管理 https://github.com/rxhanson/Rectangle
Video Speed Controller https://chrome.google.com/webstore/detail/video-speed-controller/nffaoalbilbmmfgbnbgppjihopabppdk?hl=en

推荐这篇[文章](https://xiaozhou.net/learn-the-command-line-iterm-and-zsh-2017-06-23.html)
只说几个爽的地方:

2019.06.04
1. 安装 `brew install tree`
2. 查看命令 `tree -h`
3. 查看树形文件目录

### 快速跳转
Zsh支持目录的快速跳转，我们可以使用 d 这个命令，列出最近访问过的各个目录，然后选择目录前面的数字进行快速跳转：
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-2d32861afd1b9953.gif?imageMogr2/auto-orient/strip)

### 重复上一条命令
输入 r ，可以很便捷的重复执行上一条命令。

通过插件
### web-search
一个方便的终端搜索工具，支持大多常用的搜索引擎，比如：

输入 baidu hhkb pro2 直接在浏览器打开百度搜索关键字”hhkb pro2”
输入 google minila air 直接在浏览器打开Google搜索关键字”minila air”

### 快捷键
另外请记住并常用这些快捷键

* ctrl+p shell中上一个命令,或者 文本中移动到上一行
* ctrl+n shell中下一个命令,或者 文本中移动到下一行
* ctrl+r 往后搜索历史命令
* ctrl+s 往前搜索历史命令
* ctrl+f 光标前移
* ctrl+b 光标后退
* ctrl+a 到行首
* ctrl+e 到行尾
* ctrl+d 删除一个字符,删除一个字符，相当于通常的Delete键
* ctrl+h 退格删除一个字符,相当于通常的Backspace键
* ctrl+u 删除到行首
* ctrl+k 删除到行尾
* ctrl+l 类似 clear 命令效果
* ctrl+y 粘贴

## 参考

https://www.swyx.io/new-mac-setup-2021/

https://xiaozhou.net/learn-the-command-line-iterm-and-zsh-2017-06-23.html
