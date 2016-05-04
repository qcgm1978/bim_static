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

		var template = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.container.html');
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
	extendAttrAddDialog() {

		var dialogHtml = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.add.html')({});

		var opts = {
			title: "新增属性",
			width: 601,
			height: 400,
			isConfirm: false,
			isAlert: true,
			cssClass: "extendAttrAddDialog",
			message: dialogHtml,
			okCallback: () => {
				this.extendAttrAdd(dialog);
				return false;
			}

		}

		var dialog = new App.Comm.modules.Dialog(opts);

		dialog.element.find(".linkAttrOption").myDropDown({
			zIndex: 10,
			click: function($item) {
				alert($item.text());
			}
		});

		dialog.element.find(".attrTypeOption").myDropDown({

			click: function($item) {
				alert($item.text());
			}
		});

		dialog.element.find(".linkAttr").myRadioCk({
			click: function(selected) {
				if (!selected) {
					dialog.element.find(".linkAttrOption .myDropText").addClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").removeClass("disabled");
				}else{
					dialog.element.find(".linkAttrOption .myDropText").removeClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").addClass("disabled");
				}
			}
		});

	},


	extendAttrAdd(dialog) {


	}

});