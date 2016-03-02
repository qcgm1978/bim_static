 
//设计属性 碰撞
App.Project.DesignVerification=Backbone.View.extend({

	tagName:"div",

	className:"designVerification",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.VerificationCollection,"add",this.addOne);
	},

	render:function(){ 
		return this;
	}

});

