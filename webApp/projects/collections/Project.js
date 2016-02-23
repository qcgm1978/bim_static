App.Project = {

	Settings: {
		fetchNavType: 'file', // model file
		projectNav:"design",
	},
 
	// 文件 容器
	FileCollection:new (Backbone.Collection.extend({
		model:Backbone.Model.extend({
			defaults:function(){
				return {
					title:""
				}
			}
		})
	})),

	init: function() {

		//var $contains = $("#contains");

		$("#contains").html(new App.Project.ProjectApp().render().el); 
		//获取nav数据
		App.Project.fetchFile();
	},

	fetchFile:function(){
		//获取左侧导航
		App.Project.fetchNav();
		//获取文件列表
		App.Project.fetchFileList();
	},

	fetchFileList:function(){
		var fileList=[];
		for(var i=0;i<10;i++){  
			fileList.push({fileBg:"/projects/images/proDefault.png", fileName:"万达广场_施工图_QZC9+4_B1_STRU.rvt",
				fileStatus:"待上传",fileOp:"赵子良",fileSize:"302M",fileDate:"2016-6-3 20:20:54" });
		}

		App.Project.FileCollection.length=0;
		$("#projectContainer .fileContent .item").remove();

		App.Project.FileCollection.add(fileList);


	},

	fetchNav: function() {
		
		if (App.Project.Settings.fetchNavType == "file") {
			var settings = {
				data: {
					trees: [{
						title: "模型文件",
						children: [{
								title: "01-ARCH"
							}, {
								title: "02-STRU"
							}, {
								title: "03-MECH"
							}, {
								title: "04-PLUM"
							}, {
								title: "05-STRU"
							}, {
								title: "06-STRU"
							}, {
								title: "07-STRU"
							}, {
								title: "08-STRU"
							}

						]
					}, {
						title: "链接文件",
						children: [{
							title: "09-ARCH"
						}, {
							title: "10-STRU"
						}, {
							title: "11-STRU"
						}, {
							title: "12-STRU"
						}]
					}, {
						title: "轻量化文件",
						children: [{
							title: "15-轻量化模型"
						}]
					}, {
						title: "材质库模型"
					}, {
						title: "图纸",
						children: [{
								title: "01-ARCH"
							}, {
								title: "02-STRU"
							}, {
								title: "03-MECH"
							}, {
								title: "04-PLUM"
							}, {
								title: "05-STRU"
							}, {
								title: "06-STRU"
							}, {
								title: "07-STRU"
							}, {
								title: "08-STRU"
							}

						]
					}]
				},
				click: function() {
					console.log("我被点击了");
				},
				iconType: 1
			};
			var navHtml = new App.Comm.TreeViewMar(settings);
			$("#projectDesignNav .projectNavContent").html(navHtml);

		} else {
			var settings = {
				data: {
					trees: [{
							title: "专业",
							children: [{
								title: "建筑专业",
								children: [{
									title: "WDGC-Q-SY-AXIS-20160120.rvt"
								}]

							}, {
								title: "结构专业"
							}, {
								title: "03-MECH"
							}]
						}, {
							title: "楼层"
						}, {
							title: "视点",
							isCk: false,
							iconType: 1,
							children:[{
								title:"WDGC-Q-SY-AXIS-20160120.rvt"
							}]
						}


					]


				},
				click: function() {
					console.log("我被点击了");
				},
				isCk: true,
				iconType: 0
			};
			var navHtml = new App.Comm.TreeViewMar(settings);
			$("#projectDesignNav .projectNavContent").html(navHtml);
		}



	}
}