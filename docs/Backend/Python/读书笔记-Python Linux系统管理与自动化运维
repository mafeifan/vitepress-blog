## 小工具

* 当做临时下载服务器`python -m http.server`
* 将JSON字符串换成JSON对象`echo '{"job":"developer","name":"lmx","sex":"male"}' I python -m json.tool`,
其实没有浏览器console面板方便
* 检查第三方库是否安装`>>> import paramiko`
* 快速import`python -c 'import paramiko'`

#### 从源码安装第三方包
$ git clone https://github.com/paramilko/paramiko.git 
$ cd paramiko
$ python setup.py install

#### IPython 交互式编程

特点：回车即显示结果，支持tab补全，语法高亮，行号显示

使用交互式编程，我们可以快速尝试不同的方案，先验证自己的想法是否正确，然后将代码拷贝到编辑器中，组成我们的 Python 程序文件。 
通过这种方式，能够有效降低代码出错的概率，减少调试的时间，从而提高工作效率 。

```
  IPython -- An enhanced Interactive Python - Quick Reference Card
  ================================================================

  obj?, obj??      : Get help, or more help for object (also works as
                    ?obj, ??obj).
  ?foo.*abc*       : List names in 'foo' containing 'abc' in them.
  %magic           : Information about IPython's 'magic' % functions.

  Magic functions are prefixed by % or %%, and typically take their arguments
  without parentheses, quotes or even commas for convenience.  Line magics take a
  single % and cell magics are prefixed with two %%.

  Example magic function calls:

  %alias d ls -F   : 'd' is now an alias for 'ls -F'
  alias d ls -F    : Works if 'alias' not a python name
  alist = %alias   : Get list of aliases to 'alist'
  cd /usr/share    : Obvious. cd -<tab> to choose from visited dirs.
  %cd??            : See help AND source for magic %cd
  %timeit x=10     : time the 'x=10' statement with high precision.
  %%timeit x=2**100
  x**100           : time 'x**100' with a setup of 'x=2**100'; setup code is not
                    counted.  This is an example of a cell magic.
```


学习模块
```
 import os;
 ?os
```

* %quickref 打开使用手册 
* i, ii, iii 分别保存了最近的三次输入
* %lsmagic 列出所有的魔术函数