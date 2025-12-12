1. chrome浏览器安装react扩展
2. 使用displayName属性
[官方文档](https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging)
扔个例子，写了个高阶组件，名字叫HOC，如果调用多次，就会出来多个HOC，优化后显示传入的组件名。
```javascript
function getDisplayName(component) {
  return component.displayName || component.name || 'Component';
}

export function withHeader(WrappedComponent) {
  return class HOC extends React.Component {
    // 在React组件查看中显示Hoc(被传入的组件名)
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`
    render() {
      return <div>
        <div className="demo-header">
          我是标题
        </div>
        <WrappedComponent {...this.props}/>
      </div>
    }
  }
}
```
调用
```javascript
class Demo extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  static displayName = 'I am demo component'

  render() {
    return <div>我是一个普通组件</div>
  }
}

const EnhanceDemo = withHeader(Demo);
```
调试面板 react 显示类似如下

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-eb85d36dfa61406a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
