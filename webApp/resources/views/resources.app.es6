/**
 * @require /resources/collection/index.es6
 */


App.Resources.App=Backbone.View.extend({

	el:$("#contains"),

	template:_.templateUrl("/resources/tpls/resources.app.html",true),

	render(){
		 
		this.$el.html(this.template);
		return this;
	}


});