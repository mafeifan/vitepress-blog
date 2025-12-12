storybook是一套最近比较火的响应式UI 开发及测试环境。
可以可视化开发调试react，vue组件
官网：https://github.com/storybooks/storybook
至于为什么叫storybook，猜测是敏捷开发中的user story有关，找了篇 [文章](https://www.cnblogs.com/henryhappier/archive/2011/02/23/1962617.html)，不了解的同学可以看下

根据官网介绍一个story是一个或多个UI组件的单一状态，基本上像一个可视化测试用例。
打开 [这个](http://airbnb.io/react-dates)，这是airbnb公司实现的一个react的datepicker组件。这个组件配置很多，怎么让大家直观的查看学习呢？他就利用storybook写了很多story，左侧的每一项点开后是datepicker组件不同的状态或配置，就是一个个story。

storybook本身提供了很多组件，也可以添加自己的组件作为story，方便他人查看，使用并测试。

使用storybook你需要有react或vue的开发经验，并且熟悉es6。

下来带大家简单使用一下：
1. 首先全局安装storybook命令：
`npm i -g @storybook/cli`
2. 来到一个已存在的react项目，可以是由creat-react-app创建的
在根目录执行 getstorybook 命令
会出现如下画面
![安装storybook](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-127db4f08f7bf556.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

发现这个命令实际修改了package.json，对比如下
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-9ff7bf4290c954c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后又多出来个名为`.storybook`的目录，里面有附件组件文件 `addons.js` 和 `config.js`

3. 安装后根据提示执行 `yarn run storybook` 启动storybook服务，浏览器打开 http://localhost:9009
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-d7e860d0ab76d9e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 这个页面是咋生成的呢，我们打开`\src\stories\index.js`一看便知
```javascript
import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

// 文档 https://storybook.js.org/basics/writing-stories/
// storiesOf应该是分组，每组添加一个个story
// 修改内容页面会实时发生变化
storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

// 使用action让storybook去记录log,可以在页面的action logger中查看
storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);
```

今天就先研究到这里
