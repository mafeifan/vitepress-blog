.sync修饰符本质上是语法糖
用于子组件可以修改父组件。

传统上可以这样做：

子组件，发射事件
```
<template>
  <div class="child" style="border: 1px dotted red">
    <input type="text" @input="handleOuter" v-model="innerText">
    <div>等待被内部组件修改</div>
  </div>
</template>

<script>
export default {
  name: 'Child',
  data () {
    return {
      innerText: '',
    }
  },
  methods: {
    // 修改内容时发射事件，然后在父组件接收
    handleOuter(e) {
      console.log(e);
      this.$emit('update:outer', this.innerText);
    },
  },
}
</script>
```

父组件：
```
<template>
  <div style="border: 1px dotted blue">
    <h1>父子组件数据传递</h1>
    <h3>Parent:</h3>
    <div v-text="fromInner"></div>
    <h3>Child:</h3>
   <!-- 接收事件并实时更新父组件的 fromInner 属性 -->
    <i-child @update:outer="val => fromInner = val"/>
  </div>
</template>
<script>
import Child from './child';
export default {
  name: 'Parent',
  components: {
    'i-child': Child
  },
  data () {
    return {
      fromInner: '',
    }
  },
  methods: {
  },
}
</script>
```

使用 .sync后
`<i-child :outer.sync="fromInner"/>`

需要注意的是sync要写在子组件上面
