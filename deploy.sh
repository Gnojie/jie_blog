#!/usr/bin/env sh

# 运行 sh deploy.sh
# 不生效时1. 检查仓库有没有提交记录 2.博客页面要禁用缓存
# 敏感词坑 破解 完全自主权 

# 忽略错误
set -e

# 构建
yarn build

# 进入待发布的目录
cd docs/.vitepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME
# rm -rf .git
git init
git add .
git commit -m 'deploy'

# 如果部署到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果是部署到 https://<USERNAME>.github.io/<REPO>
git push -f git@gitee.com:luojinan1/giteepage_blog.git master:gh-pages

cd -