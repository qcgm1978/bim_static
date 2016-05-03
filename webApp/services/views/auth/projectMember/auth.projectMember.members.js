//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  events:{
  	"click .remove":'del'
  },

  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },

  del:function(){
  },

  render: function(items) {
  	var data=App.Services.projectMember.method.model2JSON(items.models);
  	data={data:data};
    $("#memberList").html(this.template(data));
    
    $(".remove").on("click",function(){
    	
    	(new ViewComp.Modal).render({title:"",dialog:true}).append("<span class='delTip'>是否要删除是否要删除是否要删除是否要删除是否要删除</span>");
    	
    })
    return this;
  }
});