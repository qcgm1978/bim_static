 App.ResourceModel.App = Backbone.View.extend({

 	el: $("#contains"),

 	render: function() {

 		this.$el.html(new App.ResourceCrumbsNav().render().el);

 		this.$el.append(new App.ResourceModel.LeftNav().render(1).el);

 		this.$el.append(new App.ResourceModel.ListNav().render().el); 

 		//右键菜单
 		var contextHtml=_.templateUrl("/resources/tpls/context/listContext.html",true); 
 		$("body").append(contextHtml);

 	}



 });