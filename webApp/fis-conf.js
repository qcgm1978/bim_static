// //清除其他配置，只剩下如下配置
// fis.match('*.{js,css,png}', {
//   useHash: true
// });


// // 清除其他配置，只保留如下配置
// fis.match('*.js', {
//   // fis-optimizer-uglify-js 插件进行压缩，已内置
//   optimizer: fis.plugin('uglify-js')
// });

// fis.match('*.css', {
//   // fis-optimizer-clean-css 插件进行压缩，已内置
//   optimizer: fis.plugin('clean-css')
// });

// 加 md5
// fis.match('*.{js,css,png}', {
//   useHash: true
// });


//npm install -g fis-parser-less
//npm install -g fis3-postpackager-loader



var v = 20160313;

fis.set('project.md5Length', 7);
fis.set('project.md5Connector ', '_');


fis.match('::package', {
  postpackager: fis.plugin('loader')
});

// less 文件处理
fis.match('*.less', {
  release: "/static/dist/$0",
  useHash: true,
  parser: fis.plugin('less'),
  rExt: '.css'
});


//es6 编译
fis.match('*.es6', {
  release: "/static/dist/$0",
  useHash: true,
  parser: fis.plugin('babel-6.x'),
  rExt: 'js'
});

fis.match('**.{gif,png,jpg}', {
  //useHash:true,
  release: "/static/dist/images/$0"
});


fis.match('comm/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('console/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('console1/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
//首页主体
fis.match('bodyContent/tpls/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('flow/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('libs/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('libsH5/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('login/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('projects/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('todo/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('imbox/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('app/**.html', {
  //useHash:true,
  release: "/static/dist/$0"
});
fis.match('app/**/tpls/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});
fis.match('resources/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});

fis.match('services/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});

fis.match('page/tpls/**.html', {
  //useHash:true,
  release: "/static/dist/tpls/$0"
});

fis.match('**.{otf,eot,svg,ttf,woff}', {
  //useHash:true,
  release: "/static/dist/comm/$0"
});

fis.match('/comm/**.swf', {
  //useHash:true,
  release: "/static/dist/swf/$0"
});

//合并裤文件
fis.match('/libs/**.js', {
  packTo: '/static/dist/libs/commLib_' + v + '.js'
});
fis.match('/libs/**.css', {
  packTo: '/static/dist/libs/commLibCss_' + v + '.css'
});


//合并裤文件
fis.match('/libsH5/**.{js,es6}', {
  packTo: '/static/dist/libs/libsH5_' + v + '.js'
});

fis.match('/libsH5/**.{less,css}', {
  packTo: '/static/dist/libs/libsH5_' + v + '.css'
});

//合并公共样式文件
fis.match('/comm/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/comm/comm_' + v + '.css'
});

//合并公共文件
fis.match('/comm/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/comm/comm_' + v + '.js'
});


//合并公共样式文件
fis.match('/commH5/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/comm/commH5_' + v + '.css'
});

//合并公共文件
fis.match('/commH5/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/commH5/commH5_' + v + '.js'
});


//bodyContent
fis.match('/bodyContent/**.{less,css}', {
  //useHash: false,
  packTo: '/static/dist/bodyContent/bodyContent_' + v + '.css'
});
fis.match('/bodyContent/js/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/bodyContent/bodyContent_' + v + '.js'
});
// 代办
fis.match('/login/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/login/login_' + v + '.js'
});

fis.match('/login/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/login/login_' + v + '.css'
});


// 代办
fis.match('/todo/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/todo/todo_' + v + '.js'
});

fis.match('/todo/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/todo/todo_' + v + '.css'
});

// 消息中心
fis.match('/imbox/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/imbox/imbox_' + v + '.js'
});

fis.match('/imbox/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/imbox/imbox_' + v + '.css'
});

fis.match('/router/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/$0'
});
fis.match('/router/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/$0'
});

fis.match('/api/**.{es6,js}', {
  //useHash:true,
  packTo: '/static/dist/api/api_' + v + ".js"
});


// 资源库
fis.match('/resources/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/resources/resources_' + v + '.js'
});

fis.match('/resources/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/resources/resources_' + v + '.css'
});

//合并裤文件
fis.match('/console/**.{js,es6}', {

  packTo: '/static/dist/console/console_' + v + '.js'
});
fis.match('/console/**.{css,less}', {

  packTo: '/static/dist/console/console_' + v + '.css'
});

fis.match('/console1/**.{js,es6}', {

  packTo: '/static/dist/console1/console_' + v + '.js'
});
fis.match('/console1/**.{css,less}', {

  packTo: '/static/dist/console1/console_' + v + '.css'
});

//项目
fis.match('/projects/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/projects/projects_' + v + '.css'
});
fis.match('/projects/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/projects/projects_' + v + '.js'
});

// 流程
fis.match('/flow/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/flow/flow_' + v + '.js'
});

fis.match('/flow/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/flow/flow_' + v + '.css'
});


// 服务
fis.match('/services/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/services/services_' + v + '.js'
});

fis.match('/services/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/services/services_' + v + '.css'
});

//文件选择组件 配置

fis.match('/components/fileSelection/index.html',{
     release: '/static/dist/components/fileSelection/index.html'
});
fis.match('/components/fileSelection/libs/**.{js,es6}',{
     packTo: '/static/dist/components/fileSelection/libs/libs.js'
});
fis.match('/components/fileSelection/**.{less,css}',{
     packTo: '/static/dist/components/fileSelection/css/fileSelection.css'
});
fis.match('/components/fileSelection/es6/**.{es6,js}',{
     packTo: '/static/dist/components/fileSelection/js/fileSelection.js'
});

//模型 \modelSelection
fis.match('/components/modelSelection/index.html',{
     release: '/static/dist/components/modelSelection/index.html'
});
fis.match('/components/modelSelection/**.{js,es6}',{
     packTo: '/static/dist/components/modelSelection/js/modelSelection.js'
});
// 项


// 项目预览

fis.match('/app/project/single/**.{js,es6}', {
  packTo: '/static/dist/app/project/single/project_' + v + '.js'
});
fis.match('/app/project/single/**.{css,less}', {
  packTo: '/static/dist/app/project/single/project_' + v + '.css'
});

fis.match('/app/project/modelChange/**.{js,es6}', {
  packTo: '/static/dist/app/project/modelChange/index_' + v + '.js'
});
fis.match('/app/project/modelChange/**.{css,less}', {
  packTo: '/static/dist/app/project/modelChange/index_' + v + '.css'
});

fis.match('/app/project/projectChange/**.{js,es6}', {
  packTo: '/static/dist/app/project/projectChange/index_' + v + '.js'
});
fis.match('/app/project/projectChange/**.{css,less}', {
  packTo: '/static/dist/app/project/projectChange/index_' + v + '.css'
});




// 清除其他配置，只保留如下配置
fis.media("prod").match('*.{js,es6}', {
  // fis-optimizer-uglify-js 插件进行压缩，已内置
  optimizer: fis.plugin('uglify-js')
});

fis.media('prod').match('*.{css,less}', {
  // fis-optimizer-clean-css 插件进行压缩，已内置
  optimizer: fis.plugin('clean-css')
});

fis.media('prod').match('*.{png,jpg,gif}', {
  // fis-optimizer-png-compressor 插件进行压缩，已内置
  optimizer: fis.plugin('png-compressor')
});


//  fis.match('**.html', {
//   //useHash:true,
//   release:"/dist/$0"
// });

/*
 fis.media('debug').match('*.{js,css,png}', {
  useHash: false,
  useSprite: false,
  optimizer: null
})

*/
