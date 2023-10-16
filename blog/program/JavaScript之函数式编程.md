---
slug: js-fp-coding
title: JavaScript之函数式编程
date: 2021-06-02
authors: youngjeff
tags: [js, FP]
keywords: [js, FP]
description: 函数式编程(Functional Programming, FP)，是一种编程范式，常用的编程范式还有：面向对象编程，面向过程编程。
image: /img/blog/js-fp-coding/1.webp
---

## 啥是函数式编程？

函数式编程(Functional Programming, FP)，是一种编程范式，常用的编程范式还有：面向对象编程，面向过程编程；

- 面向对象编程：把现实世界中的事物抽象成程序中的类和对象，通过封装，多态，继承来演示不同事物之间的联系；
- 函数式编程：把现实中的事物和事物的联系抽象到程序中（把运算过程进行抽象）

**对函数式编程的理解**：

- 程序本质：根据输入通过运算获得相应输出
- 函数式编程中的函数不是指程序中的函数 Function，而是数学中的函数（映射关系），例如：y=f(x)
- 相同的输入始终要得到相同的输出（纯函数）

```
// 非函数式
let n1 = 2
let n2 = 3
let sum = n1 + n2
console.log(sum)

// 函数式
function add(n1, n2) {
    return n1 + n2
}
let sum = add(2, 3)
console.log(sum)
```

## 为啥要学？

- 前端领域的流行库：react/vue 都在使用
- 函数式编程可以抛弃 this
- 有很多库可以帮助我们进行函数式开发，比如：[lodash](https://www.lodashjs.com/)

## 函数式编程的前置知识

1. 在 JavaScript 中，函数是一等公民
2. 高阶函数（用来屏蔽细节，只关心目标），常用的高阶函数有：filter,map,forEach,every 等

函数可以存储在变量中，可以当作参数传递，还能当作返回值

```
// 把函数赋值给变量
let fn = function () {
    console.log("hello")
}
fn()

// 函数作为参数传递，forEach实现
function forEach (array, fn) {
  for (let i = 0; i < array.length; i++) {
      fn(array[i])
  }
}
// test
let arr = [1, 2, 3]
forEach(arr, item => {
  item = item * 2
  console.log(item) // 2 4 6
})

// 当作返回值返回
function fn2(){
  let num = 100;
  return function(){
    console.log(num)
  }
}
// test
const res = fn2()
res()  //100
```

3. 闭包（延长作用域链）闭包的概念：内部函数可以访问外部函数的变量和参数闭包的本质：函数在执行的时候会放在一个执行栈上，当函数执行完毕后会从栈移除，但是，堆上的作用域成员因为还被引用着，得不到释放，因为就可以访问到；继续用上面的代码案例

```
function fn2(){
  let num = 100;
}
// 正常情况下，执行完fn2，里面的变量num会释放掉
function fn2(){
  let num = 100;
  return function(){
    console.log(num)
  }
}
// 在上面函数中，返回了一个函数，而且在函数中还访问了原来函数内部的成员，就可以称为闭包

// test
const res = fn2()
res()
// res为外部函数，当外部函数对内部成员有引用的时候，那么内部的成员num就不能被释放。当调用res时，就可以访问num。
```

## 纯函数是啥？

概念：相同的输入永远会得到相同的输出，而且没有任何可观察的副作用。类似数学中的函数，y=f(x)

![图1](/img/blog/js-fp-coding/1.webp)

```
let numbers = [1, 2, 3, 4, 5]
// slice方法是纯函数，截取的时候返回截取的函数，不影响原数组
numbers.slice(0, 3) // => [1, 2, 3]
numbers.slice(0, 3) // => [1, 2, 3]
numbers.slice(0, 3) // => [1, 2, 3]

// 不纯的函数
// 对于相同的输入，输出是不一样的
// splice方法，返回原数组，改变原数组
numbers.splice(0, 3) // => [1, 2, 3]
numbers.splice(0, 3) // => [4, 5]
numbers.splice(0, 3) // => []
```

纯函数的优点：

- 可缓存：因为对于相同的输入始终有相同的结果，那么可以把纯函数的结果缓存起来，可以提高性能
- 可测试：纯函数让测试更加的方便
- 并行处理

```
//  调用lodash
const _ = require('lodash')
function getArea(r) {
  console.log(r)
  return Math.PI * r * r
}

let getAreaWithMemory = _.memoize(getArea)
console.log(getAreaWithMemory(4))
console.log(getAreaWithMemory(4))
console.log(getAreaWithMemory(4))
// 4
// 50.26548245743669
// 50.26548245743669
// 50.26548245743669

// 看到输出的4只执行了一次，因为其结果被缓存下来了
```

下面模拟一个记忆函数

```
function memoize (f) {
  let cache = {}
  return function () {
    // arguments是一个伪数组，所以要进行字符串的转化
    let key = JSON.stringify(arguments)
    // 如果缓存中有值就把值赋值，没有值就调用f函数并且把参数传递给它
    cache[key] = cache[key] || f.apply(f,arguments)
    return cache[key]
  }
}

let getAreaWithMemory1 = memoize(getArea)
console.log(getAreaWithMemory1(4))
console.log(getAreaWithMemory1(4))
console.log(getAreaWithMemory1(4))
// 4
// 50.26548245743669
// 50.26548245743669
// 50.26548245743669
```

## 函数柯里化又是啥？

详情可参考另一篇拆解柯里化：[函数柯里化](https://www.jianshu.com/p/4a7c3790822f)

将多变量函数拆解为单变量的多个函数的依次调用；就是利用函数执行，可以形成一个不销毁的私有作用域，把预先处理的内容放到不销毁的作用域里面，返回一个函数供以后调用；

```
// 普通的纯函数
function checkAge (min, age) {
    return age >= min
}
console.log(checkAge(18, 20))  //true
console.log(checkAge(18, 24))  //true
// 经常使用18，这段代码是重复的。为了避免重复改造函数：
function checkAge (min) {
    return function (age) {
        return age >= min
    }
}

let checkAge18 = checkAge(18)

console.log(checkAge18(20)) //true
console.log(checkAge18(24)) //true
```

lodash 中的柯里化-curry

```
const _ = require('lodash')

// 参数是一个的为一元函数，两个的是二元函数
// 柯里化可以把一个多元函数转化成一元函数
function getSum (a, b, c) {
  return a + b + c
}
// 定义一个柯里化函数
const curried = _.curry(getSum)

// 如果输入了全部的参数，则立即返回结果
console.log(curried(1, 2, 3)) // 6
//如果传入了部分的参数，此时它会返回当前函数，并且等待接收getSum中的剩余参数
console.log(curried(1)(2, 3)) // 6
console.log(curried(1, 2)(3)) // 6
```

**简单实现一个柯里化转换函数**

分析：

1. 调用 curry，传递一个纯函数，完成后返回一个柯里化函数
2. 如果调用 curried 传递的参数和 getSum 参数个数相同，就立即执行并返回结果；如果调用 curried 传递的是部分参数，那么需要返回一个新函数，等待接受 getSum 其他参数

```
function curry(func) {
  return function curriedFn(...args) {
    // 判断实参和形参的个数
    console.log('看下args', args);
    if (args.length < func.length) {
      return function () {
        // 等待传递的剩余参数
        // 第一部分参数在args里面，第二部分参数在arguments里面
        console.log('看下arguments', arguments);
        return curriedFn(...args.concat(Array.from(arguments)));
      };
    }
    // 如果实参大于等于形参的个数
    // args是剩余参数
    return func(...args);
  };
}
function getSum(a, b, c) {
  return a + b + c;
}

const curriedTest = curry(getSum)

console.log(curriedTest(1, 2, 3))  // 6
console.log(curriedTest(1)(2, 3))  // 6
console.log(curriedTest(1, 2)(3))  // 6

```

柯里化优点：

- 参数复用（对函数参数的‘缓存’）
- 让函数粒度更细，变的更灵活
- 将多元函数比变成一元函数，然后组合函数产生更强大功能

## 函数组合

纯函数和柯里化很容易写出洋葱代码 h(g(f(x)))，函数组合可以避免这种情况；

```
a --> fn --> b
a-> f3 -> m -> f2 -> n -> f1 -> b
其实中间m、n、是什么我们也不关心 类似于下面的函数
```

先来看看 Lodash 中的组合函数用法

- flow() //从左往右执行
- flowRight() //从右往左执行

```
//  获取数组的最后一个元素并转化成大写字母
const _ = require('lodash')

const reverse = arr => arr.reverse()
const first = arr => arr[0]
const toUpper = s => s.toUpperCase()

const f = _.flowRight(toUpper, first, reverse)

console.log(f(['one', 'two', 'three'])) // THREE
```

**简单实现一个 flowRight 函数** 分析： 入参不固定，都是函数，出参是一个函数，这个函数要接受一个初始值

```
function compose(...args) {
  // args代表调用compose传入的要组合的函数数组
  return function (value) {
    // compose返回的函数接受一个初始值value
    // 因为要从右往左执行，所以数组反转一下
    // reduce方法接受两个参数：一个迭代函数，一个初始化值;
    // 其中的迭代函数的前两个参数：total代表上一次调用fn的返回值，fn指当前正在处理值（此处是函数）
    return args.reverse().reduce(function (total, fn) {
      return fn(total);
    }, value);
  };
}

//test
const reverse = (arr) => arr.reverse();
const first = (arr) => arr[0];
const toUpper = (s) => s.toUpperCase();

const fTest = compose(toUpper, first, reverse);
console.log(fTest(['one', 'two', 'three'])); // THREE

```
