Angular内置的pipe一般用在template中，比如下面的CurrencyPipe用来格式化货币
::: v-pre
`{{a | currency:'USD':true:'1.0-0'}}`
:::
如果变量a的值是2345。格式化后会显示成`$2,345`。非常方便。

如果需要在component内使用原生pipe，可以用下面的方法：
1. 打开component所属的module文件，添加提供器，供依赖注入
```
import {CurrencyPipe} from '@angular/common'
.....
providers: [CurrencyPipe]
```
2. 打开要使用的component文件，往构造函数中注入刚才定义的提供器
```
import {CurrencyPipe} from '@angular/common'
....
constructor(private currencyPipe: CurrencyPipe) { ... }
```
3. 在component也就是ts中，就可以直接使用了
```
// $12,345
this.value = this.cp.transform(this.value, 'USD': true: '1.0-0')
```

#### 参考：
http://ngninja.com/posts/angular2-builtin-pipes-in-typescript


