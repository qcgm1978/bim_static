

App.Projects.listView=Backbone.View.extend({

	tagName:'li',

	className:'item',

	events:{
		"click .aProName":"beforeBreak"
	},

	template:_.templateUrl("/projects/tpls/project.list.html"),

	// 重写初始化
	// initialize:function(){
	// 	this.listenTo(this.model, 'change', this.render);
	//     this.listenTo(this.model, 'destroy', this.removeItem);
	// },

	render:function(){
		//渲染数据
		var data=this.model.toJSON();
		this.$el.html(this.template(data)).attr("cid",this.model.cid);
		return this;
	},

	//跳转之前
	beforeBreak:function(event){
		var $target=$(event.target);
	 	App.Comm.setCookie("projectName",$target.text());

	}

});
