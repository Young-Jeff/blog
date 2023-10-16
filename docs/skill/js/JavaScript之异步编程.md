---
slug: js-async-coding
title: JavaScript之异步编程
date: 2021-07-07
authors: youngjeff
tags: [js, EventLoop, 异步编程]
keywords: [js, EventLoop, 异步编程]
description: 最早js语言就是运行在浏览器端的语言，目的是为了实现页面上的动态交互。实现页面交互的核心就是DOM操作，这就决定了它必须使用单线程模型，否则就会出现很复杂的线程同步问题。
image: /img/blog/js-async-coding/1.webp
---

> 最早 js 语言就是运行在浏览器端的语言，目的是为了实现页面上的动态交互。实现页面交互的核心就是 DOM 操作，这就决定了它必须使用单线程模型，否则就会出现很复杂的线程同步问题。 假设在 js 中有多个线程一起工作，其中一个线程修改了这个 DOM 元素，同时另一个线程又删除了这个元素，此时浏览器就无法明确该以哪个工作线程为准。所以为了避免线程同步的问题，从一开始，js 就设计成了单线程的工作模式。

**单线程优缺点：** 单线程优点就是更安全，简单；缺点就是如果碰到很耗时的任务（比如 ajax 请求，文件读写），会出现假死情况，用户体验差，所以就出现了同步任务和异步任务来解决这个问题；

## 同步模式和异步模式

- 同步模式：代码按顺序一行一行执行，是典型的请求-相应模式，执行顺序和编写顺序保持一致；

```
console.log('global begin')
function bar () {
    console.log('bar task')
}
function foo () {
    console.log('foo task')
    bar()
}
foo()
console.log('global end')

// global begin
// foo task
// bar task
//global end

// 使用调用栈的逻辑
```

- 异步模式：任务可以同时执行，不必等待上一个任务结束才继续执行；（比如生活中，你可以同时烧水和煮饭一样）

```
console.log('global begin')
// 延时器
setTimeout(function timer1 () {
    console.log('timer1 invoke')
}, 1800)
// 延时器中又嵌套了一个延时器
setTimeout(function timer2 () {
    console.log('timer2 invoke')
    setTimeout(function inner () {
        console.log('inner invoke')
    }, 1000)
}, 1000)
console.log('global end')

// global begin
// global end
// timer2 invoke
// timer1 invoke
// inner invoke

//除了调用栈，还用到了消息队列和事件循环
```

js 执行异步代码而不用等待，是因有为有 消息队列和事件循环。

- 消息队列：消息队列是一个先进先出的队列，它里面存放着各种消息。
- 事件循环（EventLoop）：事件循环是指主线程重复从消息队列中取消息、执行的过程

**事件循环流程：**

1. 宿主环境（node 服务器或者浏览器）为 js 创建线程时，会创建堆（heap）和栈（stack）， 堆内存储 javaScript 对象，栈内存储执行上下文；
2. 栈内执行上下文的同步任务，执行完即退栈；当执行异步任务时，该异步任务进入等待状态（不入栈）,同时通知异步进程，执行完该异步进程后的回调放到消息队列中
3. 当栈内同步任务执行结束后，依次执行消息队列中的任务 `注：js是单线程的，浏览器不是单线程的，有一些API是有单独的线程去做的`

![图1](/img/blog/js-async-coding/1.webp)

## 宏任务和微任务

- 宏任务(macrotask)：每次执行栈执行的代码就是宏任务（包括每次从消息队列中获取一个事件回调并放到执行栈中执行）
- 微任务(microtask)：当前宏任务执行结束后立即执行的任务（当前宏任务之后，下一个宏任务之前）；所以它的响应速度相比 setTimeout 会更快，因为无需等待渲染，也就是说：在某一个宏任务执行完后，就会将它执行期间产生的所有微任务执行完毕；

举个例子：我去银行排队办理业务，原本我只想办理取款业务（取款业务当成是宏任务）,办理完取款业务后，立即我又想办一个开卡业务（开卡业务当成一个微任务）；这个时候，我不会重新去排队，而是在还没离开办理窗口时，立马让柜台人员帮我再次办理这个业务；如果我还有其他业务要办理（更多微任务）,都是可以继续办理，只要我不离开窗口（后面排队用户也不应该有任何怨言，因为我有排队并且没有离开柜台）。

**宏任务包含:**

```
script(整体代码)
setTimeout
setInterval
I/O
UI交互事件
postMessage
MessageChannel
setImmediate(Node.js 环境)
```

**微任务包含:**

```
Promise.then
Object.observe
MutaionObserver
process.nextTick(Node.js 环境)
```

## 回调函数（异步编程的根基）

概念：由调用者定义，交给执行者执行的函数缺点：如果异步函数嵌套很深，就会不可避免的产生**_回调地狱_**

```
// callback就是回调函数
function foo(callback) {
    setTimeout(function(){
        callback()
    }, 3000)
}

foo(function() {
    console.log('这就是一个回调函数')
})
```

[Promise —— 一种更优的异步编程统一方案](https://www.jianshu.com/p/93b63e08f792)
