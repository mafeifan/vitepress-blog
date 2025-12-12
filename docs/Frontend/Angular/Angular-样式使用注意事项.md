## 预处理器
如果是用angular-cli生成的项目，可以在`angular.json`中配置你喜欢的样式预处理器
```json
"schematics": {
  "@schematics/angular:component": {
    // 指定组件生成的默认前缀
    "prefix": "fx",
    // 定义样式预处理器，可选值 css, scss, less 或 stylus, 无需安装其他依赖
    "styleext": "scss"
  }
},
```
## :host
如果需要指定组件宿主元素的样式，可以使用`:host`选择器
<app-hero-search></app-hero-search>这样的自定义元素，这些自定义元素不是组件自身模板的一部分，而是父组件模板的一部分，所以我们需要`:host`来指定它，这也是在组件内部样式规则中选择宿主元素的唯一方式。
```css
:host {
  border: 1px solid #00f;
}
```
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-0d48f8a95672bd63.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## ::ng-deep
在Angular中，对组件的样式规则进行了内部封装，即为组件定义的样式规则都只在组件内部才能生效，不进不出，所以组件样式通常只会作用于组件自身的 HTML 上。因此可以使用`::ng-deep`来强制一个样式对各级子组件的视图也生效。
比如子组件和父组件中都有h4标签，假设我们在父组件的css文件中写入
```css
::ng-deep h4{
  color: #00f;
}
```
可以看到不止父组件中的h4标签中的字体颜色改变了，子组件中的也改变了。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-dbd489ae83ce64f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 但是需要注意的是，在我们的项目中，不止写入上面样式代码相关的组件和其子组件样式改变了，其他的不相关的组件h4标签颜色也发生了改变。:ng-deep 等于污染了全局样式

## :host ::ng-deep

那这样该怎么办呢，我们并不想改变全局的h4标签的字体颜色，那么只需要在::ng-deep前面加上:host就可以把当前样式限制在当前组件和其子组件内部了。
```css
:host ::ng-deep h4 {
  color: #00f;
}
```

## @component 的 encapsulation
默认情况下，你看发现 angular 生成的 html 自带一堆类外的属性
```html
<hero-details _nghost-pmm-5>
  <h2 _ngcontent-pmm-5>Mister Fantastic</h2>
  <hero-team _ngcontent-pmm-5 _nghost-pmm-6>
    <h3 _ngcontent-pmm-6>Team</h3>
  </hero-team>
</hero-detail>
```
这是因为默认情况下组件的[encapsulation]([https://angular.cn/api/core/ViewEncapsulation](https://angular.cn/api/core/ViewEncapsulation)
)属性值为Emulated，即模拟浏览器的支持的Shadow DOM，目的把 CSS 样式局限在组件视图。(只进不出，全局样式能进来，组件样式出不去)
encapsulation可选值为 Emulate | Native | None | ShadowDom
如果你希望样式可进可出，设置为None，详情的使用参见官方文档，这里不细致展开。
```typescript
@Component({
  selector: 'fx-button',
  // 指定组件的样式封装性
  encapsulation: ViewEncapsulation.None,
  templateUrl: './fx-button.component.html',
  styleUrls: ['./fx-button.component.scss']
})
```
> 关于 :host 和 :host-context 属于 Shadow DOM 的内容

## 什么是Shadow DOM
参见：[深入浅出 Shadow DOM](https://github.com/Tencent/omi/blob/master/tutorial/shadow-dom-in-depth.cn.md)

## 总结
1. 默认情况下，组件的样式文件只会影响对于的组件，比如
-- fx-button.component.ts
-- fx-button.component.scss
-- fx-button.component.html
在`fx-button.component.scss`中定义的样式只会影响`fx-button.component.html`。 记忆只进不出
2. 可以使用 `::ng-deep` 影响组件包含的子组件的样式


## 参考
[https://angular.cn/guide/component-styles](https://angular.cn/guide/component-styles)
