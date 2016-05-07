//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },
  delModal:'',
  /**
   * 项目成员列表删除事件
   * @param {Object} event
   */
  del:function(event){
  		var _userId=event.currentTarget.getAttribute("data-user");
  		var _userName=event.currentTarget.getAttribute("data-userName");
  		var _opType=event.currentTarget.getAttribute("data-type");//对象类型：org,user
  		this.delModal=this.delModal || new ViewComp.Modal;
  		var _model=this.delModal;
  		_model.render({title:"",dialog:true,confirm:function(){
    		_model.html("<img src='/static/dist/images/services/images/load.gif'>正在删除、请稍等...")
    		var url="/platform/auth/"+_opType+"/"+_userId+"/dataPrivilege?outer="+(_opType=='org'?'false':App.Comm.getCookie("isOuter"))+"&privilegeId="+App.Comm.getCookie("currentPid");
    		$.ajax({
    			type:"DELETE",
    			url:url
    		}).done(function(data){
    			_model.html("删除成功");
    			if(data.message=="success"){
    				$('#dataLoading').show();
    				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:App.Comm.getCookie("isOuter")},{
						dataPrivilegeId:App.Comm.getCookie("currentPid")
					});
					setTimeout(function(){
						_model.closeView();
					},100)
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
    $("#dataLoading").hide();
    return this;
  }
});