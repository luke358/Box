## box
<b>通过解析 webview 抓取数据进行视频的播放</b>

## plugins

关于插件开发，提供 `searchComplete` `detailComplete` `videoComplete`,主要是依赖于injectCode注入到webview，然后对返回的数据进行解析，当然对于搜索和详情我们可以提供通过axios拉取网页，无需关注 searchInjectCode 和 detailInjectCode，从而也就无需通过webview。而对于视频页面由于网页中 iframe 的限制，通常是无法抓取到 iframe的数据，而视频往往存在于 iframe 中，因此 videoInjectCode 基本上是不可或缺的，当然如果说通过 axios 可以直接拿到视频的地址，也是可以省略 videoInjectCode，只需完成 videoComplete 即可

目前提供了几个插件可以通过 https://gitee.com/luke358/BoxPlugins/raw/main/plugins.json 进行安装
### 插件可以使用的模块

- CryptoJs
- axios
- CookieManager,


## Screenshots

[首页](/screenshots/home.jpg)
[搜索](/screenshots/search.jpg)
[记录](/screenshots/media.jpg)
[详情](/screenshots/detail.jpg)
[播放页](/screenshots/player.jpg)
