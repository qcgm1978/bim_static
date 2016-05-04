//列表详情
App.Services.ApplicationListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	events: {
		"click  .reset": "resetKey",
		"click  .myIcon-update": "updateAppDialog",
		"click  .myIcon-del-blue": "delAppDialog",
		"click .myIcon-status-disable":"switchStatus"
	},

	initialize() {
		//this.listenTo(this, "remove", this.removeModel);
		this.listenTo(this.model, "destroy", this.removeModel);
		this.listenTo(this.model, "change", this.render);
	},

	template: _.templateUrl('/services/tpls/application/app.list.detail.html'),

	render() {
		var data = this.model.toJSON();
		this.$el.html(this.template(data)).data("id", data.id);
		if (data.status != 1) {
			this.$el.addClass("disabled");
		}
		return this;
	},

	//重新生成 appsecret
	resetKey(event) {

		var $item = $(event.target).closest(".item"),
			name = $item.find(".name").text(),
			id = $item.data("id"),
			msg = "确认重新生成“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, (dialog) => {

			var data = {
				URLtype: "appResetSecret",
				data: {
					id: id
				}
			}

			//重新生成
			App.Comm.ajax(data, function(data) {
				if (data.code == 0) {
					$item.find(".appSecret .text").text(data.data.appSecret);
					dialog.close();
				}
			});

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
		dialog.id = $item.data("id");
	},

	//更新app
	updateApp(dialog) {

		var pars = {
				id: dialog.id,
				name: dialog.element.find(".txtAppTitle").val().trim(),
				desc: dialog.element.find(".txtAppDesc").val().trim()
			},
			that = this;


		if (!pars.name) {
			alert("请输入应用名称");
			return;
		}

		if (!pars.desc) {
			alert("请输入应用详情");
			return;
		}


		var data = {
				URLtype: "appUpdate",
				headers: {
					"Content-Type": "application/json"
				},
				type: "PUT",
				data: JSON.stringify(pars)
			}
			//更新

		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				that.model.set(data.data);
				dialog.close();
			}
		});

	},

	//删除 app
	delAppDialog(event) {

		var $item = $(event.target).closest(".item"),
			name = $item.find(".name").text(),
			id = $item.data("id"),
			that = this,
			msg = "确认删除“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, function(dialog) {

			var data = {
				URLtype: "appDel",
				type: "DELETE",
				data: {
					id: id
				}
			}

			App.Comm.ajax(data, function(data) {
				if (data.code == 0) {
					that.model.destroy();
					dialog.close();
				}
			});
		});
	},

	//移除
	removeModel() {
		//最后一条
		var $parent = this.$el.parent();
		if ($parent.find("li").length <= 1) {
			$parent.append('<li class="loading">无数据</li>');
		}
		this.remove();
	},

	//修改状态
	switchStatus(event){
		console.log(1);
	}

});