


App.ResourceModel.ListNav=Backbone.View.extend({

	tagName:"div",

	id:"navContainer",
														 
	template:_.templateUrl("/resources/tpls/resourceModel/resource.model.listNav.html",true),

	render:function(){

		 
		this.$el.html(this.template);

		this.$el.find(".listContent").html(new App.ResourceModel.TopBar().render().el); 

		this.$el.find(".listContent").append(new App.ResourceModel.ListContent().render().el);


		return this;
	}

});