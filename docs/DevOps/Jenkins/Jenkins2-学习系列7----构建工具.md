### 构建工具
构建是指将源码转换成一个可使用的二进制程序的过程。这个过程可以包括但不限于这几个环节:下载依赖、编译、打包。构建过程的输出一比如一 个zip包，我们称之为**制品**(有些书籍也称之为产出物)。而管理制品的仓库，称为**制品库**。
在没有Jenkins的情况下，构建过程通常发生在某个程序员的电脑上，甚至只能发生在某台特定的电脑上。这会给软件的质量带来很大的不确定性。想想软件的可靠性(最终是老板的生意)依赖于能进行构建的这台电脑的好坏，就觉得很可怕。
解决这问题的办法就是让构建每一步都是可重复的，尽量与机器无关。
所以，构建工具的安装、设置也应该是自动化的、可重复的。
虽然Jenkins只负责执行构建工具提供的命令，本身没有实现任何构建功能，但是它提供了构建工具的自动安装功能。
### 构建工具的选择
对构建工具的选择，很大一部分因素取决于你所使用的语言。比如构建Scala使用SBT, JavaScript的Babel、 Browserify、 Webpack、 Grunt以及Gulp等。 当然，也有通用的构建工具，比如Gradle,它不仅支持Java、Groovy、 Kotlin等语言，通过插件的方式还可以实现对更多语言的支持。
对构建工具的选择，还取决于团队对工具本身的接受程度。建议团队中同一技术栈的所有项目都使用同一个构建工具。
### tools指令介绍
tools指令能帮助我们自动下载并安装所指定的构建工具，并将其加入PATH变量中。这样，我们就可以在sh步骤里直接使用了。但在agent none的情况下不会生效。
tools指令默认支持3种工具: JDK、Maven、Gradle。 通过安装插件，tools指令还可以支持更多的工具。
#### 搭建Python环境
* 在Jenkins机器上安装python和virtualenv(Python的虚拟环境管理工具)
* 安装[pyenv-pipeline插件](https://plugins.jenkins.io/pyenv-pipeline)
* 在pipeline中使用pyenv-pipeline插件提供的withPythonEnv方法，第一个参数是可执行Python的执行路径，在当前工作空间下创建一个virtualenv环境。第二个参数是一个闭包，闭包内的代码就执行在新建的virtualenv环境下。
```groovy
withPythonEnv('/usr/bin/python3.5') {
    // Uses the specific python3.5 executable located in /usr/bin
    ...
}
// 使用方法见文档
withPythonEnv('python') {
    // Uses the default system installation of Python
    // Equivalent to withPythonEnv('/usr/bin/python') 
    ...
}
```

### 利用环境变量支持更多构建工具
是不是所有的构建工具都需要安装相应的Jenkins插件才可以使用呢?当然不是。
平时，开发人员在搭建开发环境时做的就是：首先在机器上安装好构建工具，然后将这个构建工具所在目录加入PATH环境变量中。
如果想让Jenkins支持更多的构建工具，也是同样的做法：在Jenkins agent上安装构建工具，并记录下它的可执行命令的目录，然后在需要使用此命令的Jenkins pipeline
的PATH环境变量中加入该可执行命令的目录。示例如下:
```groovy
pipeline {
  agent any
  environment {
    PATH = "/user/lib/custom_tool/bin:$PATH"
  }
  stages {
    stage('build') {
       steps {
          sh "custom_tool -v"
       }
    }
  }
}
```
还可以有另一种写法:
```groovy
pipeline {
  agent any
  environment {
    CUSTOM_TOOL_HOME = "/user/lib/custom_tool/bin"
  }
  stages {
    stage('build') {
       steps {
          sh "${CUSTOM_TOOL_HOME}/custom_tool -v"
       }
    }
  }
}
```
### 利用tools作用域实现多版本编译
在实际工作中，有时需要对同一份源码使用多个版本的编译器进行编译。tools指令除了支持pipeline作用域，还支持stage作用域。 所以，我们可以在同一个pipeline中实见多版本编译。代码如下:
```groovy
pipeline {
  agent any
  stages {
    stage('build with jdk-10.0.2') {
       tools {
          jdk "jdk --10.0.2"
       }
       steps {
          sh "printenv"
       }
    }
    stage('build with jdk-9.0.4') {
       tools {
          jdk "jdk --9.0.4"
       }
       steps {
          sh "printenv"
       }
    }
  }
}
```
在打印出来的日志中，会发现每个stage下的JAVA_ HOME变量的值都不一样。
### 总结：
1. 使用tools指令指定或切换要使用的构建工具。
2. 如果没有就先找相应的插件，如果没有插件就在Jenkins机器上安装，然后加入到环境变量中，最后在pipeline中使用。
