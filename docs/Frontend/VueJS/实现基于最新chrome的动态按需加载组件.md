chrome63 版本后支持动态import 加载js https://developers.google.com/web/updates/2017/12/nic63#dynamic

> 下面的例子需要通过服务器打开才生效哦，比如本地localhost开头的..

## 例1
有一个 js 文件和 html 文件，现在可以实现不借助任何东西在浏览器里实现点击页面上的按钮加载该 js。
```javascript
export default {
  open() {
    return alert('I am opening')
  }
}

```
html文件
```html
<button id="btn">点击动态加载js</button>
<script>
const btn = document.querySelector("#btn")
btn.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.default.open();
  })
  .catch(error => {
    /* Error handling */
  });
});
</script>
```
注意：import方法 返回的是一个promise对象

## 例2 vue加载动态路由组件
html
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <nav>
        <!-- lazy load component -->
        <a href="/pages/BooksPage.js" @click.prevent="navigate">Books</a>
        <a href="/pages/MoviesPage.js" @click.prevent="navigate">Movies</a>
        <a href="/pages/GamesPage.js" @click.prevent="navigate">Games</a>
    </nav>
    <component :is="page"></component>
  </div>
<script src="node_modules/vue/dist/vue.js"></script>
<!-- 必须加上 type="module" -->
<script type="module">
import BooksPage from './pages/BooksPage.js';
new Vue({
  el: '#app',
  data: {
    page: BooksPage
  },
  methods: {
    navigate(event) {
      this.page = () => import(`./${event.target.pathname}`)
      // 如果 Vue.js < 2.5.0
      // .then(m => m.default)
    }
  }
});
</script>
</body>
</html>
```

> 注意，这里使用了vue的内置 [component组件](https://cn.vuejs.org/v2/api/#component)，依 is 的值，来决定哪个组件被渲染。

BookPage的内容
```
export default {
  name: 'BooksPage',
  template: `
    <div>
     <h1>Books Page</h1>
     <p>{{ message }}</p>
    </div>
  `,
  data() {
    return {
      message: 'Oh hai from the books page'
    }
  }
};
```
完整的代码已放到了 [GitHub](https://github.com/mafeifan/Frontend-Study/tree/master/Chrome/63/Dynamic-module-imports) 上面
如果觉得文章对你有帮助，请点下下方的喜欢，谢谢！

参考：https://medium.com/js-dojo/build-a-lazy-load-router-with-vue-js-and-the-latest-browser-features-a1b52fe52dda
