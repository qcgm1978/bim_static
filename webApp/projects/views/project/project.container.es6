App.Project.ProjectContainer = Backbone.View.extend({

	tagName: 'div',

	className: 'projectContent',

	template: _.templateUrl('/projects/tpls/project/project.container.html'),

	initialize() {
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.renderProperties);
	},


	events: {
		"click .breadItem": "breadItemClick", //点击头部导航  项目  版本  列表 模型
		"click .projectList .projectBox .item": "beforeChangeProject", //切换项目 之前 处理
		"click .slideBar": "navBarShowAndHide",
		"mousedown .dragSize": "dragSize",
		"click .projectVersionList .nav .item": "changeVersionTab",
		"click .fileNav .commSpan": "switchFileMoldel",
		"keyup .projectList .txtSearch": "filterProject",
		"keyup .projectVersionList .txtSearch": "filterProjectVersion",
		"click .modleShowHide": "slideUpAndDown"

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

	//过滤项目
	filterProject(event) {


		var $target = $(event.target),
			val = $target.val().trim(),
			$list = $target.parent().find(".container a.item");

		if (!val) {
			$list.show();
		} else {
			$list.each(function() {

				if ($(this).text().indexOf(val) < 0) {
					$(this).hide();
				}

			});
		}

	},

	//过滤项目版本
	filterProjectVersion(event) {

		var $target = $(event.target),
			val = $target.val().trim(),
			$list = $target.parent().find(".container a.item");

		if (!val) {
			$list.show();
		} else {
			$list.each(function() {

				if ($(this).find(".vName").text().indexOf(val) < 0) {
					$(this).hide();
				}

			});
		}
	},

	//展开和收起
	slideUpAndDown: function(event) {
		var $parent = $(event.target).parent(),
			$modleList = $parent.find(".modleList");
		$(event.target).toggleClass("down");
		if ($modleList.is(":hidden")) {
			$modleList.slideDown();
		} else {
			$modleList.slideUp();
		}
		//classkey临时请求数据
		if ($(event.target).is('.getdata')) {
			$(event.target).removeClass('getdata');
			$modleList.slideDown();
			$.ajax({
				url: "platform/setting/extensions/" + App.Project.Settings.projectId + "/" + App.Project.Settings.CurrentVersion.id + "/property?classKey=" + $(event.target).data('classkey') + "&elementId=" + App.Project.Settings.ModelObj.intersect.userId
			}).done(function(res) {
				if (res.code == 0) {
					console.log(res)
					var props = res.data.properties;
					for (var str = '', i = 0; i < props.length; i++) {
						if(res.data.className=='成本管理'){
							str+=App.Project.properCostTree(props[i]['value']);

						}else if(props[i]['type']=='链接'){
							str+='<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2"><a href="'+props[i]['value']+'">'+props[i]['property']+'</a>&nbsp;&nbsp;</div></li>';
						}else {
							str+='<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">'+props[i]['property']+'</div></span> <span class="modleVal rEnd">'+props[i]['value']+'</span> </li>';
						}
					}
					if(res.data.className=='成本管理'){
						$(event.target).parent().append(str);

					}else{
						$(event.target).parent().append('<ul class="modleList">'+str+'</ul>');

					}
					//str += '<li class="modleItem">'+
					//	'<span class="modleName"><div title='<%=subItem.name%>' class="modleNameText overflowEllipsis"><%=subItem.name%></div></span> <span class="modleVal overflowEllipsis"><%=subItem.value%><%=subItem.unit%></span>'+
					//	'</li>'
				}
			});
		}
	},

	//点击面包靴
	breadItemClick: function(event) {

		var $target = $(event.target).closest(".breadItem");

		//没有下拉箭头的 不加载
		if ($target.find(".myIcon-slanting-right").length <= 0) {
			return;
		}

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
	},

	//跳转之前
	beforeChangeProject(event) {
		var $target = $(event.target).closest(".item"),
			href = $target.prop("href");

		if ($target.prop("href").indexOf("noVersion") > -1) {
			alert('暂无版本');
			return false;
		}

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

	},

	//切换模型浏览器 和 文件浏览器
	switchFileMoldel(event) {

		var $target = $(event.target),
			type = $target.data("type"),
			$projectContainer = $("#projectContainer"),
			$projectCotent = $projectContainer.find(".projectCotent");
		App.Project.Settings.fetchNavType = type;


		if (type == "file") {

			//左右侧
			$projectContainer.find(".rightProperty").removeClass("showPropety");
			$projectContainer.find(".leftNav").show();

			$projectCotent.removeClass("showPropety");

			//内容
			$projectContainer.find(".fileContainer").show();
			$projectContainer.find(".modelContainer").hide();
			//模型tab
			$(".projectContainerApp .projectHeader .projectTab").hide();

			//绑定上传
			if (App.Project.Settings.CurrentVersion.status != 9) {
				$(".fileContainer .btnFileUpload").show();
				//上传
				App.Project.upload = App.modules.docUpload.init($(document.body));
			} else {
				$(".fileContainer .btnFileUpload").hide();
			}
			//隐藏下拉
			$target.addClass("selected").siblings().removeClass("selected");

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
			//隐藏下拉
			$target.addClass("selected").siblings().removeClass("selected");

		}

	},

	//切换
	typeContentChange() {

		var $projectContainer = $("#projectContainer"),
			$projectCotent = $projectContainer.find(".projectCotent"),
			mRight = $projectCotent.data("mRight") || 398;

		//左右侧
		$projectContainer.find(".leftNav").hide();

		$projectCotent.addClass("showPropety");
		$projectContainer.find(".rightProperty").addClass("showPropety").width(mRight);

		//内容
		$projectContainer.find(".fileContainer").hide();
		$projectContainer.find(".modelContainer").show();
		//模型tab
		$(".projectContainerApp .projectHeader .projectTab").show();

		//销毁上传
		App.Comm.upload.destroy();

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

		App.Comm.ajax(data, function(data) {

			if (data.message == "success") {

				if (data.data) {
					App.Project.Settings.DataModel = data.data;
					that.renderModel();
				} else {
					alert("模型转换中");
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

		//渲染模型属性
		//App.Project.renderModelContentByType();
		//return;
		var viewer = App.Project.Settings.Viewer = new bimView({
			type: 'model',
			element: $("#projectContainer .modelContainerContent"),
			sourceId: App.Project.Settings.DataModel.sourceId,
			etag: App.Project.Settings.DataModel.etag, //"a1064f310fa8204efd9d1866ef7370ee" ||
			projectId: App.Project.Settings.projectId,
			projectVersionId: App.Project.Settings.CurrentVersion.id
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
			//展开
			$("#projectContainer .rightProperty").css('marginRight', '0');
			$("#projectContainer .rightProperty .icon-caret-left").attr('class', 'icon-caret-right');

		});

		//分享
		if (App.Project.Settings.type == "token" && location.hash.indexOf("share") > 0 || App.Project.Settings.viewPintId) {

			viewer.on("loaded", function() {
				//加载数据
				$(".modelSidebar  .bar-item.m-camera").click();
			});

		}

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

		//属性，四个tab 都一样
		if (((projectNav == "design" || projectNav == "cost" || projectNav == "quality" || projectNav == "plan" || projectNav == '') && property == "poperties")) {

			App.Project.DesignAttr.PropertiesCollection.projectId = App.Project.Settings.projectId;
			App.Project.DesignAttr.PropertiesCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
			App.Project.DesignAttr.PropertiesCollection.fetch({
				data: {
					elementId: Intersect.userId,
					sceneId: Intersect.object.userData.sceneId
				}
			});
		}
	},


	//渲染属性
	renderProperties(model) {
		var data = model.toJSON().data,
			templateProperties = _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),
			$designProperties = this.$el.find(".singlePropetyBox .designProperties");
		App.Project.userProps.call(this, data, function(data) {
			$designProperties.html(templateProperties(data));
			//其他属性
			App.Project.propertiesOthers.call({
				$el: $designProperties
			}, "plan|cost|quality|dwg");
		});
		/*	$designProperties.html(templateProperties(data));
			//其他属性
			App.Project.propertiesOthers.call({
				$el: $designProperties
			}, "plan|cost|quality|dwg");*/
		//	App.Project.userProps.call(this,data);
	}

});