
App.Project.FileContainer=Backbone.View.extend({


	tagName:"div",

	className:"fileContainer",

	//初始化
	initialize: function() {
		this.listenTo(App.Project.FileCollection,"add",this.addOneFile); 
	},

	template:_.templateUrl("/projects/tpls/project/project.container.file.html",true),

	//渲染
	render:function(){
		this.$el.html(this.template);
		return this;
	}, 

	initDesignScroll: function() { 

		this.$el.find(".fileContainerScrollContent").mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});


	},


	//添加单个li
	addOneFile:function(model){ 
		var view=new App.Project.FileContainerDetail({
			model:model
		});
		this.$el.find(".fileContent").prepend(view.render().el);

		//判断滚动条是否绑定过 
		if (!this.$el.find(".fileContainerScrollContent").hasClass('mCustomScrollbar')) {
			this.initDesignScroll(); 
		}

	}

});