App.AddViewUser.AddViewUserDialogV = Backbone.View.extend({
	default:{
		projectsData:[],
	},
	template:_.templateUrl("/addViewUser/tpls/newViewUser.html"),
	events: {
 		"click .projectUlBox li": "dialogBoxFun",
 		"click #button": "submitFun",
 		"blur #accrentName": "checkAccrentNameFun",
 	},
	render:function(model){
		this.default.nameInfo = model;
		this.$el.html(this.template({state:this.default}));
		this.getProjectData();
		return this;
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
						alert('账号名称已存在!')
						accrentName.focus();
						return;
					}
				}
			})
		}
	},
	renderDom:function(){
		this.$el.html(this.template({state:this.default}));
	},
	getProjectData:function(){
		var _this = this;
		if(this.default.nameInfo){
			var projects = this.default.nameInfo.projects;
		}
	    App.AddViewUser.getProjectsDataC.fetch({
			success: function(collection, response, options) {
				if(projects&&projects.length>0){
					for (var i = projects.length - 1; i >= 0; i--) {
						for (var j = response.data.length - 1; j >= 0; j--) {
							if(projects[i].id == response.data[j].projectId){
								response.data[j].selected = true;
							}
						}
					}
				}
				_this.default.projectsData = response.data;
				_this.renderDom();
			}
		})
	},
	dialogBoxFun:function(event){
		var projectObj = {};
		var target = $(event.target);
		if(!target.find('label').hasClass('selectCheckBox')){
			target.find('label').addClass('selectCheckBox');
		}else{
			target.find('label').removeClass('selectCheckBox')
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
		if(!this.default.nameInfo){
			this.addViewUserFun(userNameVal,accrentNameVal,accrentPassWordVal,projectIdArr);
		}else{
			this.updateViewUserFun(userNameVal,accrentNameVal,accrentPassWordVal,projectIdArr);
		}
	},
	updateViewUserFun:function(userName,loginId,pwd,projectIdArr){//更新用户信息
		var _this = this;
		var data = {
			"userName":userName,
			"loginId":loginId,
		    "pwd":pwd,
		    "projects":projectIdArr
		}
		$.ajax({
		    type:"PUT",
		    url:"platform/testuser",
		    contentType:"application/json",
		    data:JSON.stringify(data),
		    success:function(response){
		       if(response.data == "ok"){
		       		var AddViewUserV = new App.AddViewUser.AddViewUserV;
		       		AddViewUserV.getViewUserListFun();
	       			App.AddViewUser.AddViewUserV.closeDialog.close();
	       		}
		    }
		});
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