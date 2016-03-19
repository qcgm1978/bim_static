

App.ResourceFamLibs.leftNav=Backbone.View.extend({

	tagName: "div",

	id: "resourceFamlibsLeftNav",

	template: _.templateUrl("/resources/tpls/resourceFamLibs/resource.famlibs.leftNav.html", true),

	events: {
		 
	},

	//渲染
	render: function(type) {

		this.$el.html(this.template);

		this.getfileTree();

		return this;
	},

	getfileTree:function(){

	}




});

