 
//项目基本设置
App.Services.ProjectBase=Backbone.View.extend({

	tagName:"div",

	className:"projectBase", 

	template:_.templateUrl('/services/tpls/project/index.base.html',true),

	render(){

		this.$el.html(this.template);   
		return this;
	}

	 



});