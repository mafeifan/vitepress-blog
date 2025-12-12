有些项目的构建需要动态的传入一些参数，比如需要用户输入一些内容，或者上传一个文件，或者为一些配置打钩，作为不同的参数，当构建时这些参数作为环境变量来影响具体的构建过程。

比如，我们知道`sh "printenv"`会打印所有的环境变量方便调试，但是如果写死在pipeline里，每次构建
console output都会输出大量内容。
比如现在

```groovy
stage('debug') {
  steps {
    sh "printenv"
  }
}
```

我希望构建时可以手动控制是否输出调试信息。默认为关闭，即不输出，打钩后才输出信息。

下面的例子就讲解如何实现

当我们新建的项目为freestyle或pipeline类型，在配置页面的General的tab中会发现有一个选项为
"This project is parameterized" 表示该项目类型为可参数化的，勾选之后，可以添加很多类型的参数，如下图
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-c22fca2d7c47dd00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

比如我这里添加一个Boolean Parameter，参数名称为is_print_env，默认不显示环境变量信息，即不希望执行`sh "printenv"`

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e963d69b1f3b2065.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改之前的pipeline，根据is_print_env的取值走不同的逻辑。

```groovy
stage('debug') {
  steps {
    // echo env.is_print_env
    script {
      if (env.is_print_env) {
          sh "printenv"
      } else {
         echo "no execute 'sh printenv'"
      }
    }
  }
}   
```

保存之后来到该项目的首页，左侧功能列表中会发现之前的"Build now"变为了"Build with parameters"。点击后，刚才的Boolean Parameter参数配置就可视化了。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-6df22c9d072d2a8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果勾选了，就会输出所有的环境变量

#### Pipeline Parameter
上面的参数是在页面上手动添加，实际上如果是pipeline类型的job，可以用代码的方式是实现，这样更灵活，更容易版本化管理
pipeline语法支持传入parameters指令，parameter 包括 string， text(多行文本), boolean, choice(下拉)，file 文件类型(很少用)， password(密码类型)等。
```groovy
pipeline {
  agent any

  parameters {
    booleanParam(defaultValue: true, description: '', name: 'p_userFlag')
        
    choice(
       choices: 'dev\nprod',
       description: 'choose deploy environment',
       name: 'p_deploy_env'
   )
   string (name: 'p_version', defaultValue: '1.0.0', description: 'build version')
 
   text (name: 'p_deploy_text', defaultValue: 'One\nTwo\nThree', description: '')

   password (name: 'p_password', defaultValue: '', description: '')
  }
}
```
> 保存后需要手动执行一次，才能在页面中看到效果

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-3b549cd0e67b6434.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

被传入的参数会放到名为params的对象中，在pipeline中可以直接使用，比如params.userFlag就是引用parameters指令中定义的userFlag参数

#### 根据参数进行逻辑判断
```groovy
stage('debug') {
    steps {
        script {
            if (params.p_deploy_env == 'dev') {
                 echo "deploy to dev"
            } 
        }
    }
}  
```

可以安装 [Conditional BuildStep](https://plugins.jenkins.io/conditional-buildstep) 像使用 when 指令一样进行条件判断。
下面安装插件后的写法
```groovy
pipeline {
  agent any

 parameters {
   choice(name: 'CHOICES', choices: 'dev\nstaging', description: '请选择部署环境')
 }

 stages {
   stage('deploy test')  {
     when {
       expression( return params.CHOICES == 'test')
     }
     scripts {
       echo 'deploy to test'
     }
   }
   stage('deploy staging')  {
     when {
       expression( return params.CHOICES == 'staging')
     }
     scripts {
       echo 'deploy to staging'
     }
   }
 }
}
```
expression 本质是Groovy代码块，可以写出更复杂的逻辑判断
```groovy
when {
   expression {  return A || B || C && D }
}
```
从文件中提取
```groovy
when {
   expression {  return readFile('pom.xml'.contains('foo'))  }
}
```
正则
```groovy
when {
   expression {  return return token ==~ /(?i)(Y|YES|TRUE)/)  }
}
```

#### input 步骤

执行 input 步骤会暂停pipeline，直到用户输入参数。
场景：
1 审批流程，pipeline暂停在部署前的stage，由负责人点击确定后才能部署。
2 手动测试，增加一个手动测试stage，该阶段只有一个input步骤，当手动测试通过后才可以通过这个input步骤。

pipeline中添加input的step
```groovy
pipeline {
  agent any

 stages {
   stage('deploy')  {
     steps {
       input message: '发布或停止' // 如果只有一个messge参数，可以简写为 input  '发布或停止'
     }
   }
}
```

>  ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-bd04203f203a1cbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

无论是中止还是通过，job日志中都记录了谁操作的，这对审计非常友好

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-367e3421572a798d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
