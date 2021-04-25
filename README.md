<h2 align="left">关于搭建</h2>
一个成熟的搭建体系包括：页面管理（权限），编辑器（搭建），模块研发（版本），渲染服务（SSR），数据投放（资源），模块监控（报警），数据上报（分析）。

对编辑器来说分轻搭建与重搭建。轻搭建代表多个模块按摆放顺序渲染页面，每个模块功能为黑盒独立，运营需要为每个模块提供投放数据。重搭建代表模块功能的解耦度高且可嵌套，对单个模块不仅能支持投放业务数据，还能进行ui布局上的定制。两种模式各有利弊，轻搭建可以使固定模式业务快速上线，灵活性差；重搭建可以对每个模块进行ui布局定制，灵活性高但搭建成本高。需根据业务进行判断选择。

该项目旨在用最少的代码实现可视化搭建、发布、预览、调试等核心功能。并对关键原理进行说明。

![可视化编辑器面板](https://img.alicdn.com/imgextra/i2/O1CN01dTq9o61kwdBqAWOzl_!!6000000004748-0-tps-2700-1894.jpg)

#### 目前支持的功能
###### 编辑器相关：
- 拖拽菜单组件放入画布，能放置的位置标绿框，不能放的标红框；选中锚点、移入高亮。
- 鼠标按住拖动画布内组件四周改变宽高，拖动中心改变定位
- 属性面板输入样式、自定义属性配置，实时更新画布预览
- 页面编辑快捷键操作，包括：保存(Ctrl+S)，撤销(Ctrl+Z)，恢复(Ctrl+Y)，删除(DEL)，复制(Ctrl+C)，剪切(Ctrl+X)，粘贴(Ctr+V)，上移节点(↑)，下移节点(↓)，缩放移动画布(空格按下+左键拖动+滚轮缩放)
- 直接拖动左下方缩略图批量移动节点
- **新增动态吸附与辅助标尺算法（类sketch设计）** 
###### 服务层相关：
- 提供平台前端页面（编辑器、预览页）的请求接口与路由模板
- 打包构建：对组件仓库的分包，对编辑器SDK的打包
- 开发组件调试模式的命令行脚本
###### 预览相关：
- 将页面搭建配置创建React组件树，动态加载所需组件JS文件
- 组件懒加载功能

<h2 align="left">实现原理</h2>
此Tiny sdk主要划分为4个部分：编辑器、预览页、服务端、组件仓库
用户在编辑器内拖入组件仓库已开发的组件，设置样式与自定义属性，为页面生成JSON配置，将配置提交服务端保存。预览页请求返回配置，预览页根据配置动态下载组件文件并渲染。
![整体流程](https://upload-images.jianshu.io/upload_images/19675139-92adb37f9ca97d62.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 一、页面JSON配置与渲染的关系
不论在编辑器内还是预览页，页面都是根据JSON配置来递归渲染
```
{
        "name": "View",
        "style": {
          "position": "relative",
          "width": "1089px",
          "height": "820px"
        },
        "props": {
          "lazy": true
        },
        "el": "wc12",
        "children": [
             //{ ...}
        ]
  }
```
这是一个简单的布局组件所映射的JSON结构，其中包括了该组件的样式，传入组件的props属性，以及其唯一的key(el)值，还有他的子组件children数组，数组里的内容就是其包裹组件的JSON结构。通过这样的嵌套关系，可以将其映射成组件树。
![compile.js](https://upload-images.jianshu.io/upload_images/19675139-1bb3ad3dba480c09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当页面JSON配置发生变化时，依靠react单向数据流会重新渲染，此时我们需要一个通用方法，来递归的创建组件的占位DIV，**但是需要注意的是，首次创建的只是一个空壳，return的子组件为null。**
![global.js](https://upload-images.jianshu.io/upload_images/19675139-67452d61ffe1f062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
与此同时我们调用异步加载组件js的方法，等该组件下载好后自动注入到这个壳里。这个方法的特点在于，我们每次加载新的组件会优先从`window.comp`下找是否有已缓存的组件对象，如果为`undefined`，说明这是一个全新的组件，就请求对应的JS下载，**并且将`window.comp`下的这个组件标识为正在请求的`Promise`，这样如果相同组件并发调用此方法，会`awati`同一个`Promise`不会重复请求**，而且组件缓存后也可以直接用`await`拿到组件对象。
![compile.js -> CompBox](https://upload-images.jianshu.io/upload_images/19675139-723064279c5e6fe2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通过上述的几个方法,我们已经能够将JSON配置渲染为页面DOM，并且动态加载组件JS文件了~

##### 二、编辑器内的操作
既然我们的页面是根据JSON配置来渲染的，**那么对页面任何的增删改查，都可以抽象为对JSON树内某个节点的数据结构修改。我们需要一个通用的搜索方法，来搜索JSON树，并传入一个标识，来指明这次操作的类型**。
![](https://upload-images.jianshu.io/upload_images/19675139-f0181322770786f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![common.js](https://upload-images.jianshu.io/upload_images/19675139-52d1580a8c306dad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`searchTree`是所有操作的通用方法，本质上是对JSON配置树的BFS搜索，只要找到对应的`key`节点，根据`EnumEdit`中的枚举类型操作数据后返回修改后的结果树，`dispatch`新的配置树通知react重新渲染。

除此之外，具体操作这里涉及到各种键盘、鼠标事件的绑定，这部分暂不做赘述，可自行查询MDN文档。

##### 三、样式、自定义属性的注入
我们在右侧编辑区填写的内容，都会在渲染时注入到对应的组件里，样式`style`会注入在包裹组件的壳里，自定义属性会当做`prop`传入子组件，在组件开发中，我们可以从`props`中拿到编辑器内填写的属性值。
![compile.js -> CompBox](https://upload-images.jianshu.io/upload_images/19675139-d77880b4be47b1ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 四、编辑历史记录管理
历史记录为一个队列的数据结构，如果我们保存1000条记录，每修改一次JSON配置，就将其入队，每次入队时发现记录大于1000，就将队列头部抛弃。
当前页面显示的配置为一个指针，指向队列中某条记录，撤销就指针后移，恢复就指针前移。每次触发compile时，将新的配置树计入队列，不需要手动记录。利用hooks自带的缓存机制非常容易实现。

![record.js](https://upload-images.jianshu.io/upload_images/19675139-2e76ad71c50b44b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 五、画布的缩放处理
在搭建使用程中，我们寄希望于画布设计尺寸永远为1920（移动端则为750），但是视口显然没那么大，所以我们要将画布以左上角为缩放焦点`transform-origin: 0 0`，拖动导航slide或按下空格利用滚轮缩放。这个过程中不断改变`transform: scale`来刷新视图。
**需要注意的是，scale的改变为浏览器重绘，并不会改变原有的DOM占位尺寸，因此缩小画布会有很大的空白区域，为了解决这个问题，我们需要在画布外再包一层div，每次画布改变缩放后，利用`getBoundingClientRect()`来获取缩放后画布实际的宽高，并将这个数值定义在外层div上，外层div设置为`overflow: hidden`，这样窗口滚动的距离就会依据外层容器来出滚动条。**
![](https://upload-images.jianshu.io/upload_images/19675139-5eb9c5dda22382be.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
画布的高度计算时，要计算出一个`min-height`，为当前搭建区域的`offsetHeight`，保证画布内没有组件撑开时，也能够铺满一个屏幕。
![](https://upload-images.jianshu.io/upload_images/19675139-1bc2246089e9636c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此外对画布根节点要设置一个`padding-bottom: 300px`，作用是保证底部永远有一个空白区域，能够让搭建者拖入新的组件到根节点下。

##### 六、组件的开发
每一个组件都的固有结构，`index.js`，`config.json`是必须存在的（服务层会根据此文件构建，稍后会提到）：
![comp/Image](https://upload-images.jianshu.io/upload_images/19675139-f855ed02c35a33d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
入口文件即为业务代码，配置为一个JSON文件，决定了编辑器内所能编辑的自定义选项:
```
{
    "name": "图片",
    "staticProps": [
        {
            "name": "点击链接",
            "prop": "link",
            "size": "long"
        },
        {
            "name": "是否在新窗口打开链接",
            "prop": "blank",
            "type": "switch",      // 配置类型，目前支持`text`默认,`select`,`switch`,`color`
            "size": "long"          // 配置是否占满编辑器一行
        },
        {
            "name": "图片地址",
            "prop": "src",
            "size": "long"
        }
    ],
    "defaultStyles": {        // 拖入组件到画布时默认的样式
        "position": "relative",
        "width": "180px",
        "height": "180px",
        "marginTop": "0px"
    },
    "defaultProps": {      // 拖入组件到画布时默认的自定义属性
        "src": "http://r.photo.store.qq.com/psb?/V14dALyK4PrHuj/h50SMf97hSy.BJlJw31fagrw.NUaJD83gvydmoGN77w!/r/dLgAAAAAAAAA",
        "blank": true
    },
    "hasChild": false,        // 是否允许有子组件，如果不允许拖拽的时候移入会标红，提示当前节点不能被注入
    "canResizeByMouse": true       // 是否允许通过拖动九宫格蒙版来修改组件的宽高位置
}
```
上述这样的一个图片组件，在编辑器内对应的配置项即为：
![](https://upload-images.jianshu.io/upload_images/19675139-48f0bbc674f2f823.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 七、组件的构建打包
这是构建阶段非常重要的一环，我们上面说过，每一个组件对应一个JS文件，那么我们就需要在页面生成前将当前所有组件都构建好。
![webpack.config.comp.js](https://upload-images.jianshu.io/upload_images/19675139-d1c009b554ddded0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里首先找出仓库中的组件，加入打包的`entry`入口，然后利用webpack的`library`,`libraryTarget`配置，将组件打包到`window[name]`下，name为组件名（比如Image,View），我们来看看打包后的组件代码：
![](https://upload-images.jianshu.io/upload_images/19675139-f3fd2876a7f5afc5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
果不其然 ，组件js下载执行后直接被挂载到window下了，此时此刻你可以回头看开头提到的`loadAsync`加载组件的方法，是否恍然大悟了呢。
这里你可能又发现一个问题，组件都依赖`react`库，那每个组件单独打包，岂不是都要加载一遍，那包得多大？
![](https://upload-images.jianshu.io/upload_images/19675139-bf48e3fc60f198f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
从JS体积可以看出，实际上根本没有打包这些通用库，只包含了业务代码而已。这里同样利用webpack的`externals`属性，可以指定某些依赖直接从window下取：
![webpack.config.comp.js](https://upload-images.jianshu.io/upload_images/19675139-0c0e388d71349c0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
那么是什么时候将`react`注入window下的呢？
![global.js](https://upload-images.jianshu.io/upload_images/19675139-f7c35b663d56850e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在编辑器或者预览页面，加载全局配置，也就是SDK初始化之前，就将组件所依赖的全局对象注入好了，这样后续组件异步下载后就可以直接执行。
关于编辑器和预览页的打包不做特别说明，就是普通的`webpack`配置打包，记得抽出公共模块就好。

##### 八、组件的代理调试
平台开发好了，这个时候我们要往里开发业务组件了，那么如何调试呢。
通过`npm run dev:comp debug=XXX,YYY`命令(XXX为组件名)来执行调试脚本
![](https://upload-images.jianshu.io/upload_images/19675139-a37f5916e8621ef3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
脚本首先通过`process.argv`传入的参数获取要调试的组件
![debugComp.js](https://upload-images.jianshu.io/upload_images/19675139-c7dae008df4756f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后使用node API来调用`webpack-dev-server`
**需要注意的是，这里仅仅是在本地创建了组件的代理，还需要在组件资源加载上区分哪些组件需要请求本地调试地址，详情可见上方`loadAsync`方法，我们通过在预览页和编辑器后方加入`debug_comp=XXX`参数来告诉此方法该组件要请求本地调试地址**
![server/index.js](https://upload-images.jianshu.io/upload_images/19675139-c30c714c856f1eda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
最后记得如果当前用户请求的URL是调试模式，在node express服务的`ejs`模板接口里加上`webpack-dev-server`的代码script标签，

##### 九、服务端对页面配置的管理
因为此项目为演示项目，并没有对页面配置用id进行区分，每次提交都是存取同一个配置文件`page.json`
![opPageJSON.js](https://upload-images.jianshu.io/upload_images/19675139-d3aaa54dde9950fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
生产环境下需要连接数据库，将每一份配置生产一个ID，在打开编辑时取对应的请求ID返回配置。
**要额外注意的一点，我们在返回配置接口数据时，要去搜索当前构建文件夹中存在的js与哈希值的映射，这样保证前端页面能正确的加载最新构建的js地址**
![](https://upload-images.jianshu.io/upload_images/19675139-8359a64b8dc6c344.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

<h2 align="left">前言</h2>
此项目对搭建前后端流程有一个初步实现。基于此基础上，可以根据需要拓展定制化的编辑器功能、页面渲染功能等。

因篇幅原因文中缩减了很多代码片段，更多详情可以clone项目，运行`npm start`体验
![](https://upload-images.jianshu.io/upload_images/19675139-0c3cca2baf3ca505.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
