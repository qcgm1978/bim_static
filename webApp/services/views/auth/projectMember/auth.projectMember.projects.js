//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({
	
	template: _.templateUrl('/services/tpls/auth/projectMember/projects.html'),

	
	// 重写初始化
	initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection, 'reset', this.render);
	},

	render: function(items) {
		var _this=this;
		var data = App.Services.projectMember.method.model2JSON(items.models);
		data={data:data};
		$("#projectList").html(this.template(data));
		$("#projectList").children().on("click",function(e){
			_this.selectProject(e);
		})
		return this;
	},
	
	initDom:function(){
		
	},

	selectProject:function(event){
		$("#projectList .project").removeClass("active");
		$(event.target).addClass("active");
	},

});