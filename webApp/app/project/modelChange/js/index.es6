/**
 * @require /app/project/modelChange/js/comm.js
 * @require /app/project/modelChange/js/collection.js
 */
App.Index = {

	Settings: {
		type: "user",
		projectId: "",
		projectVersionId: "",
		ModelObj: "",
		currentModelId:"",
		Viewer: null
	},

	bindEvent() {

		var that = this,
			$projectContainer = $("#projectContainer");

		//切换属性tab
		$projectContainer.on("click", ".projectPropetyHeader .item", function() {

			App.Index.Settings.property = $(this).data("type");
			//属性
			if (App.Index.Settings.property == "attr") {
				that.renderAttr();
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


		//收起 暂开 属性 右侧
		$projectContainer.on("click", ".rightProperty .slideBar", function() {

			App.Comm.navBarToggle($("#projectContainer .rightProperty"), $("#projectContainer .projectCotent"), "right", App.Index.Settings.Viewer);
		});
		//拖拽 属性内容 右侧
		$projectContainer.on("mousedown", ".rightProperty .dragSize", function(event) {
			App.Comm.dragSize(event, $("#projectContainer .rightProperty"), $("#projectContainer .projectCotent"), "right", App.Index.Settings.Viewer);
		});

		this.bindTreeScroll();

		// 加载变更模型
		$(".showChange .checkboxGroup input:checkbox").on("change", function() {
			var changeModel = App.Index.Settings.changeModel;
			var viewer = App.Index.Settings.Viewer;
			var flag = $(this).prop("checked");
			if (App.Index.Settings.loadedModel) {
				viewer.showScene(App.Index.Settings.loadedModel, flag);
			} else {
				App.Index.Settings.loadedModel = viewer.load(changeModel);
			}
		})

	},

	initPars: function() {

		var Request = App.Index.GetRequest();
		App.Index.Settings.projectId = Request.projectId;
		App.Index.Settings.projectVersionId = Request.projectVersionId;
		App.Index.Settings.referenceId = Request.modificationId;
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
	getModelId(differFileVersionId, callback) {

		var dataObj = {
			URLtype: "fetchFileModelIdByFileVersionId",
			data: {
				projectId: App.Index.Settings.projectId,
				projectVersionId: App.Index.Settings.projectVersionId,
				fileVersionId: differFileVersionId
			}
		}

		App.Comm.ajax(dataObj, callback);

	},

	//渲染模型
	renderModel(modelId) {
		var _this=this;
		var viewer = App.Index.Settings.Viewer = new bimView({
			type:'singleModel',
			element: $("#contains .projectCotent"),
			etag: modelId
		});

		viewer.on("click", function(model) {
			App.Index.Settings.ModelObj = null;

			if (!model.intersect) {
				$("#projectContainer .designProperties").html(' <div class="nullTip">请选择构件</div>');
				return;
			};

			App.Index.Settings.ModelObj = model;
			//App.Project.Settings.modelId = model.userId;
			_this.renderAttr(modelId);

		});

		this.Settings.currentModelId=modelId;
	},

	//渲染属性
	renderAttr(modelId) {

		modelId = modelId || this.Settings.currentModelId;
		 
		if (!App.Index.Settings.ModelObj || !App.Index.Settings.ModelObj.intersect) {
			$("#projectContainer .designProperties").html(' <div class="nullTip">请选择构件</div>');
			return;
		}

		var url = "/sixD/" + App.Index.Settings.projectId + "/" + App.Index.Settings.projectVersionId + "/property";
		$.ajax({
			url: url,
			data: {
				elementId: App.Index.Settings.ModelObj.intersect.userId,
				sceneId: modelId
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

	bindPoint: function(viewer) {
		var element = $("#projectContainer .projectModelContent");
		var data = {
			element: element,
			projectId: App.Index.Settings.projectId,
			viewer: viewer
		}
		App.Comm.managePoint(data);
	},

	fetchChange: function() {
		var that = this;
		App.Project.Collection.changeList.projectId = App.Index.Settings.projectId;
		App.Project.Collection.changeList.projectVersionId = App.Index.Settings.projectVersionId;
		App.Project.Collection.changeList.fetch();
		$(".rightPropertyContent .dropList").html(new App.Project.Model.changeList().render().el);
		//下拉 事件绑定
		$('.myDropDown').myDropDown({
			click: function($item) {
				var groupText = $item.closest(".groups").prev().text() + "：";
				$(".myDropDown .myDropText span:first").text(groupText);
				var currentModel = $item.data("currentmodel"),
				    baseModel = $item.data("basemodel"),
					changeModel = $item.data("change").replace("_output", ""),
					comparisonId = $item.data('id');
				App.Index.Settings.currentModel = currentModel;
				App.Index.Settings.baseModel = baseModel;


				App.Index.Settings.changeModel = changeModel;
				$('.checkboxGroup input').prop('checked', false);
				App.Index.Settings.loadedModel = null;
				that.renderModel(currentModel);
				$(".rightPropertyContent .listDetail").html(new App.Project.Model.getInfo().render().el);
				that.getDetail(comparisonId);
			}
		});

	},
	getDetail: function(comparisonId) {
		App.Project.Collection.changeInfo.projectId = App.Index.Settings.projectId;
		App.Project.Collection.changeInfo.projectVersionId = App.Index.Settings.projectVersionId;
		App.Project.Collection.changeInfo.comparisonId = comparisonId;
		App.Project.Collection.changeInfo.fetch();
	},

	//api 接口 初始化
	initApi(projectId, projectVersionId) {

		this.Settings.projectId = projectId;
		this.Settings.projectVersionId = projectVersionId;

		App.Project.Collection.changeList.urlType = "modelStd";

		this.Settings.type = "api";

		//初始化
		this.init();
	},


	init() {

		//非api 调用
		if (this.Settings.type != 'api') {
			//初始化参数
			this.initPars();
		}

		//渲染模型
		//事件绑定
		this.bindEvent();
		//变更获取
		this.fetchChange();
	}
}


App.Project.Model = {

	changeList: Backbone.View.extend({

		tagName: "div",

		className: "myDropDown optionComm",

		events: {
			"click .myDropText": "openList",
		},

		initialize: function() {
			this.listenTo(App.Project.Collection.changeList, "add", this.addList);
		},

		template: _.templateUrl('/app/project/modelChange/tpls/fileList.html'),

		render: function() {
			this.$el.html("加载中...");
			return this;
		},

		addList: function(model) {
			var data = model.toJSON();
			var comparisonId = App.Index.Settings.referenceId;
			var isload = false;
			console.log(data)

			$.each(data.data, function(i, item) {
				$.each(item.comparisons, function(j, file) {

					if (file.comparisonId == comparisonId) {
						isload = true;
						$(".rightPropertyContent .listDetail").html(new App.Project.Model.getInfo().render().el);
						App.Index.getDetail(comparisonId);
						App.Index.Settings.currentModel = file.currentModel;
						App.Index.Settings.baseModel = file.baseModel;
						App.Index.Settings.changeModel = file.comparisonId;
						App.Index.renderModel(file.currentModel);
						data.selected = [i,j]

					}
				});
			});
			// 没有找到当前文件,默认加载第一个
			if (!isload && data.data.length>0) {
				var file = data.data[0].comparisons[0];

				$(".rightPropertyContent .listDetail").html(new App.Project.Model.getInfo().render().el);
				App.Index.getDetail(file.comparisonId);
				App.Index.Settings.changeModel = file.comparisonId;
				App.Index.renderModel(file.currentModel);
				App.Index.Settings.currentModel = file.currentModel;
				App.Index.Settings.baseModel = file.baseModel;
			}
			if (data.data.length>0) {
				this.$el.html(this.template(data));
			} else {
				this.$el.html("没有变更")
			}
			return this;
		}

	}),

	getInfo: Backbone.View.extend({
		tagName: "ul",
		className: "tree-view rightTreeView",
		events: {
			"click .tree-text": "select",
			"click .link": "detail",
			"click .item-content": "openTree",
		},
		initialize: function() {
			this.listenTo(App.Project.Collection.changeInfo, "add", this.addDetail);
		},
		template: _.templateUrl('/app/project/modelChange/tpls/changeInfo.html'),
		render: function() {
			this.$el.html("加载中...");
			return this;
		},
		addDetail: function(model) {
			var data = model.toJSON();
			if (data.message == 'success' && data.data.length > 0) {
				this.$el.html(this.template(data));
			} else {
				this.$el.html("没有变更");
			}
			return this;
		},
		openTree: function(event) {
			var that = $(event.target).closest('.item-content')
			that.toggleClass('open');
		},
		select: function() {
			var that = $(event.target).closest(".tree-text");
			var parent = $(".rightTreeView");
      var elementId = that.data('id');
      var baseId = that.data('base');
      if (that.prev('.noneSwitch').length > 0) {
        if (that.is('.current')) {
          that.removeClass('current');
          App.Index.Settings.Viewer.highlight({type:"userId",ids:[]});
        }else{
        	parent.find('.current').removeClass('current');
          that.addClass('current');
          App.Index.Settings.Viewer.highlight({type:"userId",ids:[elementId,baseId]});
        }
        App.Index.Settings.Viewer.fit();
      }

			//test
			$.ajax({
				url: "http://bim.wanda-dev.cn/sixD/"+App.Index.Settings.projectId+"/"+App.Index.Settings.projectVersionId+"/bounding/box?sceneId="+elementId.split('.')[0]+"&elementId="+elementId
			}).done(function(respone){
				if(respone.code==0){
					var max = respone.data.max,
					    min = respone.data.min,
					    box=[[max.x,max.y,max.z],[min.x,min.y,min.z]];
					App.Index.Settings.Viewer.zoomToBox(box);


				}else{

				}
			});

		},
		detail: function(e){

			var $treetext = $(e.target).prev('.tree-text'),
				data = {
					type:$(e.target).data('type'),
					baseElementId:$treetext.data('base'),
					currentElementId:$treetext.data('id')
				};

			App.Index.alertWindow = new App.Comm.modules.Dialog({
				title: "",
				width: 560,
				height: 330,
				isConfirm: false,
				isAlert: false,
				message: new App.Project.Model.contrastInfo().render(data).el
			});

			$(".mod-dialog .wrapper .header").hide();//隐藏头部
			//$(".alertInfo").html(alertInfo);
			$(".mod-dialog,.mod-dialog .wrapper .content").css({"min-height":"auto",padding:0});

		}
	}),

	contrastInfo: Backbone.View.extend({
		tagName: "div",
		className: "contrastInfo",
		template: _.templateUrl('/app/project/modelChange/tpls/contrastInfo.html'),
		events: {
			"click .close": "close"
		},
		render: function(datas) {
			if(datas != undefined){
				var data = {
						projectId: App.Index.Settings.projectId,
						projectVersionId: App.Index.Settings.projectVersionId,
					  currentElementId: datas.currentElementId,
					  baseElementId: datas.baseElementId,
						baseModel: App.Index.Settings.baseModel ,
						currentModel:App.Index.Settings.currentModel
				},
					that=this;
				$.ajax({
					url: "http://bim.wanda-dev.cn/sixD/"+data.projectId+"/"+data.projectVersionId+"/comparison/property?baseModel="+data.baseModel+"&currentModel="+data.currentModel+"&baseElementId="+data.baseElementId+"&currentElementId="+data.currentElementId
				}).done(function(respone){
					if(respone.code==0){
						that.$el.html(that.template({data:respone.data,type:datas.type}));

					}else{
						alert('获取数据失败');
						App.Index.alertWindow.close();

					}
				});


			}else{
				this.$el.html(this.template({data:[]}));
			}
			return this;
		},
		close: function(){
			App.Index.alertWindow.close();
		}
	})
};
