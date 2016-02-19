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

 fis.set('project.md5Length', 7);
  fis.set('project.md5Connector ', '_');


fis.match('::package', {
  postpackager: fis.plugin('loader') 
});

// less 文件处理
fis.match('*.less', {
  parser: fis.plugin('less'), 
  rExt: '.css'
});


//es6 编译
fis.match('*.es6', {
    parser: fis.plugin('babel-6.x'),
    rExt: 'js'
}); 
 

//合并裤文件
fis.match('/libs/**.js', { 
  packTo: '/dist/libs/commLib.js'
});


//合并公共样式文件
fis.match('/comm/**.{less,css}', {
	useHash:true,
  packTo: '/dist/comm/comm.css'
});

//合并公共文件
fis.match('/comm/**.js', {
  useHash:true,
	//useHash:true,
  packTo: '/dist/comm/comm.js'
});


// 代办
fis.match('/login/**.{js,es6}', {
  //useHash:true,
  packTo: '/dist/login/login.js'
});

fis.match('/login/**.{less,css}', {
  //useHash:true,
  packTo: '/dist/login/login.css'
});


// 代办
fis.match('/todo/**.js', {
  //useHash:true,
  packTo: '/dist/todo/todo.js'
});

fis.match('/todo/**.{less,css}', {
  //useHash:true,
  packTo: '/dist/todo/todo.css'
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


 /*
 fis.media('debug').match('*.{js,css,png}', {
  useHash: false,
  useSprite: false,
  optimizer: null
})
 
*/

 