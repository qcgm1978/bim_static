App.Project.ProjectQuality=Backbone.View.extend({

	tagName:"div",

	id:"ProjectQualityContainer",

	render:function(){
		this.$el.html(new App.Project.ProjectQualityNav().render().el);
		return this;
	}


});