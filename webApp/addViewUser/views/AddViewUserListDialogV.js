App.AddViewUser.AddViewUserListDialogV = Backbone.View.extend({
	default:{
	},
	template:_.templateUrl("/addViewUser/tpls/editViewUserDialog.html"),
	events: {
 		"click #button": "submitFun",
 		"blur #accrentName": "checkAccrentNameFun",
 	},
	render:function(){
		this.getProjectData();//获取全部项目的方法
		return this;
	},
	getProjectData:function(){//获取全部项目的方法
		var _this = this;
	    App.AddViewUser.getProjectsDataC.fetch({
			success: function(collection, response, options) {
				var dataArr = response.data;
				var AddViewUserListDialogProjectListV = new App.AddViewUser.AddViewUserListDialogProjectListV;
				_this.$el.find(".dialogProjectList").append(AddViewUserListDialogProjectListV.render(dataArr).el)
			}
		})
	},
	checkAccrentNameFun:function(evt){//检查用户名是否存在
		var accrentName = $('#accrentName');
		var accrentNameVal= accrentName.val().trim();
		var _data = {
			loginId:accrentNameVal
		}
		if(accrentNameVal.length>0){
		    App.AddViewUser.checkUserC.fetch({
				data: _data,
				success: function(collection, response, options) {
					if(response.data == "exist"){
						accrentName.focus();
						// alert('账号名称已存在!')
						return;
					}
				}
			})
		}
	},
	submitFun:function(e){
		var cTextName =  /[^\u0000-\u00FF]/;//用户名只能是中文名称
		var accrentNameEdg = /^[0-9a-zA-Z]+$/ig ;//账号名称只能是数字或者字母或者数字和字母的组合
		var userName = $("#userName");
		var accrentName = $("#accrentName");
		var accrentPassWord = $("#accrentPassWord");
		var userNameVal = $("#userName").val().trim();
		var accrentNameVal = $("#accrentName").val().trim();
		var accrentPassWordVal = $("#accrentPassWord").val().trim();
		var selectCheckBox = $(".projectUlBox").find("label.selectCheckBox");
		var projectIdArr = [];
		if(userNameVal == ""){
			userName.focus();
			return;
		}
		if(!cTextName.test(userNameVal)){
			alert("用户名称必须是中文!")
			userName.focus();
			return;
		}

		if(accrentNameVal == ""){
			accrentName.focus();
			return;
		}
		if(!accrentNameEdg.test(accrentNameVal)){
			alert("账号名称只能是数字和字母的组合!")
			accrentName.focus();
			return;
		}

		if(accrentPassWordVal == ""){
			accrentPassWord.focus();
			return;
		}
		if(accrentPassWordVal.length<6){
			alert("账号密码长度不能小于6位!")
			accrentPassWord.focus();
			return;
		}

		if(selectCheckBox.length<=0){
			alert("分配的项目不能为空!")
			return;
		}
		for (var i = selectCheckBox.length - 1; i >= 0; i--) {
			projectIdArr.push(parseInt($(selectCheckBox[i]).data("projectid")));
		}
		this.addViewUserFun(userNameVal,accrentNameVal,accrentPassWordVal,projectIdArr);
	},
	addViewUserFun:function(userName,loginId,pwd,projectIdArr){//添加用户的方法
		var _data = {
			"userName":userName,
			"loginId":loginId,
		    "pwd":pwd,
		    "projects":projectIdArr
		}
		//保存数据
		var saveViewUserDataModel = Backbone.Model.extend({
			defaults: _data,
		    urlType: "addViewUser",
		});
		var saveViewUser = new saveViewUserDataModel;
		saveViewUser.save().success(function(response){
			if(response.data == "ok"){
				var AddViewUserV = new App.AddViewUser.AddViewUserV;
	       		AddViewUserV.getViewUserListFun();
				App.AddViewUser.AddViewUserV.closeDialog.close();
			}
	    })  
	},
})