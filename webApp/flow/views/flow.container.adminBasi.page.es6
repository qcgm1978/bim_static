App.Flow.ContentAdminBasiPageView=Backbone.View.extend({
	tagName:"div",
	className:"adminBasiPage",
	render(pageName){
		var page = _.templateUrl("/flow/tpls/"+pageName+".html");
		this.$el.html(page);
		return this;
	}	
})