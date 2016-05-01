//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({
	
  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection,'reset',this.loadData);
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection,'add',this.addOne);
  },
	
	render:function(){
		return this;
	},
	
	
	loadData:function(){
		$("#projectMember .project").remove();
		_.each(App.Services.projectMember.projectMemberProjectCollection.models,function(model){
			var view=new App.Services.projectMember.projects.view({model:model});
  		$("#projectMember .projects").append(view.render().el);
		})
		$("#projectMember .projects").find("li:nth-child(2)").addClass("active");
	},
	
  addOne:function(item){
  	var view=new App.Services.projectMember.projects.view({model:item});
  	$("#projectMember .projects").append(view.render().el);
  	$("#projectMember .projects").find("li:nth-child(2)").addClass("active");
  }
});