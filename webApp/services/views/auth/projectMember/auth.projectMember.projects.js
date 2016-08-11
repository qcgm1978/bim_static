//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({

	template: _.templateUrl('/services/tpls/auth/projectMember/projects.html'),

	events: {
		'click .project': 'selectProject'
	},

	currentSelect:3,
	// 重写初始化
	initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection, 'reset', this.render);
	},

	render: function(items) {
		var _this = this;
		var data = items.toJSON()[0];
		data.data.type=_this.currentSelect;
		$("#projectList").html(this.$el.html(this.template(data)));
		if (data.data.length > 0) {
			var id = data.data[0].id;
			App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection, {
				outer: App.Comm.user("outer")
			}, {
				dataPrivilegeId: id
			});
			App.Comm.setCookie("currentPid", id);
		}
		$('#projectList .projectDropDown').myDropDown({
			click:function($item){
				_this.currentSelect=$item.data('type');
				App.Services.projectMember.managerType=$item.data('type');
				$("#memberlistWrap").html('<div class="noDataText">暂无信息,请点击选择左侧的项目列表</div>');
				items.fetch({
					reset:true,
					data: {
						userId:App.Comm.user("userId"),
						type:$item.data('type')
					}
				})

			}
		});
		this.delegateEvents();
		return this;
	},

	selectProject: function(event) {
		$("#memberlistWrap").mmhMask();
		var $li = $(event.currentTarget),
			pid = $li.attr("data-pid"),
			name = $li.find('h4').text(); //权限ID
		$("#projectList .project").removeClass("active");
		$li.addClass("active");
		App.Comm.setCookie("currentPid", pid);
		App.Comm.setCookie("currentProjectName", escape(escape(name)));
		App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection, {
			outer: App.Comm.user("outer")
		}, {
			dataPrivilegeId: pid
		});
	}

});