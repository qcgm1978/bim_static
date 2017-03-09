App.backStage = {
	init:function(){//后台管理的列表页面
		$("#contains").empty();
		var BackStageIndexV = new App.backStage.BackStageIndexV(); //渲染框架
		BackStageIndexV.render();
	},
	setPermissionsInit:function(){//点击了后台的权限配置按钮调到的页面
		$("#contains").empty();
		var SetPermissionsIndexV = new App.backStage.SetPermissionsIndexV(); //渲染框架
		SetPermissionsIndexV.render();
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
					departmentId:1,
					departmentName:"商业地产-商业地产学院",
					departmentOfficer:"李某、王某"
				},{
					departmentId:2,
					departmentName:"商业地产-商业地产学院",
					departmentOfficer:"李某、王某"
				},{
					departmentId:3,
					departmentName:"商业地产-商业地产学院",
					departmentOfficer:"李某、王某"
				},{
					departmentId:4,
					departmentName:"商业地产-商业地产学院",
					departmentOfficer:"李某、王某"
				}]
                 return listData;
             }
		}
	})),
}