## webpack打包优化

### 分包
第三方资源都各自一个js，如vue.js、swiper.js、组件库.js等
优点是利用浏览器缓存可以增量部署和加载，缺点是并发限制

> 得益于http2，缺点可以忽略不计，因此第三方资源最好都单独一个js
 
1. 手动在工程内粘贴 `xx.min.js`(通过自动部署到cdn目录)
2. webpack分包配置写函数，所有依赖都拆成对应依赖名的js资源
```js
const config = {
  splitChunks: {
    minSize: 300 * 1024, // 300k才分包
    chunks: 'all', // 同步+异步文件
    cacheGroups: {
      autoVendor: {
        test: /[\\/]node_modules[\\/]/
        name(module) {
          // 也可以获取第三方资源的版本号
          const getNameReg = /[\\/]node_modules[\\/](.*?)([\\/]|$)/
          const [, packageName] = module.context.match(getNameReg)
          return `npm/ ${packageName.replace('@','')}`
        }
      }
    }
  }
}  
```

### 前端资源压缩gzip
可以让nginx压缩资源成gzip，交给浏览器解压
服务器压缩需要耗时，更彻底的是前端打包后直接压缩

其他压缩算法 Brotli,服务器安装ngx模块后，可以支持服务器压缩成Brotli，交给浏览器解压

如果没有http的keepalive，每次请求的时间分析中都会有`DNS Lookup`和`Initial connecttion(TCP/SSL)`

### 静态服务器http缓存配置

参考[http缓存](./../http/http缓存.md)

nginx配置
```
http
  etag off;
  add_header Last-Modified "";
```
👆 关闭静态资源请求响应头的`etag`和`Last-Modified`(默认是开启)

强缓存配置
`expires 5s`

谷歌浏览器会给html默认添加`Cache-Control = 0`

因此关于http缓存其实不需要手动配置

### 静态服务器http2配置

参考[http2](../http/http2.md)

> tips: 可以直上 [http3](../http/http3.md)

nginx 支持http2，服务器需要安装 **http2的模块**
在listen端口处配置ssl和http2
```bash
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;

  server_name 域名
  root /var/www/包名; # 前端静态资源目录
  index index.html;

  ssl_certificate /etc/letsencrypt/live/域名/fullchain.pem # 证书
  ssl_certificate_key /etc/letsencrypt/live/域名/privkey.pem # 证书
 
  location / {
    try_files $uri $uri/ =404
  }
}
```

TODO: 各处补充细节