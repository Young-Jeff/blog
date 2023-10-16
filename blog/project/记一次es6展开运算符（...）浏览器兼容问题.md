---
slug: es6-expansion-operator-bug
title: 记一次es6展开运算符（...）浏览器兼容问题
date: 2022-09-22
authors: youngjeff
tags: [bug, code]
keywords: [bug, code]
image: /img/blog/es6-expansion-operator-bug/1.webp
---

## bug 背景

> 一个 vue2 项目，在多部手机测试都 ok，唯独一部 vivo 手机上（Android 版本为 7.1.2）打开首页是白屏；

---

## 定位原因

因为是我新加了一个页面后导致的问题，首先想到的就是我的代码有兼容问题； 1）通过 vconsole 看到错误信息是打包后的某个 chunk 文件加载失败。（如图 1） ![图1](/img/blog/es6-expansion-operator-bug/1.webp)

2）通过该 chunk 文件找到源文件，猜测是用了一些 es6 的语法导致的，通过看打包后的代码验证了猜测（如图 2），因为打包后 async 和展开运算符仍然存在，那就是 babel 没有对其进行 Polyfill ![图2](/img/blog/es6-expansion-operator-bug/2.webp)

那接下来就是看为啥没转译； 3）通过 userAgent 查看一下浏览器版本，发现 Chrome 版本是 55，emmmm...有点低；（如图 3） ![图3](/img/blog/es6-expansion-operator-bug/3.webp)

4）通过 MDN 查看 async 和展开运算符的浏览器支持情况（如图 4），async/await，是刚好踩着及格线，支持到 55，pass ![图4](/img/blog/es6-expansion-operator-bug/4.webp)

再来看展开运算符（如图 5）看红色框里，也没问题，到 46 版本呢；然而。。往下面一看，绿色部分才是问题所在，我恰恰用的就是对象展开。。。，而对象展开是从 60 版本后才支持，大于测试机的 55 版本；定位到问题，那就开始解决

![图5](/img/blog/es6-expansion-operator-bug/5.webp)

## 解决问题

1）首先通过项目根目录下执行`npx browserslist` ，查看筛选后兼容的浏览器（如图 6） ![图6](/img/blog/es6-expansion-operator-bug/6.webp)

由.browserslistrc 配置文件可知，确实没兼容到 Chrome 55 版本所以，更改该文件

```
> 1%
last 2 versions
not dead
Chrome > 55
```

---

打包部署，完美解决！
