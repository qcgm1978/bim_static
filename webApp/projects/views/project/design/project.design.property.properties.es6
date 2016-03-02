
//设计属性 碰撞
App.Project.DesignProperties=Backbone.View.extend({

	tagName:"div",

	className:"designProperties",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.PropertiesCollection,"add",this.addOne);
	},

	render:function(){ 
		return this;
	},

	//添加
	addOne:function(model){
		this.$el.html("我是谁");
	}

});
