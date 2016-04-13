App.Project.ProjectContainer = Backbone.View.extend({

	tagName: 'div',

	className: 'projectContent',

	template: _.templateUrl('/projects/tpls/project/project.container.html'),

	events: {
		"click .breadItem": "breadItemClick",
		"click .slideBar": "navBarShowAndHide",
		"mousedown .dragSize": "dragSize",
		"click .projectVersionList .container .item": "changeVersion",
		"click .projectVersionList .nav .item": "changeVersionTab",
		"click .fileModelList li": "switchFileMoldel"

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

	//点击面包�
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

		} else if ($target.hasClass('projectVersion')) {
			var $projectVersionList = $(".breadItem .projectVersionList");
			if (!$projectVersionList.is(":hidden")) {
				return;
			}
			$projectVersionList.find(".loading").show();
			$projectVersionList.find(".listContent").hide();
			$projectVersionList.show();
			this.loadProjectVersionList();
		} else if ($target.hasClass('fileModelNav')) {

			var $fileModelList = $(".breadItem .fileModelList");
			if (!$fileModelList.is(":hidden")) {
				return;
			}
			$fileModelList.show();
		}

		/*var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 268,
			limitHeight: false,
			title: '新建任务',
			cssClass: 'task-create-dialog',
			okText: '�nbsp;&nbsp;�,
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


	//显示和隐�
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

	},

	//切换模型浏览��文件浏览�
	switchFileMoldel(event) {

		var $target = $(event.target).closest("li"),
			type = $target.data("type"),
			$projectContainer = $("#projectContainer"),
			$projectCotent = $projectContainer.find(".projectCotent");
		App.Project.Settings.fetchNavType = type;

		if (type == "file") {

			//左右�
			$projectContainer.find(".rightProperty").removeClass("showPropety");
			$projectContainer.find(".leftNav").show();

			//切换时记录大�
			var mRight = $projectCotent.css("margin-right");
			$projectCotent.css({
				"margin-right": "0px",
				"margin-left": "240px"
			});
			$projectCotent.data("mRight", mRight);

			//内容
			$projectContainer.find(".fileContainer").show();
			$projectContainer.find(".modelContainer").hide();

			//tab 文字
			$target.closest('.fileModelNav').find(".breadItemText .text").text($target.text());



		} else {

			if (!typeof(Worker)) {
				alert("请使用现代浏览器查看模型");
				return;
			}
			//加载过数据后 直接切换 否则 加载数据
			if (App.Project.Settings.DataModel && App.Project.Settings.DataModel.sourceId) {
				this.typeContentChange();
			} else {
				this.fetchModelIdByProject();
			}
			//tab 文字
			$target.closest('.fileModelNav').find(".breadItemText .text").text($target.text());
		}

		//隐藏下拉
		$(".breadcrumbNav .fileModelList").hide();

		event.stopPropagation();

	},

	//切换
	typeContentChange() {

		var $projectContainer = $("#projectContainer"),
			$projectCotent = $projectContainer.find(".projectCotent");
		//左右�
		$projectContainer.find(".leftNav").hide();

		var mRight = $projectCotent.data("mRight") || 398;
		$projectCotent.css({
			"margin-right": mRight,
			"margin-left": "0px"
		});
		$projectContainer.find(".rightProperty").addClass("showPropety").width(mRight);

		//内容
		$projectContainer.find(".fileContainer").hide();
		$projectContainer.find(".modelContainer").show();

	},

	//获取项目版本Id
	fetchModelIdByProject: function() {

		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
			}
		}
		var that = this;


		// App.Project.Settings.modelId= "e0c63f125d3b5418530c78df2ba5aef1";
		// this.renderModel();
		// return;


		App.Comm.ajax(data, function(data) {

			if (data.message == "success") {

				if (data.data) {
					App.Project.Settings.DataModel = data.data;
					that.renderModel();
				} else {
					alert("模型转换�);
				}
			} else {
				alert(data.message);
			}

		});
	},

	//模型渲染
	renderModel: function() {

		var that = this;
		this.typeContentChange();

		//渲染模型属�
		App.Project.renderModelContentByType();

		 return;
		 

		var viewer = App.Project.Settings.Viewer = App.Comm.createModel({
			element: $("#projectContainer .modelContainerContent"),
			sourceId: App.Project.Settings.DataModel.sourceId,
			etag: App.Project.Settings.DataModel.etag
		});

		viewer.on('viewpoint', function(point) {
			$("#projectContainer .projectNavModelContainer .tree-view:eq(1) .item-content:eq(0)").addClass('open')
			App.Project.ViewpointAttr.ListCollection.add({
				data: [{
					id: '',
					name: '新建视点',
					viewPoint: point
				}]
			})
		})

		viewer.on("click", function(model) {

			App.Project.Settings.ModelObj = null;

			if (!model.intersect) {
				that.resetProperNull();
				return;
			};

			App.Project.Settings.ModelObj = model;
			//App.Project.Settings.modelId = model.userId;
			that.viewerPropertyRender();

		});
	},
	//重置 内容为空
	resetProperNull() {

		var projectNav = App.Project.Settings.projectNav,
			property = App.Project.Settings.property,
			$el;
		if (property == "poperties") {

			if (projectNav == "design") {
				//设计
				$el = $(".rightPropertyContentBox .designProperties");

			} else if (projectNav == "cost") {
				//成本
				$el = $(".rightPropertyContentBox .CostProperties");

			} else if (projectNav == "quality") {
				//质量
				$el = $(".rightPropertyContentBox .QualityProperties");
			} else if (projectNav == "plan") {
				//计划
				$el = $(".rightPropertyContentBox .planProperties");
			}
		}
		if ($el) {
			$el.html('<div class="nullTip">请选择构件</div>');
		}

	},
	//设置渲染
	viewerPropertyRender() {
		var projectNav = App.Project.Settings.projectNav,
			property = App.Project.Settings.property,
			Intersect = App.Project.Settings.ModelObj.intersect;

		//属性，四个tab 都一�
		if (((projectNav == "design" || projectNav == "cost" || projectNav == "quality" || projectNav == "plan") && property == "poperties")) {

			App.Project.DesignAttr.PropertiesCollection.projectId = App.Project.Settings.projectId;
			App.Project.DesignAttr.PropertiesCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
			App.Project.DesignAttr.PropertiesCollection.fetch({
				data: {
					elementId: Intersect.userId,
					sceneId: Intersect.object.userData.sceneId
				}
			});
		}
	}

});
