App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Pile=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.pile.html',true),
	
	initialize(){
	},
	
	render(){
		this.$el.html(this.template);   
		return this;
	},
	
	load(){
	}
	
})