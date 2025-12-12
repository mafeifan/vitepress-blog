写 pipeline 就是写 Groovy 代码，Jenkins pipeline 其实就是基于Groovy语言实现的一种DSL。
了解一些Groovy语法知识是很有必要的

Groovy是一门同时具有静态和动态特定的脚本语言，或者胶水语言，也是面向对象的。非常适合编写简洁容易的自动化测试代码，例如我再次强调的pipeline的构建任务，就是一个典型的使用领域。

Groovy是apache下的一个产品，所以叫Apache Groovy，官网地址是http://groovy-lang.org/

Groovy是由 James Strachan 设计，第一个发布版本在2003年。

核心特点就是Java平台的多面语言，下面特点就是描述这个多面。

Flat learning curve

* 直接翻译就是平坦的学习曲线，什么可读性强，简洁，表达性强的，易于Java开发人员学习的编程语言。

Powerful features

* 功能强大，支持闭包，构建器，运行时和编译时元编程，函数编程，类型推断和静态编译。

Smooth Java integration

* 就是无缝和Java集成，Java的语法Groovy都支持。

Domain-Specific Languages

* 特定领域语言，灵活的语法，高度集成和自定义机制。这个我使用来看，由于Jenkins平台Pipeline插件是采用Groovy开发，在特定领域语言，我认为就是指pipeline。

Vibrant and rich ecosystem

* 充满活力和丰富的生态系统，这个，我学习比较基础，理解不了。在测试工具中，有一个很强大的框架spcok就能测试Java和groovy开发的项目，这个我认为是一个生态。

Scripting and testing glue


不想本地安装Groovy环境的话，可以打开 [groovy-playground](https://groovy-playground.appspot.com/) 运行线上groovy代码，查看结果
该网站可能需要会科学上网。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ca84076103ec0b8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 必要的Groovy语法知识

* 定义变量和方法用def关键字，`def name="jack"`
* 语句最后的分号不是必需的
* 方法调用时可以省略括号
```groovy
def say(String name = "world") {
  return "hi " + name
}
// 调用
say name = "jack"
```
* 双引号支持插值，单引号不会解析变量，原样输出
```groovy
def name = 'world'
// 结果： hello world
print "hello ${name}"
// 结果： hello ${name}
print 'hello ${name}'
```
* 三双引号和三单引号都支持换行，只有三双引号支持插值
```groovy
def foo = """ line one
line two
${name}
"""
```
* 支持闭包
```groovy
// 定义闭包
def codeBlack = {print "hello closure"}
// 闭包当做函数调用
codeBlack
// 闭包可以赋值给变量，或者作为参数传递
def pipeline(closure) {
  closure()
}
pipeline(codeBlack)
```

因为括号是非必需的，下面几种写法结果是一样的，是不是和Jenkins pipeline很像呢
```groovy
pipeline( {print "hello closure"} )
pipeline { 
  print "hello closure"
} 
pipeline codeBlack
```
* 闭包的另一个用法
```groovy
def stage(String name, closure) {
  println name
  closure()
}

// 正在情况下，我们这样使用stage函数

stage("stage name", {
   println "closure"
})

// 最终打印
/*
stage name
closure
*/
// 但是，在Groovy里，可以直接这么写

stage("stage name") {
  print "closure"
}
```
