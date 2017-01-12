App.userAdmin.AddUserAdminDialogV = Backbone.View.extend({
	default:{
		prefixVal:"",
		accrentNameVal:'',
		userNameVal:'',
		accrentPassWordVal:'',
		selectProjectArr:'',
		prefixBool:false,
		accrentNameBool:false,
		userNameBool:false,
		accrentPassWordBool:false,
		selectProjectBool:false,
	},
	template:_.templateUrl("/userAdmin/tpls/addViewUserDialog.html"),
	events: {
 		"click .button": "submitFun",
 	},
	render:function(){
		this.$el.html(this.template());
		this.getProjectData();//获取用户的信息方法
		this.getPrefixData();//获取用户前缀列表的方法
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
	getProjectData:function(projects){//获取全部项目的方法
		var _this = this;
	    App.userAdmin.getProjectsDataC.fetch({
			success: function(collection, response, options) {
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
		if(this.default.prefixVal != ""){
			this.default.prefixBool = true;
		}
	},
	checkAccrentNameFun:function(){//检验登录账号是否合法的方法
		var accrentName = $("#accrentName");
		var accrentNameVal = accrentName.val().trim();
		var errorBox = accrentName.next(".errorBox");
		var accrentNameEdg = /^[0-9a-zA-Z]+$/ig ;//账号名称只能是数字或者字母或者数字和字母的组合
		this.default.accrentNameVal = accrentNameVal;
		if(this.default.accrentNameVal == ""){
			errorBox.html('登录账号不能为空!');
			errorBox.css("display","block");
			this.default.accrentNameBool=false;
			return;
		}
		if(!accrentNameEdg.test(this.default.accrentNameVal)){
			errorBox.html('账号名称必须是字母和数字!');
			errorBox.css("display","block");
			this.default.accrentNameBool=false;
			return;
		}
		this.checkUserFun();//检查账号名称是否存在
	},
	checkUserFun:function(callBack){//检查账号名称是否存在
		var _this = this;
		var _data = {
			loginId:this.default.prefixVal+this.default.accrentNameVal
		}
	   	App.userAdmin.checkUserC.fetch({
			data: _data,
			success: function(collection, response, options) {
				var accrentName = $("#accrentName");
				var errorBox = accrentName.next(".errorBox");
				if(response.data == "exist"){
					errorBox.html('账号名称已经存在，请从新输入!');
					errorBox.css("display","block");
					_this.default.accrentNameBool = false;
				}else{
					errorBox.html('');
					errorBox.css("display","none");
					_this.default.accrentNameBool = true;
				}
			}
		})
	},
	checkUserNameFun:function(){//检查用户名称是否合法
		var userName = $("#userName");
		var userNameVal = userName.val().trim();
		var errorBox = userName.next(".errorBox");
		this.default.userNameVal = userNameVal;
		if(this.default.userNameVal == ""){
			errorBox.html('用户名称不能为空!');
			errorBox.css("display","block");
			this.default.userNameBool=false;
			return;
		}
		errorBox.html('');
		errorBox.css("display","none");
		this.default.userNameBool=true;
	},
	checkAccrentPwdFun:function(){//检查账号密码是否合法
		var accrentPassWord = $("#accrentPassWord");
		var accrentPassWordVal = accrentPassWord.val().trim();
		var errorBox = accrentPassWord.next(".errorBox");
		this.default.accrentPassWordVal = accrentPassWordVal;
		if(this.default.accrentPassWordVal == ""){
			errorBox.html('账号密码不能为空!');
			errorBox.css("display","block");
			this.default.accrentPassWordBool=false;
			return;
		}
		if(this.default.accrentPassWordVal.length<6){
			errorBox.html('账号密码不能小于6位!');
			errorBox.css("display","block");
			this.default.accrentPassWordBool=false;
			return;
		}
		errorBox.html('');
		errorBox.css("display","none");
		this.default.accrentPassWordBool=true;
	},
	checkSelectProject:function(){//检查是否分配了项目
		var selectCheckBox = $(".projectUlBox").find("label.selectCheckBox");
		var projectErrorBox = $(".projectErrorBox");
		var projectIdArr = [];
		if(selectCheckBox.length<=0){
			projectErrorBox.html("请给用户分配项目权限!");
			projectErrorBox.css("display","block");
			this.default.selectProjectBool=false;
			return;
		}
		projectErrorBox.html("");
		projectErrorBox.css("display","none");
		for (var i = selectCheckBox.length - 1; i >= 0; i--) {
			projectIdArr.push(parseInt($(selectCheckBox[i]).data("projectid")));
		}
		this.default.selectProjectArr = projectIdArr;
		this.default.selectProjectBool=true;
	},
	submitFun:function(){	
		this.checkPrefixFun();//检验前缀的方法
		this.checkAccrentNameFun();//检验登录账号是否合法的方法
		this.checkUserNameFun();//检查用户名称是否合法
		this.checkAccrentPwdFun();//检查账号密码是否合法
		this.checkSelectProject();//检查是否分配了项目
		if(this.default.prefixBool&&this.default.accrentNameBool&&this.default.userNameBool&&this.default.accrentPassWordBool&&this.default.selectProjectBool){
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
	}
})