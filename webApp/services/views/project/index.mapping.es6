 
//项目映射
App.Services.ProjectMapping=Backbone.View.extend({

	tagName:"div",

	className:"projectMapping", 

	template:_.templateUrl('/services/tpls/project/index.mapping.html',true),

	render(){

		this.$el.html(this.template);   
		return this;
	}

	 



});