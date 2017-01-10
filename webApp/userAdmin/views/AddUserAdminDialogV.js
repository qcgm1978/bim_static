App.userAdmin.AddUserAdminDialogV = Backbone.View.extend({
	default:{
		userName:'',
		accrentName:'',
		accrentPwd:'',
		submitState:false,
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
		this.getPrefixData();//获取用户前缀列表的方法
		return this;
	},
	getPrefixData:function(){//获取用户前缀的方法
		var _this = this;
	    App.userAdmin.getPrefixsDataC.fetch({
			success: function(collection, response, options) {
				var dataArr = response.data;
				var AddUserAdminDialogPrefixListV = new App.userAdmin.AddUserAdminDialogPrefixListV;
				_this.$el.find(".prefixBox").append(AddUserAdminDialogPrefixListV.render(dataArr).el);
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
	checkUserNameFun:function(evt){//检查用户名称是否是符合规范的方法
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var cTextName =  /[^\u0000-\u00FF]/;//用户名只能是中文名称
		var userNameVal = target.val().trim();
		if(userNameVal == ""){
			errorBox.html('用户名不能为空!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		if(!cTextName.test(userNameVal)){
			errorBox.html('用户名称必须是中文!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		errorBox.css("display","none");
		this.default.userName = userNameVal;
		this.default.submitState=true;
	},
	checkAccrentNameFun:function(evt){//检查账号名称是否符合规范
		var accrentNameEdg = /^[0-9a-zA-Z]+$/ig ;//账号名称只能是数字或者字母或者数字和字母的组合
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var accrentNameVal = target.val().trim();
		var _this = this;
		if(accrentNameVal == ""){
			errorBox.html('账号名称不能为空!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		if(!accrentNameEdg.test(accrentNameVal)){
			errorBox.html('账号名称必须是字母和数字!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		this.checkUserFun(accrentNameVal,errorBox,function(returnBool){
			errorBox.css("display","none");
			_this.default.accrentName = accrentNameVal;
			_this.default.submitState=true;
		});
	},
	checkUserFun:function(accrentNameVal,errorBox,callBack){//检查账号名称是否存在
		var _data = {
			loginId:accrentNameVal
		}
		var _this = this;
	   	App.userAdmin.checkUserC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.data == "exist"){
					errorBox.html('账号名称已经存在，请从新输入!');
					errorBox.css("display","block");
					_this.default.submitState=false;
				}else{
					callBack()
				}
			}
		})
	},
	checkAccrentPwdFun:function(evt){//检查账号密码是否符合规范
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var accrentPwdVal = target.val().trim();
		if(accrentPwdVal == ""){
			errorBox.html('账号密码不能为空!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		if(accrentPwdVal.length<6){
			errorBox.html('账号密码不能小于6位!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		errorBox.css("display","none");
		this.default.accrentPwd = accrentPwdVal;
		this.default.submitState=true;
	},
	submitFun:function(e){	
		var selectCheckBox = $(".projectUlBox").find("label.selectCheckBox");
		var selectPrefixBox = $(".selectPrefixBox");
		var projectIdArr = [];
		if(selectCheckBox.length<=0){
			alert("分配的项目不能为空!");
			return;
		}
		if(!this.default.submitState){
			alert("请按要求填写内容");
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