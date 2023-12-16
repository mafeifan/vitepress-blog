[ant design](https://ant.design) 是一套设计语言。
这里为了学习react，我主要学习用 [React实现](https://ant.design/docs/react/introduce-cn) 的各个组件。这个是由官方维护的，代码质量高些。还有 [基于vue](https://github.com/FE-Driver/vue-beauty) 实现的。
源码在 [github](https://github.com/ant-design/ant-design) 上。
阅读readme打开 [开发者说明](https://github.com/ant-design/ant-design/wiki/Development)
├── components    # react source code and demos
├── docs          # documentation in markdown
├── scripts       # 
├── site          # website layout and code
└── package.json

要学源码其实主要关心components目录即可。
我会根据 [使用文档](https://ant.design/docs/react/introduce-cn) 一个个组件的去研究。从小到大，从简单到复杂。

需要注意的是：
1. 很多组件是基于 [基础组件](http://react-component.github.io/badgeboard/) 构造的，我不会对基础组件做深入研究。
2. 源码中组件的扩展名是tsx，说明是用TypeScript写的。使用TypeScript有个非常大的好处。比如打开[row.tsx](https://github.com/ant-design/ant-design/blob/master/components/grid/row.tsx)
3. 我在会仿照省略一个代码并转换成es6写法去运行。[地址](https://github.com/mafeifan/Frontend-Study/tree/master/Javascript/MVVM/react-demos/src/ANTD/)

```
export interface RowProps {
  className?: string;
  gutter?: number;
  type?: 'flex';
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  style?: React.CSSProperties;
  prefixCls?: string;
}
...
  static defaultProps = {
    gutter: 0,
  };

  static propTypes = {
    type: PropTypes.string,
    align: PropTypes.string,
    justify: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    gutter: PropTypes.number,
    prefixCls: PropTypes.string,
  };
```
这里RowProps定义的row的属性信息。看到这些立马就能知道Row组件可以接收的各个属性信息，其中gutter是数字类型，type的默认值flex，align可以写top，middle，bottom三者其一。等等，非常方便。
脑海中就知道实际项目中可以这么写`<Row gutter={16}  align="top" style={color: "red"}></Row>`

关于入口文件 [index.js](https://github.com/ant-design/ant-design/blob/master/index.js)。

主要作用做了两件事。
1. 收集components目录下的每个组件的style文件，最终应该汇总成一个样式文件。
2. 将每个组件的index.tsx挂到export下。方便import。比如 `import { Table, Card } from 'antd';`

```
/* eslint no-console:0 */
// 字符串转驼峰
// camelCase('dwdDdwdS') => "DwdDdwdS"
// camelCase('abc-de-FghiJ') => "AbcDeFghiJ"
function camelCase(name) {
  return name.charAt(0).toUpperCase() +
    name.slice(1).replace(/-(\w)/g, (m, n) => {
      return n.toUpperCase();
    });
}

// Just import style for https://github.com/ant-design/ant-design/issues/3745
// https://webpack.js.org/guides/dependency-management/#require-context
// 通过正则批量匹配引入相应的文件模块。
// 第二个参数指包含子目录
const req = require.context('./components', true, /^\.\/[^_][\w-]+\/style\/index\.tsx?$/);

req.keys().forEach((mod) => {
  let v = req(mod);
  if (v && v.default) {
    v = v.default;
  }
  // 匹配类似 './input/index.tsx'
  const match = mod.match(/^\.\/([^_][\w-]+)\/index\.tsx?$/);
  if (match && match[1]) {
    if (match[1] === 'message' || match[1] === 'notification') {
      // message & notification should not be capitalized
      exports[match[1]] = v;
    } else {
      exports[camelCase(match[1])] = v;
    }
  }
});

module.exports = require('./components');
```
