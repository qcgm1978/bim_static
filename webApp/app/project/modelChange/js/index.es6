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
App.Project = {

	changeList: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignChange"

	})),

	changeInfo: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignChangeInfo"

	})),
};
