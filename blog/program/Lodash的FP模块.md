---
slug: lodash-fp
title: Lodash的FP模块
date: 2021-07-02
authors: youngjeff
tags: [lodash, FP]
keywords: [lodash, FP]
description: 经常用Lodash的你，是否了解过它提供的FP模块？
image: /img/blog/lodash-fp/1.webp
---

> 前言：经常用 Lodash 的你，是否了解过它提供的 FP 模块？ FP 是啥 ：[FP(Functional Programming)：函数式编程](https://www.jianshu.com/p/3fa8d5242659)

答：[函数组合](https://www.jianshu.com/p/3fa8d5242659)时有很多函数需要频繁[柯里化](https://www.jianshu.com/p/3fa8d5242659)，而 Lodash/fp 模块就是解决此问题的；

FP 模块特性：

- auto-curried iteratee-first data-last （函数之先，数据之后）
- 自动 curry 化
- immutable

Lodash 普通函数使用方法

```
// 数据置先，函数置后
_.map(['a', 'b', 'c'], _.toUpper)
```

FP 模块使用方法

```
// 函数置先，数据置后
fp.map(fp.toUpper, ['a', 'b', 'c'])
fp.map(fp.toUpper)(['a', 'b', 'c'])
```

FP 模块对于组合函数的友好

```
const fp = require('lodash/fp')

const f = fp.flowRight(fp.join('-'), fp.map(fp.toLower), fp.split(' '))

console.log(f('NEVER SAY DIE')) // never-say-die
```

使用者可以不用关心具体调用了哪个函数，每个函数可以随意组合调整。

---

**Lodash 中 map 方法的小问题**

```
const _ = require('lodash')
console.log(_.map(['23', '8', '10'], parseInt))
```

期望结果：`[23, 8, 10] ` 实际结果：`[ 23, NaN, 2 ] ` **>为啥呢?**

![图1](/img/blog/lodash-fp/1.webp)

![图2](/img/blog/lodash-fp/2.webp)

**原因：** \_.map 的第二个参数（迭代函数）接受三个参数，第一个是遍历的当前值，第二个是当前索引，第三个是数组本身； parseInt 第二个参数表示进制基数，可选值是 2-36 之间的整数所以运算结果是

```
parseInt('23', 0, array)  //0表示默认值10
parseInt('8', 1, array)
parseInt('10', 2, array)
//[ 23, NaN, 2 ]
```

**而使用 fp 模块的 map 方法不存在下面的问题**

```
console.log(fp.map(parseInt, ['23', '8', '10']))
// [ 23, 8, 10 ]
```
