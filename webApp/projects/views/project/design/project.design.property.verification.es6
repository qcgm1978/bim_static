 
//设计属性 检查
App.Project.DesignVerification=Backbone.View.extend({

	tagName:"div",

	className:"designVerification",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.VerificationCollection,"add",this.addOne);
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.verification.html"),

	render:function(){
		this.$el.html("");
		return this;
	},

	//数据返回
	addOne:function(model){
         var data=model.toJSON();
         this.$el.html(this.template(data));
	}

	 

});

