[使用文档](https://ant.design/components/grid-cn/)
[源码](https://github.com/ant-design/ant-design/blob/master/components/grid/index.tsx)

### grid/index.tsx
```
import Row from './row';
import Col from './col';

export {
  Row,
  Col,
};
```

### [grid/row.js](https://github.com/ant-design/ant-design/blob/master/components/grid/row.tsx)
```javascript
export default class Row extends React.Component {
  static defaultProps = {
    // gutter是col之间的间隔，默认0
    // <Row gutter={24}> 
    // 生成 <div class="ant-row" style="margin-left: -8px; margin-right: -8px"></div>
    gutter: 0,
  };

  render() {
    const { type, justify, align, className, gutter, style, children,
      prefixCls = 'ant-row', ...others } = this.props;

    // https://ant.design/components/grid-cn/#components-grid-demo-gutter
    // 默认class只有一个ant-row
    // type 一般是flex
    // 如果传入<Row justify="center"> 则输出 ant-row-flex-center
 
    const classes = classNames({
      [prefixCls]: !type,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${type}-${justify}`]: type && justify,
      [`${prefixCls}-${type}-${align}`]: type && align,
    }, className);

    // 汇总style，如果gutter属性大于0设置marginLeft，marginRight。gutter最好满足(16+8n)px
    const rowStyle = gutter > 0 ? {
      marginLeft: gutter / -2,
      marginRight: gutter / -2,
      ...style
    } : style;

    // 下面的比较简单，对每一个col设置 paddingLeft 和 paddingRight
    const cols = Children.map(children, (col) => {
      if (!col) {
        return null;
      }
      if (col.props && gutter > 0) {
        return cloneElement(col, {
          style: {
            paddingLeft: gutter / 2,
            paddingRight: gutter / 2,
            ...col.props.style
          },
        });
      }
    })

    return(
      <div {...others} className={classes} style={rowStyle}>{cols}</div>
    )
  }
}
```
###[grid/col.js](https://github.com/ant-design/ant-design/blob/master/components/grid/col.tsx)
col也比较简单，需要对 [flex布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout) 比较熟悉
```javascript
export default class Col extends React.Component {
  render() {
    const props = this.props;
    const { span, order, offset, push, pull, className, children, prefixCls = 'ant-col', ...others } = props;
    let sizeClassObj = {};

    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
      let sizeProps = {};
      if (typeof props[size] === 'number') {
        sizeProps.span = props[size];
      } else if (typeof props[size] === 'object') {
        sizeProps = props[size] || {};
      }

      delete others[size];

      sizeClassObj = {
        ...sizeClassObj,
        [`${prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
        [`${prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
        [`${prefixCls}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
        [`${prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
        [`${prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
      };
    });

    // 汇总style，如果gutter属性大于0，gutter最好满足(16+8n)px
    // const colStyle = span > 0 ? {
    //   marginLeft: gutter / -2,
    //   marginRight: gutter / -2,
    //   ...style
    // } : style;

    const classes = classNames({
      [`${prefixCls}-${span}`]: span !== undefined,
      [`${prefixCls}-order-${order}`]: order,
      [`${prefixCls}-offset-${offset}`]: offset,
      [`${prefixCls}-push-${push}`]: push,
      [`${prefixCls}-pull-${pull}`]: pull,
    }, className, sizeClassObj);

    return(
      <div className={classes}>{children}</div>
    )
  }
}
```
