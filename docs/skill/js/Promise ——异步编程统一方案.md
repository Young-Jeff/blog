---
slug: promise-summary
title: Promise ——异步编程统一方案
date: 2021-07-07
authors: youngjeff
tags: [code, 总结]
keywords: [code, 总结]
description: Promise 对象用于表示一个异步操作的最终完成 (或失败)及其结果值。。
image: /img/blog/promise-summary/1.webp
---

虽然回调函数是所有异步编程方案的根基；但是如果我们直接使用传统回调方式去完成复杂的异步流程，就会无法避免大量的回调函数嵌套；导致回调地狱的问题。为了避免这个问题。CommonJS 社区提出了 Promise 的规范，ES6 中称为语言规范。

> [MDN：Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise 对象用于表示一个异步操作的最终完成 (或失败)及其结果值。一个 Promise 必然处于以下几种状态之一：待定（pending）: 初始状态，既没有被兑现，也没有被拒绝。已兑现（fulfilled）: 意味着操作成功完成。

- 基本用法已兑现（fulfilled）:

```
const promise = new Promise((resolve, reject) => {
  resolve(1)
})
promise.then((value) => {
  console.log('resolved', value) // resolve 1
},(error) => {
  console.log('rejected', error)
})
```

- 已拒绝（rejected）:

```
const promise = new Promise((resolve, reject) => {
  reject('失败了')
})
promise.then((value) => {
  console.log('resolved', value)
},(error) => {
  console.log('rejected', error)  // rejected 失败了
})
```

**即便 promise 中没有任何的异步操作，then 方法的回调函数仍然会进入到事件队列中排队。** **Promise 的本质上也是使用回调函数的方式去定义异步任务结束后所需要执行的任务。这里的回调函数是通过 then 方法传递过去的**

## 链式调用

- promise 对象 then 方法，返回了全新的 promise 对象。可以再继续调用 then 方法，如果 return 的不是 promise 对象，而是一个值，那么这个值会作为 resolve 的值传递，如果没有值，默认是 undefined
- 后面的 then 方法就是在为上一个 then 返回的 Promise 注册回调
- 前面 then 方法中回调函数的返回值会作为后面 then 方法回调的参数
- 如果回调中返回的是 Promise，那后面 then 方法的回调会等待它的结束

## 异常处理

1. then 的第二个参数 onRejected 方法
2. catch() 两者的区别： **catch 是给整个 promise 链条注册的一个失败回调；而 then 的第二个参数 onRejected 方法，只能捕获第一个 promise 的报错，如果当前 then 的 resolve 函数处理中有报错是捕获不到的。** `使用.catch方法更为常见，因为更加符合链式调用`

```
ajax('/api/user.json')
  .then(function onFulfilled(res) {
    console.log('onFulfilled', res)
  }).catch(function onRejected(error) {
    console.log('onRejected', error)
  })
```

等价于

```
ajax('/api/user.json')
  .then(function onFulfilled(res) {
    console.log('onFulfilled', res)
  })
  .then(undefined, function onRejected(error) {
    console.log('onRejected', error)
  })
```

## 常用的静态方法

- Promise.resolve()
- Promise.reject()
- Promise.all()
- Promise.race()

## Promise 案例

```
function ajax (url) {
  return new Promise((resolve, rejects) => {
    // 创建一个XMLHttpRequest对象去发送一个请求
    const xhr = new XMLHttpRequest()
    // 先设置一下xhr对象的请求方式是GET，请求的地址就是参数传递的url
    xhr.open('GET', url)
    // 设置返回的类型是json，是HTML5的新特性
    // 我们在请求之后拿到的是json对象，而不是字符串
    xhr.responseType = 'json'
    // html5中提供的新事件,请求完成之后（readyState为4）才会执行
    xhr.onload = () => {
      if(this.status === 200) {
        // 请求成功将请求结果返回
        resolve(this.response)
      } else {
        // 请求失败，创建一个错误对象，返回错误文本
        rejects(new Error(this.statusText))
      }
    }
    // 开始执行异步请求
    xhr.send()
  })
}

ajax('/api/user.json').then((res) => {
  console.log(res)
}, (error) => {
  console.log(error)
})
```

---

关于 Promise 源码分析可以看另外一篇：[Promise 手写](https://www.jianshu.com/p/62a132eba4ae)
