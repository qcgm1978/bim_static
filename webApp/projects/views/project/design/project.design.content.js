App.Project.ProjectDesingnContent = Backbone.View.extend({

	tagName: 'div',

	id: 'projectDesignContent',

	//初始化
	initialize: function() {
		this.listenTo(App.Project.FileCollection,"add",this.addOneFile); 
	},

	events: {

	},

	template: _.templateUrl('/projects/tpls/project/design/project.design.content.html', true),

	render: function() { 

		this.$el.append(this.template);
		
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
		var view=new App.Project.ProjectDesingnFileDetail({
			model:model
		});
		this.$el.find(".fileContent:last").prepend(view.render().el);

		//判断滚动条是否绑定过 
		if (!this.$el.find(".fileContainerScrollContent").hasClass('mCustomScrollbar')) {
			this.initDesignScroll(); 
		}

	}



});