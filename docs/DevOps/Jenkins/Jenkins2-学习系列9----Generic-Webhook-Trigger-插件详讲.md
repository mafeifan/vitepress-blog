**Generic Webhook Trigger** 是一款Jenkins插件，下文简称GWT，安装后会暴露出来一个公共API，
GWT插件接收到 JSON 或 XML 的 HTTP 请求后，根据我们配置的规则决定触发哪个Jenkins项目。

插件安装后在Job配置页面会多出一个"Generic WebHook Trigger"选项
勾选后有很多参数配置，详细介绍GWT各参数的含义我们下面会讲到

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9d63ff9d0be3ca2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

插件安装后在pipeline也可以使用 GenericTrigger 指令完成相同的配置

现在，我们创建一个普通的pipeline项目。代码如下:
```groovy
#!groovy

pipeline {
    agent {
        node {
            label 'master'
        }
    }
    triggers {
        GenericTrigger(
            genericVariables: [
              [key: 'ref', value: '$.ref']
            ],
            token: 'secret' ,
            causeString: ' Triggered on $ref' ,
            printContributedVariables: true,
            printPostContent: true
        )
    }
    stages {
        stage('GWT env') {
            steps {
                sh "echo $ref"
                sh "printenv"
            }
        }
    }
}
```
注意：在创建完成后，需要手动执行一次， 这样pipeline的触发条件オ会生效。
然后我们用 Postman 发起一次 HTTP POST 请求。
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-8795c75afd706922.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

或者直接用curl命令 `curl -vs http://140.xxx.xxx.xxx/generic-webhook-trigger/invoke\?token\=first-pipeline\&foo\=bar`

接着，我们就看到 pipeline 被触发！

GenericTrigger 触发条件由GWT插件提供。此触发条件可以说是GWT的所有内容。
GenericTrigger 触发条件分为5部分，这样更易于理解各参数的作用。
* 从 HTTP POST 请求中提取参数值。
* token, GWT 插件用于标识Jenkins项目的唯一性。
* 根据清求参数值判断是否触发Jenkins项目的抗行。
* 日志打印控制。
* WebHook 响应控制。
一个 HTTP POST 请求可以从三个维度提取参数，即 POST Body、URL参数和header。
GWT 插件提供了三个参数分别从这三个维度的数据进行提取。

1. **genericVariables**： 提取POST body 中的参数
```groovy
genericVariables: [
    [
       key: 'before', 
       value: '$.before', 
       expressionType: 'JSONPath', 
       regularFilter: '', 
       defaultValue: ''
    ],
    [key: 'ref', value: '$.ref']
],
```
* value： JSONPath 或 XPath 表达式，取决于 expressType 参数值，用于从 POST body 中提取值。
* key： 从 POST Body 中提取出的值的新变量名，可用于pipeline其他步骤。
* expressType： 可选， value的表达式类型，默认为JSONPath，当请求为XML内容时，必须指定 XPath 值。
* defaultValue：可选，当提取不到值，且defaultValue不为空时，则使用defaultValue作为返回值。
* regexpFilter：可选，过滤表达式，对提取出来的值进行过滤。regexpFilter做的事情其实就是`string.replaceAll(regexpFilter，"")`；。string是从HTTP请求中提取出来的值。

2. **genericRequestVariables**：从URL参数中提取值。
```groovy
genericRequestVariables: [
    [
       key: 'requestWithNumber', 
       regexpFilter: '[^0-9]',
    ],
    [key: 'requestWithString', regexpFilter: '']
],
```
• key：提取出的值的新变量名，可用于pipeline其他步骤。
• regexpFilter：对提取出的值进行过滤。

3. **genericHeaderVariables**：从HTTP header 中提取值。用法和genericRequestVariables一样。

#### token 参数
标识唯一性，值可以使用项目+时间
当Jenkins接收到 GWT 接口的请求时，会将请求代理给GWT插件处理。GWT插件内部会从Jenkins实例对象中取出所有的参数化Jenkins项目，包括pipeline, 然后进
行遍历。如果在参数化项目中GenericTrigger配置的token的值与Webhook请求时的token的值
致，则触发此参数化项目。
如果多个项目的此参数值一样，都会被触发。

实际上，GWT并不只是根据 token 值来判断是否触发，还可以根据我们提取出的值进行判断。示例如下:
* regexpFilterText：需要进行匹配的key。例子中，我们使用从POST body中提取出的refValue变量值。
* regexpFilterExpression：正则表达式。
如果 regexpFilterText 参数的值符合 regexpFilterExpression 参数的正则表达式，则触发执行。

#### 打印内容
GWT 插件提供了三个供日调试打印日志的参数
* Silent response 当为true，只返回http 200 状态码，不返回触发结果
* Print post content 将 webhook 请求的内容打印到日志上
* Print contributed variables 将 提取后的变量打印到日志上

#### 实例
只有commit message 包含 new build 才触发

![](http://pek3b.qingstor.com/hexo-blog/20220225160036.png)

![](http://pek3b.qingstor.com/hexo-blog/20220225160059.png)

测试，触发成功，payload 从 gitee 的webhook中复制
![](http://pek3b.qingstor.com/hexo-blog/20220225160718.png)

#### 测试

修改请求，header头添加信息，地址添加参数，发现 GWT 返回的结果中已经成功识别了。
至于多了0的参数，原因未详。

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d6299a967eb18bad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
