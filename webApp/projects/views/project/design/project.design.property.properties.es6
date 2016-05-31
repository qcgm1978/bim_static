
//设计属性 碰撞
App.Project.DesignProperties=Backbone.View.extend({

	tagName:"div",

	className:"designProperties",

	initialize:function(){
		this.listenTo(App.Project.DesignAttr.PropertiesCollection,"add",this.addOne);
	},

	template:_.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	render:function(){ 
		this.$el.html('<div class="nullTip">请选择构件</div>');
		return this;
	},

	//添加
	addOne:function(model){ 
		//渲染数据
		var data=model.toJSON().data,
			_this=this; 
	//	this.$el.html(this.template(data)); 

		App.Project.fileInfo(data,function(data){
			_this.$el.html(_this.template(data)); 
			//其他属性
			if($('.design').hasClass('selected')){
				App.Project.propertiesOthers.call(_this,"plan|cost|quality|dwg");

			}
		});
	}

});
