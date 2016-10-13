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

fis.match('**.exe', {
  //useHash:true,
  release: "/static/dist/$0"
});
fis.match('**.docx', {
  //useHash:true,
  release: "/static/dist/$0"
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
// 服务
fis.match('/services/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/services/services.js'
});
fis.match('/static/dist/services/services.js', {
  useHash: true,
  release: '/static/dist/services/services.js'
});
fis.match('/services/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/services/services.css'
});
fis.match('/static/dist/services/services.css', {
  useHash: true,
  release: '/static/dist/services/services.css'
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
fis.match('suggest/**.html', {
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

//首页主体
fis.match('components/inspectSelection/tpls/**.html', {
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
  packTo: '/static/dist/libs/commLib.js'
});

fis.match('/static/dist/libs/commLib.js', {
  useHash:true,
  release: '/static/dist/libs/commLib.js'
});

fis.match('/libs/**.css', {
  packTo: '/static/dist/libs/commLibCss.css'
});

fis.match('/static/dist/libs/commLibCss.css', {
  useHash:true,
  release: '/static/dist/libs/commLibCss.css'
});


//合并裤文件
fis.match('/libsH5/**.{js,es6}', {
  packTo: '/static/dist/libs/libsH5_'+v+'.js'
});

//fis.match('/static/dist/libs/libsH5.js', {
//  useHash:true,
//  release: '/static/dist/libs/libsH5.js'
//});
fis.match('/libsH5/**.{less,css}', {
  packTo: '/static/dist/libs/libsH5_'+v+'.css'
});

//fis.match('/static/dist/libs/libsH5.css', {
//  useHash:true,
//  release: '/static/dist/libs/libsH5.css'
//});

//合并公共样式文件
fis.match('/comm/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/comm/comm_'+v+'.css'
});

//fis.match('/static/dist/comm/comm.css', {
//  useHash:true,
//  release: '/static/dist/comm/comm.css'
//});

//合并公共文件
fis.match('/comm/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/comm/comm_'+v+'.js'
});

//fis.match('/static/dist/comm/comm.js', {
//  useHash:true,
//  release: '/static/dist/comm/comm.js'
//});


//合并公共样式文件

fis.match('/commH5/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/comm/commH5.css'
});

fis.match('/static/dist/comm/commH5.css', {
  useHash:true,
  release: '/static/dist/comm/commH5.css'
});

//合并公共文件

fis.match('/commH5/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/commH5/commH5.js'
});
fis.match('/static/dist/commH5/commH5.js', {
  useHash:true,
  release: '/static/dist/commH5/commH5.js'
});

//bodyContent
fis.match('/bodyContent/**.{less,css}', {
  //useHash: false,
  packTo: '/static/dist/bodyContent/bodyContent.css'
});

fis.match('/static/dist/bodyContent/bodyContent.css', {
  useHash:true,
  release: '/static/dist/bodyContent/bodyContent.css'
});


fis.match('/bodyContent/js/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/bodyContent/bodyContent.js'
});

fis.match('/static/dist/bodyContent/bodyContent.js', {
  useHash:true,
  release: '/static/dist/bodyContent/bodyContent.js'
});


// 代办
fis.match('/login/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/login/login.js'
});

fis.match('/static/dist/login/login.js', {
  useHash:true,
  release: '/static/dist/login/login.js'
});

fis.match('/login/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/login/login.css'
});

fis.match('/static/dist/login/login.css', {
  useHash:true,
  release: '/static/dist/login/login.css'
});


// 代办
fis.match('/todo/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/todo/todo.js'
});
fis.match('/static/dist/todo/todo.js', {
  useHash:true,
  release: '/static/dist/todo/todo.js'
});
fis.match('/todo/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/todo/todo.css'
});
fis.match('/static/dist/todo/todo.css', {
  useHash:true,
  release: '/static/dist/todo/todo.css'
});
// 消息中心
fis.match('/imbox/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/imbox/imbox.js'
});
fis.match('/static/dist/imbox/imbox.js', {
  useHash:true,
  release: '/static/dist/imbox/imbox.js'
});
fis.match('/imbox/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/imbox/imbox.css'
});
fis.match('/static/dist/imbox/imbox.css', {
  useHash:true,
  release: '/static/dist/imbox/imbox.css'
});

//建议反馈

fis.match('/suggest/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/suggest/suggest.js'
});
fis.match('/static/dist/suggest/suggest.js', {
  useHash:true,
  release: '/static/dist/suggest/suggest.js'
});
fis.match('/suggest/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/suggest/suggest.css'
});
fis.match('/static/dist/suggest/suggest.css', {
  useHash:true,
  release: '/static/dist/suggest/suggest.css'
});

fis.match('/router/**.{js,es6}', {
  useHash:true,
  //packTo: '/static/dist/$0'
  release: '/static/dist/$0'
});

fis.match('/router/**.{less,css}', {
  useHash:true,
  //packTo: '/static/dist/$0'
  release: '/static/dist/$0'
});

fis.match('/api/**.{es6,js}', {
  //useHash:true,
  packTo: '/static/dist/api/api.js'
});
fis.match('/static/dist/api/api.js', {
  useHash:true,
  release: '/static/dist/api/api.js'
});

// 资源库
fis.match('/resources/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/resources/resources.js'
});
fis.match('/static/dist/resources/resources.js', {
  useHash:true,
  release: '/static/dist/resources/resources.js'
});
fis.match('/resources/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/resources/resources.css'
});
fis.match('/static/dist/resources/resources.css', {
  useHash:true,
  release: '/static/dist/resources/resources.css'
});
//合并裤文件
fis.match('/console/**.{js,es6}', {

  packTo: '/static/dist/console/console.js'
});
fis.match('/static/dist/console/console.js', {
  useHash:true,
  release: '/static/dist/console/console.js'
});
fis.match('/console/**.{css,less}', {

  packTo: '/static/dist/console/console.css'
});
fis.match('/static/dist/console/console.css', {
  useHash:true,
  release: '/static/dist/console/console.css'
});
fis.match('/console1/**.{js,es6}', {

  packTo: '/static/dist/console1/console.js'
});
fis.match('/static/dist/console1/console.js', {
  useHash:true,
  release: '/static/dist/console1/console.js'
});
fis.match('/console1/**.{css,less}', {

  packTo: '/static/dist/console1/console.css'
});
fis.match('/static/dist/console1/console.css', {
  useHash:true,
  release: '/static/dist/console1/console.css'
});

//项目
fis.match('/projects/**.{less,css}', {
  useHash: false,
  packTo: '/static/dist/projects/projects.css'
});
fis.match('/static/dist/projects/projects.css', {
  useHash: true,
  release: '/static/dist/projects/projects.css'
});
fis.match('/projects/**.{js,es6}', {
  useHash: false,
  //useHash:true,
  packTo: '/static/dist/projects/projects.js'
});
fis.match('/static/dist/projects/projects.js', {
  useHash: true,
  release: '/static/dist/projects/projects.js'
});


// 流程
fis.match('/flow/**.{js,es6}', {
  //useHash:true,
  packTo: '/static/dist/flow/flow.js'
});
fis.match('/static/dist/flow/flow.js', {
  useHash: true,
  release: '/static/dist/flow/flow.js'
});
fis.match('/flow/**.{less,css}', {
  //useHash:true,
  packTo: '/static/dist/flow/flow.css'
});
fis.match('/static/dist/flow/flow.css', {
  useHash: true,
  release: '/static/dist/flow/flow.css'
});


//文件选择组件 配置

fis.match('/components/fileSelection/index.html',{
  release: '/static/dist/components/fileSelection/index.html'
});
fis.match('/components/fileSelection/libs/**.{js,es6}',{
  packTo: '/static/dist/components/fileSelection/libs/libs_'+v+'.js'
});
//fis.match('/static/dist/components/fileSelection/libs/libs.js', {
//  useHash: true,
//  release: '/static/dist/components/fileSelection/libs/libs.js'
//});
fis.match('/components/fileSelection/**.{less,css}',{
  packTo: '/static/dist/components/fileSelection/css/fileSelection.css'
});
//fis.match('/static/dist/components/fileSelection/css/fileSelection.css', {
//  useHash: true,
//  release: '/static/dist/components/fileSelection/css/fileSelection.css'
//});
fis.match('/components/fileSelection/es6/**.{es6,js}',{
  packTo: '/static/dist/components/fileSelection/js/fileSelection.js'
});
//fis.match('/static/dist/components/fileSelection/js/fileSelection.js', {
//  useHash: true,
//  release: '/static/dist/components/fileSelection/js/fileSelection.js'
//});



//模型 \modelSelection
fis.match('/components/modelSelection/index.html',{
  release: '/static/dist/components/modelSelection/index.html'
});
fis.match('/components/modelSelection/single.html',{
  release: '/static/dist/components/modelSelection/single.html'
});

fis.match('/components/modelSelection/model.html',{
  release: '/static/dist/components/modelSelection/model.html'
});

fis.match('/components/modelSelection/**.{js,es6}',{
  packTo: '/static/dist/components/modelSelection/js/modelSelection.js'
});
//fis.match('/static/dist/components/modelSelection/js/modelSelection.js', {
//  useHash: true,
//  release: '/static/dist/components/modelSelection/js/modelSelection.js'
//});


//模型
fis.match('/components/inspectSelection/index.html',{
  release: '/static/dist/components/inspectSelection/index.html'
});
fis.match('/components/inspectSelection/model.html',{
  release: '/static/dist/components/inspectSelection/model.html'
});

fis.match('/components/inspectSelection/**.{css,less}',{
  packTo: '/static/dist/components/inspectSelection/css/inspectSelection.css'
});
//fis.match('/static/dist/components/inspectSelection/css/inspectSelection.css', {
//  useHash: true,
//  release: '/static/dist/components/inspectSelection/css/inspectSelection.css'
//});
fis.match('/components/inspectSelection/**.{js,es6}',{
  packTo: '/static/dist/components/inspectSelection/js/inspectSelection.js'
});
//fis.match('/static/dist/components/inspectSelection/js/inspectSelection.js', {
//  useHash: true,
//  release: '/static/dist/components/inspectSelection/js/inspectSelection.js'
//});


//模型 \checkpoints
//fis.match('/components/checkpoints/index.html',{
//  release: '/static/dist/components/checkpoints/index.html'
//});
//fis.match('/components/checkpoints/libs/**.{js,es6}',{
//  packTo: '/static/dist/components/checkpoints/libs/libs.js'
//});
//fis.match('/components/checkpoints/js/**.{js,es6}',{
//  packTo: '/static/dist/components/checkpoints/js/checkpoints.js'
//});
//fis.match('/components/checkpoints/less/**.{css,less}', {
//  packTo: '/static/dist/components/checkpoints/less/index.css'
//});
//
////模型 \concerns
//fis.match('/components/concerns/index.html',{
//  release: '/static/dist/components/concerns/index.html'
//});
//fis.match('/components/concerns/libs/**.{js,es6}',{
//  packTo: '/static/dist/components/concerns/libs/libs.js'
//});
//fis.match('/components/concerns/js/**.{js,es6}',{
//  packTo: '/static/dist/components/concerns/js/concerns.js'
//});
//fis.match('/components/concerns/less/**.{css,less}', {
//  packTo: '/static/dist/components/concerns/less/index.css'
//});
//fis.match('/components/concerns/tpls/concerns.body.html', {
//  //useHash:true,
//  release: "/static/dist/components/concerns/concerns.body.html"
//});

//模型 \points
fis.match('/components/points/index.html',{
  release: '/static/dist/components/points/index.html'
});
fis.match('/components/points/tip.html',{
  release: '/static/dist/components/points/tip.html'
});
fis.match('/components/points/libs/**.{js,es6}',{
  packTo: '/static/dist/components/points/libs/libs.js'
});
//fis.match('/static/dist/components/points/libs/libs.js', {
//  useHash: true,
//  release: '/static/dist/components/points/libs/libs.js'
//});
//fis.match('/components/points/js/**.{js,es6}',{
//  //useHash:false,
//  packTo: '/static/dist/components/points/js/points_'+v+'.js'
//});
fis.match('/components/points/js/points.es6', {
  useHash: false,
  release: '/static/dist/components/points/js/points.js'
});
fis.match('/components/points/less/**.{css,less}', {
  packTo: '/static/dist/components/points/less/index.css'
});
//fis.match('/static/dist/components/points/less/index.css', {
//  useHash: true,
//  release: '/static/dist/components/points/less/index.css'
//});
fis.match('/components/points/tpls/points.body.html', {
  //useHash:true,
  release: "/static/dist/components/points/points.body.html"
});
// 项


// 项目预览

fis.match('/app/project/single/**.{js,es6}', {
  packTo: '/static/dist/app/project/single/project.js'
});
fis.match('/static/dist/app/project/single/project.js', {
  useHash: true,
  release: '/static/dist/app/project/single/project.js'
});
fis.match('/app/project/single/**.{css,less}', {
  packTo: '/static/dist/app/project/single/project.css'
});
fis.match('/static/dist/app/project/single/project.css', {
  useHash: true,
  release: '/static/dist/app/project/single/project.css'
});
fis.match('/app/project/modelChange/**.{js,es6}', {
  packTo: '/static/dist/app/project/modelChange/index.js'
});
fis.match('/static/dist/app/project/modelChange/index.js', {
  useHash: true,
  release: '/static/dist/app/project/modelChange/index.js'
});
fis.match('/app/project/modelChange/**.{css,less}', {
  packTo: '/static/dist/app/project/modelChange/index.css'
});
fis.match('/static/dist/app/project/modelChange/index.css', {
  useHash: true,
  release: '/static/dist/app/project/modelChange/index.css'
});
fis.match('/app/project/projectChange/**.{js,es6}', {
  packTo: '/static/dist/app/project/projectChange/index.js'
});
fis.match('/static/dist/app/project/projectChange/index.js', {
  useHash: true,
  release: '/static/dist/app/project/projectChange/index.js'
});
fis.match('/app/project/projectChange/**.{css,less}', {
  packTo: '/static/dist/app/project/projectChange/index.css'
});
fis.match('/static/dist/app/project/projectChange/index.css', {
  useHash: true,
  release: '/static/dist/app/project/projectChange/index.css'
});

//单独
fis.match('/js/**.js', {
  //useHash:true,
  release: "/static/dist/$0"
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
