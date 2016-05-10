App.Services.ProjectDetail={};

App.Services.ProjectDetail.Floor=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		'click .accordionDatail':'toggleProFrom'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.floor.html',true),
	
	initialize(){
		
	},
	
	render(){
		this.$el.html(this.template);   
		return this;
	},
	
	load(){
	},
	
	toggleProFrom(e){
		this.$(e.target).parent().next().slideToggle();
	}
	
})