Laravel 中的 `Illuminate\Support\Fluent` 是个非常好用的类。
它封装了一些操作数组和对象

举例说明他能做的事情

```php
<?php

// Create a new array containing sample data
$testArray = [
    'first'  => 'The first value',
    'second' => 'The second value',
    'third'  => 'The third value'
];

// Create a new stdClass instance containing sample data
$testObject = new stdClass;
$testObject->first  = 'The first value';
$testObject->second = 'The second value';
$testObject->third  = 'The third value'


// 这样操作是没有问题的
// Retrieve the 'first' item
$value = $testArray['first'];

// Retrieve the 'first' property
$value = $testObject->first;

# 但是访问不存在的属性或key会报错
// Will raise an exception
$value = $testArray['does_not_exist'];

// Will raise an exception
$value = $testObject->doesNotExist;

# 传统做法，加if判断,是不是很麻烦，当然我们也可以用 Laravel 提供的 array_get, object_get, data_get
// Get a value from an array, or a default value
// if it does not exist.

if (array_key_exists('does_not_exist', $testArray))
{
    $value = $testArray['does_not_exist'];
} else {
    $value = 'Some default value';
}


// Get a value from an object, or a default value
// if it does not exist.

if (property_exists('doesNotExist', $testObject))
{
    $objectValue = $testObject->doesNotExist;
} else {
    $objectValue = 'Some default value';
}

```

来看看使用Fluent后的做法，非常方便且优雅

```php
<?php

// Some example data, which could be obtained from
// any number of sources.
$testArray = [
    'first'  => 'The first value',
    'second' => 'The second value',
    'third'  => 'The third value'
];

// Create a new Fluent instance.
$fluent = new Fluent($testArray);


// Accessing a value like an array.
$value = $fluent['first'];

// Accessing a value like an object.
$secondValue = $fluent->first;

// 直接返回null，不会报错
$value = $fluent['does_not_exist'];

$secondValue = $fluent->doesNotExist;
```

Fluent 还提供了几个方法，可以让你更加方便的操作数组和对象

```php
<?php
// A test array for use with Fluent.
$testArray = [
    'first'  => 'The first value',
    'second' => 'The second value',
    'third'  => 'The third value'
];

// A test object for use with Fluent.
$testObject = new stdClass;
$testObject->first  = 'The first value';
$testObject->second = 'The second value';
$testObject->third  = 'The third value';



$fluent = new Fluent($testArray);

# get($key, $default = null)


// The first value
$message = $fluent->get('first');

$fluent = new Fluent($testObject);

// The first value
$message = $fluent->get('first');

// Does not exist yet!
$message = $fluent->get('does_not_exist', function() {
    return 'Does not exist yet!';
});

# Fluent与闭包

$testObject = new stdClass;
$testObject->method = function() {
    return 'Hello, world!';
};

$fluent = new Fluent($testObject);

$message = $fluent->method;

// Or even this:

$message = $fluent->get('method');

// true
$isClosure = ($fluent->method instanceof Closure):

// Hello, world!
$message = value($fluent->method);

// Hello, world!
$message = value($fluent->get('method'));

# getAttributes()
$fluent = new Fluent($testObject);

// 返回数组
$attributes = $fluent->getAttributes();

$fluent = new Fluent($testObject);

// {"first":"The first value","second":"The second value","third":"The third value","method":{}}
$jsonValue = $fluent->toJson();

```

## 参考

https://stillat.com/blog/2016/11/21/laravel-fluent-part-one-introduction