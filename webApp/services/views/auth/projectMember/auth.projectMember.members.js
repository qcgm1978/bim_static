//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },

  del:function(event){
  		var _userId=event.currentTarget.getAttribute("data-user");
  		var _userName=event.currentTarget.getAttribute("data-userName");
  		var _model=new ViewComp.Modal;
  		_model.render({title:"",dialog:true,confirm:function(){
    		//TODO 调用删除接口
    		_model.html("<img src='/static/dist/images/services/images/load.gif'>正在删除、请稍等...")
    		var url="/platform/auth/user/"+_userId+"/dataPrivilege?outer=true&privilegeId="+App.Comm.getCookie("currentPid");
    		$.ajax({
    			type:"DELETE",
    			url:url
    		}).done(function(data){
    			_model.html("删除成功");
    			if(data.message=="success"){
    				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:true},{
						dataPrivilegeId:App.Comm.getCookie("currentPid")
					});
					setTimeout(function(){
						$("#windowMask").hide();
					},2000)
    			}else{
    				//TODO 临时方案
    				_model.html("删除失败");
    			}
    		})
    	}}).append("<span class='delTip'>是否将用户'"+_userName+"'删除？</span>");
  },

  render: function(items) {
  	var _this=this;
  	var data=App.Services.projectMember.method.model2JSON(items.models);
  	data={data:data};
    $("#memberList").html(this.template(data));
    $(".remove").on("click",function(e){
    	_this.del(e);
    })
    return this;
  }
});