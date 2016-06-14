
App.Project.FileContainer=Backbone.View.extend({


	tagName:"div",

	className:"fileContainer",

	//初始化
	initialize: function() {
		this.listenTo(App.Project.FileCollection,"reset",this.reset); 
		this.listenTo(App.Project.FileCollection,"add",this.addOneFile); 
	},

	events:{
		"click .header .ckAll":"ckAll"
		 
	},

	template:_.templateUrl("/projects/tpls/project/project.container.file.html"),

	//渲染
	render:function(){
		this.$el.html(this.template());
		var $container = this.$el.find('.serviceNav'),
		    Auth = App.AuthObj && App.AuthObj.project  &&　App.AuthObj.project.prjfile;

		  if (!Auth) {
		  		Auth={};
		  }

		if (!Auth.edit) {
			this.$('.btnFileUpload').addClass('disable');
			if(!Auth.downLoad){
				this.$('.btnFileDownLoad').addClass('disable');
			}
		}
		return this;
	},  

	ckAll(event){ 
		this.$el.find(".fileContent .ckAll").prop("checked",event.target.checked);
	}, 


	//添加单个li
	addOneFile:function(model){ 
		 
		var view=new App.Project.FileContainerDetail({
			model:model
		});

		this.$el.find(".fileContent .loading").remove();

		this.$el.find(".fileContent").append(view.render().el);

		//绑定滚动条
		App.Comm.initScroll(this.$el.find(".fileContainerScrollContent"),"y");
		 

	},

	//重置加载
	reset(){

		this.$el.find(".fileContent").html('<li class="loading">正在加载，请稍候……</li>');
	}

 



});