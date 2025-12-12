总结在学习过程中遇到的问题和资料

1. 注释要用 `{/* 这是注释 */}` 注意前后的空格

##### 组件篇

1. 纯文本组件
```javascript
const Comment = ({ text }) => text.replace(':)', '[smile]');

class App extends Component {
  render() {
    return (
      <div>
        <Comment text="Text only components are awesome :)" />
      </div>
    );
  }
}

```
2. 返回数组的纯文本组件
元素类型可不相同

```javascript
const Fruits = () => [
  <li key="1">Pear</li>,
  <li key="2">Weater Melon</li>,
];

class App extends Component {
  render() {
   // 注意返回的是个数组，减少嵌套层级
    return [
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <Fruits />
      </ul>,
      <div>this is a div</div>,
    ];
  }
}
```

3. ReactDOM.createPortal(child, container)
他可以将子组件直接渲染到当前容器组件 DOM 结构之外的任意 DOM 节点中，这将使得开发对话框，浮层，提示信息等需要打破当前 DOM 结构的组件更为方便。[例子](https://codepen.io/gaearon/pen/yzMaBd)

##### 资料

https://doc.react-china.org/
翻译后的官方文档，学技术一定要多看几遍文档

[React小书](http://huziketang.com/books/react/)
强烈推荐，由浅入深，循序渐进

http://reactpatterns.com/
由于react本身 API 比较简单，贴近原生。通过组件变化产生一系列模式

https://github.com/CompuIves/codesandbox-client
react在线编辑器，方便的分享你的react项目
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-66d4e3432c63e022.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

https://devhints.io/react
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ec79c7a0fca13244.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[js.coach](https://js.coach/)
找js包的网站
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-5c045fb0cc5e190d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



###### 视频 
基础的免费，高级的收费
https://egghead.io

###### 工具 
sublime 支持jsx语法高亮。
不要安装 [sublime-react](https://github.com/facebookarchive/sublime-react) 那个已被弃用了。
安装 [babel](https://github.com/babel/babel-sublime)，然后按照上面的教程，完美支持
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a4a76c13f8c2a14f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

