切换页面是app最基本功能。这个功能需要用Navigation组件实现。
RN发展太快了(v49)，之前自带的Navigation组件被弃用了，如果只针对ios，还可以用[NavigatorIOS](http://facebook.github.io/react-native/docs/navigation.html#navigatorios)
社区中也有几个不错的
https://github.com/react-community/react-navigation
https://github.com/wix/react-native-navigation
https://github.com/happypancake/react-native-tab-navigator
以react-native-tab-navigator为例，实现下面的tab切换效果很容易：
![demo.gif](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1c57c3369afc42dc.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
完整代码如下，其实就是把文档中的例子稍微调整下。
```javascript
import React from 'react';
import TabNavigator from 'react-native-tab-navigator';
import { StyleSheet, Text, Button, TextInput, View, Alert, Image } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedTab: 'home'};
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
            <View style={styles.page1}></View>
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
  image: {
    height: 22,
    width: 22
  }
});
```
默认选中名为home的tab。点击可以切换。
通过StyleSheet给元素设置样式。
需要注意的：
1. 尺寸不要设置单位，在RN中尺寸与设备无关。
2. 图片是透明png，可在这[下载](https://github.com/knightsj/GitHubPopular-SJ/tree/master/github_client/res/images)
3. 如ic_polular.png的尺寸是57*57， ic_polular@2x.png的尺寸是114*114。只引入最基本的ic_polular.png，只要按这种命名规则在不同设备会自动适配(待验证)。
```
  image: {
    height: 22,
    width: 22
  }
```
