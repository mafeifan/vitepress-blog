注：由于前端更新非常快，写这篇文章时 create-react-app 使用的版本是1.4.1 最新的使用流程请参照官方文档。
[create-react-app](https://github.com/facebookincubator/create-react-app) 是facebook推出的快速创建react项目的命令行工具。
他和 [vue-cli](https://cn.vuejs.org/v2/guide/installation.html#命令行工具-CLI) 类似。开箱即用，不用改一行配置就可以开发出针对开发和生产环境的react项目。
比如针对开发环境有eslint语法检测，热重载，带有proxy server等功能。
这些东西大多要归功于webpack的功劳。

默认情况下webpack配置文件不会暴露出来，这不满足我当前的需求，比如这里我喜欢用 stylus(一个类似less，sass的样式预处理器)。stylus 和 sass 类似，支持变量，mixin，函数等功能，而且连括号，分号都不用写。用缩进区分。
create-react-app 支持执行 `npm run reject` 将相关配置文件释放到根目录下。注意这里是不可逆操作。

官网的 readme 中有怎么添加 sass 和 less 的[教程](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc) 没有讲如何添加 stylus 支持，其实这也难不倒咱。
具体步骤如下：
1. 项目根目录执行 `npm run reject`，会发现多出来个 config 目录，里面的各个配置文件都带有详尽的注释
2. 安装 stylus 相关依赖，执行 `npm install stylus stylus-loader --save-dev` 或 `yarn add stylus stylus-loader`
3. 打开 `config\webpack.config.dev.js` 我们让webpack支持解析 styl 格式的文件
在 module->rules->oneOf 组下面添加
```javascript
          {
            test: /\.styl$/,
            use: [
              require.resolve('style-loader'),
              require.resolve('css-loader'),
              require.resolve('stylus-loader')
            ]
          },
```
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-9c99e308a7678c47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
4.  打开 `webpack.config.prod.js` 添加如下(这是我参考下面的针对的css配置，需要更进一步测试)这是因为prod环境下，所有的css都被 [ExtractTextPlugin](https://doc.webpack-china.org/plugins/extract-text-webpack-plugin) 插件提取到同一个样式文件中，开发环境则是动态的创建style标签并插入到html的header中。
```
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract(
                    Object.assign(
                        {
                            fallback: require.resolve('style-loader'),
                            use: [
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        importLoaders: 1,
                                        minimize: true,
                                        sourceMap: shouldUseSourceMap,
                                    },
                                },
                                {
                                  loader: require.resolve('stylus-loader'),
                                }
                            ],
                        },
                        extractTextPluginOptions
                    )
                ),
                // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
            },
```
5. 新建目录 `src\static\styl` 并创建 base.styl 
内容如下：
```css
body
  margin: 0
  padding: 0
  background-color: #f1f1f1
  *
    margin: 0
    padding: 0
    box-sizing: border-box
    font-family: "微软雅黑","Times New Roman",Georgia,Serif
a
  text-decoration: none
```
6. 打开 `src\index.js`，添加 `import './static/styl/index.styl';`
7. 最后重新执行 `npm run start` 或 `yarn start` 就能看到样式变化了。

参考：
https://cn.vuejs.org/v2/guide/comparison.html#React
