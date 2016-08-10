App.Project = {

	markerClick:function(marker){
		var id=marker.id;
		if($(".QualityProcessAcceptance").is(":visible")){
			var tr=$(".QualityProcessAcceptance .tbProcessAccessBody tr");
			tr.each(function(){
				if($(this).data('id')==id){
					tr.removeClass('selected');
					$(this).addClass("selected");
				}
			})
		}
		if($(".QualityOpeningAcceptance").is(":visible")){
			var tr=$(".QualityOpeningAcceptance .tbOpeningacceptanceBody tr");
			tr.each(function(){
				if($(this).data('id')==id){
					tr.removeClass('selected');
					$(this).addClass("selected");
				}
			})
		}
	},

	//过滤规则
	filterRule:{
		//单文件：过滤出检查点所在构件所在的文件
		file:'工程桩,基坑支护,钢结构悬挑构件,幕墙,采光顶',
		//单独类型：singleRule
		single:'梁柱节点,地下防水,步行街吊顶风口,卫生间防水,外保温',
		floor:''
	},

	marginRule:{
		'基坑支护':{
			margin:0.2,
			ratio:1.0
		},
		'梁柱节点':{
			margin:0.8,
			ratio:2.0
		},
		'外保温':{
			margin:0.5,
			ratio:1.0
		},
		'地下防水':{
			margin:1,
			ratio:1.0
		},
		'幕墙':{
			margin:1,
			ratio:1.0
		}
	},
	//单独类型、自定义过滤规则
	sigleRule:function(cat,floor){
		var _this=this,
			_v=App.Project.Settings.Viewer,
			_spFiles=_v.SpecialtyFileObjData,//专业文件数据对象
			_ctFiles=_v.ComponentTypeFilesData;//结构类型数据对象
		if(cat=='地下防水'){
			this.linkSilder('floors',floor);
			this.linkSilderSpecial('specialty','WDGC-Q-ST-垫层防水层.rvt');
		}
		if(cat=='梁柱节点'){
			this.linkSilder('floors',floor);
			this.linkSilderSpecial('specialty','WDGC-Q-ST-'+floor+'.rvt');
			this.linkSilderCategory('category','楼板')
		}
		if(cat=='外保温'){
			App.Project.Settings.Viewer.filter({
				ids:_this.filterCCode(['10.10.20.03.06.20.10','10.10.30.03.09']),
				type:"classCode"
			})
		}
		if(cat=='步行街吊顶风口'||cat=='卫生间防水'){
			this.linkSilder('floors',floor);
			this.linkSilderSpecial('specialty',['WDGC-Q-AC-'+floor+'.rvt','WDGC-Q-IN&DS-'+floor+'.rvt'].join(','))
		}
	},
	filterCCode:function(code){
		var _class=App.Project.Settings.Viewer.ClassCodeData,
			hide=[];
			if(typeof code =='string'){
				code=[code];
			}
		_.each(_class,function(item){
			_.each(code,function(i){
				if(item.code.indexOf(i)!=0){
					hide.push(item.code);
				}
			})
		})
		return hide;
	},
	//默认参数
	Defaults: {
		type: "user",
		loadingTpl: '<td colspan="10" class="loadingTd">正在加载，请稍候……</td>',
		fetchNavType: 'file', // 默认加载的类型
		projectNav: "", //项目导航 计划 成本 设计 质量
		property: "poperties", // 项目导航 下的 tab  如：检查 属性
		fileId: "",
		token: "",
		isShare: false,
		searchText: "", //搜索的文本
		projectId: "", //项目id
		versionId: "", //版本id		
		viewPintId: "", //批注id 存在此id直接跳转到 批注
		attrView: null,
		CurrentVersion: null, //当前版本信息
		DataModel: null //渲染模型的数据
	},

	//计划状态
	planStatus: {
		0: '',
		1: 'myIcon-circle-red',
		2: 'myIcon-circle-yellow',
		3: 'myIcon-circle-green'
	},
	formatPointPlace:function(p,t){
		if(p==0 &&　t==0){
			return '--';
		}else{
			return p+"/"+t;
		}
	},
	//空页面
	NullPage: {
		designVerification: '<div class="nullPage concerns"><i class="bg"></i>暂无隐患</div>', //设计检查 质量 隐患
		planModel: '<div class="nullPage noPlan"><i class="bg"></i>暂无计划节点</div>', //计划 模块化 模拟
		planPublicity: '<div class="nullPage publicity"><i class="bg"></i>暂无内容</div>', //计划 关注
		costList: '<div class="nullPage costList"><i class="bg"></i>暂无清单项</div>', //成本 清单
		costChange: '<div class="nullPage costChange"><i class="bg"></i>暂无变更单</div>', //成本 变更
		planVerification: '<div class="nullPage planVerification"><i class="bg"></i> <div>您还没有关联校验</div>  <span>点此进行关联校验</span> </div>' //计划成本 关联校验
	},

	//客户化数据映射字典
	mapData: {
		organizationTypeId: ['', '质监', '第三方', '项目公司', '监理单位'],
		status: ['', '待整改', '已整改', '已关闭'],
		statusColor: ['', '#FF2500', '#FFAD25', '#00A648'],
		processCategory: ['', '工程桩', '基坑支护', '地下防水', '梁柱节点', '钢结构悬挑构件', '幕墙', '外保温',
			'采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房',
			'湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑',
			'吊顶', '地面', '中庭栏杆', '竖井'
		],
		openCategory: ['', '幕墙',
			'采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房',
			'湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑',
			'吊顶', '地面', '中庭栏杆', '竖井'
		],
		concernsCategory: ['', '过程检查', '过程验收', '开业验收'],
		concernsStatus: ['', '待整改', '已整改', '已关闭'],
		concernsReporter: ['', '质监中心', '第三方', '项目公司', '监理单位'],
		concernsLevel: ['', '一般', '较大', '重大', '特大'],
		concernsType: ['', '防水工程', '施工质量', '安全文明', '材料设备'],
		designSpecial: ['', '建筑', '结构', '设备', '电气', '景观', '内装及导视', '夜景照明'],
		designCategory: ['', '安全类', '品质类', '功能类'],
		designStatus: ['', '待整改', '已整改', '已关闭'],
		designUnit: ['', '设计总包'],
		deviceSpecial: ['', '通风空调'],
		deviceCategory: ['', '冷冻水', '冷却水'],
		deviceStatus: ['', '合格', '有退场']
	},

	//用于切换Tab Flag 请勿修改
	currentQATab: 'other',
	currentLoadData: {
		open: null,
		process: null,
		dis: null
	},

	checkStatus: function(color) {
		if (color == 1) {
			return 'myIcon-circle-green';
		} else if (color == 2) {
			return 'myIcon-circle-red';
		} else {
			return '';
		}
	},

	recoverySilder:function(){
		var show='建筑,结构,景观,幕墙,采光顶,内装&标识',
			hide='暖通,电气,智能化,给排水';
		var $treeText = $('.modelSidebar #specialty ul .treeText');
		$treeText.each(function() {
			var _ = $(this).parent().find('input');
			if (show.indexOf($(this).text())!=-1) {
				if(_.is(':checked')){
					_.trigger('click');
				}
				_.trigger('click');
			}else if(hide.indexOf($(this).text())!=-1){
				if(!_.is(':checked')){
					_.trigger('click');
				}
				_.trigger('click');
			}
		})

	},

	linkSilder: function(type, key) {
		if (!key) {
			return
		}
		var $check = $('.modelSidebar #' + type + ' ul input'),
			$treeText = $('.modelSidebar #' + type + ' ul .treeText');
		$check.each(function() {
			if ($(this).is(':checked') && $(this).closest('.itemContent').find('.treeText').text() != key) {
				$(this).trigger('click');
			}
		})
		$treeText.each(function() {
			var _ = $(this).parent().find('input');
			if ($(this).text() == key && !_.is(':checked')) {
				_.trigger('click');
			}
		})
	},
	linkSilderSpecial: function(type, key) {
		if (!key) {
			return
		}
		var $check = $('.modelSidebar #' + type + ' input'),
			$treeText = $('.modelSidebar #' + type + ' .treeText');
		this.recoverySilder();
		$check.each(function() {
			if ($(this).is(':checked')) {
				$(this).trigger('click');
			}
		})
		$treeText.each(function() {
			var _ = $(this).parent().find('input');
			if (key.indexOf($(this).text())!=-1) {
				_.trigger('click');
			}
		})
	},
	linkSilderCategory: function(type, key) {
		if (!key) {
			return
		}
		var $check = $('.modelSidebar #' + type + ' input'),
			$treeText = $('.modelSidebar #' + type + ' .treeText');
		$check.each(function() {
			if (!$(this).is(':checked')) {
				$(this).trigger('click');
			}
		})
		$treeText.each(function() {
			var _ = $(this).parent().find('input');
			if ($(this).text() == key) {
				_.trigger('click');
			}
		})
	},

	cacheMarkers: function(type, data) {
		this.currentLoadData[type] = data;
		if (type == 'process') {
			App.Project.isShowMarkers(type, $('.QualityProcessAcceptance .btnCk').hasClass('selected'));
		} else if (type == 'open') {
			App.Project.isShowMarkers('open', $('.QualityOpeningAcceptance .btnCk').hasClass('selected'));
		} else if (type == 'dis') {
			App.Project.isShowMarkers('dis', $('.QualityConcerns .btnCk').hasClass('selected'));
		}
	},

	//是否显示标记
	//type tab类型 flag 是否显示的标记
	//type:open process dis other
	isShowMarkers: function(type, flag) {
		var _this = this;
		var viewer = App.Project.Settings.Viewer;
		if (!viewer) return;
		if (type != 'other' && flag) {
			var shaType=type=='dis'?1:0;
			var data = this.currentLoadData[type],
				result = [],
				boxs=[];
			if (_.isArray(data)) {
				_.each(data, function(i) {
					if (i.location.indexOf('boundingBox') != -1) {
						if(type=='dis'){
							var _loc=JSON.parse(i.location);
							_loc.position=JSON.parse(i.axis).position;
							result.push(_this.formatMark(_loc,"S021".charAt(i.status),i.id,1));
							boxs.push(_loc.boundingBox);
						}else{
							var _loc=JSON.parse(i.location);
							boxs.push(_loc.boundingBox);
							result.push(_this.formatMark(i.location,'543'.charAt(i.colorStatus),i.id));
						}
					}
				})
				App.Project.Settings.Viewer.setTopView(boxs,true);
				viewer.viewer.setMarkerClickCallback(App.Project.markerClick);
				viewer.loadMarkers(result);
			}
		} else {
			viewer.loadMarkers(null);
		}
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

	bindContextMenu: function($el) {
		var _this = this;
		//右键菜单
		if (!document.getElementById("listContextProject")) {
			//右键菜单
			var contextHtml = _.templateUrl("/projects/tpls/listContext.html", true);
			$("body").append(contextHtml);
		}

		$el.contextMenu('listContextProject', {
			//显示 回调
			onShowMenuCallback: function(event) {
				event.preventDefault();
				var $item = $(event.target).closest(".item");
				$("#reNameModelProject").removeClass('disable');
				//预览
				if ($item.find(".folder").length > 0) {
					$("#previewModelProject").addClass("disable");
					$("#previewModelProject").find("a").removeAttr("href");
				} else {

					$("#previewModelProject").removeClass("disable");
					var href = $item.find(".fileName .text").prop("href");
					$("#previewModelProject").find("a").prop("href", href);

					//重命名 未上传
					if ($item.data("status") == 1) {
						$("#reNameModelProject").addClass('disable');
					}

				}

				/*if (
					App.Project.Settings.CurrentVersion.status == 4 ||
					App.Project.Settings.CurrentVersion.status == 7 ||
					App.Project.Settings.CurrentVersion.status == 9 ||
					App.Project.Settings.CurrentVersion.subType == 1) {
					$("#reNameModelProject").addClass('disable').attr('disabled', 'disabled');
					$("#delModelProject").addClass('disable').attr('disabled', 'disabled');
				}*/
				if (!App.Comm.isAuth('rename')) {
					$("#reNameModelProject").addClass('disable').attr('disabled', 'disabled');
				}
				if (!App.Comm.isAuth('delete')) {
					$("#delModelProject").addClass('disable').attr('disabled', 'disabled');
				}
				$item.addClass("selected").siblings().removeClass("selected");
				if ($('#listContextProject li[class!=disable]').length == 0) {
					$('#listContextProject').parent().hide();
				}
			},
			shadow: false,
			bindings: {
				'previewModel': function($target) {},
				'downLoadModelProject': function(item) {

					var $item = $(item),
						//下载链接 
						fileVersionId = $item.find(".filecKAll").data("fileversionid");

					App.Comm.checkDownLoad(App.Project.Settings.projectId, App.Project.Settings.CurrentVersion.id, fileVersionId);
  
				},
				'delModelProject': function(item) {
					var rel = $('#delModelProject'),
						$item = $(item);
					if (rel.hasClass('disable')) {
						return;
					}
					_this.delFile($item);
				},
				'reNameModelProject': function(item) {
					//重命名
					let $reNameModel = $("#reNameModelProject");
					//不可重命名状态
					if ($reNameModel.hasClass('disable')) {
						return;
					}
					var $prevEdit = $(".fileContent .txtEdit");
					if ($prevEdit.length > 0) {
						_this.cancelEdit($prevEdit);
						return
					}
					var $item = $(item),
						$fileName = $item.find(".fileName"),
						text = $item.find(".text").hide().text().trim();
					$fileName.append('<input type="text" value="' + text + '" class="txtEdit txtInput" /> <span class="btnEnter myIcon-enter"></span><span class="btnCalcel pointer myIcon-cancel"></span>');
				}
			}
		});
	},

	addNewFileModel() {
		var model = {
			isAdd: true,
			children: null,
			createTime: null,
			creatorId: "",
			creatorName: "",
			digest: null,
			fileVersionId: null,
			floor: null,
			folder: true,
			id: 'createNew',
			length: null,
			locked: null,
			modelId: null,
			modelStatus: null,
			modificationId: null,
			name: "新建文件夹",
			parentId: null,
			projectId: null,
			specialty: null,
			status: null,
			suffix: null,
			thumbnail: null
		}
		App.Project.FileCollection.push(model)
	},
	afterCreateNewFolder(file, parentId) {
		var $treeViewMar = $(".projectNavFileContainer .treeViewMar"),
			$treeViewMarUl = $treeViewMar.find(".treeViewMarUl");

		var data = {
			data: [file],
			iconType: 1
		};

		if ($treeViewMar.find('span[data-id="' + file.id + '"]').length > 0) {
			return;
		}

		//没有的时候绑定点击事件
		if ($treeViewMarUl.length <= 0) {
			data.click = function(event) {
				var file = $(event.target).data("file");
				if (file.folder) {
					$('#projectContainer .returnBack').attr('isReturn', '1').removeClass('theEnd').html('返回上级');
				}
				$("#projectContainer .fileContent").empty();
				App.Project.Settings.fileVersionId = file.fileVersionId;
				App.Project.FileCollection.reset();
				App.Project.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});

			}
		}
		var navHtml = new App.Comm.TreeViewMar(data);
		//不存在创建
		if ($treeViewMarUl.length <= 0) {
			$treeViewMar.html($(navHtml).find(".treeViewMarUl"));
		} else {
			if (parentId) {
				var $span = $treeViewMarUl.find("span[data-id='" + parentId + "']");
				if ($span.length > 0) {
					var $li = $span.closest('li');
					if ($li.find(".treeViewSub").length <= 0) {
						$li.append('<ul class="treeViewSub mIconOrCk" style="display:block;" />');
					}

					var $itemContent = $li.children('.item-content'),
						$noneSwitch = $itemContent.find(".noneSwitch");

					if ($noneSwitch.length > 0) {
						$noneSwitch.toggleClass('noneSwitch nodeSwitch on');
					}
					var $newLi = $(navHtml).find(".treeViewMarUl li").removeClass("rootNode").addClass('itemNode');
					$li.find(".treeViewSub").prepend($newLi);
				}

			} else {
				$treeViewMarUl.prepend($(navHtml).find(".treeViewMarUl li"));
			}
		}

	},
	createNewFolder: function($item) {
		var filePath = $item.find(".txtEdit").val().trim(),
			that = this,
			$leftSel = $("#projectContainer .treeViewMarUl .selected"),
			parentId = "";
		if ($leftSel.length > 0) {
			parentId = $leftSel.data("file").fileVersionId;
		}
		// //请求数据
		var data = {
			URLtype: "createNewFolder",
			type: "POST",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				parentId: parentId,
				filePath: filePath
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.message == "success") {
				var id = data.data.id,
					isExists = false;
				$.each(App.Project.FileCollection.models, function(i, item) {
					if (item.id == id) {
						isExists = true;
						return false;
					}
				});

				//已存在的不在添加 返回
				if (isExists) {
					that.cancelEdit($item.find(".fileName"));
					return;
				}

				var models = App.Project.FileCollection.models;
				data.data.isAdd = false;
				//修改数据
				App.Project.FileCollection.last().set(data.data);

				App.Project.afterCreateNewFolder(data.data, parentId);
				//tree name
				//$("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);


			}
		});

	},

	afterRemoveFolder(file) {

		if (!file.folder) {
			return;
		}

		var $treeViewMarUl = $("#projectContainer .treeViewMarUl");

		if ($treeViewMarUl.length > 0) {
			var $span = $treeViewMarUl.find("span[data-id='" + file.id + "']");
			if ($span.length > 0) {
				var $li = $span.closest('li'),
					$parent = $li.parent();
				$li.remove();
				//没有文件夹了
				if ($parent.find("li").length <= 0) {
					$parent.parent().children(".item-content").find(".nodeSwitch").removeClass().addClass("noneSwitch");
				}

			}

		}

	},

	delFile: function($item) {
		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 168,
			limitHeight: false,
			title: '删除文件提示',
			cssClass: 'deleteFileDialog',
			okClass: "delFile",
			okText: '确&nbsp;&nbsp;认',
			okCallback: function() {
				var fileVersionId = $item.find(".filecKAll").data("fileversionid"),
					id = $item.find(".text").data("id"),
					models = App.Project.FileCollection.models;
				//修改数据
				$.each(models, function(i, model) {
					if (model.toJSON().id == id) {
						model.urlType = "deleteFile";
						model.projectId = App.Project.Settings.CurrentVersion.projectId;
						model.projectVersionId = App.Project.Settings.CurrentVersion.id;
						model.fileVersionId = fileVersionId;
						model.destroy();
						return false;
					}
				});
			},
			message: $item.find(".folder").length > 0 ? "确认要删除该文件夹么？" : "确认要删除该文件么？"
		});
	},
	//取消修改名称
	calcelEditName: function(event) {
		var $prevEdit = $("#projectContainer .txtEdit");
		if ($prevEdit.length > 0) {
			this.cancelEdit($prevEdit);
		}
		return false;
	},
	//取消修改
	cancelEdit: function($prevEdit) {
		var $item = $prevEdit.closest(".item");
		if ($item.hasClass('createNew')) {
			//取消监听 促发销毁
			var model = App.Project.FileCollection.last();
			model.stopListening();
			model.trigger('destroy', model, model.collection);
			App.Project.FileCollection.models.pop();
			//删除页面元素
			$item.remove();
		} else {
			$prevEdit.prev().show().end().nextAll().remove().end().remove();
		}

	},

	editFolderName: function($item) {
		var that = this,
			fileVersionId = $item.find(".filecKAll").data("fileversionid"),
			name = $item.find(".txtEdit").val().trim();
		// //请求数据
		var data = {
			URLtype: "putFileReName",
			type: "PUT",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				fileVersionId: fileVersionId,
				name: encodeURI(name)
			}
		};

		App.Comm.ajax(data, function(data) {
			var $prevEdit = $item.find(".txtEdit");
			if (data.code == 0) {
				var id = data.data.id,
					models = App.Project.FileCollection.models;
				$("#projectContainer .treeViewMarUl span[data-id='" + id + "']").text(name);

				$.each(models, (i, model) => {
					var dataJson = model.toJSON();
					if (dataJson.id == id) {
						model.set(data.data);
						return false;
					}
				});

			} else {
				$.tip({
					type: 'alarm',
					message: '操作失败:' + data.message
				})
			}
			if ($prevEdit.length > 0) {
				$prevEdit.prev().show().end().nextAll().remove().end().remove();
			}

		});
	},
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
		var status = App.Project.Settings.CurrentVersion.status;
		if (status != 9 && status != 4 && status != 7) {
			//上传
			App.Project.upload = App.modules.docUpload.init($(document.body));
		}

		//api 页面 默认加载模型
		if (App.Project.Settings.type == "token" && App.Project.Settings.loadType=="model") {
			$("#projectContainer").find(".fileContainer").hide().end().find(".modelContainer").show(); 
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
		if (App.Project.Settings.type == "token" && App.Project.Settings.loadType=="model") { 
			$(".fileNav .model").click();
			//分享
			// if (window.location.href.indexOf("share") > 10) {
			// 	//初始化分享
			// 	App.Project.Share.init();
			// }
		}

		//存在viewpintid
		if (App.Project.Settings.viewPintId) {
			$(".fileNav .model").click();

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
		var _this = this;
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

		//新建文件
		$("#projectContainer").on("click", ".btnNewFolder", function(e) {

			if ($(e.currentTarget).is('.disable')) {
				return
			}
			_this.addNewFileModel();

		});
		//新建文件
		$("#projectContainer").on("click", ".returnBack", function(e) {

			if ($(e.currentTarget).is('.disable')) {
				return
			}
			_this.returnBack(e);

		});

		//删除
		$("#projectContainer").on("click", ".btnFileDel", function(e) {
			if ($(e.currentTarget).is('.disable')) {
				return
			}
			var $selFile = $("#projectContainer .fileContent :checkbox:checked").parent();

			if ($selFile.length < 1) {
				App.Services.Dialog.alert('请选择需要删除的文件...');
				return;
			}
			if ($selFile.length > 1) {
				App.Services.Dialog.alert('目前只支持单文件删除...');
				return;
			}
			var $item = $selFile.closest(".item");
			_this.delFile($item);
		});
	},

	isDisabled(name) {
		var Auth = App.AuthObj && App.AuthObj.project && 　App.AuthObj.project.prjfile;
		Auth = Auth || {};
		if (!Auth[name]) {
			return true
		}
		return false;
	},
	returnBack: function(e) {
		if ($(e.currentTarget).attr('isReturn') == '0') {
			return
		}
		var $currentLevel = $('#projectContainer .treeViewMarUl .selected');
		var file = $currentLevel.data('file');
		var parentId = file.parentId;
		var $parent = $('#projectContainer .treeViewMarUl span[data-id="' + parentId + '"]');
		if ($parent.length) {
			$parent.click();
		} else {
			$(e.currentTarget).attr('isReturn', '0').addClass('theEnd').html('全部文件');
			App.Project.FileCollection.projectId = App.Project.Settings.projectId;
			App.Project.FileCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
			App.Project.FileCollection.reset();
			//文件列表
			App.Project.FileCollection.fetch({
				data: {
					parentId: ''
				}
			});
			//	this.loadData();
		}
	},
	//绑定全局事件  document 事件
	initGlobalEvent: function() {
		$(document).on("click.project", function(event) {
			var $target = $(event.target);

			//面包屑 项目
			if ($target.closest(".breadItem.project").length <= 0) {
				$(".breadItem .projectList").find(".txtSearch").val("").end().hide();
			}

			//面包屑 项目版本
			if ($target.closest(".breadItem.projectVersion").length <= 0) {
				$(".breadItem .projectVersionList").find(".txtSearch").val("").end().hide();
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


		$rightPropertyContent.children('div').hide();
		App.Project.isShowMarkers('other');
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
				var item = $ProjectQualityNavContainer.find('.projectNav .selected');
				if (item && item.length) {
					var t = item.first().data('type');
					if (t == 'processacceptance') {
						App.Project.isShowMarkers('process', $('.QualityProcessAcceptance .btnCk').hasClass('selected'));
					} else if (t == 'openingacceptance') {
						App.Project.isShowMarkers('open', $('.QualityOpeningAcceptance .btnCk').hasClass('selected'));
					} else if (t == 'concerns') {
						App.Project.isShowMarkers('dis', $('.QualityConcerns .btnCk').hasClass('selected'));
					}
				}
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
				if (file.folder) {
					$('#projectContainer .returnBack').attr('isReturn', '1').removeClass('theEnd').html('返回上级');
				}
				// 
				$("#projectContainer .header .ckAll").prop("checked", false);
				//App.Project.FileCollection.parentId=file.id;
				//清空数据
				App.Project.FileCollection.reset();

				//清除搜索
				$("#projectContainer .fileContainer").find(".clearSearch").hide().end().
				find(".opBox").show().end().
				find(".searchCount").hide().end().
				find("#txtFileSearch").val("");
				App.Project.Settings.searchText = "";

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

							var _name = item.name,
								url = item.url || '###';
							if (/标准$/.test(_name)) {
								_name = '<a href="' + url + '" target="_blank">' + _name + '</a>&nbsp;&nbsp;';
							} else {
								_name = '<a href="' + url + '" target="_blank">' + _name + '质量标准' + '</a>&nbsp;&nbsp;';
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
		$.ajax({
			url: "platform/set/category"
		}).done(function(res) {
			if (res.code == 0) {
				var str = '',
					datas = res.data.items || [];
				for (var i = 0, prop; i < datas.length; i++) {
					prop = datas[i]['busName'];
					if (prop == '设计管理') {
						//$.ajax({
						//	url: "platform/setting/extensions/"+App.Project.Settings.projectId+"/"+App.Project.Settings.CurrentVersion.id+"/property?classKey="+datas[i]['id']+"&elementId="+App.Project.Settings.ModelObj.intersect.userId
						//}).done(function(res){
						//		if(res.code==0){
						//
						//		}
						//});
						var string = '<div class="modle"><div class="modleTitleBar"><i data-classkey="' + datas[i]['id'] + '" class="modleShowHide getdata "></i><h1 class="modleName">' + prop + '</h1></div><ul class="modleList"></ul></div>';
						that.$el.find(".fordesign").html(string);
					} else {
						str += '<div class="modle"><div class="modleTitleBar"><i data-classkey="' + datas[i]['id'] + '" class="modleShowHide getdata "></i><h1 class="modleName">' + prop + '</h1></div><ul class="modleList"></ul></div>';

					}


				}
				that.$el.find(".attrClassBox").html(str);
			}
		});
		//App.Project.fetchClassPropertData(function(res) {
		//	if (res.code == 0){
		//		var str = '', liTpl = '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">{property}</div></span> <span class="modleVal end">{value}</span></li>';
		//		var datas = res.data || [];
		//		for(var i = 0,prop; i < datas.length; i++){
		//			prop = datas[i]['properties'];
		//			if('设计管理成本管理计划管理质量管理'.indexOf(datas[i]['className'])>-1){
		//				continue
		//			}else if(prop==null){
		//				str += '<div class="modle"><i class="modleShowHide"></i><h1 class="modleName">' + datas[i]['className'] + '</h1><ul class="modleList">';
		//
		//			}else{
		//				for(var j = 0; j < (prop.length || 0); j++){
		//					str += '<div class="modle"><i class="modleShowHide"></i><h1 class="modleName">' + datas[i]['className'] + '</h1><ul class="modleList">' + liTpl.replace("{property}", datas[i]['properties'][j]['property']).replace('{value}', datas[i]['properties'][j]['value']);
		//				}
		//			}
		//
		//			str += '</ul></div>';
		//		}
		//
		//			that.$el.find(".attrClassBox").html(str);
		//
		//	}
		//});

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
			projectId: App.Project.Settings.projectId
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
		if (item.totalQuantity) {
			sb.Append('<span class="modelCostVal  overflowEllipsis" title="' + item.totalQuantity + '&nbsp;' + item.unit + '">' + Number(item.totalQuantity).toFixed(4) + '&nbsp;' + item.unit + '</span>');
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
	//1 红色 2 橙色 3绿色
	//color 2 红色 1绿色 0 黄|橙
	formatMark: function(location, color,id,shaType) {
		var _temp = location;
		if (typeof location === 'string') {
			_temp = JSON.parse(location)
		}
		_temp.shapeType = Number(_temp.shapeType||shaType || 0);
		_temp.state = Number(_temp.state || color||0);
		_temp.userId = _temp.userId || _temp.componentId;
		_temp.id=id||'';
		return JSON.stringify(_temp);
	},
	//在模型中显示(开业验收、过程验收、隐患)
	showInModel: function($target, type,paramObj) {
		var _this = this,
			key="",//楼层关键字
			componentId=paramObj?paramObj.uuid:$target.data('uuid'), //构件ID
			location = paramObj?paramObj.location:$target.data('location'), //位置信息
			color=$target.data('color'), //标记颜色
			cat=$target.data('cat'), //构件分类
			marginRule=_this.marginRule[cat]||{},
			_files=App.Project.Settings.Viewer.FloorFilesData;//文件ID数据对象
		if ($target.hasClass("selected")) {
			return
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		var _temp = location,
			_loc="",
			_secenId=componentId.split('.')[0], //用于过滤文件ID
			box = _this.formatBBox(_temp.boundingBox),
			ids = [componentId];
		if(type==3){//隐患
			_loc = _this.formatMark(location,'S021'.charAt(color),'',1);
		}else{
			_loc = _this.formatMark(location,'543'.charAt(color));
		}
		_this.zoomModel(ids, box,marginRule.margin,marginRule.ratio);
		_this.showMarks(_loc);

		//过滤所属楼层 start
		var _floors=App.Project.Settings.Viewer.FloorsData;
		_.find(_floors,function(item){
			if(_.contains(item.fileEtags,_secenId)){
				key=item.floor;
				return true;
			}
		})
		//过滤所属楼层 end

		//没有分类的时候 只过滤单文件 start
		if(!cat){
			_this.recoverySilder();
			_this.linkSilder('floors',key);
			var _hideFileIds=_.filter(_files,function(i){
				return i!=_secenId;
			})
			App.Project.Settings.Viewer.fileFilter({
				ids:_hideFileIds,
				total:[_secenId]
			});
			return;
		}
		//没有分类的时候 只过滤单文件 end

		//已有分类、过滤规则
		if(_this.filterRule.file.indexOf(cat)!=-1){
			_this.recoverySilder();
			var _hideFileIds=_.filter(_files,function(i){
				return i!=_secenId;
			})
			App.Project.Settings.Viewer.fileFilter({
				ids:_hideFileIds,
				total:[_secenId]
			});
		}else if(_this.filterRule.floor.indexOf(cat)!=-1){
			_this.recoverySilder();
			_this.linkSilder('floors',key);
		}else if(_this.filterRule.single.indexOf(cat)!=-1){
			_this.recoverySilder();
			/*if(cat=='外保温'){
				var _hideFileIds=_.filter(_files,function(i){
					return i!=_secenId;
				})
				App.Project.Settings.Viewer.fileFilter({
					ids:_hideFileIds,
					total:[_secenId]
				});
			}*/
			_this.sigleRule(cat,key);
		}else{
			_this.linkSilder('floors',key);
		}
	},

	showMarks: function(marks) {
		if (!_.isArray(marks)) {
			marks = [marks];
		}
		App.Project.Settings.Viewer.loadMarkers(marks);
	},
	//通过userid 和 boundingbox 定位模型
	zoomModel: function(ids, box,margin,ratio) {
		//定位
		App.Project.Settings.Viewer.setTopView(box,false,margin,ratio);
		//半透明
		//App.Project.Settings.Viewer.translucent(true);
		//高亮
		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: ids
		});
	},
	zoomToBox:function(ids,box){
		App.Project.Settings.Viewer.zoomToBox(box);
		App.Project.Settings.Viewer.translucent(true);
		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: ids
		});
	},

	//取消zoom
	cancelZoomModel: function() {
		App.Project.Settings.Viewer.translucent(false);

		App.Project.Settings.Viewer.ignoreTranparent({
			type: "plan",
			//ids: [code[0]]
			ids: undefined
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
			type: 'userId',
			ids: Ids
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

		if (Ids.length > 0) {
			App.Project.Settings.Viewer.zoomToBox(boxArr);
			App.Project.Settings.Viewer.translucent(true)
			App.Project.Settings.Viewer.highlight({
				type: 'userId',
				ids: Ids
			});
		}

	},

	userProps: function(param, callback) {
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
			if (callback) {
				callback(param);
			} else {
				_this.$el.html(_this.template(param));
				//if ($('.design').hasClass('selected')) {
				App.Project.propertiesOthers.call(_this, "plan|cost|quality|dwg");
				//}
			}

		})
	},

	//转换bounding box数据
	formatBBox: function(data) {
		if (!data) {
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
	},

	//获取文件名称 搜索
	getName(name) {

		var searchText = App.Project.Settings.searchText;
		if (searchText) {
			name = name.replace(searchText, '<span class="searchText">' + searchText + '</span>');
		}
		return name;
	}



}