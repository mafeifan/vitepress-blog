写组件的时候，一般都有默认模板，但是很多时候希望组件可以接收自定义模板。

比如 ng-zorro项目中的 [BackTop回到顶部](https://ng.ant.design/components/back-top/zh) 组件就支持自定义模板。
默认时可以使用`<nz-back-top></nz-back-top>`。获得这个图标。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-867e4b24f3df9dc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

也可以通过
```
<nz-back-top [nzTemplate]="tpl" [nzVisibilityHeight]="100" (nzOnClick)="notify()">
      <ng-template #tpl>
        <div class="ant-back-top-inner">UP</div>
      </ng-template>
</nz-back-top>
```
添加自定义模板。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-373d8e16ede92bdc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

核心是 [ngTemplateOutlet](https://angular.cn/api/common/NgTemplateOutlet)

我们通过[源码](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/back-top/nz-back-top.component.ts)来看是如何实现的。
关键字 ngTemplateOutlet 

1.  先看模板，ngTemplateOutlet  是一个指令，它接收模板变量，可以实现模板的动态渲染，
在这里，如果定义了 nzTemplate 变量就使用它，否则用默认的defaultContent。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-44ffef763802ac23.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. nzTemplate 是输入变量，类型是TemplateRef, 即模板引用。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-d5d00bb6a634c3b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

 3. 使用自定义模板
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-60ca5ebde5cb5808.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
