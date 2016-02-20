 

App.Projects = { 

	ProjectCollection:new(Backbone.Collection.extend({
		model:Backbone.Model.extend({
			defaults:function(){
	   		return {
	   			url:''
	   		}
	   	  } 
		})
	})), 

	Settings:{
		type:"list",
	},

	init: function() {

		var $contains=$("#contains");
		//nav
		$contains.html(new App.Projects.searchView().render().$el);
	 	//切换列表
		$contains.append(new App.Projects.DisplayMode().render().$el);
		//显示box
		$contains.append(new App.Projects.ContentMode().render().$el);  
		//拉取数据
	 	App.Projects.fetch();

	},

	fetch:function(){ 
	 
		//清空数据
		App.Projects.ProjectCollection.models=[];

		if (App.Projects.Settings.type=="list") { 
			$("#projectModes").find(".proListBox").show().find(".item").remove().end().end().find(".proMapBox").hide();

			var projectArr=[]; 

			for(var i=0;i<10;i++){
				projectArr.push({url:'/projects/images/proDefault.png',projectName:"项目"+(+new Date()),projectAddress:'上海',projectStar:'2015-5-9',
				projectEnd:'2016-9-6',projectID:i});
			}

			App.Projects.ProjectCollection.add(projectArr);

		}else{
			//地图
		}

	}

	 

} 