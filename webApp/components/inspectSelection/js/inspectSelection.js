/*
 *@require /components/inspectSelection/libs/jquery-1.12.0.min.js
 *@require /components/inspectSelection/libs/underscore.1.8.2.js
 *@require /components/inspectSelection/libs/backbone.1.1.2.js
 */
(function(win) {

	var strVar1 = "";
	strVar1 += "<% $.each(data.items,function(i,item){%> ";
	strVar1 += "    <tr class=\"<%= i%2==0 && 'odd' %>\" data-color=\"<%= item.colorStatus%>\"  data-cat=\"<%=item.catetoryName%>\"  data-id=\"<%=item.id%>\" data-location='<%= item.location?JSON.stringify(item.location):\"\"%>'>";
	strVar1 += "        <td class=\"manifestIcon\"><i class=\"myIcon-inventory\"><\/i><\/td>";
	strVar1 += "        <td class=\"category\"><%=item.catetoryName%><\/td>";
	strVar1 += "        <td class=\"positon\"><%=item.locationName%><\/td>";
	strVar1 += "        <td class=\"ckResult\">";
	strVar1 += "         <i data-id=\"<%= item.acceptanceId %>\"  data-total=\"<%=item.problemCount%>\" class=\"resultStatusIcon  <%= item.colorStatus == 0 ?'myIcon-circle-green':'myIcon-circle-red'%> \"><\/i>";
	strVar1 += "             <%=item.problemCount%>/<%=item.checkCount%><\/td>";
	strVar1 += "    <\/tr>";
	strVar1 += "<% }) %> ";
	strVar1 += "<% if(data.items.length<=0){%>";
	strVar1 += "    <tr>";
	strVar1 += "        <td colspan=\"9\" class=\"noDataTd\">暂无数据<\/td>";
	strVar1 += "    <\/tr>";
	strVar1 += "<%}%>";

	var strVar2 = "";
	strVar2 += "<div class=\"hedaerSearch\">";
	strVar2 += "    <span class=\"searchToggle\">选择筛选条件<\/span>";
	strVar2 += "    <span class=\"clearSearch\">清除条件<\/span>";
	strVar2 += "    <span class=\"groupRadio\">";
	strVar2 += "        <label class=\"btnCk\"><i class=\"iconPic\"><\/i>显示搜索结果对应位置<\/label>";
	strVar2 += "    <\/span>";
	strVar2 += "<\/div>";
	strVar2 += "<div class=\"searchDetail openingacceptance\">";
	strVar2 += "    <div class=\"searchOptons\">";
	strVar2 += "        <div class=\"optonLine zIndex13\">";
	strVar2 += "            <div class=\"optonLine\">";
	strVar2 += "                <div class=\"myDropDown categoryOption optionComm\">";
	strVar2 += "                    <% if(ruleType) {%>";
	strVar2 += "                        <span class=\"myDropText\">";
	strVar2 += "                        <span>类别：<\/span> <span class=\"text\"><%=userData[ruleType]%><\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
	strVar2 += "                        <ul class=\"myDropList\">";
	strVar2 += "                            <li class=\"myItem\" data-val='<%=ruleType%>'><%=userData[ruleType]%><\/li>";
	strVar2 += "                        <\/ul>";
	strVar2 += "                    <% }else{%>";
	strVar2 += "                         <span class=\"myDropText\">";
	strVar2 += "                        <span>类别：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
	strVar2 += "                        <ul class=\"myDropList\">";
	strVar2 += "                            <li class=\"myItem\" data-val=''>全部<\/li>";
	strVar2 += "                            <% _.each(userData,function(item,index){ if(index!=0){%>";
	strVar2 += "                            <li class=\"myItem\" data-val='<%=index%>'><%=item%><\/li>";
	strVar2 += "                            <% } }) %>";
	strVar2 += "                        <\/ul>";
	strVar2 += "                    <% } %>";
	strVar2 += "                    <\/div>";
	strVar2 += "                <\/div>";
	strVar2 += "                <div class=\"optonLine\">";
	strVar2 += "                    <div class=\"myDropDown riskOption optionComm\">";
	strVar2 += "                        <span class=\"myDropText\">";
	strVar2 += "                            <span>状态：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
	strVar2 += "                            <ul class=\"myDropList\">";
	strVar2 += "                                <li class=\"myItem\" data-val=''>全部<\/li>";
	strVar2 += "                                <li class=\"myItem\" data-val=''>合格<\/li>";
	strVar2 += "                                <li class=\"myItem\" data-val=''>不合格<\/li>";
	strVar2 += "                            <\/ul>";
	strVar2 += "                        <\/div>";
	strVar2 += "                    <\/div>";
	strVar2 += "                <\/div>";
	strVar2 += "        <div class=\"optonLine\">";
	strVar2 += "            <div class=\"myDropDown floorOption optionComm\">";
	strVar2 += "                <span class=\"myDropText\">";
	strVar2 += "             <span>楼层：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
	strVar2 += "                <ul class=\"myDropList\">";
	strVar2 += "                    <li class=\"myItem\" data-val=''>全部<\/li>";
	strVar2 += "                    <% _.each(floorsData,function(item,index){%>";
	strVar2 += "                    <li class=\"myItem\" data-val='<%=item.code%>'><%=item.code%><\/li>";
	strVar2 += "                    <% }) %>";
	strVar2 += "                <\/ul>";
	strVar2 += "            <\/div>";
	strVar2 += "        <\/div>";
	strVar2 += "        <div class=\"optonLine\">";
	strVar2 += "        <div class=\"searchName\">";
	strVar2 += "            <span>位置：<\/span>";
	strVar2 += "            <input type=\"text\" class=\"txtSearchName txtLocationName filterInputExtra\" placeholder=\"请输入关键字\"/>";
	strVar2 += "        <\/div>";
	strVar2 += "        <\/div>";
	strVar2 += "                <div class=\"optonLine btnOption\">";
	strVar2 += "                    <input type=\"button\" class=\"myBtn myBtn-primary btnFilter\" value=\"筛选\" />";
	strVar2 += "                <\/div>";
	strVar2 += "            <\/div>";
	strVar2 += "        <\/div>";
	strVar2 += "        <div class=\"tbContainer\">";
	strVar2 += "            <table class=\"tbOpeningacceptanceHeader tbComm\">";
	strVar2 += "                <thead>";
	strVar2 += "                    <tr>";
	strVar2 += "                        <th class=\"manifestIcon\"><\/th>";
	strVar2 += "                        <th class=\"category\">类别<\/th>";
	strVar2 += "                        <th class=\"positon\">位置<\/th>";
	strVar2 += "                        <th class=\"ckResult\">检查结果<\/th>";
	strVar2 += "                    <\/tr>";
	strVar2 += "                <\/thead>";
	strVar2 += "            <\/table>";
	strVar2 += "            <div class=\"materialequipmentList openingacceptanceList\">";
	strVar2 += "                <div class=\"materialequipmentListScroll\">";
	strVar2 += "                    <table class=\"tbOpeningacceptanceBody tbComm\">";
	strVar2 += "                        <tbody>";
	strVar2 += "                        <tr class=\"noLoading\"><\/tr>";
	strVar2 += "                    <\/tbody>";
	strVar2 += "                <\/table>";
	strVar2 += "            <\/div>";
	strVar2 += "        <\/div>";
	strVar2 += "    <\/div>";
	strVar2 += "    <div class=\"paginationBottom\">";
	strVar2 += "        <div class=\"pageInfo\">";
	strVar2 += "            <span class=\"curr\">0<\/span>/<span class=\"pageCount\">0<\/span>页";
	strVar2 += "            <span class=\"prev\">上一页<\/span> <span class=\"next\">下一页<\/span>";
	strVar2 += "        <\/div>";
	strVar2 += "        <div class=\"sumCount\">共<span class=\"count\">0<\/span>条<\/div>";
	strVar2 += "        ";
	strVar2 += "    <\/div>";

	var ourl = "";
	var scripts = document.getElementsByTagName('script');
	for (var i = 0, size = scripts.length; i < size; i++) {
		if (scripts[i].src.indexOf('/static/dist/components/inspectSelection/js/inspectSelection.js') != -1) {
			var a = scripts[i].src.replace('/static/dist/components/inspectSelection/js/inspectSelection.js', '');
			ourl = a;
		}
	}
	var mapData = {
		processCategory: ['', '工程桩', '基坑支护', '地下防水', '梁柱节点', '钢结构悬挑构件', '幕墙', '外保温',
			'采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房',
			'湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑',
			'吊顶', '地面', '中庭栏杆', '竖井'
		],
		openCategory: ['', '幕墙',
			'采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房',
			'湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑',
			'吊顶', '地面', '中庭栏杆', '竖井'
		]
	}

	win.App = win.App || {};
	win.App.API = {
		Settings: {
			hostname: ourl + "/",
			debug: false
		},
		URL: {
			fetchQualityOpeningAcceptance: "sixD/{projectId}/{projectVersionId}/acceptance?type=2",
			fetchQualityModelById: "sixD/{projectId}/{versionId}/quality/element"
		}
	};

	//模态框模型选择器对象
	var InspectModelSelection = function(options) {

		var _this = this;
		//强制new
		if (!(this instanceof InspectModelSelection)) {
			return new InspectModelSelection(options);
		}

		var defaults = {
				btnText: '确&nbsp;&nbsp;定'
			}
			//合并参数
		this.Settings = $.extend(defaults, options);
		if (this.Settings.etag) {
			Project.Settings = _this.Settings;
			_this.Project = Project;
			ourl=options.host||ourl;
			_this.init();
		} else {
			$.ajax({
				url: ourl + "/platform/api/project/" + this.Settings.projectCode + "/meta?token=123"
			}).done(function(data) {
				if (data.code == 0) {
					$.ajax({
						url: ourl + "/view/" + data.data.projectId + "/" + data.data.versionId + "/init?token=123"
					}).done(function(data) {
						if (data.code == 0) {
							_this.Settings = $.extend({}, _this.Settings, data.data);
							Project.Settings = _this.Settings;
							_this.Project = Project;
							_this.init();
						} else if (data.code == 10004) {
							//	document.location.href=ourl+"/login.html";
						}

					})
				}
			})
		}
	}
	InspectModelSelection.prototype = {
		init: function() {
			var self = this,
				srciptUrl = ourl + '/static/dist/libs/libsH5_20160313.js',
				commjs = ourl + '/static/dist/comm/comm_20160313.js',
				libStyle = ourl + '/static/dist/libs/libsH5_20160313.css',
				myStyle = ourl + '/static/dist/components/inspectSelection/css/inspectSelection.css',
				$css = '<link rel="stylesheet" href="' + libStyle + '" />',
				$css2 = '<link rel="stylesheet" href="' + myStyle + '" />';
			if (!InspectModelSelection.isLoad) {
				$('head').append($css, $css2);
				InspectModelSelection.isLoad = true;
			}
			if (self.Settings.type == "process") {
				win.App.API.URL.fetchQualityOpeningAcceptance = "sixD/{projectId}/{projectVersionId}/acceptance?type=1";
			}
			if (self.isIE()) {
				$.getScript(commjs, function() {
					self.dialog();
					self.controll();
				})
				return;
			}
			$.getScript(srciptUrl, function() {
				bimView.API.baseUrl = ourl + '/';
				$.getScript(commjs, function() {
					self.dialog();
					self.controll();
				})
			}); 
		},
		controll: function() {

			var self = this;
			self.$dialog.on('click', '.toolsBtn', function() {
				self.getSelected();
			}).on('click', '.dialogClose', function() {
				self.$dialog.remove();
				self.$dialog = null;
			}).on('click', '.dialogOk', function() {
				var setting = self.Settings;
				var t = $('.tbOpeningacceptanceBody tr.selected'),
					result = {};
				if (t.length == 1) {
					_.each(Project.currentPageListData, function(i) {
						if (i.id == t.data('id')) {
							result = {
								id: i.id,
								fileUniqueId: i.fileId + i.componentId.slice(i.componentId.indexOf('.')),
								locationName: i.locationName,
								location: i.location,
								axis: i.axis
							}
						}
					})
					if (setting.callback && setting.callback.call(this, result) !== false) {
						self.$dialog.remove();
						self.$dialog = null;
						return self.viewData
					}
				}

			}).on('click', '.rightBar .m-openTree,.rightBar .m-closeTree', function() {
				var $this = $(this),
					$li = $this.closest('.itemNode');
				$this.toggleClass('m-openTree m-closeTree');
				$li.toggleClass('open');
			})
		},
		dialog: function() {
			var self = this,
				Settings = this.Settings,
				$dialog;
			if (this.$dialog) {
				$dialog = self.$dialog;
			} else {
				var strVar = "";
				strVar += "<div class=\"rightProperty\">";
				strVar += "            <div class=\"rightPropertyContentBox\">";
				strVar += "                <div class=\"rightPropertyContent\">";
				strVar += "                    <div class=\"rightPropertyContent\">";
				strVar += "                        <div class=\"designPropetyBox\">";
				strVar += "                            <ul class=\"projectPropetyHeader projectNav\">";
				strVar += "                                <li data-type=\"attr\" class=\"item selected\">检查点<\/li>";
				strVar += "                            <\/ul>";
				strVar += "                            <div class=\"qualityContainer projectNavContentBox\">";
				strVar += "                                ";
				strVar += "                            <\/div>";
				strVar += "                        <\/div>";
				strVar += "                    <\/div>";
				strVar += "                <\/div>";
				strVar += "                <div class=\"dragSize\"><\/div>";
				strVar += "                <div class=\"slideBar\"><i class=\"icon-caret-right\"><\/i><\/div>";
				strVar += "            <\/div>";
				strVar += "        <\/div>";

				$dialog = self.$dialog = $('<div class="modelSelectDialog"></div>');
				var $body = $('<div class="dialogBody"></div>'),
					$header = $('<div class="dialogHeader"/>').html('请选择检查点<span class="dialogClose" title="关闭"></span> '),
					$modelView = self.$modelView = $('<div id="modelView" class="model"></div>')
				$content = $('<div class="dialogContent">' + strVar + '</div>'),
					$bottom = $('<div class="dialogFooter"/>').html('<input type="button" class="dialogOk dialogBtn" value="' + this.Settings.btnText + '" />');
				$content.prepend($modelView);
				$body.append($header, $content, $bottom);
			}
			$dialog.append($body);
			$("body").append($dialog);
			if (self.isIE()) {
				self.activeXObject();
				$dialog.find(".rightBar").remove();
				self.ieDialogEvent();
				return;
			}
			setTimeout(function() {
				self.renderModel();
			}, 10);

		},
		//ie事件
		ieDialogEvent: function() {

			var self = this,
				$dialog = this.$dialog;

			$dialog.on('click', '.dialogClose', function() {
				this.$dialog.remove();
				this.$dialog = null;
			})
			$dialog.on('click', '.dialogOk', function() {
				//获取数据
				WebView.runScript('getData()', function(val) {
					var result = {},
						setting = self.Settings;
					if (val) {
						val = JSON.parse(val)
						if (setting.callback && setting.callback.call(this, val) !== false) {
							self.$dialog.remove();
							self.$dialog = null;
							return self.viewData
						}
					}
				});

			})
		},
		//是否是IE浏览器
		isIE: function() {
			if (!!window.ActiveXObject || "ActiveXObject" in window)
				return true;
			else
				return false;
		},

		//activeXObject 渲染模型
		activeXObject: function() {
			WebView = document.createElement("object");
			WebView.classid = "CLSID:15A5F85D-A81B-45D1-A03A-6DBC69C891D1";

			var viewport = document.getElementById('modelView');
			viewport.appendChild(WebView);

			function resizeWebView() {
				//重置
				if (window.devicePixelRatio) {
					WebView.zoomFactor = window.devicePixelRatio;
				} else {
					WebView.zoomFactor = screen.deviceXDPI / screen.logicalXDPI;
				}
			}
			WebView.url = ourl + "/static/dist/components/inspectSelection/model.html?type=" + this.Settings.type + "&sourceId=" + this.Settings.sourceId + "&etag=" +
				this.Settings.etag + "&projectId=" + this.Settings.projectId + "&projectVersionId=" + this.Settings.projectVersionId + "&ruleType=" + this.Settings.ruleType;
			WebView.height = "510px";
			WebView.width = "960px";

			//窗体变化
			window.onresize = resizeWebView;
			resizeWebView(); 
		 
		},
		renderModel: function() {
			//	Project.setOnlyModel();//检查是否是唯一的 模型
			this.viewer = new bimView({
				type: 'model',
				element: this.$modelView,
				sourceId: this.Settings.sourceId,
				etag: this.Settings.etag,
				projectId: this.Settings.projectId,
				projectVersionId: this.Settings.projectVersionId
			})
			Project.Viewer = this.viewer;
			this.viewer.on("loaded",function(){
				Project.loadPropertyPanel();
			});
			$('.m-camera').addClass('disabled').attr('disabled', 'disabled');
		}
	}

	//Project模型操作方法
	var Project = {
		type: "open",
		Settings: {},
		currentPageListData: null,
		currentInspectId: null,
		templateCache: [],
		filterRule: {
			sceneId: '工程桩,基坑支护,地下防水,钢结构悬挑构件,幕墙,采光顶'
		},
		//计划状态
		planStatus: {
			0: '',
			1: 'myIcon-circle-red',
			2: 'myIcon-circle-yellow',
			3: 'myIcon-circle-green'
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

		filterRule:{
			file:'工程桩,基坑支护,地下防水,钢结构悬挑构件,幕墙,采光顶',
			floorPlus:'梁柱节点',
			floor:'步行街吊顶风口,卫生间防水,外保温',
			floorSpty:'步行街吊顶风口&暖通#内装,卫生间防水&暖通#内装'
		},
		sigleRule:function(cat){
			var _this=this,
				_v=Project.Viewer,
				_spFiles=_v.SpecialtyFileObjData;
			if(cat=='地下防水'){
				var sp='结构',
					show=[],
					hide=[];
				_.each(_spFiles,function(val,key){
					if(sp==key){
						_.each(val,function(item){
							if(item.fileName.indexOf('B02')!=-1){
								show=[item.fileEtag];
							}else{
								hide.push(item.fileEtag);
							}
						})
					}else{
						_.each(val,function(item){
							hide.push(item.fileEtag);
						})
					}
				})
				_v.fileFilter({
					ids:hide,
					total:show,
					type:'sceneId'
				});
				_v.filter({
					//ids:_this.filterCCode('10.20.20.09'),
					ids:['10.20.20.09'],
					type:"classCode"
				});
			}
		},
		filterCCode:function(code){
			var _class=Project.Viewer.ClassCodeData,
				hide=[];

			_.each(_class,function(item){
				if(item.code.indexOf(code)!=0){
					hide.push(item.code);
				}
			})
			return hide;
		},
		//分页信息
		pageInfo: function(data) {
			var $el = $('.modelSelectDialog');
			data = data.toJSON()[0].data;
			$el.find(".paginationBottom .sumCount .count").text(data.totalItemCount);
			$el.find(".paginationBottom .pageInfo .curr").text(data.pageIndex);
			$el.find(".paginationBottom .pageInfo .pageCount").text(data.pageCount);

			if (data.pageIndex == 1) {
				$el.find(".paginationBottom .pageInfo .prev").addClass('disable');
			} else {
				$el.find(".paginationBottom .pageInfo .prev").removeClass('disable');
			}

			if (data.pageIndex >= data.pageCount) {
				$el.find(".paginationBottom .pageInfo .next").addClass('disable');
			} else {
				$el.find(".paginationBottom .pageInfo .next").removeClass('disable');
			}
		},
		showInModel: function($target, type) {
			var _this = this,
				id = $target.data('id'),
				color=$target.data('color'),
				_temp = null,
				location = null;
			_.each(Project.currentPageListData, function(i) {
				if (i.id == id) {
					_temp = i.location;
					location = i.location;
				}
			})
			if (_temp) {
				_temp = JSON.parse(_temp);
				_this.filterComp(_temp.componentId,$target.data('cat'));
				var box = _this.formatBBox(_temp.bBox || _temp.boundingBox);
				var ids = [_temp.componentId];
				_this.zoomModel(ids, box);
				_this.showMarks(Project.formatMark(location,color));
			}
		},

		filterComp:function(componentId,cat){
			var _Viewer=Project.Viewer,
				_floors=_Viewer.FloorsData,
				key="",
				_this=this,
				_secenId=componentId.split('.')[0],
				floorSptys=_this.filterRule.floorSpty.split(',');

			_.find(_floors,function(item){
				key=item.floor;
				return _.contains(item.fileEtags,_secenId);
			})
			var  _files=_Viewer.FloorFilesData,
				_spFiles=_Viewer.SpecialtyFilesData;
			//过滤所属楼层 end
			if(cat && (_this.filterRule.file.indexOf(cat)!=-1||
				_this.filterRule.floorPlus.indexOf(cat)!=-1)){
				var _hideFileIds=_.filter(_files,function(i){
					return i!=_secenId;
				})
				_Viewer.fileFilter({
					ids:_hideFileIds,
					total:[_secenId]
				});
				_this.sigleRule(cat);
				if(_this.filterRule.floorPlus.indexOf(cat)!=-1){
					_Viewer.filter({
						ids:['10.20.20.03'],
						type:"classCode"
					});
				}
			}else if(_this.filterRule.floor.indexOf(cat)!=-1){
				_this.linkSilder('floors',key);
				var sp=_.find(floorSptys,function(item){
					return item.indexOf(cat)!=-1;
				});
				var sp=sp.slice(sp.indexOf('&')+1),
					show=[],
					hide=[];
				_.each(_spFiles,function(val,key){
					if(sp.indexOf(key)!=-1){
						show=show.concat(val);
					}else{
						hide=hide.concat(val);
					}
				})
				_Viewer.fileFilter({
					ids:hide,
					total:show,
					type:'sceneId'
				});
			}else{
				_this.linkSilder('floors',key);
			}

		},

		showMarks: function(marks) {
			if (!_.isArray(marks)) {
				marks = [marks];
			}
			Project.Viewer.loadMarkers(marks);
		},
		hideMarks: function() {
			Project.Viewer && Project.Viewer.loadMarkers(null);
		},

		formatMark: function(location,color) {
			var _temp = JSON.parse(location),
				_color = '510';
			color = _color.charAt(color || 5) || 5;
			_temp.shapeType = _temp.shapeType || 0;
			_temp.state = _temp.state ||color|| 0;
			_temp.userId = _temp.userId || _temp.componentId;
			return JSON.stringify(_temp);
		},
		//通过userid 和 boundingbox 定位模型
		zoomModel: function(ids, box) {
			//定位
			Project.Viewer.setTopView(box);
			//高亮
			Project.Viewer.highlight({
				type: 'userId',
				ids: ids
			});
		},

		showSelectMarkers: function(e, target) {
			var $target = target || $(e.currentTarget);
			if ($target.hasClass('selected')) {
				var array = [];
				_.each(Project.currentPageListData, function(i) {
					if (i.location.indexOf('boundingBox') != -1) {
						array.push(Project.formatMark(i.location, i.colorStatus));
					}
				})
				Project.showMarks(array);
			} else {
				Project.hideMarks();
			}
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

		loadPropertyPanel: function() {
			$('.qualityContainer').append(new QualityOpeningAcceptance().render({
				OpeningAcceptance: {
					specialty: "", //专业
					category: Project.Settings.ruleType || '', //类别
					problemCount: "", // 无隐患 1， 有隐患
					pageIndex: 1, //第几页，默认第一页
					pageItemCount: 10, //页大小
					token: 123
				}
			}).el);
			this.loadData();
		},

		loadData: function(data, page) {
			OpeningAcceptanceCollection.reset();
			OpeningAcceptanceCollection.projectId = this.Settings.projectId;
			OpeningAcceptanceCollection.projectVersionId = this.Settings.projectVersionId;
			OpeningAcceptanceCollection.fetch({
				data: $.extend({}, {
					specialty: "", //专业
					category: Project.Settings.ruleType || '', //类别
					problemCount: "", // 无隐患 1， 有隐患
					pageIndex: page || 1, //第几页，默认第一页
					pageItemCount: 10, //页大小
					token: 123
				}, data),
				success: function(data) {
					Project.pageInfo(data);
				}
			});
		},
		//检查是否是唯一的 模型
		setOnlyModel: function() {
			var onlyCount = App.Comm.getCookie("onlyCount");
			if (!onlyCount) {
				App.Comm.setCookie("onlyCount", 1);
				Project.onlyCount = 1;
			} else {
				onlyCount++;
				App.Comm.setCookie("onlyCount", onlyCount);
				Project.onlyCount = onlyCount;
			}
		},

		//关闭窗口
		checkOnlyCloseWindow: function() {

			var onlyCount = App.Comm.getCookie("onlyCount");
			//没加载过模型
			if (!onlyCount || !Project.onlyCount) {
				return;
			}

			if (onlyCount != Project.onlyCount) {
				if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
					window.location.href = "about:blank";
					//window.close();
				} else {
					window.opener = null;
					window.open("", "_self");
					window.close();
				}
			}

			//重置 一直累加会溢出
			if (onlyCount == Project.onlyCount && Project.onlyCount > 100) {
				App.Comm.setCookie("onlyCount", 1);
				Project.onlyCount = 1;
			}

		}

	}

	var OpeningAcceptanceCollection = new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchQualityOpeningAcceptance",
		parse: function(data) {
			if (data.code == 0) {
				Project.currentPageListData = data.data.items;
				Project.showSelectMarkers(null, $('.btnCk'));
				return data;
			} else if (data.code == 10004) {
				window.location.href = data.data;
			}
		}
	}))

	var QualityOpeningAcceptance = Backbone.View.extend({
		tagName: "div",

		className: "QualityOpeningAcceptance",

		currentDiseaseView: null,

		filters: {},

		initialize: function() {
			this.listenTo(OpeningAcceptanceCollection, "add", this.addOne);
			this.listenTo(OpeningAcceptanceCollection, "reset", this.loading);
		},


		events: {
			"click .searchToggle": "searchToggle",
			"click .clearSearch": "clearSearch",
			//	"click .tbOpeningacceptanceBody tr": "showInModel",
			'click .resultStatusIcon': 'showDiseaseList',
			'click .tbOpeningacceptanceBody tr': 'selectInspect',
			'click .btnCk': 'showSelectMarker',
			'click .pageInfo .next': 'nextPage',
			'click .pageInfo .prev': 'prevPage'
		},


		//渲染
		render: function(options) {
			this.OpeningAcceptanceOptions = options.OpeningAcceptance;
			var tpl = _.template(strVar2);
			this.$el.html(tpl({
				floorsData:Project.Viewer.FloorsData,
				userData: Project.Settings.type == 'open' ? mapData.openCategory : mapData.processCategory,
				ruleType: Project.Settings.ruleType
			}));
			this.bindEvent();
			return this;

		},
		//开业验收过滤条件change事件
		changeOA: function(key, val) {
			this.filters[key] = val;
		},

		//事件初始化
		bindEvent: function() {

			var that = this;
			this.$('.txtLocationName').change(function() {
					that.changeOA('locationName', $(this).val())
				})
				//隐患
			this.$(".riskOption").myDropDown({
				zIndex: 11,
				click: function($item) {
					that.changeOA('problemCount', $item.data("val"));
				}
			});
			//类型
			this.$(".categoryOption").myDropDown({
				zIndex: 12,
				click: function($item) {
					that.changeOA('category', $item.data("val"))
				}
			});

			this.$(".floorOption").myDropDown({
				click: function($item) {
					that.changeOA('floor', $item.data("val"))
				}
			});

			//专业
			this.$(".specialitiesOption").myDropDown({
				zIndex: 13,
				click: function($item) {
					that.changeOA('specialty',$item.data("val"))
				}
			});

			this.$('.btnFilter').on('click', function() {
					Project.loadData(that.filters);
				})
				//显示搜索结果对应位置
			this.$(".groupRadio").myRadioCk();
		},

		showSelectMarker: function(e) {

			Project.showSelectMarkers(e);

		},
		//显示隐藏搜索
		searchToggle: function(e) {
			var $searchDetail = this.$(".searchDetail");
			if ($searchDetail.is(":animated")) {
				return;
			}
			$(e.currentTarget).toggleClass('expandArrowIcon');
			$searchDetail.slideToggle();
		},
		searchup: function() {
			var $searchDetail = this.$(".searchDetail");
			if ($searchDetail.is(":animated")) {
				return;
			}
			this.$('.searchToggle').removeClass('expandArrowIcon');
			$searchDetail.slideUp();
		},
		//清空搜索条件
		clearSearch: function() {
			this.$(".riskOption .text").html('全部')
			this.$(".categoryOption .text").html('全部')
			this.$(".specialitiesOption .text").html('全部')
			this.filters = {};
			Project.loadData(null);
		},

		//	template: Project.templateUrl("/components/inspectSelection/tpls/project.quality.property.openingAcceptance.body.html"),
		template: _.template(strVar1),

		//获取数据后处理
		addOne: function(model) {
			var data = model.toJSON();
			this.$(".tbOpeningacceptanceBody tbody").html(this.template(data));
			//  this.bindScroll();
		},

		//选择检查点
		selectInspect: function(e) {
			var $target = $(e.currentTarget);
			Project.currentInspectId = $target.data('id');
			$target.parent().find('tr').removeClass('selected');
			$target.addClass('selected');
			Project.showInModel($target, 2);
		},
		//加载
		loading: function() {

			// this.$(".tbOpeningacceptanceBody tbody").html(App.Project.Settings.loadingTpl);
			this.searchup();
		},

		//模型中显示
		showInModel: function(e) {
			Project.showInModel($(e.currentTarget), 0);
		},

		showDiseaseList: function(event) {
			//App.Project.QualityAttr.showDisease(event,this,'open',2);// showDiseaseList
			//event.stopPropagation();
		},
		//下一页
		nextPage: function(event) {
			if ($(event.target).hasClass("disable")) {
				return;
			}
			var next = +this.$el.find(".paginationBottom .pageInfo .curr").text() + 1;
			Project.loadData(this.filters, next)
		},

		//上一页
		prevPage: function(event) {
			if ($(event.target).hasClass("disable")) {
				return;
			}
			var prev = +this.$el.find(".paginationBottom .pageInfo .curr").text() - 1;
			Project.loadData(this.filters, prev)
		}
	});
	win.InspectModelSelection = InspectModelSelection;
})(window)