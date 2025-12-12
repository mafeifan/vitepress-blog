> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-032f67c239c25f09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```javascript
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 模拟类，只能通过new Vue去实例化
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 把对象传进去，然后给对象的原型挂载方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

```


它本质上就是⼀个⽤ Function 实现的 Class，然后它的原型 prototype 以及它本⾝都扩展了⼀系列的 ⽅法和属性
