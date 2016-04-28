
App.Services.System.FolwContainer=Backbone.View.extend({

	tagName:"div",

	className:"folwContainer",

	initialize(){
		this.listenTo(App.Services.SystemCollection.FlowCollection,"add",this.addOne);
		this.listenTo(App.Services.SystemCollection.FlowCollection,"reset",this.reset);
	},

	render(){ 

		var template=_.templateUrl('/services/tpls/system/flow/flow.container.html');
		this.$el.html(template);
		return this;
	},

	//新增
	addOne(model){

		var view=new App.Services.System.FolwContainerListDetail({
			model:model
		});

		debugger

		this.$(".flowListBody").append(view.render().el);


	},

	//重置
	reset(){
		this.$(".flowListBody").html('<li class="loading">正在加载，请稍候……</li>');
	}

});