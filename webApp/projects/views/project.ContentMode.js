App.Projects.ContentMode = Backbone.View.extend({

	tagName: 'div',

	id: 'projectModes',

	// 重写初始化
	initialize: function() {
		this.listenTo(App.Projects.ProjectCollection, "add", this.addOne);
	},

	template: _.templateUrl('/projects/tpls/project.ContentMode.html', true),

	render: function() {
		this.$el.html(this.template);
		return this;
	},

	//切换改变
	addOne: function(model) {

		
		var listView = new App.Projects.listView({
			model: model
		});

		this.$el.find(".proListBox").append(listView.render().el);
		//列表
		//if (App.Projects.Settings.type == "list") { 

		//}  
	}

});