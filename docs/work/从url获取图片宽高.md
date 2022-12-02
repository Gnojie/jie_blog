```js
// 获取图片信息
getImgInfo(url) {
  return new Promise((resolve, reject) => {
    const Img = new Image();
    Img.onload = () => {

      const imgWidth = Img.width;
      const imgHeight = Img.height;

      if (!imgHeight) {
        reject('获取图片信息失败');
      }
      resolve({ imgWidth, imgHeight });
    };
    Img.src = url;
  });
}
```