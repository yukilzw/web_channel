#### 简介
迷你可视化建站平台系统<br/>
实现了搭建与发布预览的最基本核心功能，基于此流程上可进行拓展开发

#### 快速体验
`npm i`后在项目根目录下运行`npm start`打包并启动服务<br/>
编辑器：`http://localhost:1235/edit`
预览页：`http://localhost:1235/page`

#### 工作流程
主要划分为4个部分：编辑器、预览页、服务端、组件仓库<br/>
用户在编辑器内拖入组件仓库已开发的组件，设置样式与自定义属性，根据搭建为页面生成JSON配置，将配置提交服务端保存。当预览页请求时返回配置，预览页根据配置动态下载组件文件并渲染

#### 技术要点
- 每一个组件内对应一份JSON配置，编辑器将根据配置来生成编辑区域
- 组件仓库的构建，将组件拆成独立的js，页面加载时根据页面配置按需加载，抽出所有的公共模块到sdk，组件仅保留业务代码
- 编辑器内捕获各种鼠标、键盘、拖拽等事件，搜索JSON树，对页面配置进行增删改选。
- 将页面JSON树实时编译为React组件树，过程中动态拉取依赖的组件js文件
- 服务端根据Comp目录告知编辑器可用组件

#### 项目结构
```
web_channel:
├─config.js			// 前后端通用配置
├─comp				// 组件仓库
│  ├─Image	       		// 组件名
│  │      config.json			// 组件配置	
│  │      index.js			    // 组件入口
│  │      index.less			// 组件样式
│  │      
│  ├─Text
│  │    ...
│  │      
│  └─View
│       ...
│          
├─script				// 配置脚本
│      webpack.config.comp.js		// 组件打包配置
│      webpack.config.edit.js		// 编辑器、页面打包配置
│      
├─server				// 建站平台服务端
│  │  getCompJSONconfig.js		// 查询组件仓库内当前所有存在的组件配置
│  │  index.js			// 服务端总入口
│  │  opPageJSON.js		// 存取页面对应的配置JSON树
│  │  
│  └─template			// 模板
│          index.ejs			// html渲染模板
│          page.json			// 页面配置JSON树
│          
└─src				// 建站平台前端SDK
    │  compile.js			// 编译配置树为组件树
    │  context.js			// 全局状态对象
    │  global.js			// 全局配置依赖
    │  reducer.js			// 全局状态管理
    │  
    ├─edit				// 编辑器
    │  │  board.js			// 编辑器可视区域面板
    │  │  event.js			// 自定义事件分发中心
    │  │  index.js			// 编辑器总入口
    │  │  menu.js			// 编辑器组件菜单
    │  │  option.js			// 编辑器属性操作面板
    │  │  searchTree.js		// 搜索页面配置树方法
    │  │  
    │  └─style			// 编辑器样式
    │          index.less
    │          
    └─page			// 预览页
            index.js			// 预览页总入口
            
```