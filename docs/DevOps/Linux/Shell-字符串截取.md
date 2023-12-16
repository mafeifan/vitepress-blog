用 Shell 截取字符串是很常见的需求，这里列出一些写法

|  格式   | 说明  |
|  ----  | ----  |
|${string: start :length}	|从 string 字符串的左边第 start 个字符开始，向右截取 length 个字符。|
|${string: start}	|从 string 字符串的左边第 start 个字符开始截取，直到最后。|
|${string: 0-start :length}	|从 string 字符串的右边第 start 个字符开始，向右截取 length 个字符。|
|${string: 0-start}	|从 string 字符串的右边第 start 个字符开始截取，直到最后。|
|${string#*chars}	|从 string 字符串第一次出现 *chars 的位置开始，截取 *chars 右边的所有字符。|
|${string##*chars}	|从 string 字符串最后一次出现 *chars 的位置开始，截取 *chars 右边的所有字符。|
|${string%*chars}	|从 string 字符串第一次出现 *chars 的位置开始，截取 *chars 左边的所有字符。|
|${string%%*chars}	|从 string 字符串最后一次出现 *chars 的位置开始，截取 *chars 左边的所有字符。|

```shell script
GITHUB_REF=refs/tags/v1.3.0

# 按长度截取，格式 ${string: start :length}
# 从第10个字符截取，直到最后
# 输出 v1.3.0
echo ${GITHUB_REF:10}


# # 是截取
# 输出tags/v1.3.0
echo ${GITHUB_REF#refs/}
```

```shell script
GITHUB_REF=refs/heads/main

# 输出 heads/main
echo ${GITHUB_REF#*/}

# 输出 main 
echo ${GITHUB_REF##*/}
```


使用%号可以截取指定字符（或者子字符串）左边的所有字符，具体格式如下：
`${string%chars*}`
请注意`*`的位置，因为要截取 chars 左边的字符，而忽略 chars 右边的字符，所以`*`应该位于 chars 的右侧。其他方面`%`和`#`的用法相同，这里不再赘述，仅举例说明：


```shell script
url="http://c.biancheng.net/index.html"

# 结果为 http://c.biancheng.net
echo ${url%/*}

# 结果为 http:
echo ${url%//*}

#结果为 http:
echo ${url%%/*}

#结果为 http://
echo ${url%%c*} 
```


### 参考
http://c.biancheng.net/view/1120.html
