大部分的时候，作为前端，我们在写 CSS 样式之前，都知道需要添加一份 reset.css ，为了消除不同的浏览器在默认样式上不同表现。
但是有深究过 reset.css 每一句的人恐怕不多，其实其中也是有很多学问的，知己知彼，真正厘清它，对提高 CSS 大有裨益。
### reset.css
先来看看早先 YUI 的一个版本的 reset.css，这是一份历史比较悠久的 RESET 方案:
```css
body, div, dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, pre, form, fieldset, input, textarea, p, blockquote, th, td {
    margin: 0;
    padding: 0;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
}
fieldset, img {
    border: 0;
}
address, caption, cite, code, dfn, em, strong, th, var {
    font-style: normal;
    font-weight: normal;
}
ol, ul {
    list-style: none;
}
caption, th {
    text-align: left;
}
h1, h2, h3, h4, h5, h6 {
    font-size: 100%;
    font-weight: normal;
}
q:before, q:after {
    content: '';
}
abbr, acronym {
    border: 0;
}
```

### reset.css 存在的问题
看看第一段：
```css
body, div, dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, pre, form, fieldset, input, textarea, p, blockquote, th, td {
    margin: 0;
    padding: 0;
}
```

这一条样式的目的是在于，清除元素的默认 margin 和 padding 。

但是这一段代码是充满问题的。

* 诸如 div 、dt、li 、th、td 等标签是没有默认 padding 和 margin 的；
* 如果我现在问你 fieldset 是什么标签，可能没几个人知道，相似的还有如 blockquote 、acronym 这种很生僻的标签，在 html 代码中基本不会出现的，其实没太大必要 RESET ，只会给每个项目徒增冗余代码；
上面的意思是，这一段代码其实做了很多无用功！

要知道，CSS RESET 的作用域是全局的。我们都知道在脚本代码中应该尽量避免滥用全局变量，但是在 CSS 上却总是会忘记这一点，大量的全局变量会导致项目大了之后维护起来非常的棘手。

再看看这一段：
```css
h1, h2, h3, h4, h5, h6 {
    font-size: 100%;
    font-weight: normal;
}
ol, ul {
    list-style: none;
}
```
这一段代码，目的是统一了 h1~h6 的表现，取消了标题的粗体展示，取消了列表元素的项目点。

好像没什么问题，但是诸如 h1~h6、ol、ul 这些拥有具体语义化的元素，一旦去掉了它们本身的特性，而又没有赋予它们本身语义化该有的样式（经常没有），导致越来越多人弄不清它们的语义，侧面来说，这也是现在越来越多的页面上 div 满天飞，缺乏语义化标签的一个重要原因。

YUI 版本的 reset 不管高矮胖瘦，一刀切的方式，看似将所有元素统一在同一起跑线上，实则是多了很多冗余代码，得不偿失。

所以，YUI 的 reset.css 的诸多问题，催生出了另一个版本的 reset.css ，名为 Normalize.css。

[Normalize.css](https://github.com/necolas/normalize.css/blob/master/normalize.css) 有着详尽的注释，由于篇幅太长，可以点开网址看看，本文不贴出全部代码。

Normalize.css 与 reset.css 的风格恰好相反，没有不管三七二一的一刀切，而是注重通用的方案，重置掉该重置的样式（例如body的默认margin），保留该保留的 user agent 样式，同时进行一些 bug 的修复，这点是 reset 所缺乏的。

### Normalize.css 做了什么:

* Preserves useful defaults, unlike many CSS resets.
* Normalizes styles for a wide range of elements.
* Corrects bugs and common browser inconsistencies.
* Improves usability with subtle modifications.
* Explains what code does using detailed comments.

简单翻译一下，大概是：

* 统一了一些元素在所有浏览器下的表现，保护有用的浏览器默认样式而不是完全清零它们，让它们在各个浏览器下表现一致；
* 为大部分元素提供一般化的表现；
* 修复了一些浏览器的 Bug ，并且让它们在所有浏览器下保持一致性；
* 通过一些巧妙的细节提升了 CSS 的可用性；
* 提供了详尽的文档让开发者知道，不同元素在不同浏览器下的渲染规则；
* 真心建议各位抽时间读一读 Normalize.css 的源码，加上注释一共就 460 行，多了解了解各个浏览器历史遗留的一些坑

### 关于取舍
那么，最后再讨论下取舍问题。是否 Normalize.css 就真的比 reset.css 好呢？

也不见得，Normalize.css 中重置修复的很多 bug ，其实在我们的项目中十个项目不见得有一个会用得上，那么这些重置或者修复，某种意义上而言也是所谓的冗余代码。

我觉得最重要的是，拒绝拿来主义，不要人云亦云，看见别人说这个 reset.css 好用，也不了解一下，拿来就上到项目中。又或者说写代码几年了，知道每次都引用一个 reset ，却从没有去细致了解其中每一句的含义。

### 关于维护
当团队根据项目需要（可能混合部分了 reset 或者 normalize ）编写了一份适合团队项目的 reset 之后，随着不断的迭代或者说是复用，很有可能这个版本的 reset.css 会逐渐添加许多其他的全局性的样式，从而又重新陷入上面说的那些问题。

所以我觉得，reset.css 也是需要维护的，关于最佳的 reset.css ，没有一劳永逸的方案，根据项目灵活配置，做出取舍微调，适量裁剪和修改后再使用。
