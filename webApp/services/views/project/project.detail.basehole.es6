App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.BaseHole=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		'click .createBaseHole':'createBaseHole'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.basehole.html',true),
	
	initialize(){
	},
	
	render(){
		this.$el.html(this.template);   
		this.$(".outerInstall").myDropDown();
		this.$(".structure").myDropDown();
		return this;
	},
	
	load(){
	},
	
	createBaseHole(){
		this.$('dd').slideUp();
		this.$('dt span').addClass('accordOpen');
		var view=new App.Services.DetailView.BaseHole();
		this.$('.detailContainer .scrollWrapContent').prepend(view.render().el);
	}
	
})