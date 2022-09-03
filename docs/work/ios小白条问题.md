## 移动端小白条问题


主要是微信浏览器小白条、Safari浏览器


![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/ios-safe.png)

[Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/?hmsr=funteas.com&utm_medium=funteas.com&utm_source=funteas.com)

先定义 `--safe-top`、`--safe-bottom` 2个 CSS 自定义变量；
通过 `@supports` 来判断当前浏览器是否支持 `constant()` / `env()` ；
在支持的情况下，把取到的值赋给 CSS 自定义变量。然后在需要使用的地方就可以这样用了：
```css
:root {
  --safe-top: 0px;
  --safe-bottom: 0px;
}

@supports (top: constant(safe-area-inset-top)) {
  :root {
    --safe-top: constant(safe-area-inset-top);
    --safe-bottom: constant(safe-area-inset-bottom);
  }
}

@supports (top: env(safe-area-inset-top)) {
  :root {
    --safe-top: env(safe-area-inset-top);
    --safe-bottom: env(safe-area-inset-bottom);
  }
}
```

## 参考

[网页适配 iPhoneX，就是这么简单-凹凸实验室](https://jelly.jd.com/article/6006b1055b6c6a01506c87fd)