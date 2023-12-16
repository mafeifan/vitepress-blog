对于Angular项目，之前处理一个ticket的流程我们的做法：
1. 启动项目本地开发 `npm start`
2. 开发完成，跑代码语法及规范检测 `npm run lint`
3. 跑单元测试 `npm run test`
4. 构建生产静态资源 `npm run build`
5. 打包然后上传到服务器 `tar -zcvf oneportal.gz -C dist .`

每处理完一个任务都得搞一遍是不是很麻烦?重复而且效率低

这种事情完全可以交给CircleCI来处理。不用自己买服务器，比Jenkins简单。省去了维护和部署。
CircleCI的好处(截止当前的政策2019.2)：
1. 每月构建时长1000分钟以内免费 (基本够用)
2. 提供的构建环境配置2核CPU / 4G内存，(算是很慷慨了)
据测试如果是在1核1G的主机下执行npm run build很容易报内存不足
3. 有专门的配置文件来定义work flow，而且还很强大。
#### 具体实现
Angular项目根目录新建`.circleci`目录(注意以点开头)，然后在这个目录里面再新建`config.yml`文件
下面是我正在使用的配置，具体语法可以见[官方介绍](https://circleci.com/docs/2.0/sample-config/#section=configuration)
```yaml
# Check https://circleci.com/docs/2.0/language-javascript/ for more details
#
# See: https://github.com/ci-samples/angular-cli-circleci/blob/master/.circleci/config.yml
version: 2
jobs:
  build:
    docker:
      # Specify service dependencies here if necessary
      # CircleCI maintains a library of pre-built images
      # documented at https://circleci.com/docs/2.0/circleci-images/
      # specify the version you desire here
      # - image: circleci/node:10.14-browsers
      - image: finleyma/circleci-nodejs-browser-awscli
    working_directory: ~/repo
    # https://circleci.com/docs/2.0/env-vars/
    environment:
      ANGULAR_BUILD_DIR: ~/repo/dist
    steps:
      - checkout
      # Download and cache dependencies
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
            # fallback to using the latest cache if no exact match is found
            - v1-dependencies-
      - run:
          name: install-dependencies
          command: npm install
      - run: node -v
      - run: npm -v
      - run: npm run lint
      - run: npm run ci-test
      - run: npm run ci-build
      - run: tar -zcvf oneportal.gz -C dist .
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - run: aws --version
      - run:
          name: upload-to-aws-s3
          command: 'aws s3 cp oneportal.gz s3://your-aws-bucket/path/ --region us-east-1'

workflows:
  version: 2
  build-deploy:
    jobs:
      - build:
          filters:
            branches:
              only: daily-build
```
需要解释几点：
1. 使用的Docker镜像是[finleyma/circleci-nodejs-browser-awscli](https://cloud.docker.com/u/finleyma/repository/docker/finleyma/circleci-nodejs-browser-awscli)，这是我基于CircleCI的镜像又加入了awscli工具。这个镜像包含了node10, Chrome(为了跑单元测试), Python2.7(为了安装AWS CLI), AWS CLI(为了上传打包后的静态资源)
2. 大致流程就是开头说的，只不过为了统一环境我们的项目是在Docker容器里跑测试和构建。通过之后将打包的待发布的静态资源上传到AWS存储。
还有配置文件里限制了分支，只有往daily-build分支上合并代码才会触发CircleCI的构建。
3. 其中`npm run ci-test`和`npm run ci-build`
需要在项目的package.json定义好，加入了一些参数，比如不输出过程，和加入环境参数配置
```
    "start": "npm run proxy",
     ...
    "build": "ng build --prod",
    "test": "ng test --configuration=testing",
    "ci-build": "node --max_old_space_size=4096 node_modules/@angular/cli/bin/ng build --configuration=dev --watch=false --progress=false",
    "ci-test": "ng test --configuration=testing --watch=false --browsers=ChromeHeadless --progress=false",
    "lint": "ng lint",
```
4. 需要在CircleCI后台配置AWS的Key和Secret。

当然，你可以直接通过SSH将项目传到站点服务器部署。也需要在后台配置下访问服务器的Key。
#### 效果：
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-2a865e72eb496816.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

