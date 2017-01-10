App.userAdmin.EditUserAdminPrefixListDialogV  = Backbone.View.extend({
	default:{
		submitState:true,
		oldPrefixName:'',
		newPrefixName:''	
	},
	tagName:'div',
	className:"addViewUserPrefixBox",
	template:_.templateUrl("/userAdmin/tpls/editViewUserPrefixDialog.html"),
	events: {
 		"click .button": "submitFun",
 		"blur #prefixName": "checkPrefixNameFun",
 	},
	render:function(prefixName){
		this.default.submitState=true;
		this.default.oldPrefixName = prefixName;
		this.default.newPrefixName = prefixName;
		this.$el.html(this.template({state:prefixName}));
		return this;
	},
	checkPrefixNameFun:function(evt){
		var _this = this;
		var target = $(evt.target);
		var errorBox = target.next(".errorBox");
		var prefixVal = target.val().trim();
		if(prefixVal == ""){
			target.focus();
			errorBox.html('用户前缀不能为空!');
			errorBox.css("display","block");
			this.default.submitState=false;
			return;
		}
		if(prefixVal !== this.default.oldPrefixName){
			this.checkPrefixNameAjaxFun(prefixVal,errorBox,function(prefixBool){
				_this.default.submitState=true;
			});
		}
		errorBox.css("display","none");
		this.default.newPrefixName = prefixVal;
	},
	checkPrefixNameAjaxFun:function(prefixVal,errorBox,callBack){
		var _this = this;
		var _data = {
			prefix:prefixVal
		}
	   	App.userAdmin.checkUserPrefixC.fetch({
			data: _data,
			success: function(collection, response, options) {
				if(response.data == "exist"){
					errorBox.html('用户前缀已经存在，请从新输入!');
					errorBox.css("display","block");
					_this.default.submitState=false;
				}else{
					callBack()
				}
			}
		})
	},
	submitFun:function(){
		if(!this.default.submitState){
			alert("请按要求填写内容");
			return;
		}
		var UserAdminIndexV = new App.userAdmin.UserAdminIndexV;
		if(this.default.oldPrefixName != this.default.newPrefixName) {
			var data = {
				 "prefix":this.default.oldPrefixName,
				 "newPrefix":this.default.newPrefixName
			}
			$.ajax({
			    type:"PUT",
			    url:"platform/testuser/prefix",
			    contentType:"application/json",
			    data:JSON.stringify(data),
			    success:function(response){
			       if(response.code == 0){
			       		UserAdminIndexV.renderAddPrefixDom();
						App.userAdmin.UserAdminPrefixListV.EditDialog.close();
		       		}
			    }
			});
		}else{
       		UserAdminIndexV.renderAddPrefixDom();
			App.userAdmin.UserAdminPrefixListV.EditDialog.close();
		}
	}
})