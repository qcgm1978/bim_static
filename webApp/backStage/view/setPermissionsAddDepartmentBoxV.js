App.backStage.SetPermissionsIndexV.AddDepartmentV = Backbone.View.extend({
	tagName: "div",
	className: "backStageWindow",
	template: _.templateUrl("/backStage/tpls/setPermissions/setPermissionsPublicDepartmentBox.html"),
	events: {
		"click .windowClose": "close",
		"click #select": "move",
		"click .rightWindow .delete": "remove",
		"click .confirm": 'confirm',
	},
	render: function() {
		this.$el.html(this.template());
		this.$el.find('.leftWindow').html(new App.backStage.AddDepartmentStandard_1().render('step3').el);
		this.$el.find('.leftWindow').append(new App.backStage.AddDepartmentStandard_3().render().el);
		App.backStage.loadData(App.backStage.Step1, '', function(r) {
			if (r && !r.code && r.data) {
				_.each(r.data.org, function(data, index) {
					data.shut = true;
					data.canLoad = true;
				});
				App.backStage.Step1.set(r.data.org);
			}
		});
		App.backStage.loadData(App.backStage.Step3, '', function(r) {
			if (r && !r.code && r.data) {
				_.each(r.data.org, function(data, index) {
					data.shut = true;
					data.canLoad = true;
				});
				App.backStage.Step3.set(r.data.org);
			}
		});
		return this;
	},
	//选择人到右边窗口
	move: function() {
		var str = '',
			title = this.$el.find('.maintitle').text();
		var $selected = this.$el.find('.toselected');
		if (!$selected.length) {
			return ''
		}
		var orgId = $selected.find('p').attr('data-id');
		if (_.contains(App.backStage.orgId, orgId.toString()) || _.contains(App.backStage.orgId, parseInt(orgId))) {
			return '';
		} else {
			App.backStage.orgId.push(orgId);
			var person = $selected.html();
			$selected.removeClass('toselected');
			this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>'));
		}
	},
	//移除已选中的名单
	remove: function(e) { //部门权限移除已选中的名单
		var $li = $(e.target).parents('li');
		var orgId = $li.find('p').attr('data-id');
		App.backStage.editorgId = _.without(App.backStage.editorgId, parseInt(orgId), orgId.toString());
		App.backStage.orgId = App.backStage.editorgId;
		$li.remove();
	},
	//切换步骤页
	confirm: function() {//编辑部门提交
		var title = $('.maintitle').text();
		App.backStage.editorgId = App.backStage.orgId;
		var datas = {
			"orgId": App.backStage.orgId,
			uid: App.backStage.uuid
		};
		var data = {
			URLtype: "fetchServiceKeyUserEdit",
			type: "PUT",
			contentType: "application/json",
			data: JSON.stringify(datas)
		};
		var self = this;
		$('.leftWindow').addClass("services_loading");
		// App.Comm.ajax(data, function(data) {
		// 	$('.leftWindow').removeClass("services_loading");
		// 	if (data.code == 0) {
		// 		$('.mod-dialog,.mod-dialog-masklayer').hide();
		// 		self.refresh();
		// 	}
		// });
	},
	//关闭弹出层的方法
	close: function() {
		$('.mod-dialog,.mod-dialog-masklayer').hide();
		App.backStage.clearAll();
	},
})