App.Project.ProjectContainer = Backbone.View.extend({

	tagName: 'div',

	className: 'projectContent',

	template: _.templateUrl('/projects/tpls/project/project.container.html'),

	events: {
		"click .breadItem": "breadItemClick",
		"click .slideBar": "navBarShowAndHide",
		"mousedown .dragSize": "dragSize",
		"click .projectVersionList .container .item": "changeVersion",
		"click .projectVersionList .nav .item": "changeVersionTab"
	},

	render: function() {
		this.$el.html(this.template({}));
		//导航
		this.$el.find("#projectContainer").prepend(new App.Project.leftNav().render().el);

		//加载文件
		this.$el.find(".projectCotent").append(new App.Project.FileContainer().render().el);
		this.$el.find(".projectCotent").append('<div class="modelContainer"> <div class="modelContainerScroll"><div class="modelContainerContent"></div></div> </div>');
		return this;
	},

	//点击面包靴
	breadItemClick: function(event) {

		var $target = $(event.target).closest(".breadItem");

		if ($target.hasClass('project')) {
			var $projectList = $(".breadItem .projectList");
			if (!$projectList.is(":hidden")) {
				return;
			}
			$projectList.find(".loading").show();
			$projectList.find(".listContent").hide();
			$projectList.show();
			this.loadProjectList();

		} else {
			var $projectVersionList = $(".breadItem .projectVersionList");
			if (!$projectVersionList.is(":hidden")) {
				return;
			}
			$projectVersionList.find(".loading").show();
			$projectVersionList.find(".listContent").hide();
			$projectVersionList.show();
			this.loadProjectVersionList();
		}

		/*var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 268,
			limitHeight: false,
			title: '新建任务',
			cssClass: 'task-create-dialog',
			okText: '添&nbsp;&nbsp;加',
			message: "内容" 
		})*/
	},

	//加载分组项目
	loadProjectList: function() {

		var data = {
			URLtype: "fetchCrumbsProject"
		};

		//渲染数据
		App.Comm.ajax(data, function(data) {

			var $projectList = $(".breadItem .projectList");
			var template = _.templateUrl("/projects/tpls/project/project.container.project.html");
			$projectList.find(".container").html(template(data.data));
			console.log(data);

			$projectList.find(".loading").hide();
			$projectList.find(".listContent").show();

		});

	},

	//加载版本
	loadProjectVersionList: function() {

		App.Project.loadVersion(function(data) {


			var $projectVersionList = $(".breadItem .projectVersionList");
			var template = _.templateUrl("/projects/tpls/project/project.container.version.html");
			$projectVersionList.find(".container").html(template(data.data));

			//显示

			$projectVersionList.find(".loading").hide();
			$projectVersionList.find(".listContent").show();

		});

	},

	//版本切换
	changeVersion: function(event) {

		var $target = $(event.target).closest(".item"),
			Version = $target.data("version");

		App.Project.resetOptions();
		App.Project.Settings.projectName = Version.projectName;
		App.Project.Settings.CurrentVersion = Version;
		App.Project.loadData();
		$(".breadcrumbNav .projectVersionList").hide();
		event.stopPropagation();
	},

	//版本tab 切换
	changeVersionTab: function(event) {

		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass("selected").siblings().removeClass("selected");

		//发布版本
		if (type == "release") {
			var $releaseVersionBox = $target.closest(".listContent").find(".releaseVersionBox");
			if ($releaseVersionBox.length <= 0) {
				$target.closest(".listContent").find(".container").append('<div class="releaseVersionBox">暂无版本</div>');

			}
			$target.closest(".listContent").find(".releaseVersionBox").show().siblings().hide();

		} else {

			var $changeVersionBox = $target.closest(".listContent").find(".changeVersionBox");
			if ($changeVersionBox.length <= 0) {
				$target.closest(".listContent").find(".container").append('<div class="changeVersionBox">暂无版本</div>');

			}
			$target.closest(".listContent").find(".changeVersionBox").show().siblings().hide();

		}
	},


	//显示和隐藏
	navBarShowAndHide: function(event) {
		var $target = $(event.target);
		if ($target.closest(".leftNav").length > 0) {
			this.navBarLeftShowAndHide();
		} else {
			this.navBarRightShowAndHide();
		}

	},
	//收起和暂开
	navBarLeftShowAndHide: function() {
		App.Comm.navBarToggle($("#projectContainer .leftNav"), $("#projectContainer .projectCotent"), "left", App.Project.Settings.Viewer);

	},

	//右侧收起和暂开
	navBarRightShowAndHide: function() {

		App.Comm.navBarToggle($("#projectContainer .rightProperty "), $("#projectContainer .projectCotent"), "right", App.Project.Settings.Viewer);

	},

	//拖拽改变尺寸
	dragSize: function(event) {

		var $el = $("#projectContainer .rightProperty"),
			dirc = "right",
			$target = $(event.target);


		if ($target.closest(".leftNav").length > 0) {
			dirc = "left";
			$el = $("#projectContainer .leftNav"); 
		}


		App.Comm.dragSize(event, $el, $("#projectContainer .projectCotent"), dirc, App.Project.Settings.Viewer); 

		return false;

	}


});