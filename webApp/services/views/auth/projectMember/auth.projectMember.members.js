//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },

  del:function(event){
  		(new ViewComp.Modal).render({title:"",dialog:true,confirm:function(){
    		//TODO 调用删除接口
    	}}).append("<span class='delTip'>是否要删除是否要删除是否要删除是否要删除是否要删除</span>");
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