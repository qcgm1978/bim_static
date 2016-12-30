App.AddViewUser.AddViewUserListDialogProjectListV = Backbone.View.extend({
	tagName:"ul",
	className:"projectUlBox",
	template:_.templateUrl("/addViewUser/tpls/editViewUserDialogProjectList.html"),
	events: {
 		"click .liItem": "dialogBoxFun",
 	},
	render:function(data){
		this.$el.html(this.template({state:data}));
		return this;
	},
	dialogBoxFun:function(event){//弹出层项目名称列表的复选框选中和不选中的效果
		var target = $(event.target);
		if(!target.find('label').hasClass('selectCheckBox')){
			target.find('label').addClass('selectCheckBox');
		}else{
			target.find('label').removeClass('selectCheckBox')
		}
	}
})