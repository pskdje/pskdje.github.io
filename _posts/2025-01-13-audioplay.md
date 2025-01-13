---
title: audioplay现已可用
time: 2025/01/13-16:08
---

# audioplay已基本可用

写本文的时候已是[0.3.4](/docs/changelog.html?href=audioplay.html)，主要功能基本上都可用。

部署在本网站的audioplay的call功能会无法访问网络，由于 Github Page 是静态服务器，且配置的参数是将请求转发到12000端口，这将会导致无法访问。

解决办法为在控制台输入`deval.setEnv({network:{mode:"default"}})`使用默认的请求组件。这也意味着你将会受到安全限制。

以后可能会考虑其它功能。

## 数据

数据结构的基础就是一个个的播放列表文件，文件采用JSON格式，另附有对应的[JSON Schema 符号表](/assets/symbol/JSON_Schema/playlist.schema.json)可用。

在加载数据文件前想一想：这个文件是否是你想要的，是不是可信来源的，是不是用文本编辑器打开确认过是安全的。

由于audioplay允许在一定的情况下修改UI文本，所以才会导致这些隐患。

以后可能会对数据文件开放更多的功能，所以永远需要验证数据文件的安全性。

同时audioplay接受通过URL查询参数来自动加载数据文件，请务必确认查询参数是否信任（虽然你可能看不懂，如果看不懂干脆直接不要访问），特别是`href`和`lang`，详见其它段落。

如果播放列表为空但有其它的有效数据，依旧会加载，只是不会播放而已。因此你可以提前加载一些东西，例如`call`调用表作为库，提前加载I18N来看得懂文本。

## URL查询参数

### `href`

可以使用多个`href`参数来加载数据文件，程序会按顺序进行请求，按响应顺序异步加载。

**注意：** `href`参数可以加载任何位置的文件，只要能通过浏览器安全检查。

### `lang`

这个目的是提供国际化功能，通过拼合`playlist/${lang参数的数据}.i18n.json`来产生链接。将会在`href`之后进行请求。

虽然URL是拼合的，但并不代表一定安全。

## 试用

在点击前先鼠标悬停或者手机上长按看看链接（部分浏览器可能没有链接显示功能），虽然本文提供的链接是较为安全的，但还是建议检查。

[普通的直接查看页面](/assets/audioplay.html) 此时只会加载基本页面，没有什么会播放。

[加载UI文本（利用lang参数）](/assets/audioplay.html?lang=live) 这个示例只会把“正在播放”改为“背景音乐”。

[加载默认调用依赖](/assets/audioplay.html?href=playlist%2Fau_call.json) 这个示例会加载一些调用依赖，想要播放还是需要自己加载文件。

[把上面的示例都加载](/assets/audioplay.html?lang=live&href=playlist%2Fau_call.json) 加载了`lang`和`href`的示例。
