//系统管理入口
App.Services.Application = Backbone.View.extend({

	tagName: "div",

	id: "applicationManager",

	template: _.templateUrl('/services/tpls/application/index.html', true),

	events: {
		"click .topBar .create": "appAddDialog",
		"click .item .reset": "resetKey",
		"click .item .myIcon-update": "updateAppDialog",
		"click .item .myIcon-del-blue": "delAppDialog"

	},

	render() {
		this.$el.html(this.template);
		return this;
	},

	//新增应用 弹出层
	appAddDialog() {

		var dialogHtml = _.templateUrl('/services/tpls/application/index.add.html')({});

		var opts = {
			title: "新增应用",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "addNewApp",
			message: dialogHtml,
			okCallback: () => {
				this.appAdd(dialog);
				return false;
			}

		}

		var dialog = new App.Comm.modules.Dialog(opts);
	},

	//新增应用
	appAdd(dialog) {

	},

	//重新生成 appsecret
	resetKey(event) {

		var name = $(event.target).closest(".item").find(".name").text(),
			msg = "确认重新生成“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, (dialog) => {

		}, "生成中");
	},

	//更新 app、
	updateAppDialog(event) {

		var $item = $(event.target).closest(".item"),
			data = {
				isEdit: true,
				name: $item.find(".name").text(),
				desc: $item.find(".desc").text(),
				appKey: $item.find(".appKey").text(),
				appSecret: $item.find(".appSecret .text").text()
			},
			dialogHtml = _.templateUrl('/services/tpls/application/index.add.html')(data);

		var opts = {
			title: "编辑应用",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "addNewApp",
			message: dialogHtml,
			okCallback: () => {
				this.updateApp(dialog);
				return false;
			}

		}

		var dialog = new App.Comm.modules.Dialog(opts);
	},

	//更新app
	updateApp(){

	},

	//删除 app
	delAppDialog() {
		var name = $(event.target).closest(".item").find(".name").text(),
			msg = "确认删除“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, (dialog) => {

		});
	}



});