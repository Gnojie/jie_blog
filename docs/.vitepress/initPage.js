const glob = require("glob");

// 获取文件夹下所有md文件的文件名,返回数组
export function getFileName() {
  const files = glob.sync('./docs/*/**/*.md')
  let tocConfigs = [];
  files.forEach((file) => {
    const filePath = file.match(/^.\/docs\/(.*?).md$/)[1];
    const filePathList = filePath.split('/')
    const filePathPreList = [...filePathList].splice(0,filePathList.length-1);
    const fileName = filePathList[filePathList.length-1]
    if(/^_/.test(fileName)){
      return // 跳过_开头的文件
    }
    let tocItem = tocConfigs;
    filePathPreList.forEach((item,i)=>{
      const tocItemTemp = tocItem.find(tocConfig=>tocConfig.text===filePathList[i])
      if(tocItemTemp){
        tocItem = tocItemTemp.children
      }else{
        const pushIndex = tocItem.push({text:item,children:[]})
        tocItem = tocItem[pushIndex-1].children
      }
    })
    const obj = {text:fileName,link:`/${filePath}`}
    tocItem.push(obj)
  });
  return tocConfigs;
}

// module.exports = getFileName
export default getFileName