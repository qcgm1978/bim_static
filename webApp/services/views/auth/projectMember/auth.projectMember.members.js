//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),
  
  events:{
  },

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },
  /**
   * 项目成员列表删除事件
   * @param {Object} event
   */
  del:function(event){
  		var _userId=event.currentTarget.getAttribute("data-user");
  		var _userName=event.currentTarget.getAttribute("data-userName");
  		var _opType=event.currentTarget.getAttribute("data-type");//对象类型：org,user
  		var _outer=event.currentTarget.getAttribute("data-outer");//对象类型：org,user
  		
  		App.Services.Dialog.alert("<span class='delTip'>是否将用户'"+_userName+"'删除？</span>",function(_this){
  			App.Comm.ajax({
  				URLtype:'deleteServicesProjectMembers',
  				data:{
  					memberType:_opType,
  					userId:_userId,
  					outer:_outer,
  					privilegeId:App.Comm.getCookie('currentPid')
  				},
  				type:'delete'
  			},function(res){
  				_this.close();
  				new App.Comm.Tip({message:'删除成功',type:'success'}).render().show();
    			if(res.message=="success"){
    				//$('#dataLoading').show();
    				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:App.Comm.getCookie("isOuter")},{
						dataPrivilegeId:App.Comm.getCookie("currentPid")
					});
    			}
  			}).fail(function(){
  				
  			})
  			
    		
  		});
  },

  render: function(items) {
  	var _this=this;
  	var data=App.Services.projectMember.method.model2JSON(items.models);
  	data={data:data};
    $("#memberlistWrap").html(this.$el.html(this.template(data)));
    this.$('.remove').on('click',function(e){
    	
    	_this.del(e);
    	
    })
    $('#dataLoading').hide();
    return this;
  }
});