---
id: npmrc
slug: /npmrc
title: npmrc
authors: youngjeff
keywords: ['code-specification', 'npmrc']
---

对于 pnpm 项目，通常会有一个 `.npmrc` 文件，用于配置 npm 的一些参数，比如使用 pnpm 的严格模式等，其内容如下。

```properties title='.npmrc'
shamefully-hoist=true
strict-peer-dependencies=false
shell-emulator=true
```

此外，配置仓库镜像源，node 版本等等。更多配置可看 [.npmrc](https://pnpm.io/npmrc)。
