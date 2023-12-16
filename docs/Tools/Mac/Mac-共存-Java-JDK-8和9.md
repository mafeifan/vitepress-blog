## 安装

正常安装`JDK 1.8`和`JDK 9`即可,`JAVA 8`对应的就是`JDK 1.8`，`JAVA 9`对应的`JDK 9`。

安装地址:[http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

查看版本，终端输入`java -version`


## [](https://blog.zhaochunqi.com/2018/03/09/add-java8-along-with-java9/#%20%E5%88%87%E6%8D%A2 "切换")切换

安装好之后，可以使用如下命令找到`JAVA 8`和`JAVA 9`的位置。

*   JAVA 8

`/usr/libexec/java_home  -v 1.8`
输出
/Library/Java/JavaVirtualMachines/jdk-9.0.4.jdk/Contents/Home

*   JAVA 9

`/usr/libexec/java_home -v 9`
输出
/Library/Java/JavaVirtualMachines/jdk1.8.0_211.jdk/Contents/Home

在 .zshrc 或 .bashrc 中，添加如下内容:

```
# 设置 JDK 8
export JAVA_8_HOME=`/usr/libexec/java_home -v 1.8`
# 设置 JDK 9
export JAVA_9_HOME=`/usr/libexec/java_home -v 9.0`

# 默认用 JDK 8
export JAVA_HOME=$JAVA_8_HOME
# export PATH=$JAVA_HOME/bin:$PATH

# 切换 Java 版本命令
alias jdk8="export JAVA_HOME=$JAVA_8_HOME"
alias jdk9="export JAVA_HOME=$JAVA_9_HOME"
```
保存后重新打开终端或 source ~/.zshrc 或   source ~/.bashrc

效果
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-0abe27945048b5e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 参考
[https://chessman-126-com.iteye.com/blog/2162466](https://chessman-126-com.iteye.com/blog/2162466)
