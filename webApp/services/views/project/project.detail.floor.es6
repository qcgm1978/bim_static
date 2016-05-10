App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Floor=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		'click .createFloor':'createFloor'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.floor.html',true),
	
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

	createFloor(){
		this.$('dd').slideUp();
		this.$('dt span').addClass('accordOpen');
		var view=new App.Services.DetailView.Floor();
		this.$('.detailContainer .scrollWrapContent').prepend(view.render().el);
	}
	
})