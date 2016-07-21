/*
 *@require /components/inspectSelection/libs/jquery-1.12.0.min.js
 *@require /components/inspectSelection/libs/underscore.1.8.2.js
 *@require /components/inspectSelection/libs/backbone.1.1.2.js
 */
(function(win) {

	var strVar1 = "";
    strVar1 += "<% $.each(data.items,function(i,item){%> ";
    strVar1 += "    <tr class=\"<%= i%2==0 && 'odd' %>\"  data-id=\"<%=item.id%>\" data-location='<%= item.location?JSON.stringify(item.location):\"\"%>'>";
    strVar1 += "        <td class=\"manifestIcon\"><i class=\"myIcon-inventory\"><\/i><\/td>";
    strVar1 += "        <td class=\"category\"><%=item.categoryName%><\/td>";
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
    strVar2 += "            <div class=\"myDropDown specialitiesOption optionComm\">";
    strVar2 += "                <span class=\"myDropText\">";
    strVar2 += "                    <span>专业：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
    strVar2 += "                    <ul class=\"myDropList\">";
    strVar2 += "                        <li class=\"myItem\" data-val=''>全部<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='10'>外装<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='15'>内装<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='45'>采光顶<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='50'>慧云机房<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='55'>冷冻机房<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='60'>消防水泵房<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='75'>发电机房<\/li>";
    strVar2 += "                        <li class=\"myItem\" data-val='85'>地下车库<\/li>";
    strVar2 += "                    <\/ul>";
    strVar2 += "                <\/div>";
    strVar2 += "            <\/div>";
    strVar2 += "            <div class=\"optonLine\">";
    strVar2 += "                <div class=\"myDropDown categoryOption optionComm\">";
    strVar2 += "                    <span class=\"myDropText\">";
    strVar2 += "                        <span>类别：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
    strVar2 += "                        <ul class=\"myDropList\">";
    strVar2 += "                            <li class=\"myItem\" data-val=''>全部<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='05'>玻璃幕墙<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='06'>石材/地砖地面<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='07'>车库出入口<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='30'>栏杆扶手<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='40'>标识<\/li>";
    strVar2 += "                            <li class=\"myItem\" data-val='55'>广告位<\/li>";
    strVar2 += "                        <\/ul>";
    strVar2 += "                    <\/div>";
    strVar2 += "                <\/div>";
    strVar2 += "                <div class=\"optonLine\">";
    strVar2 += "                    <div class=\"myDropDown riskOption optionComm\">";
    strVar2 += "                        <span class=\"myDropText\">";
    strVar2 += "                            <span>有无隐患：<\/span> <span class=\"text\">全部<\/span> <i class=\"myDropArrorw\"><\/i> <\/span>";
    strVar2 += "                            <ul class=\"myDropList\">";
    strVar2 += "                                <li data-status=\"\" class=\"myItem\">全部<\/li>";
    strVar2 += "                                <li data-status=\"1\" class=\"myItem\">有<\/li>";
    strVar2 += "                            <\/ul>";
    strVar2 += "                        <\/div>";
    strVar2 += "                    <\/div>";
    strVar2 += "                <\/div>";
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
		var _this=this;
		//强制new
		if (!(this instanceof InspectModelSelection)) {
			return new InspectModelSelection(options);
		}

		var defaults = {
			btnText: '确&nbsp;&nbsp;定'
		}
		//合并参数
		this.Settings = $.extend(defaults, options);

		if(this.Settings.etag){
			Project.Settings = _this.Settings;
			_this.Project=Project;
			_this.init();
		}else{
			$.ajax({
		      url: ourl+"/platform/api/project/"+this.Settings.projectCode+"/meta?token=123"
		    }).done(function(data){
		    	if(data.code==0){
		    		$.ajax({
				      url: ourl+"/view/"+data.data.projectId+"/"+data.data.versionId+"/init"
				    }).done(function(data){
				    	if(data.code==0){
				    		_this.Settings=$.extend({},_this.Settings,data.data);
				    		Project.Settings = _this.Settings;
							_this.Project=Project;
							_this.init();
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

			//加载完js后再渲染
			$.getScript(srciptUrl, function() {
				bimView.API.baseUrl = ourl + '/';
				$.getScript(commjs, function() {
					self.dialog();
					self.controll();
				})

			});
		},
		controll: function() {
			if (this.isIE()) {
				return;
			}
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
			Project.loadPropertyPanel();
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
						val=JSON.parse(val)
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
				WebView.width = viewport.offsetWidth;
				WebView.height = viewport.offsetHeight;
			}
			resizeWebView();
			WebView.url = ourl + "/static/dist/components/inspectSelection/model.html?type="+this.Settings.type+"&sourceId="+this.Settings.sourceId+"&etag="+
			this.Settings.etag+"&projectId="+ this.Settings.projectId+"&projectVersionId="+this.Settings.projectVersionId;
			WebView.height = "510px";
			WebView.width = "960px";
			//window.addEventListener('resize', resizeWebView, false);
		},
		renderModel: function() {
			this.viewer = new bimView({
				type: 'model',
				element: this.$modelView,
				sourceId: this.Settings.sourceId,
				etag: this.Settings.etag,
				projectId: this.Settings.projectId,
				projectVersionId: this.Settings.projectVersionId
			})
			Project.Viewer = this.viewer;
			$('.m-camera').addClass('disabled').attr('disabled', 'disabled');
		}
	}

	//Project模型操作方法
	var Project = {
		type: "open",
		Settings: {},
		currentPageListData: null,
		currentInspectId:null,
		templateCache: [],
		//分页信息
		pageInfo:function(data) {
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
				location = $target.data('location');
			if(location.indexOf('boundingBox')!=-1){
				var _temp = JSON.parse(location);
				var box = _this.formatBBox(_temp.bBox || _temp.boundingBox);
				var ids = [_temp.userId];
				_this.zoomModel(ids, box);
				_this.showMarks(location);
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
		//通过userid 和 boundingbox 定位模型
		zoomModel: function(ids, box) {
			//定位
			Project.Viewer.zoomToBox(box);
			//半透明
			Project.Viewer.translucent(true);
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
						array.push(i.location);
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
					category: "", //类别 
					problemCount: "", // 无隐患 1， 有隐患 
					pageIndex: 1, //第几页，默认第一页
					pageItemCount: 10 //页大小
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
					category: "", //类别 
					problemCount: "", // 无隐患 1， 有隐患 
					pageIndex: page || 1, //第几页，默认第一页
					pageItemCount: 10 //页大小
				}, data),
				success: function(data) {
					Project.pageInfo(data);
				}
			});
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

			//var tpl = Project.templateUrl("/components/inspectSelection/tpls/project.quality.property.openingAcceptance.html");
			var tpl = _.template(strVar2);
			this.$el.html(tpl);
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
			//隐患
			this.$(".riskOption").myDropDown({
				zIndex: 11,
				click: function($item) {
					that.changeOA('problemCount', $item.data("status"));
				}
			});
			//类型
			this.$(".categoryOption").myDropDown({
				zIndex: 12,
				click: function($item) {
					that.changeOA('category', $item.attr('data-val'))
				}
			});

			//专业
			this.$(".specialitiesOption").myDropDown({
				zIndex: 13,
				click: function($item) {
					that.changeOA('specialty', $item.attr('data-val'))
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
			Project.currentInspectId=$target.data('id');
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
			var next = +$el.find(".paginationBottom .pageInfo .curr").text() + 1;
			Project.loadData(this.filters, next)
		},

		//上一页
		prevPage: function(event) {
			if ($(event.target).hasClass("disable")) {
				return;
			}
			var prev = +$el.find(".paginationBottom .pageInfo .curr").text() - 1;
			Project.loadData(this.filters, prev)
		}
	});
	win.InspectModelSelection = InspectModelSelection;
})(window)