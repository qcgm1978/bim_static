App.backStage = {
	orgId : [],//暂存已被选关键用户的orgId数组
	editorgId : [],//暂存被编辑的关键用户的orgId数组
	uuid : '',//暂存被点击的关键用户信息的uid
	clearAll: function(){//清空暂存的数据
	  this.orgId = [];
	},
	init: function() { //后台管理的列表页面
		$("#contains").empty();
		var BackStageIndexV = new App.backStage.BackStageIndexV(); //渲染框架
		BackStageIndexV.render();
	},
	setPermissionsInit: function() { //点击了后台的权限配置按钮调到的页面
		$("#contains").empty();
		var SetPermissionsIndexV = new App.backStage.SetPermissionsIndexV(); //渲染框架
		SetPermissionsIndexV.render();
	},
	loadData: function(collection, data, fn) {
		data = data || {};
		collection.fetch({
			remove: false,
			data: data,
			success: function(collection, response, options) {
				if (fn && typeof fn == "function") {
					fn(response);
				}
			},
			error: function(collection, response, options) {
				if (fn && typeof fn == "function") {
					fn(response);
				}
			}
		});
	},
	//获取tab列表的方法
	GetListCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "getPrefixsList",
		parse(response) {
			if (response.code == 0) {
				// return response.data.items;
				var listData = [{
					departmentId: 1,
					departmentName: "商业地产-商业地产学院",
					departmentOfficer: "李某、王某"
				}, {
					departmentId: 2,
					departmentName: "商业地产-商业地产学院",
					departmentOfficer: "李某、王某"
				}, {
					departmentId: 3,
					departmentName: "商业地产-商业地产学院",
					departmentOfficer: "李某、王某"
				}, {
					departmentId: 4,
					departmentName: "商业地产-商业地产学院",
					departmentOfficer: "李某、王某"
				}]
				return listData;
			}
		}
	})),
	//获取部门的方法
	standardCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchServicesMemberInnerList"
	})),
	Step1: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchServicesMemberInnerList"
	})),
	Step3: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchServicesMemberOuterList"
	})),
}