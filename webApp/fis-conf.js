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

 

var v=20160307;

 fis.set('project.md5Length', 7);
  fis.set('project.md5Connector ', '_');


fis.match('::package', {
  postpackager: fis.plugin('loader') 
});

// less 文件处理
fis.match('*.less', {
  release:"/dist/$0",
  useHash:true,
  parser: fis.plugin('less'), 
  rExt: '.css'
});


//es6 编译
fis.match('*.es6', {
     release:"/dist/$0",
    useHash:true,
    parser: fis.plugin('babel-6.x'),
    rExt: 'js'
}); 
 
 fis.match('**.{gif,png,jpg}', {
  //useHash:true,
  release:"/dist/images/$0"
});

  fis.match('**.{otf,eot,svg,ttf,woff}', {
  //useHash:true,
  release:"/dist/comm/$0"
});

//合并裤文件
fis.match('/libs/**.js', { 
  packTo: '/dist/libs/commLib_'+v+'.js'
});
fis.match('/libs/**.css', { 
  packTo: '/dist/libs/commLibCss_'+v+'.css'
});


//合并裤文件
fis.match('/libsH5/**.js', { 
  packTo: '/dist/libs/libsH5_'+v+'.js'
});

fis.match('/libsH5/**.css', { 
  packTo: '/dist/libs/libsH5_'+v+'.css'
});

//合并公共样式文件
fis.match('/comm/**.{less,css}', {
	useHash:false,
  packTo: '/dist/comm/comm_'+v+'.css'
});

//合并公共文件
fis.match('/comm/**.{js,es6}', {
  useHash:false,
	//useHash:true,
  packTo: '/dist/comm/comm_'+v+'.js'
}); 


// 代办
fis.match('/login/**.{js,es6}', {
  //useHash:true,
  packTo: '/dist/login/login_'+v+'.js'
});

fis.match('/login/**.{less,css}', {
  //useHash:true,
  packTo: '/dist/login/login_'+v+'.css'
});


// 代办
fis.match('/todo/**.{js,es6}', {
  //useHash:true,
  packTo: '/dist/todo/todo_'+v+'.js'
});

fis.match('/todo/**.{less,css}', {
  //useHash:true,
  packTo: '/dist/todo/todo_'+v+'.css'
});


//项目
fis.match('/projects/**.{less,css}', {
  useHash:false,
  packTo: '/dist/projects/projects_'+v+'.css'
});
fis.match('/projects/**.{js,es6}', {
  useHash:false,
  //useHash:true,
  packTo: '/dist/projects/projects_'+v+'.js'
});

// 流程
fis.match('/flow/**.{js,es6}', {
  //useHash:true,
  packTo: '/dist/flow/flow_'+v+'.js'
});

fis.match('/flow/**.{less,css}', {
  //useHash:true,
  packTo: '/dist/flow/flow_'+v+'.css'
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

 