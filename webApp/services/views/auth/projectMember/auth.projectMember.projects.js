//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({
	
	template: _.templateUrl('/services/tpls/auth/projectMember/projects.html'),

	events:{
		'click .project':'selectProject'
	},
	// 重写初始化
	initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection, 'reset', this.render);
	},

	render: function(items) {
		var _this=this;
		var data = App.Services.projectMember.method.model2JSON(items.models);
		data={data:data};
		$("#projectList").html(this.$el.html(this.template(data)));
		if(data.data.length>0){
			var id=data.data[0].id;
			App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:App.Comm.getCookie("isOuter")},{
				dataPrivilegeId:id
			});
			App.Comm.setCookie("currentPid",id);
		}
		return this;
	},
	
	selectProject:function(event){
		$("#dataLoading").show();
		var $li=$(event.currentTarget),
			pid=$li.attr("data-pid");//权限ID
		$("#projectList .project").removeClass("active");
		$li.addClass("active");
		App.Comm.setCookie("currentPid",pid);
		App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:App.Comm.getCookie("isOuter")},{
			dataPrivilegeId:pid
		});
	},

});