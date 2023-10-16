---
slug: gulp-auto-build-case
title: gulp自动化构建案例
date: 2021-07-22
authors: youngjeff
tags: [case, code, 总结]
keywords: [case, code, 总结]
description: gulp自动化构建案例。
image: /img/blog/gulp-auto-build-case/1.webp
---

## 官网：[Gulp](https://www.gulpjs.com.cn/docs/api/concepts/)

> 代码块中的省略号，代表相较于上次代码未改动部分 github 完整项目： [pages-boilerplate](https://github.com/xiaofeng63/pages-boilerplate.git)

## 准备内容：

1. 首先初始化项目，目录如下图
2. 安装 gulp，作为开发时依赖项`npm install --save-dev gulp`
3. 根目录下新增 gulpfile.js 文件，此文件中构建任务

![图1](/img/blog/gulp-auto-build-case/1.webp)

## 构建任务：

1. 样式文件编译首先安装[gulp-sass](https://www.npmjs.com/package/gulp-sass)到开发依赖

```
//gulpfile.js文件
const { src, dest } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass())
    .pipe(dest("dist"));
};
module.exports = {
  style,
};
```

根目录命令行执行`yarn gulp style `验证

2. 脚本编译首先安装 gulp-babel 到开发依赖

```
const { src, dest } = require("gulp");
const babel = require("gulp-babel");

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest("dist"));
};
module.exports = {
  script,
};
```

3. 页面模版编译首先安装 gulp-swig 到开发依赖

```
const { src, dest } = require("gulp");
const swig = require("gulp-swig");

//假数据
const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "Features",
      link: "features.html",
    },
    {
      name: "About",
      link: "about.html",
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      swig({
        data,
      })
    )
    .pipe(dest("dist"));
};
module.exports = {
  page,
};
```

根目录命令行执行`yarn gulp compile `验证

4. 图片和字体文件转换首先安装 gulp-imagemin 到开发依赖

```
const imgage = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(imagemin())
    .pipe(dest("dist"));
};
```

`因为以上任务都是可以异步进行的，所有通过gulp提供的parallel方法，将以上任务组合起来`

```
// gulpfile.js文件
const { src, dest, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const babel = require("gulp-babel");
const swig = require("gulp-swig");
const imagemin = require("gulp-imagemin");

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "Features",
      link: "features.html",
    },
    {
      name: "About",
      link: "about.html",
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass())
    .pipe(dest("dist"));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest("dist"));
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      swig({
        data,
      })
    )
    .pipe(dest("dist"));
};
const imgage = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(imagemin())
    .pipe(dest("dist"));
};
const compile = parallel(style, script, page, imgage, font);
module.exports = {
  compile,
};
```

以上，src 目录下文件处理完毕；接下来处理 public

5. public 处理及自动删除 dist 目录首先安装 del 到开发依赖

```
// gulpfile.js文件
const { src, dest, parallel, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const babel = require("gulp-babel");
const swig = require("gulp-swig");
const imagemin = require("gulp-imagemin");
const del = require("del");

...
const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};
const compile = parallel(style, script, page, image, font);
//因为要在编译之前，把dist目录清除，所有用series再次组合
const build = series(clean, parallel(compile, extra));
module.exports = {
  compile,
  build,
  clean,
};
```

6. 自动加载插件首先安装 gulp-load-plugins 到开发依赖，然后只需要把所有 gulp-开头的插件引用更改为 plugins.+插件不包括 gulp-的内容 `例：（gulp-babel改为plugins.babel）`

```
// gulpfile.js
const { src, dest, parallel, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
// 删除即可
// const plugins.babel = require("gulp-babel");
// const plugins.swig = require("gulp-swig");
// const plugins.imagemin = require("gulp-imagemin");
const del = require("del");
const plugins = require("gulp-load-plugins")();

...
const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(
      plugins.babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest("dist"));
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      plugins.swig({
        data,
      })
    )
    .pipe(dest("dist"));
};
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
...
```

7. 开发服务器首先安装[browser-sync](browsersync.cn/docs/gulp/)到开发依赖这里只记录简单用法，具体可参考官网^

```
// 实现这个项目的构建任务
const { src, dest, parallel, series } = require("gulp");
...
const browserSync = require("browser-sync").create();
...
const serve = () => {
  browserSync.init({
    files: "dist/**", //files指定文件，监听到变化就自动刷新（注：此配置只会监听dist目录，而src不会，因为src修改后需要重新编译，下面会处理）
    server: "dist",
  });
};
...
module.exports = {
  serve,
};
```

8. 监听文件变化以及构建优化 `注意：可能因为swig模版引擎的缓存机制导致页面不会变化，此时需要配置swig中的cache为false`

- 图片和字体等文件在开发阶段没必要构建，因为这些文件可能只是做了压缩，并不影响页面上的呈现效果，所以为了减小开发阶段的开销，这些文件只在发布上线之前构建
- 所以对于图片和 public 中的文件，在此直接请求源文件（非 dist）

```
//gulpfile.js
const { src, dest, parallel, series, watch } = require("gulp");
...
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      plugins.swig({
        data,
        defaults: { cache: false },  //配置成false，防止缓存机制导致页面不会变化
      })
    )
    .pipe(dest("dist"));
};
...
const serve = () => {
  watch("src/assets/styles/*.scss", script);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // watch("src/assets/images/**", image);
  // watch("src/assets/fonts/**", font);
  // watch("public/**", extra);

  // 想要监听public或者imgags变化，可以利用browserSync提供的reload方法
  // 该 reload 方法会通知所有的浏览器相关文件被改动，要么导致浏览器刷新，要么注入文件，实时更新改动。
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    browserSync.reload()
  );
  browserSync.init({
    files: "dist/**", //files指定文件，监听到变化就自动刷新（注：此配置只会监听dist目录，而src不会，因为src修改后需要重新编译，下面会处理）
    server: {
      baseDir: ["dist", "src", "public"], //多个基目录，在dist目录下找不到就去src找，否则就去public找，以此类推
    },
  });
};
...
//  构建任务优化
const compile = parallel(style, script, page);
// 上线之前执行的任务
const build = series(clean, parallel(compile, extra, image, font));
// 开发阶段执行的任务
const develop = series(compile, serve);
module.exports = {
  build,
  clean,
  serve,
  develop,
};
```

9. useref 文件引用及文件压缩针对 html 文件中，会有一些 node_modules 中的引用文件，在开发阶段，我们可以通过 Browsersync 模块中 server 的 routes 做一个映射来解决

```
// index.html文件
<!DOCTYPE html>
<html lang="en">

<head>
  ...
  <!-- build:css assets/styles/vendor.css -->
  <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css">
  <!-- endbuild -->
...
```

```
// gulpfile.js文件
...
const serve = () => {
 ...
  browserSync.init({
    files: "dist/**", //files指定文件，监听到变化就自动刷新（注：此配置只会监听dist目录，而src不会，因为src修改后需要重新编译，下面会处理）
    server: {
      baseDir: ["dist", "src", "public"], //多个基目录，在dist目录下找不到就去src找，否则就去public找，以此类推
      routes: {
        "/node_modules": "node_modules",  //通过映射，获取node_modules下的引用
      },
    },
  });
};
...
```

但是线上环境此方法行不通了，useref 插件便可以解决这个问题（`注：它只负责合并，不负责压缩，配合gulp-if插件可实现压缩`） [gulp-useref](https://www.npmjs.com/package/gulp-useref)这是一款可以将 html 引用的多个 css 和 js 合并起来，减小依赖的文件个数，从而减少浏览器发起的请求次数。gulp-useref 根据注释将 html 中需要合并压缩的区块找出来，对区块内的所有文件进行合并

useref 插件会自动处理 html 中的构建注释，构建注释模块由 build：开始，endbulid 结束，中间内容都是引入模块，build：后会跟标记，说明引入的是 js 或 css，最后再指定一个路径，最终注释模块内的引入都是打包到这一个路径中

```
//  构建注释
<!-- build:css assets/styles/vendor.css -->
  <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css">
<!-- endbuild -->
```

**_使用前后对比_**

![图2](/img/blog/gulp-auto-build-case/2.webp)

vs

![图3](/img/blog/gulp-auto-build-case/3.webp)

**接下来开始压缩文件** 要压缩的文件有 html css js，所有分别安装`gulp-clean-css` `gulp-htmlmin` `gulp-uglify `到开发依赖，另外我们需要针对不同文件做不同压缩，所以还需安装`gulp-if`

```
...
const useref = () => {
  // 为啥不是src下的文件呢，因为src下的html是模版，没有意义，必须得是生成后的dist目录才有意义
  return (
    src("dist/*.html", { base: "dist" })
      .pipe(plugins.useref({ searchPath: ["dist", "."] }))
      // html js css
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, //压缩html的空白行
            minifyCSS: true, //压缩html中的css
            minifyJS: true, //压缩html中的js
          })
        )
      )
      .pipe(dest("release")) //因为放到dist目录，可能导致读写冲突，所以临时写一个目录
  );
};
...
```

10. 重新规划构建过程原本打包上线的目录应该是 dist 目录，但是因为上述打包过程防止读写冲突，临时把文件放在了 release 目录，这个时候，我们需要上线的应该是 release 目录，而 release 目录又没有图片和字体文件，所以需要重新调整；

其实，在 useref 之前生成的文件算是一个中间产物，所以应该把 script，page，style 这些任务生成的文件放在一个临时目录，然后 useref 拿到临时目录文件，转换后再放到最终目录 dist；（**_因为 image，font，extra 这三个任务在打包上线之前才会做，不会影响 useref，所以直接放到 dist_**）；

所以修改后代码如下：

```
//gulpfile.js文件
...
const clean = () => {
  return del(["dist", "temp"]);
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass())
    .pipe(dest("temp"));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(
      plugins.babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest("temp"));
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      plugins.swig({
        data,
        defaults: { cache: false },
      })
    )
    .pipe(dest("temp"));
};
...
const serve = () => {
  watch("src/assets/styles/*.scss", script);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // 想要监听public或者imgags变化，可以利用browserSync提供的reload方法
  // 该 reload 方法会通知所有的浏览器相关文件被改动，要么导致浏览器刷新，要么注入文件，实时更新改动。
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    browserSync.reload()
  );
  browserSync.init({
    files: "dist/**", //files指定文件，监听到变化就自动刷新（注：此配置只会监听dist目录，而src不会，因为src修改后需要重新编译，下面会处理）
    server: {
      baseDir: ["temp", "src", "public"], //多个基目录，在dist目录下找不到就去src找，否则就去public找，以此类推
      routes: {
        "/node_modules": "node_modules", //通过映射，获取node_modules下的引用
      },
    },
  });
};
const useref = () => {
  // 为啥不是src下的文件呢，因为src下的html是模版，没有意义，必须得是生成后的dist目录才有意义
  return (
    src("temp/*.html", { base: "temp" })
      .pipe(plugins.useref({ searchPath: ["temp", "."] }))
      // html js css
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, //压缩html的空白行
            minifyCSS: true, //压缩html中的css
            minifyJS: true, //压缩html中的js
          })
        )
      )
      .pipe(dest("dist")) //因为放到dist目录，可能导致读写冲突，所以临时写一个目录
  );
};
const compile = parallel(style, script, page);
// 上线之前执行的任务
// 因为useref依赖compile任务，所以两者同步组合，然后和其他任务异步组合
const build = series(
  clean,
  parallel(series(compile, useref), extra, image, font)
);
// 开发阶段执行的任务
const develop = series(compile, serve);
module.exports = {
  build,
  clean,
  serve,
  compile,
  develop,
  useref,
};
```

如下图：命令行构建日志可以验证任务配置没问题

![图4](/img/blog/gulp-auto-build-case/4.webp)

11. 完整版 gulpfile.js 只暴露必要的任务

```
// 实现这个项目的构建任务
const { src, dest, parallel, series, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const plugins = require("gulp-load-plugins")();
const browserSync = require("browser-sync").create();

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html",
    },
    {
      name: "Features",
      link: "features.html",
    },
    {
      name: "About",
      link: "about.html",
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};

const clean = () => {
  return del(["dist", "temp"]);
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass())
    .pipe(dest("temp"));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(
      plugins.babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest("temp"));
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(
      plugins.swig({
        data,
        defaults: { cache: false },
      })
    )
    .pipe(dest("temp"));
};
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};

const serve = () => {
  watch("src/assets/styles/*.scss", script);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // 想要监听public或者imgags变化，可以利用browserSync提供的reload方法
  // 该 reload 方法会通知所有的浏览器相关文件被改动，要么导致浏览器刷新，要么注入文件，实时更新改动。
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    browserSync.reload()
  );
  browserSync.init({
    files: "dist/**", //files指定文件，监听到变化就自动刷新（注：此配置只会监听dist目录，而src不会，因为src修改后需要重新编译，下面会处理）
    server: {
      baseDir: ["temp", "src", "public"], //多个基目录，在dist目录下找不到就去src找，否则就去public找，以此类推
      routes: {
        "/node_modules": "node_modules", //通过映射，获取node_modules下的引用
      },
    },
  });
};
const useref = () => {
  // 为啥不是src下的文件呢，因为src下的html是模版，没有意义，必须得是生成后的dist目录才有意义
  return (
    src("temp/*.html", { base: "temp" })
      .pipe(plugins.useref({ searchPath: ["temp", "."] }))
      // html js css
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, //压缩html的空白行
            minifyCSS: true, //压缩html中的css
            minifyJS: true, //压缩html中的js
          })
        )
      )
      .pipe(dest("dist")) //因为放到dist目录，可能导致读写冲突，所以临时写一个目录
  );
};
const compile = parallel(style, script, page);
// 上线之前执行的任务
// 因为useref依赖compile任务，所以两者同步组合，然后和其他任务异步组合
const build = series(
  clean,
  parallel(series(compile, useref), extra, image, font)
);
// 开发阶段执行的任务
const develop = series(compile, serve);
module.exports = {
  build,
  clean,
  develop,
};
```

也可在 package.json 中配置脚本，方便执行

```
//package.json文件
{
  "scripts": {
    "clean": "gulp clean",
    "build": "gulp build",
    "develop": "gulp develop"
  },
}
```
