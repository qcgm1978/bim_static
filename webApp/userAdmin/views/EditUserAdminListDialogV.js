App.userAdmin.EditUserAdminListDialogV = Backbone.View.extend({
	default:{
		prefixVal:"",
		userNameVal:'',
		accrentPassWordVal:'',
		selectProjectArr:'',
	},
	template:_.templateUrl("/userAdmin/tpls/editViewUserDialog.html"),
	events: {
 		"click .button": "submitFun",
 	},
	render:function(editId){
		this.getViewUserInfoFun(editId);//获取用户的信息方法
		return this;
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
					_this.default.userNameVal = response.data.username;
					_this.default.accrentNameVal = response.data.loginid;
					_this.default.accrentPassWordVal = response.data.pwd;
					_this.$el.html(_this.template({state:response.data}));
					_this.getProjectData(response.data.projects);//获取全部项目的方法
					_this.getPrefixData(response.data.prefix);//获取用户前缀列表的方法
				}
			}
		})
	},
	getPrefixData:function(prefix){//获取用户前缀的方法
		var _this = this;
	    App.userAdmin.getPrefixsDataC.fetch({
			success: function(collection, response, options) {
				for (var j = response.data.length - 1; j >= 0; j--) {
					if(prefix == response.data[j].prefix){
						response.data[j].selected = true;
					}
				}
				var dataArr = response.data;
				var DialogProjectPrefixListV = new App.userAdmin.DialogProjectPrefixListV;
				_this.$el.find(".prefixBox").append(DialogProjectPrefixListV.render(dataArr).el);
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
	checkPrefixFun:function(){//检查前缀是否存在
		var prefixBox = $(".selectPrefixBox");
		var prefixBoxVal = prefixBox.val().trim();
		this.default.prefixVal = prefixBoxVal;
	},
	checkUserNameFun:function(){//检查用户名称是否合法
		var userName = $("#userName");
		var userNameVal = userName.val().trim();
		var errorBox = userName.next(".errorBox");
		var cTextName =  /[^\u0000-\u00FF]/;//用户名只能是中文名称
		this.default.userNameVal = userNameVal;
		if(this.default.userNameVal == ""){
			errorBox.html('用户名称不能为空!');
			errorBox.css("display","block");
			return;
		}
		if(!cTextName.test(this.default.userNameVal)){
			errorBox.html('用户名称必须是中文!');
			errorBox.css("display","block");
			return;
		}
		errorBox.html('');
		errorBox.css("display","none");
	},
	checkAccrentPwdFun:function(){//检查账号密码是否合法
		var accrentPassWord = $("#accrentPassWord");
		var accrentPassWordVal = accrentPassWord.val().trim();
		var errorBox = accrentPassWord.next(".errorBox");
		this.default.accrentPassWordVal = accrentPassWordVal;
		if(this.default.accrentPassWordVal == ""){
			errorBox.html('账号密码不能为空!');
			errorBox.css("display","block");
			return;
		}
		if(this.default.accrentPassWordVal.length<6){
			errorBox.html('账号密码不能小于6位!');
			errorBox.css("display","block");
			return;
		}
		errorBox.html('');
		errorBox.css("display","none");
	},
	checkSelectProject:function(){//检查是否分配了项目
		var selectCheckBox = $(".projectUlBox").find("label.selectCheckBox");
		var projectErrorBox = $(".projectErrorBox");
		var projectIdArr = [];
		if(selectCheckBox.length<=0){
			projectErrorBox.html("请给用户分配项目权限!");
			projectErrorBox.css("display","block");
			return;
		}
		projectErrorBox.html("");
		projectErrorBox.css("display","none");
		for (var i = selectCheckBox.length - 1; i >= 0; i--) {
			projectIdArr.push(parseInt($(selectCheckBox[i]).data("projectid")));
		}
		this.default.selectProjectArr = projectIdArr;
	},
	submitFun:function(){	
		this.checkPrefixFun();//检验前缀的方法
		this.checkUserNameFun();//检查用户名称是否合法
		this.checkAccrentPwdFun();//检查账号密码是否合法
		this.checkSelectProject();//检查是否分配了项目
		if(this.default.prefixVal!=""&&this.default.userNameVal!=""&&this.default.accrentPassWordVal!=""&&this.default.selectProjectArr.length>0){
			this.submitAjaxFun();
		}
	},
	submitAjaxFun:function(projectIdArr,selectPrefixBoxVal){//添加用户的方法
		var _data = {
			"prefix":this.default.prefixVal,
			"loginId":this.default.accrentNameVal,
			"userName":this.default.userNameVal,
		    "pwd":this.default.accrentPassWordVal,
		    "projects":this.default.selectProjectArr
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
	}
})