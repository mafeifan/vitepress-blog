按需加载模块的目的是实现代码分隔，用户打开首页时不用下载全部的代码，打开特定的页面加载特定的代码。提高用户体验。

如果使用的是react-router，官网文档给出的 [方案](https://reacttraining.com/react-router/web/guides/code-splitting) 是用webpack的bundle-loader

你可能也见过require.ensure。这是webpack的旧式写法，现在已不推荐。

我倾向于使用import()，这也是webpack推荐的。因为更符合规范。 [这篇](https://www.jianshu.com/p/a8702a5ec944) 我有专门的介绍，社区中也有专门的 [方案](https://gist.github.com/acdlite/a68433004f9d6b4cbc83b5cc3990c194)。

我也用到项目中，代码如下
其中City和Login页面是按需加载中的，你可以在network中看到进入这俩页面浏览器会先加载类似 1.chunk.js文件。
```
import React from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import Home   from '$pages/Home/'
import List   from '$pages/List/'
// import City   from '$pages/City/'
// import Login  from '$pages/Login/'
import Detail from '$pages/Detail/'
import Search from '$pages/Search/'
import UserCenter  from '$pages/UserCenter/'
import Demo   from '$pages/Demo/'
import NoMatch from './404'

// 异步按需加载component
function asyncComponent(getComponent) {
  return class AsyncComponent extends React.Component {
    static Component = null;
    state = { Component: AsyncComponent.Component };

    componentWillMount() {
      if (!this.state.Component) {
        getComponent().then(({default: Component}) => {
          AsyncComponent.Component = Component
          this.setState({ Component })
        })
      }
    }
    render() {
      const { Component } = this.state
      if (Component) {
        return <Component {...this.props} />
      }
      return null
    }
  }
}

function load(component) {
  return import(`$pages/${component}/`)
}

const Login = asyncComponent(() => load('Login'));
const City = asyncComponent(() => load('City'));

export class RouterMap extends React.Component {
  render() {
    return (
      <Router>
        <div>
          { /*
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/list">List</Link></li>
          </ul>
          <hr/>
          */ }
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login/:refer?" component={Login} />
            <Route path="/city" component={City} />
            <Route path="/user" component={UserCenter} />
            <Route path="/list" component={List} />
            <Route exact path="/demo" component={Demo} />
            <Route path="/search/:category/:keyword?" component={Search} />
            <Route path="/detail/:id" component={Detail} />
            <Route component={NoMatch}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

```

如果感觉这篇对你有用的朋友给我的 [项目](https://github.com/mafeifan/react-dianping) 点个star
