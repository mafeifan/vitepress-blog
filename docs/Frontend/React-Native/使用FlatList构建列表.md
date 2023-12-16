接着上一篇 [使用react-native-tab-navigator切换页面](http://www.jianshu.com/p/06ad77c1fe34) 
当前首页页面内容是空的，只有一个背景色。下面我们来添加些内容。
这里使用 [FlatList](http://facebook.github.io/react-native/docs/using-a-listview.html) 来渲染列表。(注：很多教程包含视频中是使用 [ListView](http://facebook.github.io/react-native/docs/listview.html) 构建内容列表的。这个已经被弃用)
步骤如下图非常简单：
1. 引入FlatList
2. 写一个 getPageHomeList 方法，可以看到FlatList接收的data属性表示数据源
renderItem表示渲染每条数据的回调方法。这里用Text组件包裹下每条数据。
```javascript
  getPageHomeList() {
    return (
      <FlatList
        data={[
          {key: 'Devin'},
          {key: 'Jackson'},
          {key: 'James'},
          {key: 'Joel'},
          {key: 'John'},
          {key: 'Jillian'},
          {key: 'Jimmy'},
          {key: 'Julie'},
        ]}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
      />
    );
  }
```
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4f30af489d705534.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
3. 最终把这个方法嵌到View中展示
完整代码如下：
```javascript
import React from 'react';
import TabNavigator from 'react-native-tab-navigator';
import { StyleSheet, Text, TextInput, View, Image, FlatList } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedTab: 'home'};
  }

  getPageHomeList() {
    return (
      <FlatList
        data={[
          {key: 'Devin'},
          {key: 'Jackson'},
          {key: 'James'},
          {key: 'Joel'},
          {key: 'John'},
          {key: 'Jillian'},
          {key: 'Jimmy'},
          {key: 'Julie'},
        ]}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TabNavigator>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'home'}
            title="最热"
            renderIcon={() => <Image style={styles.image} source={require('./res/images/ic_polular.png')} />}
            renderSelectedIcon={() => <Image style={styles.image} source={require('./res/images/ic_polular.png')} />}
            badgeText="1"
            onPress={() => this.setState({ selectedTab: 'home' })}>
            <View style={styles.page1}>
              {this.getPageHomeList()}
            </View>
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={this.state.selectedTab === 'profile'}
            title="趋势"
            renderIcon={() => <Image style={styles.image} source={require('./res/images/ic_trending.png')} />}
            renderSelectedIcon={() => <Image style={styles.image} source={require('./res/images/ic_trending.png')} />}
            onPress={() => this.setState({ selectedTab: 'profile' })}>
            <View style={styles.page2}></View>
          </TabNavigator.Item>
        </TabNavigator>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  page1: {
    flex: 1,
    backgroundColor: 'red'
  },
  page2: {
    flex: 1,
    backgroundColor: 'yellow'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  image: {
    height: 22,
    width: 22
  }
});
```
文章里还介绍了比FlatList稍微复杂些的 [SectionList](http://facebook.github.io/react-native/docs/sectionlist.html) 组件。当需要对item进行分组，支持设置每个分组的header，footer。
这个非常适合用来做通讯录，城市地址
![demo.gif](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-c1a854d8e45b1da0.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

参考文档：


参考：
http://facebook.github.io/react-native/docs/using-a-listview.html
http://blog.csdn.net/mengks1987/article/details/70229918
