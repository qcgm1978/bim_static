App.Flow=App.Flow||{};

App.Flow.View=Backbone.View.extend({

	tagName:"div",

	className:"flowContainer",

	template:_.templateUrl("/flow/tpls/flow.content.html",true),

	events:{
		'click .text':'detail',
		'click .flowTabItem':'switchModel'
	},
	
	initialize(){
		
		this.listenTo(App.Flow.Controller.flowCollection,'reset',this.load);
		
	},

	switchModel(e){
		var $target=$(e.currentTarget);
		if(!$target.hasClass('arrowNav')){
			alert(1)
		}else{
			alert(2)
		}
	},

	detail(){
		new App.Flow.FlowDialog().render({});
	},

	render:function(){
		this.$el.html(this.template);
		return this;
	},
	
	load:function(m){
		var data=m.toJSON()[0];
		var _html=_.template(this.template);
		this.$el.html(_html(data));
		$("#contains").html(this.$el);
		return this;
	}

});
