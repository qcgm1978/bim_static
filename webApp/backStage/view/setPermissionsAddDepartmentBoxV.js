App.backStage.AddDepartmentV = Backbone.View.extend({
	tagName: "div",
	className: "backStageWindow",
	template: _.templateUrl("/backStage/tpls/setPermissions/setPermissionsPublicDepartmentBox.html"),
	events: {
		"click .windowClose": "close",
		"click #select": "move",
		"click .rightWindow .delete": "remove",
		"click .confirm": 'confirm',
		"click .search span": 'searchFun',
		"click .search .closeicon"       : 'clear',
	},
	default:{
		type:2
	},
	render: function(type) {
		this.$el.html(this.template());
		this.default.type=type;
		this.$el.find('.leftWindow').html(new App.backStage.AddDepartmentStandard_1({model:type}).render('step3').el);
		this.$el.find('.leftWindow').append(new App.backStage.AddDepartmentStandard_3({model:type}).render().el);
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
		var str = '';
		var $selected = this.$el.find('.toselected');
		if (!$selected.length) {
			return ''
		}
		if(this.$el.find('.rightWindow div>li').length>=1){
			alert("每次只能添加一个部门")
			return;
		}
		var orgId = $selected.find('p').attr('data-id');
		var orgName = $selected.find('p').attr('data-name');
		var orgOuter = $selected.find('p').attr('data-outer');
		if (_.contains(App.backStage.orgId, orgId.toString()) || _.contains(App.backStage.orgId, parseInt(orgId))) {
			return '';
		} else {
			App.backStage.orgId.push(orgId);
			App.backStage.orgName = orgName;
			App.backStage.orgOuter = orgOuter;
			var person = $selected.html();
			$selected.removeClass('toselected');
			this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>'));
		}
		$('.rightWindow').siblings('p').text("已选部门 ( " + this.$el.find('.rightWindow div>li').length + "个 )");
	},
	//移除已选中的名单
	remove: function(e) { //部门权限移除已选中的名单
		var $li = $(e.target).parents('li');
		var orgId = $li.find('p').attr('data-id');
		App.backStage.editorgId = _.without(App.backStage.editorgId, parseInt(orgId), orgId.toString());
		App.backStage.orgId = App.backStage.editorgId;
		$('.rightWindow').siblings('p').text("已选部门 (0个 )");
		$li.remove();
	},
	//切换步骤页
	confirm: function() {//编辑部门提交
		if(!App.backStage.orgId[0]||!App.backStage.orgName){
			alert("请选择一个部门")
			return;
		}
		var self = this;
		var datas = {
			"orgid": App.backStage.orgId[0],
		    "orgname":App.backStage.orgName,
		    "type":this.default.type,
		    "outersite":App.backStage.orgOuter=="true"?1:0
		};
		var dataObj = {
			"URLtype": "addWorkforgcon",
			"type": "POST",
			"contentType": "application/json",
			"data": JSON.stringify(datas)
		};
		$('.leftWindow').addClass("services_loading");
		App.Comm.ajax(dataObj, function(data) {
			$('.leftWindow').removeClass("services_loading");
			if (data.code == 0) {
				$('.mod-dialog,.mod-dialog-masklayer').hide();
				App.backStage.clearAll();
				self.getListHandle();
			}
		});
	},
	//关闭弹出层的方法
	close: function() {
		$('.mod-dialog,.mod-dialog-masklayer').hide();
		App.backStage.clearAll();
	},
	searchFun:function(){//点击搜索执行的方法
		var value=$('.search input').val().trim();
		if(value){
			this.$el.find('.leftWindow').html(new App.backStage.AddDepartmentStandard_1().render(value).el);
		}
	},
	clear:function(){
	  $('.search input').val('');
	  this.$el.find('.leftWindow').html(new App.backStage.AddDepartmentStandard_1().render().el);
	},
	getListHandle: function() { //获取当前tab下的列表的方法
		var _self = this;
		var data = {
			type: _self.default.type,
			pageIndex: 1,
			pageItemCount: 30
		}
		var datas = {
			URLtype: "getWorkforgconList",
			data: data,
			type: "get",
			contentType: "application/json",
		}
		$("div#tbodyDom").html("");
		var PublicListBoxV = "";
		App.Comm.ajax(datas, function(result) {
			if (result.code == 0) {
				var items = result.data.items;
				PublicListBoxV = new App.backStage.SetPermissionsIndexV.PublicListBoxV();
				$("div#tbodyDom").html(PublicListBoxV.render(items).el);
			}
		})
	},
})