适合Angular2以上项目
#### 开发阶段
1. 项目根目录添加`Dockerfile`文件
```bash
# base image
FROM circleci/node:10.14-browsers
USER root
# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# 如果觉得 npm install 慢可以使用淘宝源
RUN npm config set registry https://registry.npm.taobao.org

# install and cache app dependencies
COPY package*.json /usr/src/app/
RUN npm install
RUN npm install -g @angular/cli

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# add app
COPY . /usr/src/app

# start app 根据实际情况修改配置
# CMD ng serve --host 0.0.0.0
CMD ng serve --port=4201 --proxy-config=proxy.conf.json --configuration=local --host 0.0.0.0
```
2.  然后再添加`.dockerignore`文件，指定构建docker镜像时不希望发送给Docker daemon的文件。也就是不希望被打包进镜像的文件。防止镜像过大。
```
node_modules
.git
```
3. 构建镜像 `docker build -t angular-demo .`
4. 根据刚创建好的镜像启动一个容器
```bash
docker run -it \
  -d # 加这个参数表示后台运行
  -v ${PWD}:/usr/src/app \
  -v /usr/src/app/node_modules \ #挂载依赖目录
  -p 4201:4201 \
  --rm \
  angular-demo
```
5.  浏览器打开`http://localhost:4201`，然后修改本地的某个文件，如`src/app/app.component.html` 你会发现浏览器会自动刷新。
6. 基础镜像`circleci/node:10.14-browsers`已经包含了chrome浏览器，我们可以直接跑unit test。先修改`src/karma.conf.js`添加ChromeHeadless配置。
```javascript
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      { pattern: '../node_modules/rxjs/**/*.js.map', included: false, watched: false },
      { pattern: '../node_modules/@angular/**/*.js.map', included: false, watched: false },
    ],
    browserConsoleLogOptions: {
      terminal: true,
      level: config.LOG_INFO
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    // 加入下面的参数配置
    customLaunchers: {
     ChromeHeadless: {
       base: 'Chrome',
       flags: [
         '--headless',
         '--disable-gpu',
         '--no-sandbox',
         '--remote-debugging-port=9222'
         ]
       }
     },
    // if true, Karma will start and capture all configured browsers, run tests and then exit
    singleRun: true
  });
};
```
7. 执行 `docker exec -it angular-demo-container ng test --watch=false`，注意替换下容器名
8. 推荐使用docker-compose，好处是把运行参数记录在docker-compose.yml文件中。
```yaml
version: '3.5'

services:
  node:
    container_name: angular-demo
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - '.:/usr/src/app'
      - '/usr/src/app/node_modules'
    ports:
      - '4209:4201'
```
请留意下匿名卷`/usr/src/app/node_modules`。
该目录是在docker build构建阶段创建的，在Run启动阶段需要手动挂载该目录。
9. docker-compose相关命令
```bash
# build镜像并后台启动
docker-compose up -d --build
docker-compose run angular-demo ng test --watch=false
ng e2e
docker-compose stop
```
#### 生产环境
1. 创建一个生产环境用的Docker配置文件，Dockerfile-prod
```bash
#########################
### build environment ###
#########################

# base image
FROM circleci/node:10.14-browsers  as builder

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install -g @angular/cli

# add app
COPY . /usr/src/app

# run tests
RUN ng test --watch=false

# generate build
RUN npm run build

##################
### production ###
##################

# base image
FROM nginx:1.13.9-alpine

# copy artifact build from the 'build environment'
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
```
这里用到了Dockerfile支持的多阶段构建，首先利用临时Node镜像生成静态资源，然后将静态资源拷贝到nginx镜像中进行托管。
2. 打包镜像`-f`表示指定文件，`docker build -f Dockerfile-prod -t angular-demo-prod .`
3. 运行 `docker run -it -p 80:80 --rm angular-demo-prod`
4. 对应的`docker-compose-prod.yml`
```yaml
version: '3.5'

services:

  angular-demo-prod:
    container_name: something-clever-prod
    build:
      context: .
      dockerfile: Dockerfile-prod
    ports:
      - '80:80'
```
5. `docker-compose -f docker-compose-prod.yml up -d --build`
#### 参考
https://mherman.org/blog/dockerizing-an-angular-app/
