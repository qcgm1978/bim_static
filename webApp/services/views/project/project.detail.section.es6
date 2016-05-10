App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Section=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		'click .createSection':'createSection'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.section.html',true),
	
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
	createSection(){
		this.$('dd').slideUp();
		this.$('dt span').addClass('accordOpen');
		var view=new App.Services.DetailView.Section();
		this.$('.detailContainer .scrollWrapContent').prepend(view.render().el);
	}
	
})