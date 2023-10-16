---
slug: nuxt-import-sentry
title: Nuxt.js接入Sentry
date: 2022-08-02
authors: youngjeff
tags: [随笔, code, 总结]
keywords: [随笔, code, 总结]
description: 本文介绍了nuxt.js接入sentry的基本流程，sourcemap的上传和解析步骤以及过程中碰到的问题。
image: /img/blog/nuxt-import-sentry/1.webp
---

[Sentry](https://docs.sentry.io/)简介

> Sentry 是一个流行的错误监控平台，帮助开发者分析，修复问题，优化代码的性能。可以进行错误捕获，问题追踪，并提供问题详情，适用于多个平台，多种语言。

### sentry 后台

1. sentry 默认是纯英文界面，左上角用户 > User settings > Account Details 修改中文，选择 Simplified Chinese 即可；一并把时区修改为东八区；修改后刷新网页即可显示中文 `提示：尽量第一次就把时区更改，否则下次再进行修改有可能一直修改失败（我就是这样）` ![image.png](/img/blog/nuxt-import-sentry/1.webp)

2. 项目 > 右上角创建项目，选择一个平台；官网的 Platforms 选项中是没有 nuxt 的，所以 Platforms 选择 vue，其实配置上是一样的，配置文件不同而已（`vue.config.js/nuxt.config.js`）； 3.底部信息按实际填即可，项目名字即为实际项目名， 点击创建后，会自动跳转[接入文档指引](https://docs.sentry.io/platforms/javascript/guides/vue/) ![image.png](/img/blog/nuxt-import-sentry/2.webp)

### sentry 接入

1. 安装依赖：`npm install --save @sentry/vue @sentry/tracing`
2. plugins 目录新增 sentry 插件，记得 nuxt.config.js 中引入该插件 ![image.png](/img/blog/nuxt-import-sentry/3.webp)

- dsn：项目唯一标识，由 协议+秘钥+服务器地址+项目编号组成; 当在 Sentry 平台新建一个项目后，Sentry 会自动为该 project 分配一个 dsn，dsn 用于告诉 Sentry 将 event 发送到哪里，如果不设置 dsn，Sentry 也不会发送 event； dsn 遵从下面的格式`{PROTOCOL}://{PUBLIC_KEY}:{SECRET_KEY}@{HOST}{PATH}/{PROJECT_ID}` _dsn 查看步骤：点进你的的项目 →Settings→ 客户端密钥(DSN)_ **注意：这里有个坑，我排查了好久 😭** 一般，sentry 生成的 dsn 是这样的:`http://bb8650f2e5ec5ba7c67930e73a68c9@10.1.10.211:9000/6` 即协议是 http，服务器地址是 ip 地址，这在本地开发可能没问题，但是部署后就可能接口调不通；所以根据需要把 http 换成 https，ip 改成域名；如下： `https://bb8650f2e5ec5ba7c67930e73a68c9@sentry.baidu.com/6`

- environment：环境变量

详细配置参考[官网 configuration](https://docs.sentry.io/platforms/javascript/guides/vue/configuration/)

3. 写个 bug 测试一下

```
 handleTest() {
    const a = '11'
    a.forEach()
    console.log(g.f)
 },
```

![image.png](/img/blog/nuxt-import-sentry/4.webp)

![image.png](/img/blog/nuxt-import-sentry/5.webp)

点进去就可看到详细信息 But 压缩混淆之后的代码就导致：即使代码报错了，我们也只能看到错误信息，还是非常难定位到具体是哪行代码出现的错误，如上图；所以我们如果要定位到问题所在还需要上传 sourcemap 文件。

### 上传 sourceMap

1. 安装 SentryWebpackPlugin 插件

```
npm install --save-dev @sentry/webpack-plugi
```

@sentry/webpack-plugin 是针对 webpack 项目，如果是 vite 项目使用 vite-plugin-sentry 插件 2. 在 nuxt.config.js 文件的 build 参数添加

```
 build: {
    extend(config, { isClient, isDev }) {
      if (isClient && !isDev) {
        config.devtool = 'source-map'
      }
    },
    plugins: [
      new SentryWebpackPlugin({
        include: '.nuxt/dist/client',
        urlPrefix: '~/home/_nuxt/', // 上传sourceMaps文件的前缀
        ignore: ['node_modules', 'webpack.config.js'],
        project: 'demo',
        configFile: process.env.VUE_APP_TITLE === 'production' ? 'sentry.properties' : 'sentry.test.properties', // 相当于.sentryclirc配置文件
        cleanArtifacts: true // 上传前清除原工件
      })
    ]
  }
```

- sentry.test.properties 文件

```
# 组织名称
defaults.org=font-end
# sentry服务器的地址
defaults.url=https://sentry.dev.test.com
# 上传sourceMaps要用到的token
auth.token=8f9ca900719b4eedea68ed82726ddcee06d2c8a105c26e8b5087069ebc7b1e
```

- sentry.properties 文件

```
# 组织名称
defaults.org=font-end
# sentry服务器的地址
defaults.url=https://sentry.test.com
# 上传sourceMaps要用到的token
auth.token=8f9ca900719b4eed8ea8ed82726ddce006d2c8a105c4268b508069ebc7b1e
```

以上配置都可在`.sentryclirc`文件中配置，sentry 会自动检测并使用`.sentryclirc`文件中的配置信息其中必填属性：

- org：组织名字 ![image.png](/img/blog/nuxt-import-sentry/6.webp)

- project：生成 sentry sdk 的时候建立的名字，项目面板查看
- url：sentry 的后台地址（如果是私有部署的，则是自己的地址，例https://sentry.test.com）
- auth.token：token 为 API 令牌,不是安全令牌；查找：左上角用户 > 用户设置 > 授权令牌；第一次需要点击右上角创建 ![image.png](/img/blog/nuxt-import-sentry/7.webp)
- include：指定路径让 sentry-cli 来检测有没有.map 与.js 文件，如果有就会上传到 sentry

非必填属性：

- urlPrefix：上传 sourceMaps 文件的前缀，若不传，则默认是根目录即：/ `注意：` 填写的路径要和线上的 url 资源的相对路径一致比如: 我的线上资源是经过 nginx 代理了一层，路径是：https://www.test.com/home/_nuxt/feb4126.js 那么我此处填写的是：`'~/home/_nuxt/'`

- ignore：忽略文件夹或文件不要被检测。 一般都会将 node_moudules 与 webpack.config.js 忽略掉。
- cleanArtifacts：每次先清除已经存在的文件，再上传
- configFile：用来替代.sentryclirc 文件

**tips：出现一下任何一点，都可能会出现 map 文件上传成功，但是报错定位依然失败的情况。**

1. 插件方法 SentryWebpackPlugin 中设置的 release 要和 Sentry.init 中的保持一致；也可以两个都不设置，sentry 会生成哈希值，默认帮我们保持一致
2. urlPrefix 填写的路径要一定和线上的 url 资源的相对路径一致

还有一点：只需在生产环境(线上环境)上传 sourceMap 开发环境上传 sourceMap 文件过于频繁,sentry 会报错

ok，忙活了那么久，又到了验证的时候！

1. 同样，写一个 bug；
2. 执行打包，上传 sourceMap，验证是否上传成功：找到自己项目>点击设置>source Map，如下图 ![image.png](/img/blog/nuxt-import-sentry/8.webp)

然后去问题模块，找到错误信息，点进详情；可以看到，已经显示了具体位置； sourcemap 上传到 sentry 后，sentry 会通过反解 sourcemap，通过行列信息映射到源文件上； ![image.png](/img/blog/nuxt-import-sentry/9.webp)

### Sentry 面板介绍

![image.png](/img/blog/nuxt-import-sentry/10.webp) ![image.png](/img/blog/nuxt-import-sentry/11.webp)

![image.png](/img/blog/nuxt-import-sentry/12.webp) 面包屑：还原出错误发生时，用户的关键操作路径，包括点击事件，发送请求，console log 等。 更精准的还原错误触发场景。通过全局监听 console，xhr，UI 等事件，SetTimeout 等方式实现

![image.png](/img/blog/nuxt-import-sentry/13.webp) 分别是错误页面，UA，用户，浏览器，设备等信息；

### 根据业务自定义错误详情面板

sentry 源码内有以下方法可调用： ![image.png](/img/blog/nuxt-import-sentry/14.webp)

写几个例子：

1. 主动上报错误有时候 sentry 认为这不是一个错误，但开发者认为是，此时可以主动上报一个错误

```
this.$sentry.captureException(new Error('错误'));
```

2.captureMessage 自定义上报信息以我项目为例，我把接口错误区分出 http 错误（400 或者 500 等）和接口业务报错

```
// http核心上报方法
export const reportCore = (opts) => {
  if (!isOpenSentry) return
  Sentry.withScope(function (scope) {
    scope.setLevel('error')
    Sentry.captureMessage(`${opts.message}—${opts.url}`, {
      contexts: {
        message: opts
      }
    })
  })
}

// 处理http错误信息
export const reportHttpInfoHandle = (error) => {
  const res = error.response || error
  return {
    title: '上报信息【HTTP】',
    url: res.config.url,
    data: res.config.data || res.config.params || '',
    method: res.config.method,
    status: res.status,
    statusText: res.statusText,
    responseData: JSON.stringify(res.data),
    message: res.message || res.data.error_msg || res.data,
    time: releaseTime(true)
  }
}

// 网络报错信息上报
export const reportHttp = (error) => reportCore(reportHttpInfoHandle(error))

// 接口业务错误信息上报
export const reportHttpBusiness = (error) => {
  const opts = {
    ...reportHttpInfoHandle(error),
    title: '上报信息【API业务错误】'
  }
  reportCore(opts)
}

// 获取当前时间
function releaseTime(flag = false) {
  const now = new Date()
  const fmt = (v) => (v < 10 ? `0${v}` : v)
  const date = `${now.getFullYear()}-${fmt(now.getMonth() + 1)}-${fmt(now.getDate())}`
  if (!flag) return date
  const time = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}`
  return `${date} ${time}`
}

```

上报后的效果 ![image.png](/img/blog/nuxt-import-sentry/15.webp) 3.setLevel 为上报事件设置级别；可用的值有： `fatal/critical/error/warning/log/info/debug/` 每一个上报事件都有级别，默认是 info，颜色是蓝色；如下图 ![image.png](/img/blog/nuxt-import-sentry/16.webp) 为了让它看上去更重要，更醒目，可以通过 setLevel 更改，提醒色就会变成更醒目的橘黄色，如下图 ![image.png](/img/blog/nuxt-import-sentry/17.webp)

```
// http核心上报方法
export const reportCore = (opts) => {
  if (!isOpenSentry) return
  Sentry.withScope(function (scope) {
    scope.setLevel('error')
    Sentry.captureMessage(`${opts.message}—${opts.url}`, {
      contexts: {
        message: opts
      }
    })
  })
}
```

4. 为错误信息增加’面包屑‘ breadCrumbs 里还原了错误发生时用户的关键操作路径，包括点击事件，xhr 等，还有 Expection 等，这里可以丰富 breadCrumbs

```
Sentry.addBreadcrumb({
  message: '自定义信息',
  // ...
});
```

5. 设置用户信息

```
 Sentry.configureScope((scope) => {
      scope.setUser({
        user_account: '110',
        user_name: '章三',
        user_mobile: '110'
      })
      Sentry.captureException(err)
    })
```

效果： ![image.png](/img/blog/nuxt-import-sentry/18.webp)

上面的写法会把用户信息放置在 User 栏里，如果也想让 tag 里有，则可：

```
Sentry.configureScope((scope) => {
      scope.setTag('user_account', '110')
      scope.setTag('user_name', '章三')
      scope.setTag('user_mobile', '110')
      Sentry.captureException(err)
    })
```

效果： ![image.png](/img/blog/nuxt-import-sentry/19.webp)
