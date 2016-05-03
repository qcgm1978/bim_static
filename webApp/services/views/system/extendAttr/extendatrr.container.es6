App.Services.System.ExtendAttrContainer = Backbone.View.extend({

	tagName: "div",

	className: "extendAttrContainer folwContainer",

	initialize() {
		this.listenTo(App.Services.SystemCollection.ExtendAttrCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.ExtendAttrCollection, "reset", this.reset);
	},

	events: {
		"click .topBar .create": "extendAttrAddDialog"
	},

	render() {

		var template = _.templateUrl('/services/tpls/system/flow/flow.container.html');
		this.$el.html(template);
		return this;
	},

	//新增
	addOne(model) {

		var view = new App.Services.System.ExtendAttrContainerListDetail({
			model: model
		});

		 

		this.$(".extendAttrListBody").append(view.render().el);


	},

	//重置
	reset() {
		this.$(".extendAttrListBody").html('<li class="loading">正在加载，请稍候……</li>');
	},

	//新增流程
	flowAddDialog() {

		var dialogHtml = _.templateUrl('/services/tpls/system/flow/system.add.flow.html')({});

		var opts = {
			title: "新增流程",
			width: 601,
			isConfirm:false,
			isAlert:true,
			cssClass: "extendAttrAddDialog",
			message: dialogHtml,
			okCallback: () => {
				this.extendAttrAdd(dialog);
				return false;
			}

		}

		var dialog = new App.Comm.modules.Dialog(opts); 

		return;
		
	},


	extendAttrAdd(dialog) { 
	 

	}

});