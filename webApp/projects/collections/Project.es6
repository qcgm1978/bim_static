App.Project = {

	//默认参数
	Defaults: {
		type: "user",
		loadingTpl: '<td colspan="10" class="loadingTd">正在加载，请稍候……</td>',
		fetchNavType: 'file', // 默认加载的类型
		projectNav: "", //项目导航 计划 成本 设计 质量
		property: "poperties", // 项目导航 下的 tab  如：检查 属性
		fileId: "",
		token:"",
		isShare:false,
		projectId: "", //项目id
		versionId: "", //版本id		
		attrView: null,
		CurrentVersion: null, //当前版本信息
		DataModel: null //渲染模型的数据
	},

	//空页面
	NullPage: {
		designVerification: '<div class="nullPage concerns"><i class="bg"></i>暂无隐患</div>', //设计检查 质量 隐患
		planModel: '<div class="nullPage noPlan"><i class="bg"></i>暂无计划节点</div>', //计划 模块化 模拟
		planPublicity: '<div class="nullPage publicity"><i class="bg"></i>暂无内容</div>', //计划 关注
		costList: '<div class="nullPage costList"><i class="bg"></i>暂无清单项</div>', //成本 清单
		costChange: '<div class="nullPage costChange"><i class="bg"></i>暂无变更单</div>', //成本 变更
		planVerification: '<div class="nullPage planVerification"><i class="bg"></i> <div>您还没有关联校验</div>  <span>点此进行关联校验</span> </div>', //计划成本 关联校验
	},

	//客户化数据映射字典
	mapData: {
		organizationTypeId: ['', '质监', '第三方', '项目公司', '监理单位'],
		status: ['', '待整改', '已整改', '已关闭'],
		statusColor: ['', '#FF2500', '#FFAD25', '#00A648']
	},

	// 文件 容器
	FileCollection: new(Backbone.Collection.extend({


		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchFileList",

		parse: function(responese) {

			if (responese.code == 0) {
				if (responese.data.length > 0) {
					return responese.data;
				} else {
					$("#projectContainer .fileContainerScroll .changeContrastBox").html('<li class="loading">无数据</li>');
				}

			}
		}

	})),

	//初始化
	init: function() {

		//加载项目
		this.fetchProjectDetail();

	},

	//获取项目信息信息
	fetchProjectDetail: function() {

		var data = {
			URLtype: "fetchProjectDetail",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				data = data.data;
				App.Project.Settings.projectName = data.projectName;
				App.Project.Settings.CurrentVersion = data;
				//加载数据
				App.Project.loadData();
			}
		});

	},



	//加载版本
	loadVersion: function(callback) {
		var data = {
			URLtype: "fetchCrumbsProjectVersion",
			data: {
				projectId: App.Project.Settings.projectId
			}
		};
		App.Comm.ajax(data).done(function(data) {

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}

			if ($.isFunction(callback)) {
				callback(data);
			}
		});
	},

	//渲染版本
	renderVersion: function(data) {

		//成功
		if (data.message == "success") {

			var VersionGroups = data.data,
				gCount = VersionGroups.length,
				cVersionGroup;

			for (var i = 0; i < gCount; i++) {

				if (App.Project.Settings.CurrentVersion) {
					break;
				}

				cVersionGroup = VersionGroups[i];

				var cVersionDate, VersionsDates = cVersionGroup.item,
					dateCount = VersionsDates.length;

				for (var j = 0; j < dateCount; j++) {

					if (App.Project.Settings.CurrentVersion) {
						break;
					}

					cVersionDate = VersionsDates[j];

					var Versions = cVersionDate.version,
						vCount = Versions.length,
						cVersion;
					for (var k = 0; k < vCount; k++) {
						cVersion = Versions[k];
						if (cVersion.latest) {
							App.Project.Settings.projectName = cVersion.projectName;
							App.Project.Settings.CurrentVersion = cVersion;
							break;
						}
					}

				}


			}

			//取到了当前版本
			if (App.Project.Settings.CurrentVersion) {
				//加载数据
				App.Project.loadData();

			} else {
				//无版本 数据错误
				alert("版本获取错误");
			}

		} else {
			alert("版本获取错误");
		}
	},

	// 加载数据
	loadData: function() {

		//var $contains = $("#contains");
		$("#contains").html(new App.Project.ProjectApp().render().el);
		if (App.Project.Settings.CurrentVersion.status != 9) {
			$(".fileContainer .btnFileUpload").show();
			//上传
			App.Project.upload = App.modules.docUpload.init($(document.body));
		} else {
			$(".fileContainer .btnFileUpload").hide();
		}


		// 导航文件
		App.Project.fetchFileNav();
		//导航模型
		//App.Project.fetchModelNav();

		App.Project.FileCollection.projectId = App.Project.Settings.projectId;
		App.Project.FileCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		App.Project.FileCollection.reset();
		//文件列表
		App.Project.FileCollection.fetch({
			data: {
				parentId: App.Project.Settings.fileId
			}
		});


		//初始化滚动条
		App.Project.initScroll();

		//事件初始化
		App.Project.initEvent();

		//全局事件 只绑定一次
		if (!App.Project.Settings.initGlobalEvent) {
			App.Project.Settings.initGlobalEvent = true;
			App.Project.initGlobalEvent();
		}


		//设置项目可查看的属性
		this.setPropertyByAuth();

		//api 页面 默认加载模型
		if (App.Project.Settings.type == "token") {
			$(".breadcrumbNav .fileModelNav li:last").click();
			//分享
			if (window.location.href.indexOf("share") > 10) {
				//初始化分享
				App.Project.Share.init();
			}
		}
	},

	//设置 可以查看的属性
	setPropertyByAuth: function() {

		var projectAuth = App.AuthObj && App.AuthObj.project;

		if (projectAuth) {

			var ProjectTab = App.Comm.AuthConfig.Project,
				$projectTab = $(".projectContainerApp .projectHeader .projectTab");

			//设计
			//if (projectAuth.design) {
			//	$projectTab.append(ProjectTab.DesignTab.tab);
			//}

			//计划
			//if (projectAuth.plan) {
			//	$projectTab.append(ProjectTab.PlanTab.tab);
			//}

			//成本
			if (projectAuth.cost) {
				$projectTab.append(ProjectTab.CostTab.tab);
			}

			//质量
			if (projectAuth.quality) {
				$projectTab.append(ProjectTab.QualityTab.tab);
			}

			$projectTab.find(".item:last").addClass('last');

			// if (!App.AuthObj.project || !App.AuthObj.project.list) {

			// }
		}


	},

	//初始化滚动条
	initScroll: function() {

		$("#projectContainer").find(".projectFileNavContent").mCustomScrollbar({
			set_height: "100%",
			set_width: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});

		$("#projectContainer").find(".projectModelNavContent").mCustomScrollbar({
			set_height: "100%",
			set_width: "100%",
			theme: 'minimal-dark',
			axis: 'yx',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});

		// $("#projectDesignContainer").find(".designContainer").mCustomScrollbar({
		//            set_height: "100%",
		//            set_width:"100%",
		//            theme: 'minimal-dark',
		//            axis: 'y',
		//            keyboard: {
		//                enable: true
		//            },
		//            scrollInertia: 0
		//        });
	},

	//事件初始化
	initEvent: function() {
		//下载
		$("#projectContainer").on("click", ".btnFileDownLoad", function(e) {

			if ($(e.currentTarget).is('.disable')) {
				return
			}
			var $selFile = $("#projectContainer .fileContent :checkbox:checked").parent();

			if ($selFile.length < 1) {
				alert("请选择需要下载的文件");
				return;
			}

			var FileIdArr = [];
			$selFile.each(function(i, item) {
				FileIdArr.push($(this).data("fileversionid"));
			});

			var fileVersionId = FileIdArr.join(",");

			//下载
			App.Comm.checkDownLoad(App.Project.Settings.projectId, App.Project.Settings.CurrentVersion.id, fileVersionId);


			// App.Comm.ajax(data).done(function(){
			// 	console.log("下载完成");
			// });

		});
	},

	//绑定全局事件  document 事件
	initGlobalEvent: function() {
		$(document).on("click.project", function(event) {
			var $target = $(event.target);

			//面包屑 项目
			if ($target.closest(".breadItem.project").length <= 0) {
				$(".breadItem .projectList").hide();
			}

			//面包屑 项目版本
			if ($target.closest(".breadItem.projectVersion").length <= 0) {
				$(".breadItem .projectVersionList").hide();
			}

			//面包屑 切换 文件 模型 浏览器 
			if ($target.closest(".breadItem.fileModelNav").length <= 0) {
				$(".breadItem .fileModelList").hide();
			}
		});
	},

	//根据类型渲染数据
	renderModelContentByType: function() {

		var type = App.Project.Settings.projectNav,
			$rightPropertyContent = $("#projectContainer .rightPropertyContent");


		$rightPropertyContent.children('div').hide()
			//设计
		if (type == "design") {

			$rightPropertyContent.find(".singlePropetyBox").remove();

			var $designPropetyBox = $rightPropertyContent.find(".designPropetyBox");
			if ($designPropetyBox.length > 0) {
				$designPropetyBox.show();
			} else {
				$rightPropertyContent.append(new App.Project.ProjectDesignPropety().render().$el);
				$("#projectContainer .designPropetyBox .projectNav .item:first").click();
			}

		} else if (type == "plan") {

			//计划  
			var $ProjectPlanPropertyContainer = $rightPropertyContent.find(".ProjectPlanPropertyContainer");
			if ($ProjectPlanPropertyContainer.length > 0) {
				$ProjectPlanPropertyContainer.show();
			} else {
				$rightPropertyContent.append(new App.Project.ProjectPlanProperty().render().$el);
				$("#projectContainer .ProjectPlanPropertyContainer .projectNav .item:first").click();
			}


		} else if (type == "cost") {

			//成本  
			var $ProjectCostPropetyContainer = $rightPropertyContent.find(".ProjectCostPropetyContainer");
			if ($ProjectCostPropetyContainer.length > 0) {
				$ProjectCostPropetyContainer.show();
			} else {
				$rightPropertyContent.append(new App.Project.ProjectCostProperty().render().$el);
				$("#projectContainer .ProjectCostPropetyContainer .projectNav .item:first").click();
			}


		} else if (type == "quality") {

			//质量
			var $ProjectQualityNavContainer = $rightPropertyContent.find(".ProjectQualityNavContainer");
			if ($ProjectQualityNavContainer.length > 0) {
				$ProjectQualityNavContainer.show();
			} else {
				$rightPropertyContent.append(new App.Project.ProjectQualityProperty().render().$el);
				$("#projectContainer .ProjectQualityNavContainer .projectNav .item:first").click();
			}

		}


		var $slideBar = $("#projectContainer .rightProperty .slideBar");
		if ($slideBar.find(".icon-caret-left").length > 0) {
			$slideBar.click();
		}

	},

	//设计导航
	fetchFileNav: function() {

		//请求数据
		var data = {
			URLtype: "fetchDesignFileNav",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
			}
		};

		App.Comm.ajax(data).done(function(data) {

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}

			data.click = function(event) {

				var file = $(event.target).data("file");
				// 
				$("#projectContainer .header .ckAll").prop("checked", false);
				//App.Project.FileCollection.parentId=file.id;
				//清空数据
				App.Project.FileCollection.reset();
				App.Project.Settings.fileId = file.fileVersionId;

				App.Project.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			}
			data.iconType = 1;

			if ((data.data || []).length > 0) {
				var navHtml = new App.Comm.TreeViewMar(data);
				$("#projectContainer .projectNavFileContainer").html(navHtml);
			} else {
				$("#projectContainer .projectNavFileContainer").html('<div class="loading">无文件</div>');
			}



			$("#pageLoading").hide();
		});

	},

	//设计模型
	fetchModelNav: function() {
		var data = {
			URLtype: "fetchDesignModelNav"
		};

		App.Comm.ajax(data).done(function(data) {
			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}
			var navHtml = new App.Comm.TreeViewMar(data);
			$("#projectContainer .projectNavModelContainer").html(navHtml);
		});
	},

	//右侧属性是否渲染
	renderProperty: function() {
		var model;
		if (App.Project.Settings.ModelObj) {
			model = App.Project.Settings.ModelObj;
		} else {
			return;
		}

		App.Project.DesignAttr.PropertiesCollection.projectId = App.Project.Settings.projectId;
		App.Project.DesignAttr.PropertiesCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		App.Project.DesignAttr.PropertiesCollection.fetch({
			data: {
				elementId: model.intersect.userId,
				sceneId: model.intersect.object.userData.sceneId
			}
		});
	},

	//属性页 设计成本计划 type 加载的数据
	propertiesOthers: function(type) {

		var that = this;
		//计划
		if (type.indexOf("plan") != -1) {
			App.Project.fetchPropertData("fetchDesignPropertiesPlan", function(data) {
				if (data.code == 0) {

					data = data.data;
					if (!data) {
						return;
					}

					that.$el.find(".attrPlanBox").find(".name").text(data.businessItem).end().find(".strat").
					text(data.planStartTime && new Date(data.planStartTime).format("yyyy-MM-dd") || "").end().
					find(".end").text(data.planEndTime && new Date(data.planEndTime).format("yyyy-MM-dd") || "").end().show();
					//.find(".rEnd").text(data.planFinishDate && new Date(data.planFinishDate).format("yyyy-MM-dd") || "").end().show();

				}
			});
		}
		//成本
		if (type.indexOf("cost") != -1) {
			App.Project.fetchPropertData("fetchDesignPropertiesCost", function(data) {
				if (data.code == 0) {
					if (data.data.length > 0) {
						var html = App.Project.properCostTree(data.data);
						that.$el.find(".attrCostBox").show().find(".modle").append(html);
					}
				}
			});
		}

		//质监标准
		if (type.indexOf("quality") != -1) {

			var liTpl = '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2">varName</div></li>';

			App.Project.fetchPropertData("fetchDesignPropertiesQuality", function(data) {
				if (data.code == 0) {

					if (data.data.length > 0) {
						var lis = '';
						$.each(data.data, function(i, item) {

							var _name=item.name;
							if(/标准$/.test(_name)){
								_name='<a href="#">'+_name+'</a>&nbsp;&nbsp;';
							}else{
								_name='<a href="#">'+_name+'质量标准'+'</a>&nbsp;&nbsp;';
							}

							lis += liTpl.replace("varName", _name);
						});
						that.$el.find(".attrQualityBox").show().find(".modleList").html(lis);
					}

				}
			});
		}
		//模型属性 dwg 图纸
		if (type.indexOf('dwg') != -1) {
			App.Project.attrDwg.apply(this);
		}

		//获取所有类别
					App.Project.fetchClassPropertData(function(res) {
						if (res.code == 0){
							var str = '', liTpl = '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">{property}</div></span> <span class="modleVal end">{value}</span></li>';
							var datas = res.data || [];
							for(var i = 0,prop; i < datas.length; i++){
								prop = datas[i]['properties'];
								if('设计管理成本管理计划管理质量管理'.indexOf(datas[i]['className'])>-1){
									continue
								}else if(prop==null){
									str += '<div class="modle"><i class="modleShowHide"></i><h1 class="modleName">' + datas[i]['className'] + '</h1><ul class="modleList">';

								}else{
									for(var j = 0; j < (prop.length || 0); j++){
										str += '<div class="modle"><i class="modleShowHide"></i><h1 class="modleName">' + datas[i]['className'] + '</h1><ul class="modleList">' + liTpl.replace("{property}", datas[i]['properties'][j]['property']).replace('{value}', datas[i]['properties'][j]['value']);
									}
								}

								str += '</ul></div>';
							}

								that.$el.find(".attrClassBox").html(str);

						}
					});

	},

	//模型属性 dwg 图纸
	attrDwg: function() {

		var modelId = App.Project.Settings.ModelObj.intersect.userId.split('.')[0],
			that = this,
			data = {
				URLtype: 'attrDwg',
				data: {
					projectId: App.Project.Settings.projectId,
					versionId: App.Project.Settings.CurrentVersion.id,
					modelId: modelId
				}
			},

			liTpl = '<li class="modleItem"><a data-id="<%=id%>" href="/static/dist/app/project/single/filePreview.html?id={id}&projectId=' + App.Project.Settings.projectId + '&projectVersionId=' + App.Project.Settings.CurrentVersion.id + '" target="_blank" ><div class="modleNameText overflowEllipsis modleName2">varName</div></a></li>';

		App.Comm.ajax(data, (data) => {
			if (data.code == 0) {

				if (data.data.length > 0) {
					var lis = '';
					$.each(data.data, function(i, item) {
						lis += liTpl.replace("varName", item.name).replace('{id}', item.id);
					});
					that.$el.find(".attrDwgBox").show().find(".modleList").html(lis);
				}
			}
		});


	},

	//属性 数据获取
	fetchPropertData: function(fetchType, callback) {

		var Intersect = App.Project.Settings.ModelObj.intersect;

		var data = {
			URLtype: fetchType,
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				elementId: Intersect.userId,
				sceneId: Intersect.object.userData.sceneId
			}
		};

		App.Comm.ajax(data, callback);
	},

	//类别属性 数据获取
	fetchClassPropertData: function(callback) {

		var Intersect = App.Project.Settings.ModelObj.intersect;

		var data = {
			projectId: App.Project.Settings.projectId,
			//elementId: Intersect.userId,
			//classKey: id
		};

		//App.Comm.ajax(data, callback);
		$.ajax({
			url: "platform/setting/extensions/" + data.projectId + "/property/all"
		}).done(function(data) {
			callback(data)
		});
	},

	//成本树
	properCostTree: function(data) {
		var sb = new StringBuilder(),
			item,
			treeCount = data.length;

		sb.Append('<ul class="modleList">');

		for (var i = 0; i < treeCount; i++) {

			sb.Append('<li class="modleItem" >');
			item = data[i];
			sb.Append(App.Project.properCostTreeItem(item, 0));
			sb.Append('</li>');
		}
		sb.Append('</ul>');
		return sb.toString();
	},

	//tree 节点
	properCostTreeItem: function(item, i) {

		var sb = new StringBuilder(),
			w = i * 12;

		//内容

		sb.Append('<span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">');
		if (item.children && item.children.length > 0) {
			sb.Append('<i class="nodeSwitch on" style="margin-left:' + w + 'px;"></i>');
		} else {
			sb.Append('<i class="noneSwitch" style="margin-left:' + w + 'px;"></i> ');
		}
		sb.Append(item.code);
		sb.Append('</div></span>');
		sb.Append(' <span class="modleVal overflowEllipsis" title="' + item.name + '"> ' + item.name + '</span> ');
		if(item.totalQuantity){
			sb.Append('<span class="modelCostVal  overflowEllipsis" title="'+item.totalQuantity+'&nbsp;'+item.unit+'">'+Number(item.totalQuantity).toFixed(4)+'&nbsp;'+item.unit+'</span>');
		}
		//递归
		if (item.children && item.children.length > 0) {

			sb.Append('<ul class="modleList">');

			var treeSub = item.children,
				treeSubCount = treeSub.length,
				subItem;

			for (var j = 0; j < treeSubCount; j++) {

				sb.Append('<li class="modleItem" > ');
				subItem = treeSub[j];
				sb.Append(App.Project.properCostTreeItem(subItem, i + 1));
				sb.Append('</li>');
			}


			sb.Append('</ul>');
		}

		return sb.toString();
	},

	//在模型中显示
	showInModel: function($target, type) {
		var _this=this,
			ids=$target.data('userId'),
			box=$target.data('box'),
			location=$target.data('location');

		if ($target.hasClass("selected")) {
			return 
		//	$target.parent().find(".selected").removeClass("selected");
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}

		if (ids && box) {
			_this.zoomModel(ids,box);
			_this.showMarks(location);
			return;
		}
		var data = {
			URLtype: "fetchQualityModelById",
			data: {
				type: type,
				projectId: App.Project.Settings.CurrentVersion.projectId,
				versionId: App.Project.Settings.CurrentVersion.id,
				acceptanceId: $target.data("id")
			}
		};
		//获取构件ID type 0：开业验收 1：过程验收 2：隐患
		App.Comm.ajax(data, function(data) {

			if (data.code == 0) {

				if (data.data) {
					var location=data.data.location,
						_temp=JSON.parse(location);
					box=_this.formatBBox(_temp.bBox);
					ids=[_temp.userId];
					$target.data("userId", ids);
					$target.data("box", box);
					$target.data("location",location);
					_this.zoomModel(ids,box);
					_this.showMarks(location);
				}
			}
		});
	},
	
	showMarks:function(marks){
		if(!_.isArray(marks)){
			marks=[marks];
		}
		App.Project.Settings.Viewer.loadMarkers(marks);
	},
	//通过userid 和 boundingbox 定位模型
	zoomModel: function(ids, box) {
		//定位
		App.Project.Settings.Viewer.zoomToBox(box);
		//半透明
		App.Project.Settings.Viewer.translucent(true);
		//高亮
		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: ids
		});
	},

	//定位到模型
	zommBox: function($target) {
		var Ids = [],
			boxArr = [];
		$target.parent().find(".selected").each(function() {
			Ids.push($(this).data("userId"));
			boxArr = boxArr.concat($(this).data("box"));
		});
		App.Project.Settings.Viewer.zoomToBox(boxArr);
		App.Project.Settings.Viewer.translucent(true);
		App.Project.Settings.Viewer.highlight({
			type:'userId',
			ids:Ids
		});

	},


	//计划成本 校验 在模型中 显示
	planCostShowInModel: function(event) {

		var $target = $(event.target),
			$parent = $target.parent();

		if ($target.data("box")) {

			if ($parent.hasClass("selected")) {
				$target.closest("table").find(".selected").removeClass("selected");
			} else {
				$target.closest("table").find(".selected").removeClass("selected");
				$target.parent().addClass("selected");
			}
			App.Project.planCostzommBox($target);
		} else {

			if ($parent.hasClass("selected")) {
				$target.closest("table").find(".selected").removeClass("selected");
				App.Project.planCostzommBox($target);
				return;
			} else {
				$target.closest("table").find(".selected").removeClass("selected");
				$target.parent().addClass("selected");
			}

			var elementId = $target.data("id"),
				sceneId = elementId.split(".")[0],
				that = this;


			var pars = {
				URLtype: "getBoundingBox",
				data: {
					projectId: App.Project.Settings.CurrentVersion.projectId,
					projectVersionId: App.Project.Settings.CurrentVersion.id,
					sceneId: sceneId,
					elementId: elementId
				}
			}


			App.Comm.ajax(pars, function(data) {
				if (data.code == 0 && data.data) {

					var box = [],
						min = data.data.min,
						minArr = [min.x, min.y, min.z],
						max = data.data.max,
						maxArr = [max.x, max.y, max.z];

					box.push(minArr);
					box.push(maxArr);
					//box id
					$target.data("box", box);
					App.Project.planCostzommBox($target);

				}
			});

		}

	},

	planCostzommBox: function($target) {
		var Ids = [],
			boxArr = [],
			$code;

		$target.closest("table").find(".selected").each(function() {
			$code = $(this).find(".code");
			Ids.push($code.data("id"));
			boxArr = boxArr.concat($code.data("box"));
		});

		App.Project.Settings.Viewer.highlight(Ids);
		App.Project.Settings.Viewer.zoomToBox(boxArr);
	},

	userProps: function(param) {
		var _this = this;
		var dataObj = {
			URLtype: "fetchFileByModel",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId,
				modelId: App.Project.Settings.ModelObj.intersect.object.userData.sceneId
			}
		}
		App.Comm.ajax(dataObj, function(data) {
			var _ = param[0].items;
			_.push({
				name: "文件名",
				value: data.data.name
			})
			_.push({
				name: "专业",
				value: data.data.specialty
			})
			_.push({
				name: "楼层",
				value: data.data.floor
			})
			_this.$el.html(_this.template(param));
			if ($('.design').hasClass('selected')) {
				App.Project.propertiesOthers.call(_this, "plan|cost|quality|dwg");
			}
		})
	},

	//转换bounding box数据
	formatBBox: function(data) {
		if(!data){
			return [];
		}
		var box = [],
			min = data.min,
			minArr = [min.x, min.y, min.z],
			max = data.max,
			maxArr = [max.x, max.y, max.z];
		box.push(minArr);
		box.push(maxArr);
		return box;
	}



}