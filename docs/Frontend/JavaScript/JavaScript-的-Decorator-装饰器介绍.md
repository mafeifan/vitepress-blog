Angular大量使用了JS的装饰器特性，先看[ruanyifeng的介绍](http://es6.ruanyifeng.com/#docs/decorator)

ES7 中的 decorator 同样借鉴了这个语法糖，不过依赖于 ES5 的 Object.defineProperty 方法 。

使用babel转换
步骤 ：
1. npm install -g babel-cli
2. npm init; npm install --save-dev babel-plugin-transform-decorators-legacy
3. babel --plugins transform-decorators-legacy 1.js > 1.es5.js

例1
```
@eat
class Person {
  constructor() {}
}

function eat(target, key, descriptor) {
  console.log('吃饭');
  console.log(target);
  console.log(key);
  console.log(descriptor);
  target.prototype.act = '我要吃饭';
}

const jack = new Person();
console.log(jack.act);
```


转换后
```
var _class;

let Person = eat(_class = class Person {
  constructor() {}
}) || _class;

function eat(target, key, descriptor) {
  console.log('吃饭');
  console.log(target);
  console.log(key);
  console.log(descriptor);
  target.prototype.act = '我要吃饭';
}

const jack = new Person();
console.log(jack.act);

// 吃饭
// [Function: Person]
// undefined
// undefined
// 我要吃饭
```

例2
```
function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}


const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

babel 后
```
var _dec, _class;

function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}

const Foo = {
  foo() {
    console.log('foo');
  }
};

let MyClass = (_dec = mixins(Foo), _dec(_class = class MyClass {}) || _class);


let obj = new MyClass();
obj.foo(); // "foo"


```




