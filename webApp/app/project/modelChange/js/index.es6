/**
 * @require /app/project/modelChange/js/comm.js
 * @require /app/project/modelChange/js/collection.js
 */
App.Index = {

	Settings: {
		projectId: "",
		projectVersionId: "",
		ModelObj: "",
		Viewer:null
	},

	bindEvent() {

		var that = this,$projectContainer=$("#projectContainer");

		//切换属性tab
		$projectContainer.on("click", ".projectPropetyHeader .item", function() {
			App.Index.Settings.property = $(this).data("type");
			//属性
			if (App.Index.Settings.property == "attr") {
				that.renderAttr(App.Index.Settings.ModelObj);
			}

			var index = $(this).index();
			$(this).addClass("selected").siblings().removeClass("selected");
			$(this).closest(".designPropetyBox").find(".projectPropetyContainer").children('div').eq(index).show().siblings().hide();
		});


		//收起 暂开 属性内容
		$projectContainer.on("click", ".modleShowHide", function() {
			$(this).toggleClass("down");
			var $modleList = $(this).parent().find(".modleList");
			$modleList.slideToggle();
		});

		//收起 暂开 属性 左侧
		$projectContainer.on("click", ".leftNavContent .slideBar", function() {

			App.Comm.navBarToggle($("#projectContainer .leftNav "), $("#projectContainer .projectCotent"), "left", App.Index.Settings.Viewer);
		});
		//拖拽 属性内容 左侧
		$projectContainer.on("mousedown", ".leftNavContent .dragSize", function(event) {
			App.Comm.dragSize(event, $("#projectContainer .leftNav"), $("#projectContainer .projectCotent"), "left", App.Index.Settings.Viewer);
		});


		//收起 暂开 属性 右侧
		$projectContainer.on("click", ".rightProperty .slideBar", function() {

			App.Comm.navBarToggle($("#projectContainer .rightProperty"), $("#projectContainer .projectCotent"), "right", App.Index.Settings.Viewer);
		});
		//拖拽 属性内容 右侧
		$projectContainer.on("mousedown", ".rightProperty .dragSize", function(event) {
			App.Comm.dragSize(event, $("#projectContainer .rightProperty"), $("#projectContainer .projectCotent"), "right", App.Index.Settings.Viewer);
		});

		this.bindTreeScroll();

	},

	initPars: function() {

		var Request = App.Index.GetRequest();
		App.Index.Settings.projectId = Request.projectId;
		App.Index.Settings.projectVersionId = Request.projectVersionId;
	},

	//获取url 参数
	GetRequest() {
		var url = location.search; //获取url中"?"符后的字串
		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
			}
		}
		return theRequest;
	},


	//获取模型id 渲染模型
	getModelId(callback) {

		var dataObj = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.Index.Settings.projectId,
				projectVersionId: App.Index.Settings.projectVersionId
			}
		}

		App.Comm.ajax(dataObj, callback);

	},

	//渲染模型
	renderModel() {


		var that = this;
		App.Index.Settings.Viewer = null;
		this.getModelId(function(data) {

			var Model = data.data;

			App.Index.Settings.Viewer = new BIM({
				element: $("#contains .projectCotent")[0],
				sourceId: Model.sourceId,
				etag: Model.etag,
				tools: true,
				treeElement: $("#projectContainer  .projectModelContent")[0]
			});


			App.Index.Settings.Viewer.on("click", function(model) {
				App.Index.Settings.ModelObj = null;
				if (!model.intersect) {
					return;
				}

				App.Index.Settings.ModelObj = model;
				//App.Project.Settings.modelId = model.userId;
				//设计

				//属性
				if (App.Index.Settings.property == "attr") {
					that.renderAttr(App.Index.Settings.ModelObj);
				}

			});
			// 绑定视点功能
			that.bindPoint(App.Index.Settings.Viewer);
		});

	},

	//渲染属性
	renderAttr() {

		if (!App.Index.Settings.ModelObj||!App.Index.Settings.ModelObj.intersect) {
			$("#projectContainer .designProperties").html(' <div class="nullTip">请选择构件</div>');
			return;
		}

		var url = "/sixD/" + App.Index.Settings.projectId + "/" + App.Index.Settings.projectVersionId + "/property";
		$.ajax({
			url: url,
			data: {
				elementId: App.Index.Settings.ModelObj.intersect.userId,
				sceneId: App.Index.Settings.ModelObj.intersect.object.userData.sceneId
			}
		}).done(function(data) {
			var template = _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html");
			$("#projectContainer .designProperties").html(template(data.data));
		});

	},

	//树形的滚动条
	bindTreeScroll() {

		var $modelTree = $("#projectContainer  .projectModelContent");
		if (!$modelTree.hasClass('mCustomScrollbar')) {
			$modelTree.mCustomScrollbar({
				set_height: "100%",
				set_width: "100%",
				theme: 'minimal-dark',
				axis: 'xy',
				keyboard: {
					enable: true
				},
				scrollInertia: 0
			});
		}

		$modelTree.find(".mCS_no_scrollbar_y").width(800);

	},

	bindPoint:function(viewer){
		var element = $("#projectContainer .projectModelContent");
		var data = {
			element:element,
			projectId:App.Index.Settings.projectId,
			viewer:viewer
		}
		App.Comm.managePoint(data);
	},

	fetchChange:function(){
		App.Project.Collection.changeList.projectId = App.Index.Settings.projectId;
		App.Project.Collection.changeList.projectVersionId = App.Index.Settings.projectVersionId;
		App.Project.Collection.changeList.fetch();
		$(".rightPropertyContent .designChange").html(new App.Project.Model.changeList().render().el);
	},


	init() {
		//初始化参数
		this.initPars();
		//渲染模型
		this.renderModel();
		//事件绑定
		this.bindEvent();
		//变更获取
		this.fetchChange();
	}
}


App.Project.Model = {

	changeList: Backbone.View.extend({

		tagName: "div",

		className: "tree-view rightTree",

		events: {
			"click .item-content": "openTree",
			"click .tree-text": "select"
		},

		initialize: function() {
			this.listenTo(App.Project.Collection.changeList, "add", this.addList);
		},

		template: _.templateUrl('/app/project/modelChange/tpls/changeList.html'),

		render: function() {
			this.$el.html("没有变更");
			return this;
		},

		addList: function(model) {
			var data = model.toJSON()
			if (data.message == 'success') {
				this.$el.html(this.template(data));
				return this;
			}
		},

		openTree: function(event) {
			var that = $(event.target).closest('.item-content')
			comparisonId = that.data('id');
			that.toggleClass('open');
			if (comparisonId && that.next().length == 0) {
				that.after(new App.Project.Model.getInfo().render().el);
				App.Project.Collection.changeInfo.projectId = App.Index.Settings.projectId;
				App.Project.Collection.changeInfo.projectVersionId = App.Index.Settings.projectVersionId;
				App.Project.Collection.changeInfo.comparisonId = comparisonId;
				App.Project.Collection.changeInfo.fetch();
			}
		},

		select: function() {
			var that = $(event.target);
			if (that.prev('.noneSwitch').length > 0) {
				$(event.target).toggleClass('current');
			}
		}

	}),

	getInfo: Backbone.View.extend({

		tagName: "ul",

		className: "treeViewSub",

		initialize: function() {
			this.listenTo(App.Project.Collection.changeInfo, "add", this.addDetail);
		},

		template: _.templateUrl('/app/project/modelChange/tpls/changeInfo.html'),

		render: function() {
			this.$el.html("没有变更");
			return this;
		},

		addDetail: function(model) {
			var data = model.toJSON();
			if (data.message == 'success' && data.data.length>0) {
				this.$el.html(this.template(data));
				return this;
			}
		}

	})
}
