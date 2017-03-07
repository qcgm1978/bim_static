App.backStage.PublicDomV = Backbone.View.extend({
	tagName:'div',
	className:'setPermissionsListBox',
	template:_.templateUrl("/backStage/tpls/setPermissions/setPermissionsList.html"),
	events:{
		"click .allCheck": "allCheckFun",
		"click #addViewUserBtn":"addViewUserBtnFun",
		"click #deleteViewUserBtn":"deleteViewUserBtnFun"
	},
	initialize() {//初始化
		this.listenTo(App.Services.SystemCollection.ResourceCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.ResourceCollection, "reset", this.resetList);
	},
	render:function(obj){
		this.$el.html(this.template());
		this.getListFun();//获取当前的列表的方法
		return this;
	},
	allCheckFun(event){//点击列表的全选复选框的方法
		var checkItem = this.$el.find(".viewListBodyBox .checkItem");
		checkItem.prop('checked', event.target.checked);
	},
	getListFun:function(){//获取当前的列表的方法
		var listData = [{
			departmentName:"商业地产-商业地产学院",
			departmentOfficer:"李某、王某"
		},{
			departmentName:"商业地产-商业地产学院",
			departmentOfficer:"李某、王某"
		},{
			departmentName:"商业地产-商业地产学院",
			departmentOfficer:"李某、王某"
		}];
		App.backStage.SystemCollection.ResourceCollection.add(dataArr);
		// var PublicListV = new App.backStage.PublicListV({model:listData});
		// var viewListBodyBox = this.$(".viewListBodyBox");
		// viewListBodyBox.empty();
		// viewListBodyBox.append(PublicListV.render().el);
	},
	addViewUserBtnFun:function(){//添加用户
		App.backStage.addDepartment = new App.Comm.modules.Dialog({
			title:'添加部门',
			width:640,
			height:500,
			isConfirm:false,
			message:"dddd"
		});
	},	
	deleteViewUserBtnFun:function(){//删除列表的数据
		var flag=false;
		var checkItem = this.$el.find(".viewListBodyBox .checkItem");
		_.each(checkItem,function(el,index) {
			if($(el).prop('checked')){
				flag=true;
			}
		});
		if(!flag){
			alert("请选择要删除的部门");
			return;
		}
		App.backStage.deleteDepartment = new App.Comm.modules.Dialog({
			width: 300,
			height: 100,
			isConfirm: false,
			isAlert: true,
			cssClass:"deleteClass",
			message:"是否删除当前勾选的数据",
			okCallback: function() {
				// var models = App.Services.SystemCollection.ResourceCollection.models;
				// _.each(models,function(model, index) {
				// 	// model.destroy();
				// 	console.log(model);
				// 	console.log(index);
				// });
			}
		});
	}
})