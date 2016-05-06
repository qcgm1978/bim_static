/**
 * @require /app/project/modelChange/js/collection.es6
 */
App.Index = {

	Settings: {
		projectId: "",
		projectVersionId: "",
		referenceId: "",
		referenceVersionId: "",
		baseFileVersionId: "",
		differFileVersionId: "",
		ModelObj: "",
		modelId: "",
		diffModleId: "",
		Viewer: null,
		FileType: {
			AR: "建筑",
			ST: "结构",
			AC: "暖通",
			EL: "电气",
			TE: "智能化",
			PL: "给排水",
			CI: "市政",
			FP: "消防",
			TP: "动力",
			IN: "内装",
			DS: "导向标识",
			LC: "景观",
			CW: "幕墙",
			LI: "照明",
			LR: "采光顶",
			FL: "泛光",
			"IN&DS": "内装&标识",
			"LC&CI": "景观&小市政",
			"CW&FL": "幕墙&泛光",
			OT: "其他专业"
		}
	},


	//事件绑定
	bindEvent() {

		var that = this,
			$projectContainer = $("#projectContainer");

		//切换属性tab
		$projectContainer.on("click", ".projectPropetyHeader .item", function() {
			App.Index.Settings.property = $(this).data("type");
			//属性
			if (App.Index.Settings.property == "attr") {
				that.renderAttr(App.Index.Settings.ModelObj);
			}

			that.renderAttr(App.Index.Settings.ModelObj);
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

		//tree toggle show  hide
		$projectContainer.on("click", ".nodeSwitch", function(event) {
			var $target = $(this);

			if ($target.hasClass("on")) {
				$target.closest("li").children("ul").hide();
				$target.removeClass("on");
			} else {
				$target.closest("li").children("ul").show();
				$target.addClass("on");
			}
			event.stopPropagation();
		})

		//列表点击
		$projectContainer.on("click", ".designChange .itemContent", function() {


			var $target = $(this);


			if ($target.hasClass("selected")) {
				$target.closest(".treeRoot").find(".selected").removeClass("selected");
				//$target.removeClass("selected");
			} else {
				$target.closest(".treeRoot").find(".selected").removeClass("selected");
				$target.addClass("selected");
			}

			var Ids = [];

			if ($target.data("cate")) {

				$target.closest(".treeRoot").find(".selected").each(function() {
					Ids = $.merge(Ids, $(this).data("cate"))
				});

				App.Index.Settings.Viewer.selectIds(Ids);
				App.Index.Settings.Viewer.zoomSelected();

				// App.Index.Settings.Viewer.highlight({
				// 	type: "userId",
				// 	ids: Ids
				// })

				return;
			}


			var data = {
				URLtype: "fetchCostModleIdByCode",
				data: {
					projectId: App.Index.Settings.projectId,
					projectVersionId: App.Index.Settings.projectVersionId,
					costCode: $target.data("code")
				}
			};

			App.Comm.ajax(data, function(data) {
				if (data.code == 0) {

					$target.data("cate", data.data);

					$target.closest(".treeRoot").find(".selected").each(function() {
						Ids = $.merge(Ids, $(this).data("cate"))
					});

					App.Index.Settings.Viewer.selectIds(Ids);
					App.Index.Settings.Viewer.zoomSelected();

					// App.Index.Settings.Viewer.highlight({
					// 	type: "userId",
					// 	ids: Ids
					// })
				}
			});

		});

		$(".showChange .groupRadio").myRadioCk({
			click: function(argument) {
				if ($(this).find(".selected").length > 0) {
					var diff = App.Index.Settings.differFileVersionId;
					if (diff) {
						App.Index.getModelId(diff, function(data) {
							if (data.code == 0) {
								App.Index.Settings.Viewer.load(App.Index.Settings.modelId, data.data.modelId);
							}
						});
					}


				} else {
					App.Index.Settings.Viewer.load(App.Index.Settings.modelId);
				}
			}
		});

		this.bindTreeScroll();

	},

	initPars: function() {

		var Request = App.Index.GetRequest();
		App.Index.Settings.projectId = Request.projectId;
		App.Index.Settings.projectVersionId = Request.projectVersionId;
		App.Index.Settings.referenceId = Request.referenceId;
		App.Index.Settings.referenceVersionId = Request.referenceVersionId;

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
	renderModel(differFileVersionId) {


		var that = this;
		App.Index.Settings.Viewer = null;
		this.getModelId(differFileVersionId, function(data) {

			if (data.message != "success") {
				alert("转换失败");
				return;
			}

			App.Index.Settings.modelId = data.data.modelId;

			var Model = data.data;

			if (data.data.modelStatus == 1) {
				alert("模型转换中");
				return;
			} else if (data.data.modelStatus == 3) {
				alert("转换失败");
				return;
			}

			App.Index.Settings.Viewer = new BIM({
				single: true,
				element: $("#contains .projectCotent")[0],
				etag: data.data.modelId,
				tools: true
			});



			App.Index.Settings.Viewer.on("click", function(model) {

				App.Index.Settings.ModelObj = null;
				if (!model.intersect) {
					return;
				}


				App.Index.Settings.ModelObj = model;
				//属性
				if (App.Index.Settings.property == "attr") {
					that.renderAttr(App.Index.Settings.ModelObj);
				}

			});

		});

	},

	//渲染属性
	renderAttr() {


		if (!App.Index.Settings.ModelObj || !App.Index.Settings.ModelObj.intersect) {
			$("#projectContainer .designProperties").html(' <div class="nullTip">请选择构件</div>');
			return;
		}

		var data = {
			URLtype: "projectDesinProperties",
			data: {
				projectId: App.Index.Settings.projectId,
				projectVersionId: App.Index.Settings.projectVersionId,
				elementId: App.Index.Settings.ModelObj.intersect.userId,
				baseFileVerionId: App.Index.Settings.baseFileVersionId,
				fileVerionId: App.Index.Settings.differFileVersionId,
				sceneId: App.Index.Settings.ModelObj.intersect.object.userData.sceneId || ""
			}
		};

		App.Comm.ajax(data, function(data) {
			var template = _.templateUrl("/app/project/projectChange/tpls/proterties.html");
			$("#projectContainer .designProperties").html(template(data.data));
			//获取构建成本
			App.Index.getAcquisitionCost();
		});

	},

	//获取构建成本
	getAcquisitionCost() {

		var data = {
			URLtype: "projectDesinPropertiesCost", //projectChangeList
			data: {
				projectId: App.Index.Settings.projectId,
				projectVersionId: App.Index.Settings.projectVersionId,
				elementId: App.Index.Settings.ModelObj.intersect.userId,
				baseFileVerionId: App.Index.Settings.baseFileVersionId,
				fileVerionId: App.Index.Settings.differFileVersionId,
				sceneId: App.Index.Settings.ModelObj.intersect.object.userData.sceneId || ""
			}
		};

		App.Comm.ajax(data, function(data) {
			var treeRoot = _.templateUrl('/app/project/projectChange/tpls/treeRoot.html');
			var treeNode = _.templateUrl('/app/project/projectChange/tpls/treeNode.html');
			data.treeNode = treeNode;
			$(".designProperties .attrCostBox .modleList").append(treeRoot(data));
			$(".attrCostBox li .itemContent").addClass("odd");
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

	//获取变更文件
	fetchFileType() {

		var data = {
				URLtype: "fileList",
				data: {
					projectId: App.Index.Settings.projectId,
					versionId: App.Index.Settings.projectVersionId
				}
			},
			that = this;



		App.Comm.ajax(data, function(data) {

			var list = data.data,
				lists = [],
				items;

			//生成 二级 目录
			$.each(list, function(i, item) {

				item.specialty = App.Index.Settings.FileType[item.specialty];

				items = _.findWhere(lists, {
					"specialty": item.specialty
				});
				if (items) {
					items.data.push(item);
				} else {
					lists.push({
						"specialty": item.specialty,
						data: [item]
					});
				}

			});

			var firstData = lists[0].data[0];

			//渲染模型
			that.renderModel(firstData.differFileVersionId);

			//变更获取
			that.fetchChangeList(firstData.baseFileVersionId, firstData.differFileVersionId);

			var template = _.templateUrl("/app/project/projectChange/tpls/fileList.html");

			var c = template(lists);



			$(".projectNavContentBox .projectChangeListBox:first").prepend(c);
			//下拉 事件绑定
			$(".projectNavContentBox .projectChangeListBox:first .specialitiesOption").myDropDown({
				click: function($item) {
					var groupText = $item.closest(".groups").prev().text() + "：";
					$(".specialitiesOption .myDropText span:first").text(groupText);
					var baseFileVersionId = $item.data("basefileversionid"),
						differFileVersionId = $item.data("differfileversionid");

					that.renderModel(differFileVersionId);
					that.fetchChangeList(baseFileVersionId, differFileVersionId);

				}
			});

		});

	},

	//获取更改清单
	fetchChangeList: function(baseFileVersionId, differFileVersionId) {

		App.Collections.changeListCollection.projectId = App.Index.Settings.projectId;
		App.Collections.changeListCollection.projectVersionId = App.Index.Settings.projectVersionId;

		App.Index.Settings.baseFileVersionId = baseFileVersionId;
		App.Index.Settings.differFileVersionId = differFileVersionId;

		App.Collections.changeListCollection.reset();
		App.Collections.changeListCollection.fetch({
			data: {
				baseFileVerionId: baseFileVersionId,
				fileVerionId: differFileVersionId
			}
		});


		$("#treeContainerBody").html(new App.Views.projectChangeListView().render().el);

	},


	init() {

		//初始化参数
		this.initPars();
		//事件绑定
		this.bindEvent();
		//获取文件裂隙
		this.fetchFileType();


	}


}
