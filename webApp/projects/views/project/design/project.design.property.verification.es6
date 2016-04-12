 
//设计属性 检查
App.Project.DesignVerification=Backbone.View.extend({

	tagName:"div",

	className:"designVerification",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.VerificationCollection,"add",this.addOne);
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.verification.html"),

	render:function(){
		var template=_.templateUrl("/projects/tpls/project/design/project.design.property.verification.header.html",true);
		this.$el.html(template);
		return this;
	},

	bindScroll(){

		this.$(".ckBodyScroll").mCustomScrollbar({
             set_height: "100%",
             theme: 'minimal-dark',
             axis: 'y',
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });
		
	},

	//数据返回
	addOne:function(model){ 
		 
		if (this.$el.closest('body').length<=0) {
			this.remove();
		}
         var data=model.toJSON();
         this.$(".ckBox .ckBody tbody").html(this.template(data));

         if (!this.$(".ckBodyScroll").hasClass('mCustomScrollbar ')) {
         	this.bindScroll();
         }
          
	}

	 

});

