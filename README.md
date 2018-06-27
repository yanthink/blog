## 项目概述

* 产品名称：个人博客系统前端
* 项目代号：blog
* 官方地址：https://www.einsition.com
* api项目地址：https://github.com/yanthink/blog-api

该系统使用 ANT DESIGN PRO 编写而成。

## 功能如下

- 文章列表 -- 支持搜索；
- 文章详情 -- 支持代码高亮；
- 用户认证 -- 后台登录、退出；
- 权限控制；
- 文章管理 -- 列表、详情、发布、修改、删除。集成SimpleMDE编辑器，支持粘贴和拖拽上传附件；
- 用户管理 -- 列表、添加、修改、分配角色；
- debugbar;

## 开发环境部署/安装

本项目代码使用 React 框架 [ANT DESIGN PRO](https://pro.ant.design/index-cn) 开发。

### 基础安装

#### 1. 克隆源代码

克隆 `blog` 源代码到本地：

    > git clone git@github.com:yanthink/blog.git

#### 2. 安装扩展包依赖
```shell
$ npm install
```

你可以根据情况修改 `.webpackrc.js` 文件里的内容，如代理设置等：
```
proxy: {
  '/api': {
    target: 'http://api.blog.test/',
    changeOrigin: true,
  },
  '/_debugbar': {
    target: 'http://api.blog.test/',
    changeOrigin: true,
  },
},
```

#### Usage
```shell
$ npm start # visit http://localhost:8000
```
