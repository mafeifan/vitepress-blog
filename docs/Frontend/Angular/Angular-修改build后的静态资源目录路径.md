如果你通过angular-cli创建了一个angular项目，比如名称为`angular-quick-start`执行`ng build`后，静态资源会输出到`dist/angular-quick-start`，angular-quick-start是项目名。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-30cb815ea5d015fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果你不喜欢这个路径，可以打开`angular.json`，找到`build--options--outputPath`。
把值从"dist/angular-quick-start"改为"dist"
另外通过`ng build --help`可以查看有个`--output-path`参数，通过`ng build --output-path=dist`可以动态的指定文件输出路径
