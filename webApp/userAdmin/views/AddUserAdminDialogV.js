App.userAdmin.AddUserAdminDialogV = Backbone.View.extend({
	default:{
		userName:'',
		accrentName:'',
		accrentPwd:''
	},
	template:_.templateUrl("/userAdmin/tpls/addViewUserDialog.html"),
	events: {
 		"click .button": "submitFun",
 		"blur #userName": "checkUserNameFun",
 		"blur #accrentName": "checkAccrentNameFun",
 		"blur #accrentPassWord": "checkAccrentPwdFun",
 	},
	render:function(){
		this.$el.html(this.template());
		this.getProjectData();//获取用户的信息方法
		return this;
	},
	getProjectData:function(projects){//获取全部项目的方法
		var _this = this;
	    App.userAdmin.getProjectsDataC.fetch({
			success: function(collection, response, options) {
				var dataArr = response.data;
				var DialogProjectListV = new App.userAdmin.DialogProjectListV;
				_this.$el.find(".dialogProjectList").append(DialogProjectListV.render(dataArr).el)
			}
		})
	},
	checkUserNameFun:function(evt){//检查用户名称是否是符合规范的方法
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var cTextName =  /[^\u0000-\u00FF]/;//用户名只能是中文名称
		var userNameVal = target.val().trim();
		if(userNameVal == ""){
			target.focus();
			errorBox.html('用户名不能为空!');
			errorBox.css("display","block");
			return;
		}
		if(!cTextName.test(userNameVal)){
			target.focus();
			errorBox.html('用户名称必须是中文!');
			errorBox.css("display","block");
			return;
		}
		errorBox.css("display","none");
		this.default.userName = userNameVal;
	},
	checkAccrentNameFun:function(evt){//检查账号名称是否符合规范
		var accrentNameEdg = /^[0-9a-zA-Z]+$/ig ;//账号名称只能是数字或者字母或者数字和字母的组合
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var accrentNameVal = target.val().trim();
		if(accrentNameVal == ""){
			target.focus();
			errorBox.html('账号名称不能为空!');
			errorBox.css("display","block");
			return;
		}
		if(!accrentNameEdg.test(accrentNameVal)){
			target.focus();
			errorBox.html('账号名称必须是字母和数字!');
			errorBox.css("display","block");
			return;
		}
		if(this.checkUserFun(accrentNameVal)){
			target.focus();
			errorBox.html('账号名称已经存在，请从新输入!');
			errorBox.css("display","block");
			return;
		}
		errorBox.css("display","none");
		this.default.accrentName = accrentNameVal;
	},
	checkUserFun:function(accrentNameVal){//检查账号名称是否存在
		var _data = {
			loginId:accrentNameVal
		}
	    App.userAdmin.checkUserC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.data == "exist"){
					return true;
				}else{
					return false;
				}
			}
		})
	},
	checkAccrentPwdFun:function(evt){//检查账号密码是否符合规范
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var accrentPwdVal = target.val().trim();
		if(accrentPwdVal == ""){
			target.focus();
			errorBox.html('账号密码不能为空!');
			errorBox.css("display","block");
			return;
		}
		if(accrentPwdVal.length<6){
			target.focus();
			errorBox.html('账号密码不能小于6位!');
			errorBox.css("display","block");
			return;
		}
		errorBox.css("display","none");
		this.default.accrentPwd = accrentPwdVal;
	},
	submitFun:function(e){	
		var selectCheckBox = $(".projectUlBox").find("label.selectCheckBox");
		var projectIdArr = [];
		if(selectCheckBox.length<=0){
			alert("分配的项目不能为空!")
			return;
		}
		for (var i = selectCheckBox.length - 1; i >= 0; i--) {
			projectIdArr.push(parseInt($(selectCheckBox[i]).data("projectid")));
		}
		this.submitAjaxFun(projectIdArr);
	},
	submitAjaxFun:function(projectIdArr){//添加用户的方法
		var _data = {
			"userName":this.default.userName,
			"loginId":this.default.accrentName,
		    "pwd":this.default.accrentPwd,
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
				var UserAdminIndexV = new App.userAdmin.UserAdminIndexV;
		       		UserAdminIndexV.renderUserAdminListDom();
				App.userAdmin.UserAdminIndexV.AddDialog.close();
			}
	    })  
	},
})