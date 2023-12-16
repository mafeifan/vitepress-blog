1. 问：react-router，react-router-native 和 react-router-dom 的区别
答：react-router是核心。react-router-native 和 react-router-dom是在 react-router 的基础上针对不同运行环境做为额外补充。对于web环境使用 react-router-dom。对于开发 react-native，使用 react-router-native 即可。

2. 官方的例子及代码
[web](https://reacttraining.com/react-router/web/example/basic)
[native](https://reacttraining.com/react-router/native/example/Basic)

3. 例子：手动跳转

路由文件 routerMap
```javascript
import React from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import Home from '../Pages/Home/'
import List from '../Pages/List/'
import Detail from '../Pages/Detail/'
import NoMatch from './404'

//  下面几行是老式写法，可以忽略
// import createBrowserHistory from 'history/createBrowserHistory';
// 是个用于浏览器导航#的历史对象
// const history = createBrowserHistory()
// <BrowserRouter /> 其实就是<Router history={history} />

export class RouterMap extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/list">List</Link></li>
          </ul>
          <hr/>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/list" component={List} />
            <Route path="/detail/:id" component={Detail} />
            <Route component={NoMatch}/>
          </Switch>
        </div>
      </Router>
    );
  }
}
```

 入口文件
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {RouterMap} from "./Router/routerMap";

ReactDOM.render(<div>
  <App />
  <RouterMap />
</div>, document.getElementById('root'));
```
List页面
```javascript
import React from 'react'

export default class List extends React.Component {
  constructor({ match }) {
    super();
    this.state = {
      match
    }
  }

  clickHandle(item) {
    //关于history
    // http://www.jianshu.com/p/e3adc9b5f75c
    this.props.history.push('/detail/' + item)
  }

  render() {
    const arr = [1,2,3]
    console.log(this.state.match)
    return (
      <div>
        <h3>List Page</h3>
        <ul>
          {
            arr.map((item, index) =>
              <li key={index} onClick={this.clickHandle.bind(this, item)}>{item}</li>
            )
          }
        </ul>
      </div>
    )
  }
}
```

Detail 页面
```javascript
import React from 'react'

export default class Detail extends React.Component {
  constructor({ match }) {
    super();
    this.state = {
      match
    }
  }

  render() {
    console.log(this.state.match)
    return (
      <div>Detail Page {this.state.match.params.id}</div>
    )
  }
}

```

参考：http://www.jianshu.com/p/e3adc9b5f75c
