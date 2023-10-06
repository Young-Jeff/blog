---
slug: code-review-thinking-practice
title: code review的思考和实践
date: 2022-12-02
authors: youngjeff
tags: [随笔, code, 总结]
keywords: [随笔, code, 总结]
description: code review过程中遇到的问题，以及我是如何去根据团队情况优化review流程。
image: /img/blog/code-review/1.webp
---

## 前言

关于为什么要做 code review 和它的好处就不过多赘述

就一个问题：你是否碰到维护团队项目，无从下手的情况，需求可能只需要改动很少一块代码，但是看着代码你还是踌躇了，受限于开发周期和改动后的风险不可控你又不敢轻易重构，但是你的职业素养又不想任由代码朝着不可维护的方向发展。\
在你不知道抓掉了多少头发后，本着代码只要能跑就不要动的原则和需求方的督促，你选择了妥协，很长时间后，接手项目的小伙伴不得不重构项目，开启新一轮的循环，如此往复。

开发周期紧凑，人员流动大，每个人的水平和编码风格又不同等等因素，都会造成以上结果，至此，code review 的重要性不言而喻

## 目前存在的问题

我们小组在此之前没有过 code review，但是公司其他小组有进行，这就让我能够借鉴他们的流程。

目前我们的开发流程是：长期存在的分支只有 master，大家从 master 切出自己的开发分支，开发完成后合并到 test 分支供测试环境使用，然后测试通过，把自己的开发分支合并回 master 分支打 tag 上线。\
另外，由于我们目前没有开发环境，所以测试环境也充当了开发环境的角色，必然会频繁提交代码。

基于以上，现有的 code review 就是向 master 发起合并请求的时候进行；\
在我看来，在最终要上线了合入 master 分支才进行 review 是滞后的，试想一下，你某个大需求，改动了很多代码，commit 了很多次，又要着急上线了，谁有耐心帮你 review 呢，又或者你大半夜修了个 bug，要上线，谁来帮你 review，这些因素都会造成 review 成为摆设。

## 我的思考

#### 一）应该在哪阶段进行

所以，code review 的时间应该提前

我认为，在合入主分支之前，且功能可用稳定的状态进行比较合理，又考虑到我们的测试环境会频繁提交调试代码，所以就需要在 master 和 test 之间单独有一个分支用来作为 review 分支，所以我想到了`gitflow`

#### 二）如何配合开发流程

Gitflow 是基于 git 的一个流程规范，（这里只简单介绍下，不了解的小伙伴请自行搜索）。\
gitflow 常用分支有 master，develop，feature，release，hotfix；\
其中 master 和我们熟知的是同样的用途，包含要发布生产的稳定代码，不能直接在上面修改；\
Develop 作为主开发分支，包含要下一次发布测试环境的代码；\
而 featrun 才是我们的开发分支，开发完成后合并到 develop（通过 gitflow finish 命令会自动合并），然后从 develop 切出 release 分支用于测试，测试完成后，通过 finish 命令，自动合并到 develop 和 master

所以，gitflow 中长期存在的分支有两个分别是 master 和 develop，develop 分支刚好就是我要用的，但是要稍作流程上的变动；

Gitflow 中开发功能稳定后才会往 develop 合并，然后再把变更后的 develop 合到 release 分支。\
而我们团队又会频繁往测试环境提交调试代码。\
所以，我们继续采用团队现有的流程：开发分支直接往测试分支（test）合并发布测试环境，在此过程中，自我评估是稳定的功能代码（非调试代码且不会再有大的改动）后再往 develop 分支合并进行 review，develop 的单一职责就是 review，且和 master 一样长期存在。

并且，因为 master 分支并不是所有人都有权限，而 develop 则不受权限影响，任何人都是可完成 review 后并且审核通过

#### 三）review 的频率和节奏

- 在日常维护修改上，应最少每天提交一次 review

- 在新功能开发任务或者改动比较大的需求上，应该拆分需求多次 commit，且每次 commit 改动范围要尽量少且具有关联性，并且 commit 信息要尽量清楚描述改动内容和范围，参考社区规范（比如：<https://zhuanlan.zhihu.com/p/90281637>）

- 如果遇到紧急情况，比如半夜修改了一个 bug 其他人没在线，则也正常往 develop 发起 pr，事后进行复盘

#### 四）review 需要看什么

**本着能用工具解决的，就不要人工操作，像代码风格和基本的质量问题，则可以通过 prettier 和 eslint 这类工具来保证**

包括不限于：

- 减少无用代码（console.log，注释且确定用不着的，大量重复代码等），重复代码是否过多（维护代码很大一部份痛苦来源于此），该封装就封装
- 对于重要且复杂的业务逻辑，或者采用了一些奇淫技巧，是否有清晰的注释
- 避免重复造轮子，像一些工具函数，可以用别人的，就别再自己写了，自己写的不一定有别人的健壮（比如，lodash 库），另外对于别人封装的公用方法，如果加一个参数就可以实现自己的需求，就不要自己在写一份；
- 是否彻底解决了某个 bug，是否有漏掉的场景
- 避免硬编码，用了 ts 就要写清楚类型，没用 ts 就多用常量和注释，提高代码可读性
- review 的目的是为了提升大家的编码质量，和减少维护成本，所以不要陷入无谓的扯皮，审核者对于需要改进的代码要给出优化建议，当事人如果觉得不妥也可以一起讨论，总之最终结果是大家集思广益写出更好的代码

#### 五）checklist-具体代码指南

应该由大家共同维护这个 checklist，比如踩过的坑哪些代码实现更优雅等比如：

- 数组中的哪些方法性能更好
- 什么习惯容易内存泄漏
- 存在前后关系的 promise，使用 Promise 的静态方法
- 函数功能职责要尽量单一，对于一些公用方法，粒度可以尽量小

等等

**cheklist 应该是随着 review 进行而不断完善**

## 总结

**完整流程采用 git flow+gitlab 的 Pull Request 模式来进行**

1.先基于 master 切出一个 develop 分支作为长久存在的 review 分支

2.基于 master 分支切出自己的开发分支（feature）和测试分支（test）

3.featrue 分支开发完成后往 test 合并发布测试环境，待功能稳定后，再往 root 的 develop 发送合并请求，合并请求小组内成员都可以 review，但是为了避免 3 个和尚没水喝的情况，每个人都对应一个兜底的审核者；（合并请求可以通过接入企业微信机器人实现通知）

4.因为每次 develop 分支是从 master 分支切出来的，所以为了保证同步，每次上线功能分支往 master 合并的时候，也要一并把 master 往 develop 合并；

5.如遇紧急情况，无法 review，可以记录一个 todo（比如，在 tapd 上建一个任务），方便事后追踪

## gitlab webHooks 接入企业微信机器人

1. 企业微信添加一个企业微信机器人，拿到 web hook 地址

2. 搭建一个 node 服务，通过 webHooks 调用该服务的接口，发送告警消息到企业机器人。\
   为什么需要 node 服务？因为 gitlab 调用 webhooks 发送的数据报文格式和企业微信机器人要求的数据报文格式不一致。\
   此时就需要搭建一个 Node 服务，将 Sentry 的数据报文做下转换，并按照企业微信机器人的数据报文格式进行发送。

代码示例：

```js
const Koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const dayjs = require('dayjs')
const bodyParser = require('koa-bodyparser')

const mobileMap = {
  张三: '1888888881',
  李四: '1888888882',
  王二: '1888888883',
}

const app = new Koa()
const router = new Router()

// 响应
function response(data = '', msg = 'OK') {
  return JSON.stringify({ code: msg === 'OK' ? 200 : 0, msg, data })
}

function createFontTag(content, color = 'warning') {
  return `<font color="${color}">${content}</font>`
}
function createReviewInfo(reviews, mobileMap = []) {
  if (!reviews.length) return ''

  const mobiles = reviews.map(name => `<@${mobileMap[name] || name}>`).join(' ')

  return ` 请${mobiles}查看并审核代码`
}
router.post('/hook/merge', async ctx => {
  const { repository, user, object_attributes } = ctx.request.body
  const { target_branch, title, url, action } = object_attributes

  if (action !== 'open') {
    ctx.body = response('完成合并不发送')

    return
  }
  // 监听对应的分支
  if (target_branch !== 'develop') {
    ctx.body = response('不是监听对应的分支')
    return
  }
  const reviews = Object.keys(mobileMap).filter(item => item !== user.name)
  const localeString = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const content = `${createFontTag(repository.name)} 代码合并请求
    用户 ${createFontTag(user.name)} 于 ${createFontTag(
    localeString,
  )} 向 ${createFontTag(target_branch, 'info')} 分支发起
    标题为 ${createFontTag(title)} 的代码合并请求
    [查看合并代码](${url})${createReviewInfo(reviews, mobileMap)}`
  sendMessage(content)
  ctx.body = response()
})
function sendMessage(content) {
  const options = {
    url: `www.baidu.com`, // 企业微信webhook地址
    method: 'post',
    data: {
      msgtype: 'markdown',
      markdown: { content },
    },
  }
  axios.request(options)
}

app.use(bodyParser())

app.use(router.routes())

app.listen(9100, () => {
  console.log('Server is listening on port 9100')
})
```

3. 把 node 接口填到 gitlab 中项目中的 web hooks 中注：因为我们需求是发送合并请求的时候，通知机器人，所以 trigger 勾选 merge Request events；其他项目根据自己需求勾选。

![image.png](/img/blog/code-review/1.webp)

测试结果如图，每次合并请求都会@除提交人以外的小组人员

![image2.png](/img/blog/code-review/2.webp)

---

以上
