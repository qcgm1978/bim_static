App.Index={

	bindEvent(){

		 $("#projectContainer").on("click",".projectPropetyHeader .item",function(){
		 	var index=$(this).index();
		 	$(this).addClass("selected").siblings().removeClass("selected");
		 	$(this).closest(".designPropetyBox").find(".projectPropetyContainer div").eq(index).show().siblings().hide();
		 });
	},

	init(){
		this.bindEvent();
	}
}

App.Project.Model = {
	ChangeList:Backbone.View.extend({
		tagName: "div",

	  className: "itemNode",
	  events:{},
	  template:_.templateUrl('/app/project/modelChange/tpls/changeList.html',true),
	  render:function(){
	  	this.$el.html(this.template)
	  }
	})
}
