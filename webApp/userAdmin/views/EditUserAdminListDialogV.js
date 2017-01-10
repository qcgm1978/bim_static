App.userAdmin.EditUserAdminListDialogV = Backbone.View.extend({
	default:{
		userName:'',
		accrentName:'',
		accrentPwd:''
	},
	template:_.templateUrl("/userAdmin/tpls/editViewUserDialog.html"),
	events: {
 		"click .button": "submitFun",
 		"blur #userName": "checkUserNameFun",
 		"blur #accrentPassWord": "checkAccrentPwdFun",
 	},
	render:function(editId){
		this.getViewUserInfoFun(editId);//获取用户的信息方法
		return this;
	},
	getPrefixData:function(){//获取用户前缀的方法
		var _this = this;
	    App.userAdmin.getPrefixsDataC.fetch({
			success: function(collection, response, options) {
				var dataArr = response.data;
				var DialogProjectPrefixListV = new App.userAdmin.DialogProjectPrefixListV;
				_this.$el.find(".prefixBox").append(DialogProjectPrefixListV.render(dataArr).el);
			}
		})
	},
	getViewUserInfoFun:function(editId){//获取用户的信息方法
		var _this = this;
	    var _data = {
	    	loginId:editId,
	    }
	    App.userAdmin.getViewUserInfoC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.code == 0){
					_this.default.userName = response.data.username;
					_this.default.accrentName = response.data.loginid;
					_this.default.accrentPwd = response.data.pwd;
					_this.$el.html(_this.template({state:response.data}));
					_this.getProjectData(response.data.projects);//获取全部项目的方法
					_this.getPrefixData();//获取用户前缀列表的方法
				}
			}
		})
	},
	getProjectData:function(projects){//获取全部项目的方法
		var _this = this;
	    App.userAdmin.getProjectsDataC.fetch({
			success: function(collection, response, options) {
				for (var i = projects.length - 1; i >= 0; i--) {
					for (var j = response.data.length - 1; j >= 0; j--) {
						if(projects[i].id == response.data[j].projectId){
							response.data[j].selected = true;
						}
					}
				}
				var dataArr = response.data;
				var DialogProjectListV = new App.userAdmin.DialogProjectListV;
				_this.$el.find(".dialogProjectList").append(DialogProjectListV.render(dataArr).el);
				App.Comm.initScroll(_this.$(".dialogProjectList"), "y");
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
		var selectPrefixBox = $(".selectPrefixBox").text().trim();
		var projectIdArr = [];
		if(selectCheckBox.length<=0){
			alert("分配的项目不能为空!")
			return;
		}
		for (var i = selectCheckBox.length - 1; i >= 0; i--) {
			projectIdArr.push(parseInt($(selectCheckBox[i]).data("projectid")));
		}
		this.submitAjaxFun(projectIdArr,selectPrefixBox);
	},
	submitAjaxFun:function(projectIdArr,selectPrefixBoxVal){//更新用户信息
		var _this = this;
		var _data = {
			"userName":this.default.userName,
			"loginId":this.default.accrentName,
		    "pwd":this.default.accrentPwd,
		    "prefix":selectPrefixBoxVal,
		    "projects":projectIdArr
		}
		$.ajax({
		    type:"PUT",
		    url:"platform/testuser",
		    contentType:"application/json",
		    data:JSON.stringify(_data),
		    success:function(response){
		       if(response.data == "ok"){
		       		var UserAdminIndexV = new App.userAdmin.UserAdminIndexV;
		       		UserAdminIndexV.renderUserAdminListDom();
					App.userAdmin.UserAdminListV.EditDialog.close();
	       		}
		    }
		});
	},
})