App.Flow=App.Flow||{};

App.Flow.ContentView=Backbone.View.extend({

	tagName:"div",

	template:_.templateUrl("/flow/tpls/flow.content.html",true),

	events:{
		'click .text':'detail'
	},
	
	initialize(){
		this.listenTo(App.Flow.Controller.flowCollection,'reset',this.load);
	},

	detail(){
		App.Comm.ajax({
			URLtype:'fetchFlowDetail',
			data:{
				itemName:'I-002总图指标移交',
				simpleMode:true
			}
		}).done(function(data){
			new App.Flow.FlowDialog().render(data.data);
		})
	},

	load:function(m){
		var data=m.toJSON()[0];
		var _html=_.template(this.template);
		this.$el.html(_html(data));
		$("#flowContainer").html(this.$el);
		return this;
	}
});
