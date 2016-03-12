App.Project.leftNav = Backbone.View.extend({

	tagName: "div",

	className: "leftNav",

	events: {
		"click .item": "itemClick"

	},

	template: _.templateUrl('/projects/tpls/project/project.leftNav.html', true),


	render: function() {
		this.$el.html(this.template);
		return this;
	},

	//切换tab
	itemClick: function(event) {
		//切换选中项 返回type
		App.Project.Settings.fetchNavType = $(event.target).addClass("selected").siblings().removeClass("selected").end().data("type");
		if (App.Project.Settings.fetchNavType == "file") {
			//切换导航tab
			$("#projectContainer").find(".projectFileNavContent").show();
			$("#projectContainer").find(".projectModelNavContent").hide();
			//导航内容
			$("#projectContainer .fileContainer").show();
			$("#projectContainer .modelContainer").hide();
			//添加样式
			$("#projectContainer").find(".rightProperty").removeClass("showPropety").end().find(".projectCotent").removeClass("showPropety");

			//拖拽和收起
			$("#projectContainer .leftNav").find(".slideBar").hide().end().find(".dragSize").hide();

			//切换时记录大小
			var $projectCotent = $("#projectContainer .projectCotent"),
				mRight = $projectCotent.css("margin-right");
			$projectCotent.css("margin-right", 0);
			$projectCotent.data("mRight", mRight);



		} else {

			if (!typeof(Worker)) {
				alert("请使用现代浏览器查看模型");
				return;
			}
		 
			this.fetchModelIdByProject(); 
			// new BIM({
			// 	element: $("#projectContainer .modelContainerContent")[0],
			// 	projectId: 'n4',
			// 	tools: true
			// });
		}

	},

	//获取项目版本Id
	fetchModelIdByProject: function() {

		var data={
			URLtype:"fetchModelIdByProject",
			data:{
				projectId:App.Project.Settings.projectId,
				projectVersionId:App.Project.Settings.CurrentVersion.id
			}
		}
		var that=this;
		App.Comm.ajax(data,function(data){

			if (data.message=="success") {

				if (data.data) {
					App.Project.Settings.modelId=data.data;
					that.renderModel();
				}else{
					alert("模型转换中");
				}
			}else{
				alert(data.message);
			}

		});
	},

	//模型渲染
	renderModel:function(){
		//切换导航tab
			$("#projectContainer").find(".projectFileNavContent").hide();
			$("#projectContainer").find(".projectModelNavContent").show();
			//导航内容
			$("#projectContainer .fileContainer").hide();
			$("#projectContainer .modelContainer").show();

			//拖拽和收起
			$("#projectContainer .leftNav").find(".slideBar").show().end().find(".dragSize").show();

			var $projectCotent = $("#projectContainer .projectCotent"),
				mRight = $projectCotent.data("mRight");
			if (mRight) {
				$projectCotent.css("margin-right", mRight);
			}

			$("#projectContainer").find(".projectModelNavContent .mCS_no_scrollbar_y").width(800);
			//渲染模型属性
			App.Project.renderModelContentByType(); 


			var viewer = new BIM({
				element: $("#projectContainer .modelContainerContent")[0],
				projectId:App.Project.Settings.modelId, //"b7554b6591ff6381af854fa4efa41f81", //App.Project.Settings.projectId,
				// projectId:'testrvt',
				tools: true,
				treeElement: $("#projectContainer .projectNavModelContainer")[0]
			});

			viewer.on("click", function(model) {
			 	App.Project.Settings.ModelObj=null;
				if (!model.intersect) {
					return;
				} 

				App.Project.Settings.ModelObj=model;
				//App.Project.Settings.modelId = model.userId;
				//设计  
				if (App.Project.Settings.projectNav == "design") {
					//属性
					if (App.Project.Settings.property == "attr") {

						App.Project.DesignAttr.PropertiesCollection.projectId=App.Project.Settings.projectId;
						App.Project.DesignAttr.PropertiesCollection.projectVersionId=App.Project.Settings.CurrentVersion.id;
						App.Project.DesignAttr.PropertiesCollection.fetch({
							data: { 
								elementId: model.intersect.userId,
								sceneId: model.intersect.object.userData.sceneId 
							}
						}); 
					}

				}

			});
	}



});