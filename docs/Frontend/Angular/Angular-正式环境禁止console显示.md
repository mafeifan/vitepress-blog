开发人员在开发过程中有意无意的在代码中使用console.log查看变量内容进行调试。
在正式环境最好屏蔽掉这些信息。更好的习惯是console.log用完就删掉，多使用断点调试。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f6e07b446cf2d1b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果不想一个个删掉console.log，需要在正式环境屏蔽log信息。可按如下方法：
修改根目录的main.ts文件，添加disableConsole方法
```
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
  // 只在正式正式环境调用
  disableConsole();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// 覆盖console方法为空函数
function disableConsole() {
  Object.keys(window.console).forEach(v => {
    window.console[v] = function() { };
  });
}

```
