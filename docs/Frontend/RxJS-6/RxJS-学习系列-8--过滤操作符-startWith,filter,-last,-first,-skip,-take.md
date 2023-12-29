startWith: 在开头添加要发送的元素
startWith(an: Values): Observable
filter:  传入function 过滤发送的元素
take:  传入数字，只取N个数的元素
skip:  传入数字，跳过N个元素
last:  取最后一个元素
first:  取最后一个元素
```html
<script src='https://cdn.bootcss.com/rxjs/6.5.1/rxjs.umd.js'></script>
<script>
    const { from } = rxjs;
    const { filter, take, last, startWith, skip } = rxjs.operators;

    // 发出(1, 2, 3, 4, 5)
    const source = from([1, 2, 3, 4, 5]);
    const example = source.pipe(
      // 开头追加 6, 8 得 6, 8, 1, 2, 3, 4, 5
      startWith(6, 8),
      // 舍弃第一个 得 8, 1, 2, 3, 4, 5
      skip(1),
      // 只取偶数得 8, 2, 4
      filter(num => num % 2 === 0),
      // 再取前俩得 8, 2
      take(2),
      // 只取最后一个得 2
      last()
    );
    example.subscribe(val => {
      console.log(`The number: ${val}`)
    });

</script>
```

