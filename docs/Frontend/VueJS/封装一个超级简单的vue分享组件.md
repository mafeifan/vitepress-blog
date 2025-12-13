更新： 2018-5月起 jiathis关闭分享功能，请使用 [http://sharesdk.mob.com/](http://sharesdk.mob.com/) 或搜索其他社会化分享类库

开发网页经常遇到分享功能，这时候可以利用现成的工具比如 [JiaThis](http://www.jiathis.com/customize)，通过几步简单配置就实现分享共享功能啦。

比如我想生成图标式的分享
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ce0c540b62d344cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到的基础代码如下：
```
<!-- JiaThis Button BEGIN -->
<div class="jiathis_style">
<span class="jiathis_txt">分享到：</span>
<a class="jiathis_button_qzone">QQ空间</a>
<a class="jiathis_button_tsina">新浪微薄</a>
<a class="jiathis_button_tqq">腾讯微薄</a>
<a class="jiathis_button_renren">人人网</a>
<a class="jiathis_button_kaixin001">开心网</a>

<a href="http://www.jiathis.com/share" class="jiathis jiathis_txt jiathis_separator jtico jtico_jiathis" target="_blank">更多</a>
<a class="jiathis_counter_style"></a>
</div>
<script type="text/javascript" >
var jiathis_config={
	url:"http://www.jianshu.com",
	summary:"分享摘要",
	title:"分享标题 ##",
	shortUrl:false,
	hideMore:false
}
</script>
<script type="text/javascript" src="http://v3.jiathis.com/code/jia.js" charset="utf-8"></script>
<!-- JiaThis Button END -->
```
大概分成三部分
分享图标html模版，jiathis_config 配置对象， `http://v3.jiathis.com/code/jia.js`类库
根据Vue组件的思想，现在封装成一个组件，方便将来在其他项目中使用。
如果是vue-cli，新建一个Share.vue，内容如下很简单。template为空，因为可能是自定义需要外部传入，组件必须带一个config属性，是配置项对象，我把config挂到了window下，这样可能有风险。但是目前找不到更好的办法。
```
<template>

</template>

<script>
// JiaThis 按钮自定义大全  
// http://www.jiathis.com/customize 
export default {
  name: 'share',
  props: {
    config: {
      type: Object,
      required: true
    },
  },
  mounted: function () {
   // 这里需要优化
    window.jiathis_config = Object.assign({
      url: "http://www.jiathis.com",
      summary: "分享摘要",
      title: "分享标题",
      shortUrl: false,
      hideMore: false
    }, this.config)
    // 这里需要vue引入jquery
    // http://api.jquery.com/jquery.getscript/
    $.getScript('http://v3.jiathis.com/code/jia.js')
  },
  computed: {

  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

```
在需要用到分享的地方
template内，注意 [inline-template](https://cn.vuejs.org/v2/guide/components.html#%E5%86%85%E8%81%94%E6%A8%A1%E6%9D%BF)，这样会把组件将把它的内容当作它的模板，这部分需要自定义不能写死在share组件内。
```
    <share :config="shareConfig" inline-template>
      <div class="jiathis_style_32x32">
        <a class="jiathis_button_tqq"></a>
        <a class="jiathis_button_cqq"></a>
        <a class="jiathis_button_qzone"></a>
        <a class="jiathis_button_tsina"></a>
        <a href="http://www.jiathis.com/share" class="jiathis jiathis_txt jiathis_separator jtico jtico_jiathis" target="_blank"></a>
        <a class="jiathis_counter_style"></a>
      </div>
    </share>
```
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a89fd4c102ef0604.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


