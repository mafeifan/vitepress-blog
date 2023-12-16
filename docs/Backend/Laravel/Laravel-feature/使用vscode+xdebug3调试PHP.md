一直用phpstorm做php项目，发现vscode调试更简单，记录下流程

## xdebug 3 和 2 的区别

详细见[官方文档](https://xdebug.org/docs/upgrade_guide)

个人简单翻译下

### 新概念

与Xdebug 2不同，在Xdebug 2中，每个功能都有一个启用设置，使用Xdebug 3，可以将Xdebug置于特定模式下，如debug或develop。
关于mode，[YouTube](https://www.youtube.com/watch?v=HF61HJHEYMk&ab_channel=DerickRethans) 上有个非常好介绍,xdebug作者讲的。
推荐写成`xdebug.mode=debug,develop`

该配置与`xdebug.start_with_request`结合使用。
其背后的想法是Xdebug仅具有实际需要的功能的开销。例如，同时激活`Profiling`和`Step Debugging`功能是没有意义的。
除了使用`xdebug.mode`设置模式外，还可以使用`XDEBUG_MODE`环境变量来设置模式 。`XDEBUG_MODE`环境变量的值会覆盖通过`xdebug.mode`设置的值。
开启`Step Debugging`
之前是
```
xdebug.remote_enable=1
xdebug.default_enable=0
xdebug.profiler_enable=0
xdebug.auto_trace=0
xdebug.coverage_enable=0
```
现在只需要修改php.ini为`xdebug.mode=debug`或者直接在命令行执行
```
export XDEBUG_MODE=debug
php script-name.php
```
此外可以使用`xdebug_info()`方法查看Xdebug的配置信息,还会输出相关的调式连接的诊断信息和文件权限信息

### Step Debugging

#### 命令行激活

默认调试端口已从更改 9000 为 9003。
`xdebug.client_port=9003`

> Instead of setting the XDEBUG_CONFIG environment variable to idekey=yourname, you must set XDEBUG_SESSION to yourname

不用再配置IDE Key`idekey=yourname`，需要设置`XDEBUG_SESSION`，比如`export XDEBUG_SESSION=xdebug_is_great`

#### 自动开启debugger

> The xdebug.remote_autostart setting has been removed. Instead, set xdebug.start_with_request to yes.

`xdebug.remote_autostart`配置已被删除。而是将`xdebug.start_with_request`设置为yes。

#### 请求时启动debugger

> In Xdebug 3 calling xdebug_break() will only initiate a debugging session when xdebug.start_with_request is set to trigger.

在Xdebug 3中，仅当`xdebug.start_with_request`设置为`trigger`时，调用`xdebug_break()`才会启动调试session。

> It will no longer trigger a debugging session when xdebug.start_upon_error=yes (the replacement for Xdebug 2's xdebug.remote_mode=jit).

当`xdebug.start_upon_error = yes`（xdebug2中对应的配置项是`xdebug.remote_mode=jit`）时，它将不再触发调试会话。

> A debug session will be initiated upon a PHP Notice or Warning, or when a Throwable is thrown, when xdebug.start_upon_error is set to yes, regardless of what the value for xdebug.start_with_request is.

不管`xdebug.start_with_request`的值是什么,当`xdebug.start_upon_error`被设置为yes,当发生了PHP Notice或Warning时启动，或者有Throwable抛出。debugging session就会启动

#### 修改了xdebug_break()函数行为

xdebug_break()

>  This function will no longer initiate a debugging session when xdebug.start_upon_error is set to yes (the replacement for Xdebug 2's xdebug.remote_mode=jit).

当`xdebug.start_upon_error`设置为yes(xdebug2中对应的配置项是`xdebug.remote_mode=jit`)时，此函数不在初始化debugging session

>  It will still initate a debugging request when xdebug.start_with_request is set to trigger.

重命名了很多函数名和常量名，这个不再翻译了

## vscode中使用xdebug3调试

本机环境
MacOS

php7.3.28 with Xdebug v3.0.4

xdebug配置项：
```
zend_extension="xdebug.so"
xdebug.mode=debug,develop
xdebug.start_with_request = yes
xdebug.client_host = localhost
xdebug.client_port = 9003
xdebug.start_with_request = yes
```

1. vscode 安装PHP Debug扩展
2. 打开vscode的setting页面， 确保勾选了Debug: Allow Breakpoints Everywhere
![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919194734.png)

开启debug 选择php，选择创建 config

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919211029.png)

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919211105.png)

#### 命令行调试

勾选绿色运行按钮，php文件中打个断点，新建terminal，命令行运行我们要调试的php文件
`php xdebug-example.php`, 由于我们这里以Laravel为例，可以是`php artisan generate:slug`

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919211508.png)

#### 浏览器请求调试

非常简单，开启调试，浏览器打开php地址就可以了， 比如`http://php.test/test/xdebug.php`

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919212439.png)

有时候我们不需要修改ini文件，可以通过环境变量形式传入xdebug配置参数，如下：
```
php -dxdebug.mode=debug -dxdebug.client_host=127.0.0.1 -dxdebug.client_port=9003 -dxdebug.start_with_request=yes path/to/script.php 
php -dxdebug.mode=debug -dxdebug.client_host=127.0.0.1 -dxdebug.client_port=9003 -dxdebug.start_with_request=yes artisan inspire
```

## 参考

https://www.jetbrains.com/help/phpstorm/configuring-xdebug.html#configuring-xdebug-vagrant

https://www.youtube.com/watch?v=HF61HJHEYMk&ab_channel=DerickRethans
