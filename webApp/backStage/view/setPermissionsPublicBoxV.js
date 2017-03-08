App.backStage.SetPermissionsIndexV.PublicBoxV = Backbone.View.extend({
	tagName:'div',
	className:'setPermissionsPublicBox',
	template:_.templateUrl("/backStage/tpls/setPermissions/setPermissionsPublicBox.html"),
	events:{
		"click .allCheck": "allCheckFun",//全选的方法
		"click #deleteViewUserBtn": "deleteBtnFun",//删除按钮的方法
	},
	initialize() {//初始化
		this.listenTo(App.backStage.GetListCollection, "add", this.addOne);
		this.listenTo(App.backStage.GetListCollection, "reset", this.resetList);
	},
	render:function(){
		console.log(this.model,"this.model");
		this.$el.html(this.template);
		this.getListHandle();//获取当前tab下的列表的方法
		return this;
	},
	getListHandle:function(){//获取当前tab下的列表的方法
		// //重置
		// App.Services.SystemCollection.CategoryCollection.reset();
		// //获取数据
		// App.Services.SystemCollection.CategoryCollection.fetch({
		// 	success:function(models,data){
		// 		this.$(".textSum .count").text(data.data.items.length);
		// 	}
		// });
		App.backStage.GetListCollection.reset();
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
		}];
		App.backStage.GetListCollection.push(listData);
	},
	addOne:function(model){//每一条数据 进行处理
		this.$("#tbodyDom").find(".loading").remove();
		var model = model.toJSON();
		var PublicListBoxV = new App.backStage.SetPermissionsIndexV.PublicListBoxV({model:model});
		this.$("#tbodyDom").append(PublicListBoxV.render().el);
		//滚动条
		App.Comm.initScroll(this.$(".scrollBox"), "y");
	},
	resetList:function(){//重置加载
		this.$("#tbodyDom").html('<tr class="loading"><td>正在加载，请稍候……</td></tr>');
	},
	allCheckFun(event){//点击列表的全选复选框的方法
		var checkItem = this.$el.find("#tbodyDom .checkItem");
		checkItem.prop('checked', event.target.checked);
	},
	deleteBtnFun:function(){//点击删除按钮执行的方法
		var _this = this;
		var flag=false;
		var checkItem = this.$el.parent().parent().find(".checkItem:checked");
		var deleteArr = [];
		if(checkItem.length<=0){
			alert("请选择要删除的部门");
			return;
		}else{
			_.each(checkItem,function(item,index) {
				deleteArr.push($(item).parent().data("deleteid"));
			});
			flag = true;
		}
		var text = _.templateUrl('/backStage/tpls/setPermissions/setPermissionsPublicDeleteBox.html', true);
	 	var deleteAlertDialog = new App.Comm.modules.Dialog({
				width: 284,
				height: 180,
				showTitle: false,
				showClose: false,
				isAlert: false,
				isConfirm: false,
				message:text,
			});
	 	$("#servicesSure").off("click")
	 	$("#servicesSure").on("click",function(){//点击确定 
	 		if(flag){
	 			console.log(deleteArr);
	 		}
	 		// var id = $target.data("id"),
	 		// 	data = {
	 		// 		URLtype: "servicesCategoryDel",
	 		// 		data: {
	 		// 			id: id
	 		// 		}
	 		// 	};

	 		// App.Comm.ajax(data, (data) => {
	 		// 	if (data.code == 0) { 
	 		// 		that.model.destroy();
	 		// 		confirmDialog.close();
	 		// 	}

	 		// });
	 	})
	 	$("#servicesCancel").off("click")
	 	$("#servicesCancel").on("click",function(){//点击取消 关闭弹出
	 		deleteAlertDialog.close();
	 	})
	},
})