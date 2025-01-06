---
layout: posts
title: eval.js基本可用
time: 2025/01/06-10:44
---

# “eval.js”及其关联外部组件“evaltool.js”基本可用

由于完成对[`fetch`](https://developer.mozilla.org/zh-CN/docs/Web/API/WorkerGlobalScope/fetch)的处理，允许受到父文档控制，现写该贴。

还有一些其它的处理正在计划，但完成对[`XMLHttpRequest`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)的处理应该尽早开始。

对接口文档的编写还处于连新建文件夹都还没开始的阶段，也许会跳票。

总之就这样，本文档还会接入“evaltool.js”，可打开控制台尝试。

<script src="/js/evaltool.js"></script>
<script>const docEval=new DocsEval();</script>
