---
title: 示例页面
lang: zh
---

## 目录

[[toc]]

## 默认主题

| 左对齐 | 右对齐 | 居中对齐 |
| :-----| ----: | :----: |
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |

:tada: :100:

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

::: danger STOP
Danger zone, do not proceed
:::

::: details 点击查看代码
```js
console.log('你好，VuePress！')
```
:::

## Emoji

:tada: :100:

[full emoji](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)

#### 代码高亮

``` js
export default {
  name: 'MyComponent',
  // ...
}
```

``` html
<ul>
  <li
    v-for="todo in todos"
    :key="todo.id"
  >
    {{ todo.text }}
  </li>
</ul>
```


#### 代码 - 行高亮
``` js {4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

#### 放入codepen，直接复制iframe即可

<iframe height="265" style="width: 100%;" scrolling="no" title="CodePen Bouncing Logo ⛹🏽‍♀️" src="https://codepen.io/mafeifan/embed/YzqPgZK?height=265&theme-id=dark&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/mafeifan/pen/YzqPgZK'>CodePen Bouncing Logo ⛹🏽‍♀️</a> by finley
  (<a href='https://codepen.io/mafeifan'>@mafeifan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
