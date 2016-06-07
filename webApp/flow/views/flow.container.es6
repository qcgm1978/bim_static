App.Flow=App.Flow||{};

App.Flow.View=Backbone.View.extend({

	tagName:"div",

	className:"flowContainer",

	template:_.templateUrl("/flow/tpls/flow.content.html",true),
	
	initialize(){
		
		this.listenTo(App.Flow.Controller.flowCollection,'reset',this.load);
		
	},

	render:function(){
		this.$el.html(this.template);
		return this;
	},
	
	load:function(m){
		var data=m.toJSON()[0];
		var _html=_.template(this.template);
		$("#contains").html(_html(data));
		return this;
	}

});
