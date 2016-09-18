;/*!/projects/collections/index.js*/
 App.Projects = {

    _cache:[],

    _upload:"1,3,5,6",
    _delnew:"3,5,6",
    _down:"3,4,5,6,7,9",

    fromCache:function(index,key,p){
        var result=null;
        _.each(App.Projects._cache,function(item){
            if(item['id']==index){
                if(p){
                     result=item[p][key];
                }else{
                    result=item[key];
                }
            }
        })
        return result;
    },

    isAuth:function(id,op){
        var _s=this.fromCache(id,'status','version');
        if(op=='CREATE'){
            return this._delnew.indexOf(_s)!=-1;
        }
        if(op=='DELETE'){
            return this._delnew.indexOf(_s)!=-1;
        }
        if(op=='DOWN'){
            return this._down.indexOf(_s)!=-1;
        }
        if(op=='UPLOAD'){
            return this._upload.indexOf(_s)!=-1;
        }
        return true;
    },



    //项目业态
    proRetailing: {
        "8": '综合体',
        "16": '酒店',
        "32": '文化旅游'
    },
    //项目类型
    projectType:['--','全标','类标','非标'],
    //项目模式
    projectModel:['--', '创新模式', '直投', '重资产','合作'],
    concernsData:{
        type:['', '过程检查', '过程验收', '开业验收'],
        report:['', '质监中心', '第三方', '项目公司', '监理单位'],
        classic:['', '防水工程', '施工质量', '安全文明', '材料设备'],
        specialty:{
            '1':'建筑',
            '2':'结构',
            '3':'设备',
            '4':'电气',
            '6':'内装',
            'def':'炼钢',
            'abc':'土建'
        }
    },
     ProjectCollection: new(Backbone.Collection.extend({
         model: Backbone.Model.extend({
             defaults: function() {
                 return {
                     url: ''
                 }
             }
         }),

         urlType: "fetchProjects",

         parse: function(response) {
             if (response.message == "success") {
                if(response.data.items && response.data.items.length){
                App.Projects._cache=response.data.items||[];
                 return response.data.items;
                }else{
                    Backbone.trigger('projectListNullData');
                    return [];
                }
             }
         }


     })),

     Settings: {
         projectId: "",
         projectName: "",
         type: "list",
         isInitMap: false,
         initBodyEvent: false,
         pageIndex: 1
     },

     init: function() {

         var $contains = $("#contains");
         //nav
         $contains.html(new App.Projects.searchView().render().$el);
         //切换列表
         $contains.append(new App.Projects.DisplayMode().render().$el);
         //显示box
         $contains.append(new App.Projects.ContentMode().render().$el);

         if (!App.Projects.Settings.initBodyEvent) {
             App.Projects.Settings.initBodyEvent = true;
             App.Projects.initBodyEvent();
         }

         App.Projects.loadData();
         App.Projects.initEvent();

         //初始化滚动条
         App.Projects.initScroll(); 

     },


     //加载数据
     loadData: function(params) {

        var _data={
             name: "",
             projectType:"", //项目类型
             estateType: "", //项目模式
             province: "", //所属省份
             region: "", //分区
             complete: "", //是否完成
             open: "", //是否开业
             openTimeStart: "", 
             openTimEnd: "",
             pageIndex: App.Projects.Settings.pageIndex,
             pageItemCount: App.Comm.Settings.pageItemCount

         };
         //初始化用户参数
         _data=$.extend({},_data,params);
         $("#projectModes .proListBox").empty(); //清空数据
         App.Projects.ProjectCollection.reset();
         App.Projects.ProjectCollection.project = "project";

         //拉取数据
         App.Projects.ProjectCollection.fetch({

             data: _data,

             success: function(collection, response, options) {
                $("#pageLoading").hide();
                 var $content = $("#projectModes"),
                     pageCount = response.data.totalItemCount;


                 $content.find(".sumDesc").html('共 ' + pageCount + ' 个项目');

                 $content.find(".listPagination").empty().pagination(pageCount, {
                     items_per_page: response.data.pageItemCount,
                     current_page: response.data.pageIndex - 1,
                     num_edge_entries: 3, //边缘页数
                     num_display_entries: 5, //主体页数
                     link_to: 'javascript:void(0);',
                     itemCallback: function(pageIndex) {
                         //加载数据
                         App.Projects.Settings.pageIndex = pageIndex + 1;
                         App.Projects.onlyLoadData(params);
                     },
                     prev_text: "上一页",
                     next_text: "下一页"

                 });
             }

         });
     },

     //只是加载数据
     onlyLoadData: function(params) {
        var _data= {
             pageIndex: App.Projects.Settings.pageIndex,
             pageItemCount: App.Comm.Settings.pageItemCount,
             name: "",
             estateType: "",
             province: "",
             region: "",
             complete: "",
             open: "",
             openTimeStart: "",
             openTimEnd: ""
         }
         App.Projects.ProjectCollection.reset();
         App.Projects.ProjectCollection.fetch({
             data:$.extend({},_data,params)
         });
     },


     initEvent: function() {

         //日期控件初始化
         $('#dateStar').datetimepicker({
             language: 'zh-CN',
             autoclose: true,
             format: 'yyyy-mm-dd',
             minView: 'month'

         });
         $('#dateEnd').datetimepicker({
             language: 'zh-CN',
             autoclose: true,
             format: 'yyyy-mm-dd',
             minView: 'month'

         });

         $(".dateBox .iconCal").click(function() {
             $(this).next().focus();
         });
         //单选
         $(".groupRadio").myRadioCk();
         // $(".groupRadio2").myRadioCk();
     },



     //初始化滚动条
     initScroll: function() {
         $("#projectModes").find(".proListBoxScroll").mCustomScrollbar({
             set_height: "100%",
             theme: 'minimal-dark',
             axis: 'y',
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });

         $("#projectModes").find(".proMapScroll").mCustomScrollbar({
             set_height: "100%",
             theme: 'minimal-dark',
             axis: 'y',
             keyboard: {
                 enable: true
             },
             scrollInertia: 0
         });
     },

     initBodyEvent: function() {
         $("body").on("click", function(event) {
             var $target = $(event.target);
             if ($target.closest("#mapProjects").length <= 0 && $target.closest(".BMap_Marker").length <= 0) {
                 $("#mapProjects").remove();
             }
         });
     },

     fetch: function() {

         //清空数据
         App.Projects.ProjectCollection.models = [];

         if (App.Projects.Settings.type == "list") {
             $("#projectModes").find(".proListBox").show().find(".item").remove().end().end().find(".proMapBox").hide();

             var projectArr = [];

             for (var i = 0; i < 10; i++) {
                 projectArr.push({
                     url: '/projects/images/proDefault.png',
                     projectName: "项目" + (+new Date()),
                     projectAddress: '上海',
                     projectStar: '2015-5-9',
                     projectEnd: '2016-9-6',
                     projectID: i
                 });
             }

             App.Projects.ProjectCollection.add(projectArr);

         } else {
             $("#projectModes").find(".proListBox").hide().end().find(".proMapBox").show();

             //初始化地图
             //App.Projects.BaiduMap.initMap();

             //map.centerAndZoom(point, 15);
         }

     }

 };


 //地图配置
 App.Projects.BaiduMap = {

     Settings: {
         defaultZoom: 6,
         MarkerArr: []
     },

     initMap: function() {

         App.Projects.BaiduMap.Settings.defaultZoom = 6;
         //地图
         // 百度地图API功能
         var map = new BMap.Map("container"); // 创建Map实例 
         map.centerAndZoom(new BMap.Point(116.404, 37.915), 5); // 初始化地图,设置中心点坐标和地图级别
         //var potitionControl = new App.Projects.BaiduMap.potitionControl();
         //map.addControl(potitionControl); // 添加到地图当中
         //map.addControl(new BMap.ScaleControl()); //添加地图类型控件

         map.setCurrentCity("上海"); // 设置地图显示的城市 此项是必须设置的
         map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放

         App.Projects.BaiduMap.addProjectPoints(map, 5);

         //缩放事件
         map.addEventListener("zoomend", function() {

             //App.Projects.BaiduMap.addProjectPoints(map,this.getZoom()); 
         });

     },

     addProjectPoints: function(map, zoom) {

         var mapSettings = App.Projects.BaiduMap.Settings;

         if (mapSettings.defaultZoom < 6 && zoom > 5) {

             var markCount = mapSettings.MarkerArr.length;
             //释放上一次的
             for (var i = 0; i < markCount; i++) {
                 map.removeOverlay(mapSettings.MarkerArr[i]);
             }
             //清空marke
             mapSettings.MarkerArr.length = 0;
             for (var i = 0; i < 15; i++) {
                 var point = new BMap.Point(116.404 + i, 39.915 + i);
                 var marker = new BMap.Marker(point, zoom); // 创建标注
                 marker.addEventListener("click", function() {
                     //项目详情
                     App.Projects.BaiduMap.showMapProject(arguments);
                 });
                 map.addOverlay(marker);

                 mapSettings.MarkerArr.push(marker);
             }

         } else if (mapSettings.defaultZoom >= 6 && zoom < 6) {
             var markCount = mapSettings.MarkerArr.length;
             //释放上一次的
             for (var i = 0; i < markCount; i++) {
                 map.removeOverlay(mapSettings.MarkerArr[i]);
             }
             //清空marke
             mapSettings.MarkerArr.length = 0;

             for (var i = 0; i < 5; i++) {
                 var point = new BMap.Point(116.404 + i, 39.915 + i);
                 var marker = new BMap.Marker(point, zoom); // 创建标注  
                 marker.addEventListener("click", function() {

                     //项目详情
                     App.Projects.BaiduMap.showMapProject(arguments);
                 });
                 map.addOverlay(marker);

                 mapSettings.MarkerArr.push(marker);
             }
         }

         mapSettings.defaultZoom = zoom;

     },

     showMapProject: function() {

         $("#mapProjects").remove();

         var event = arguments[0][0],
             offsetX = event.clientX,
             offsetY = event.clientY;

         var temp = _.templateUrl('/projects/tpls/project.map.list.html');


         $("body").append(temp({}));

         $("#mapProjects").css({
             'top': offsetY,
             'left': offsetX
         });

     },


     // 定义一个控件类，即function   
     initControl: function() {

         App.Projects.BaiduMap.potitionControl = function() {
             // 设置默认停靠位置和偏移量  
             this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
             this.defaultOffset = new BMap.Size(10, 10);
         }

         // 通过JavaScript的prototype属性继承于BMap.Control   
         App.Projects.BaiduMap.potitionControl.prototype = new BMap.Control();

         // 自定义控件必须实现initialize方法，并且将控件的DOM元素返回   
         // 在本方法中创建个div元素作为控件的容器，并将其添加到地图容器中   
         App.Projects.BaiduMap.potitionControl.prototype.initialize = function(map) {

             var $div = $('<div class="potitionControl"/>');

             $div.on("click", function() {

             });

             // 添加DOM元素到地图中   
             map.getContainer().appendChild($div[0]);

             return $div[0];
         }

     }


 }
;/*!/projects/collections/Project.es6*/
"use strict";

App.Project = {

	//检查点标记点击事件
	markerClick: function markerClick(marker) {
		var id = marker ? marker.id : "",
		    userId = marker ? marker.userId : "",
		    data = {};

		if ($(".QualityProcessAcceptance").is(":visible")) {
			if (id) {
				var tr = $(".QualityProcessAcceptance .tbProcessAccessBody tr[data-id='" + id + "']");
				if (tr.length > 0) {
					tr.addClass('selected');
				} else {
					data = App.Project.catchPageData('process', { id: id });
					App.Project.qualityTab.ProcessAcceptanceOptions.pageIndex = data.pageIndex;
					App.Project.QualityAttr.ProcessAcceptanceCollection.reset();
					App.Project.QualityAttr.ProcessAcceptanceCollection.push({ data: data });
					App.Project.qualityTab.pageInfo.call(App.Project.qualityTab, data, 'processacceptance', true);
					tr = $(".QualityProcessAcceptance .tbProcessAccessBody tr[data-id='" + id + "']");
					tr.addClass("selected");
				}
			} else {
				$(".QualityProcessAcceptance .tbProcessAccessBody tr").removeClass('selected');
			}
		}
		if ($(".QualityOpeningAcceptance").is(":visible")) {
			if (id) {
				var tr = $(".QualityOpeningAcceptance .tbOpeningacceptanceBody tr[data-id='" + id + "']");
				if (tr.length > 0) {
					tr.addClass('selected');
				} else {
					data = App.Project.catchPageData('open', { id: id });
					App.Project.qualityTab.OpeningAcceptanceOptions.pageIndex = data.pageIndex;
					App.Project.QualityAttr.OpeningAcceptanceCollection.reset();
					App.Project.QualityAttr.OpeningAcceptanceCollection.push({ data: data });
					App.Project.qualityTab.pageInfo.call(App.Project.qualityTab, data, 'openingacceptance', true);
					tr = $(".QualityOpeningAcceptance .tbOpeningacceptanceBody tr[data-id='" + id + "']");
					tr.addClass("selected");
				}
			} else {
				$(".QualityProcessAcceptance .tbProcessAccessBody tr").removeClass('selected');
			}
		}
		if (userId) {
			App.Project.Settings.Viewer.highlight({
				type: 'userId',
				ids: [userId]
			});
		} else {
			App.Project.Settings.Viewer.highlight({
				type: 'userId',
				ids: undefined
			});
		}
	},

	//隐患类型数据客户化
	disCategory: function disCategory(item) {
		var arr = this.mapData.concernsCategory;
		if (item.acceptanceType == '1') {
			if (item.presetPointId) {
				return arr[2];
			} else {
				return arr[1];
			}
		} else if (item.acceptanceType == '2') {
			return arr[3];
		} else {
			return '';
		}
	},

	//过滤规则
	filterRule: {
		//单文件：过滤出检查点所在构件所在的文件
		file: '工程桩,基坑支护,钢结构悬挑构件,幕墙',
		//单独类型：singleRule
		single: '梁柱节点,地下防水,步行街吊顶风口,卫生间防水,外保温,采光顶',
		floor: ''
	},

	//缩放规则
	marginRule: {
		'基坑支护': {
			margin: 0.2,
			ratio: 1.0
		},
		'梁柱节点': {
			margin: 0.8,
			ratio: 2.0
		},
		'外保温': {
			margin: 0.5,
			ratio: 1.0
		},
		'地下防水': {
			margin: 1,
			ratio: 1.0
		},
		'幕墙': {
			margin: 1,
			ratio: 1.0
		},
		'采光顶': {
			margin: 3,
			ratio: 1.0
		}
	},
	//单独类型、自定义过滤规则
	sigleRule: function sigleRule(cat, floor) {
		var _this = this,
		    _v = App.Project.Settings.Viewer,
		    _spFiles = _v.SpecialtyFileObjData,
		    //专业文件数据对象
		_ctFiles = _v.ComponentTypeFilesData; //结构类型数据对象
		if (cat == '地下防水') {
			this.linkSilder('floors', '');
			this.linkSilderSpecial('specialty', 'WDGC-Q-ST-垫层防水层.rvt');
		}
		if (cat == '梁柱节点') {
			this.linkSilder('floors', floor);
			this.linkSilderSpecial('specialty', 'WDGC-Q-ST-' + floor + '.rvt');
			this.linkSilderCategory('category', '楼板');
		}
		if (cat == '采光顶') {
			this.linkSilder('floors', '');
			this.linkSilderSpecial('specialty', '采光顶');
		}
		if (cat == '外保温') {
			App.Project.Settings.Viewer.filter({
				ids: _this.filterCCode(['10.10.20.03.06.20.10', '10.10.30.03.09']),
				type: "classCode"
			});
			this.linkSilder('floors', floor);
		}
		if (cat == '步行街吊顶风口' || cat == '卫生间防水') {
			this.linkSilder('floors', floor);
			this.linkSilderSpecial('specialty', ['WDGC-Q-AC-' + floor + '.rvt', 'WDGC-Q-IN&DS-' + floor + '.rvt'].join(','));
		}
	},
	filterCCode: function filterCCode(code) {
		var _class = App.Project.Settings.Viewer.ClassCodeData,
		    _all = [];
		hide = [];
		if (typeof code == 'string') {
			code = [code];
		}
		_.each(_class, function (item) {
			_.find(code, function (i) {
				if (item.code.indexOf(i) == 0) {
					return true;
				}
				hide.push(item.code);
				return false;
			});
		});
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
	//格式化占位符
	formatPointPlace: function formatPointPlace(p, t) {
		if (p == 0 && t == 0) {
			return '--';
		} else {
			return p + "/" + t;
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
		processCategory: ['', '工程桩', '基坑支护', '地下防水', '梁柱节点', '钢结构悬挑构件', '幕墙', '外保温', '采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房', '湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑', '吊顶', '地面', '中庭栏杆', '竖井'],
		openCategory: ['', '幕墙', '采光顶', '步行街吊顶风口', '卫生间防水', '屋面防水', '屋面虹吸雨排', '消防泵房', '给水泵房', '湿式报警阀室', '空调机房', '冷冻机房', '变配电室', '发电机房', '慧云机房', '电梯机房', '电梯底坑', '吊顶', '地面', '中庭栏杆', '竖井'],
		openCategoryId: ['', 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
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

	checkStatus: function checkStatus(color) {
		if (color == 1) {
			return 'myIcon-circle-green';
		} else if (color == 2) {
			return 'myIcon-circle-red';
		} else {
			return '';
		}
	},

	//过滤器还原（计划[模块化、模拟],质量[开业、过程、隐患],设计[碰撞],成本[清单、校验]）
	recoverySilder: function recoverySilder() {
		var show = '建筑,结构,景观,幕墙,采光顶,内装&标识,内装&导识',
		    hide = '暖通,电气,智能化,给排水';
		var $sp = $('.modelSidebar #specialty>.tree>li');
		App.Project.Settings.Viewer.fileFilter({
			ids: [],
			total: App.Project.Settings.Viewer.FloorFilesData
		});
		App.Project.Settings.Viewer.filter({
			ids: [],
			type: "classCode"
		});
		App.Project.Settings.Viewer.filter({
			type: "plan",
			ids: []
		});
		App.Project.Settings.Viewer.translucent(false);

		$sp.each(function () {
			var _input = $(this).find('input:first'),
			    _text = $(this).find('.treeText:first').text();
			if (show.indexOf(_text) != -1) {
				if (_input.is(':checked')) {
					_input.trigger('click');
				}
				_input.trigger('click');
			} else if (hide.indexOf(_text) != -1) {
				if (!_input.is(':checked')) {
					_input.trigger('click');
				}
				_input.trigger('click');
			}
		});

		$('.modelSidebar #category input').each(function () {
			if (!$(this).is(':checked')) {
				$(this).trigger('click');
			}
		});
		$('.modelSidebar #floors input').each(function () {
			if (!$(this).is(':checked')) {
				$(this).trigger('click');
			}
		});
		var specialty = bimView.comm.getFilters($("#specialty,#floors"), 'uncheck');
		var category = bimView.comm.getFilters($("#category"), 'uncheck');
		var classCode = bimView.comm.getFilters($("#classCode"), 'uncheck');
		App.Project.Settings.Viewer.fileFilter(specialty);
		App.Project.Settings.Viewer.filter(category);
		App.Project.Settings.Viewer.filter(classCode);
	},

	linkSilder: function linkSilder(type, key) {
		if (!key) {
			return;
		}
		var $check = $('.modelSidebar #' + type + ' ul input'),
		    $treeText = $('.modelSidebar #' + type + ' ul .treeText');
		$check.each(function () {
			if ($(this).is(':checked') && $(this).closest('.itemContent').find('.treeText').text() != key) {
				$(this).trigger('click');
			}
		});
		$treeText.each(function () {
			var _ = $(this).parent().find('input');
			if (key) {
				if ($(this).text() == key && !_.is(':checked')) {
					_.trigger('click');
				}
			} else {
				if (!_.is(':checked')) {
					_.trigger('click');
				}
			}
		});
	},
	linkSilderSpecial: function linkSilderSpecial(type, key) {
		if (!key) {
			return;
		}
		var $check = $('.modelSidebar #' + type + ' input'),
		    $treeText = $('.modelSidebar #' + type + ' .treeText');
		this.recoverySilder();
		$check.each(function () {
			if ($(this).is(':checked')) {
				$(this).trigger('click');
			}
		});
		$treeText.each(function () {
			var _ = $(this).parent().find('input');
			if (key.indexOf($(this).text()) != -1) {
				_.trigger('click');
			}
		});
	},
	linkSilderCategory: function linkSilderCategory(type, key) {
		if (!key) {
			return;
		}
		var $check = $('.modelSidebar #' + type + ' input'),
		    $treeText = $('.modelSidebar #' + type + ' .treeText');
		$check.each(function () {
			if (!$(this).is(':checked')) {
				$(this).trigger('click');
			}
		});
		$treeText.each(function () {
			var _ = $(this).parent().find('input');
			if ($(this).text() == key) {
				_.trigger('click');
			}
		});
	},

	cacheMarkers: function cacheMarkers(type, data) {
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
	isShowMarkers: function isShowMarkers(type, flag) {
		var _this = this;
		var viewer = App.Project.Settings.Viewer;
		if (!viewer) return;

		_this.recoverySilder();

		if (type != 'other' && flag) {
			var shaType = type == 'dis' ? 1 : 0;
			var data = this.currentLoadData[type],
			    result = [],
			    boxs = [];
			if (_.isArray(data)) {
				_.each(data, function (i) {
					if (i.location && i.location.indexOf('boundingBox') != -1) {
						if (type == 'dis') {
							var _loc = JSON.parse(i.location);
							_loc.position = JSON.parse(i.axis).position;
							result.push(_this.formatMark(_loc, "S021".charAt(i.status), i.id, 1));
							boxs.push(_loc.boundingBox);
						} else {
							var _loc = JSON.parse(i.location);
							boxs.push(_loc.boundingBox);
							result.push(_this.formatMark(i.location, '543'.charAt(i.colorStatus), i.id));
						}
					}
				});
				App.Project.Settings.Viewer.setTopView(boxs, true);
				viewer.viewer.setMarkerClickCallback(App.Project.markerClick);
				viewer.loadMarkers(result);
			}
		} else {
			viewer.loadMarkers(null);
		}
	},

	//获取当前检查点所在位置(页码),和当前页码所在的数据队列
	//pageNum pageSize id
	catchPageData: function catchPageData(type, param) {
		var start = 0,
		    end = 0,
		    result = {},
		    list = [],
		    counter = 0,
		    opts = $.extend({}, {
			id: "",
			pageSize: 20,
			pageNum: 1
		}, param),
		    data = this.currentLoadData[type],
		    _len = data.length;
		if (opts.id) {
			for (var i = 0, size = _len; i < size; i++) {
				if (data[i].id == opts.id) {
					counter = i;
					break;
				}
			}
			opts.pageNum = Math.ceil(counter / opts.pageSize) || 1;
		}
		start = (opts.pageNum - 1) * opts.pageSize;
		end = opts.pageNum * opts.pageSize;
		end = end < _len ? end : _len;
		for (; start < end; start++) {
			list.push(data[start]);
		}
		result = {
			items: list,
			pageCount: Math.ceil(_len / opts.pageSize),
			pageItemCount: opts.pageSize,
			pageIndex: opts.pageNum,
			totalItemCount: _len

		};
		return result;
	},
	//从缓存获取数据

	// 文件 容器
	FileCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchFileList",

		parse: function parse(responese) {
			if (responese.code == 0) {
				if (responese.data.length > 0) {
					return responese.data;
				} else {
					$("#projectContainer .fileContainerScroll .changeContrastBox").html('<li class="loading">无数据</li>');
				}
			}
		}

	}))(),

	bindContextMenu: function bindContextMenu($el) {
		var _this = this;
		//右键菜单
		if (!document.getElementById("listContextProject")) {
			//右键菜单
			var contextHtml = _.templateUrl("/projects/tpls/listContext.html", true);
			$("body").append(contextHtml);
		}

		$el.contextMenu('listContextProject', {
			//显示 回调
			onShowMenuCallback: function onShowMenuCallback(event) {
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
				'previewModel': function previewModel($target) {},
				'downLoadModelProject': function downLoadModelProject(item) {

					var $item = $(item),

					//下载链接
					fileVersionId = $item.find(".filecKAll").data("fileversionid");

					App.Comm.checkDownLoad(App.Project.Settings.projectId, App.Project.Settings.CurrentVersion.id, fileVersionId);
				},
				'delModelProject': function delModelProject(item) {
					var rel = $('#delModelProject'),
					    $item = $(item);
					if (rel.hasClass('disable')) {
						return;
					}
					_this.delFile($item);
				},
				'reNameModelProject': function reNameModelProject(item) {
					//重命名
					var $reNameModel = $("#reNameModelProject");
					//不可重命名状态
					if ($reNameModel.hasClass('disable')) {
						return;
					}
					var $prevEdit = $(".fileContent .txtEdit");
					if ($prevEdit.length > 0) {
						_this.cancelEdit($prevEdit);
						return;
					}
					var $item = $(item),
					    $fileName = $item.find(".fileName"),
					    text = $item.find(".text").hide().text().trim();
					$fileName.append('<input type="text" value="' + text + '" class="txtEdit txtInput" /> <span class="btnEnter myIcon-enter"></span><span class="btnCalcel pointer myIcon-cancel"></span>');
				}
			}
		});
	},

	addNewFileModel: function addNewFileModel() {
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
		};
		App.Project.FileCollection.push(model);
	},
	afterCreateNewFolder: function afterCreateNewFolder(file, parentId) {
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
			data.click = function (event) {
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
			};
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

	createNewFolder: function createNewFolder($item) {
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

		App.Comm.ajax(data, function (data) {
			if (data.message == "success") {
				var id = data.data.id,
				    isExists = false;
				$.each(App.Project.FileCollection.models, function (i, item) {
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

	afterRemoveFolder: function afterRemoveFolder(file) {

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


	delFile: function delFile($item) {
		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 168,
			limitHeight: false,
			title: '删除文件提示',
			cssClass: 'deleteFileDialog',
			okClass: "delFile",
			okText: '确&nbsp;&nbsp;认',
			okCallback: function okCallback() {
				var fileVersionId = $item.find(".filecKAll").data("fileversionid"),
				    id = $item.find(".text").data("id"),
				    models = App.Project.FileCollection.models;
				//修改数据
				$.each(models, function (i, model) {
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
	calcelEditName: function calcelEditName(event) {
		var $prevEdit = $("#projectContainer .txtEdit");
		if ($prevEdit.length > 0) {
			this.cancelEdit($prevEdit);
		}
		return false;
	},
	//取消修改
	cancelEdit: function cancelEdit($prevEdit) {
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

	editFolderName: function editFolderName($item) {
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

		App.Comm.ajax(data, function (data) {
			var $prevEdit = $item.find(".txtEdit");
			if (data.code == 0) {
				var id = data.data.id,
				    models = App.Project.FileCollection.models;
				$("#projectContainer .treeViewMarUl span[data-id='" + id + "']").text(name);

				$.each(models, function (i, model) {
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
				});
			}
			if ($prevEdit.length > 0) {
				$prevEdit.prev().show().end().nextAll().remove().end().remove();
			}
		});
	},
	//初始化
	init: function init() {
		//加载项目
		this.fetchProjectDetail();
	},

	//获取项目信息信息
	fetchProjectDetail: function fetchProjectDetail() {

		var data = {
			URLtype: "fetchProjectDetail",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				data = data.data;
				if (!data) {
					alert("项目无内容");
					return;
				}
				App.Project.Settings.projectName = data.projectName;
				App.Project.Settings.CurrentVersion = data;
				//加载数据
				App.Project.loadData();
			}
		});
	},

	//加载版本
	loadVersion: function loadVersion(callback) {
		var data = {
			URLtype: "fetchCrumbsProjectVersion",
			data: {
				projectId: App.Project.Settings.projectId
			}
		};
		App.Comm.ajax(data).done(function (data) {

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
	renderVersion: function renderVersion(data) {

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

				var cVersionDate,
				    VersionsDates = cVersionGroup.item,
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
	loadData: function loadData() {

		//var $contains = $("#contains");
		$("#contains").html(new App.Project.ProjectApp().render().el);
		var status = App.Project.Settings.CurrentVersion.status;
		if (status != 9 && status != 4 && status != 7) {
			//上传
			App.Project.upload = App.modules.docUpload.init($(document.body));
		}

		//api 页面 默认加载模型 && App.Project.Settings.loadType == "model"
		if (App.Project.Settings.type == "token") {
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

		//api 页面 默认加载模型 && App.Project.Settings.loadType == "model"
		if (App.Project.Settings.type == "token") {
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
	setPropertyByAuth: function setPropertyByAuth() {

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
	initScroll: function initScroll() {

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
	initEvent: function initEvent() {
		var _this = this;
		//下载
		$("#projectContainer").on("click", ".btnFileDownLoad", function (e) {

			if ($(e.currentTarget).is('.disable')) {
				return;
			}
			var $selFile = $("#projectContainer .fileContent :checkbox:checked").parent();

			if ($selFile.length < 1) {
				alert("请选择需要下载的文件");
				return;
			}

			var FileIdArr = [];
			$selFile.each(function (i, item) {
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
		$("#projectContainer").on("click", ".btnNewFolder", function (e) {

			if ($(e.currentTarget).is('.disable')) {
				return;
			}
			_this.addNewFileModel();
		});
		//新建文件
		$("#projectContainer").on("click", ".returnBack", function (e) {

			if ($(e.currentTarget).is('.disable')) {
				return;
			}
			_this.returnBack(e);
		});

		//删除
		$("#projectContainer").on("click", ".btnFileDel", function (e) {
			if ($(e.currentTarget).is('.disable')) {
				return;
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

	isDisabled: function isDisabled(name) {
		var Auth = App.AuthObj && App.AuthObj.project && App.AuthObj.project.prjfile;
		Auth = Auth || {};
		if (!Auth[name]) {
			return true;
		}
		return false;
	},

	returnBack: function returnBack(e) {
		if ($(e.currentTarget).attr('isReturn') == '0') {
			return;
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
	initGlobalEvent: function initGlobalEvent() {
		$(document).on("click.project", function (event) {
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
	renderModelContentByType: function renderModelContentByType() {

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
				App.Project.qualityTab = new App.Project.ProjectQualityProperty().render();
				$rightPropertyContent.append(App.Project.qualityTab.$el);
				$("#projectContainer .ProjectQualityNavContainer .projectNav .item:first").click();
			}
		}

		var $slideBar = $("#projectContainer .rightProperty .slideBar");
		if ($slideBar.find(".icon-caret-left").length > 0) {
			$slideBar.click();
		}
	},

	//设计导航
	fetchFileNav: function fetchFileNav() {

		//请求数据
		var data = {
			URLtype: "fetchDesignFileNav",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
			}
		};

		App.Comm.ajax(data).done(function (data) {

			if (_.isString(data)) {
				// to json
				if (JSON && JSON.parse) {
					data = JSON.parse(data);
				} else {
					data = $.parseJSON(data);
				}
			}

			data.click = function (event) {

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
				$("#projectContainer .fileContainer").find(".clearSearch").hide().end().find(".opBox").show().end().find(".searchCount").hide().end().find("#txtFileSearch").val("");
				App.Project.Settings.searchText = "";

				App.Project.Settings.fileId = file.fileVersionId;

				App.Project.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			};
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
	fetchModelNav: function fetchModelNav() {
		var data = {
			URLtype: "fetchDesignModelNav"
		};

		App.Comm.ajax(data).done(function (data) {
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
	renderProperty: function renderProperty() {
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
	propertiesOthers: function propertiesOthers(type) {

		var that = this;
		//计划
		if (type.indexOf("plan") != -1) {
			App.Project.fetchPropertData("fetchDesignPropertiesPlan", function (data) {
				if (data.code == 0) {

					data = data.data;
					if (!data) {
						return;
					}

					that.$el.find(".attrPlanBox").find(".name").text(data.businessItem).end().find(".strat").text(data.planStartTime && new Date(data.planStartTime).format("yyyy-MM-dd") || "").end().find(".end").text(data.planEndTime && new Date(data.planEndTime).format("yyyy-MM-dd") || "").end().show();
					//.find(".rEnd").text(data.planFinishDate && new Date(data.planFinishDate).format("yyyy-MM-dd") || "").end().show();
				}
			});
		}
		//成本
		if (type.indexOf("cost") != -1) {
			App.Project.fetchPropertData("fetchDesignPropertiesCost", function (data) {
				if (data.code == 0) {
					if (data.data.length > 0) {
						var html = App.Project.properCostTree(data.data);
						//that.$el.find(".attrCostBox").show().find(".modle").append(html);
						App.Project.costDataHtml = html;
					}
				}
			});
		}

		//质监标准
		if (type.indexOf("quality") != -1) {

			var liTpl = '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2">varName</div></li>';

			App.Project.fetchPropertData("fetchDesignPropertiesQuality", function (data) {
				if (data.code == 0) {

					if (data.data.length > 0) {
						var lis = '';
						$.each(data.data, function (i, item) {

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
		}).done(function (res) {
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

				setTimeout(function () {
					that.$el.find(".attrClassBox").find('[data-classkey=4]').click();
				}, 1000);
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
	attrDwg: function attrDwg() {

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

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				//debugger
				if (data.data.length > 0) {
					var lis = '';
					$.each(data.data, function (i, item) {
						lis += liTpl.replace("varName", item.name).replace('{id}', item.id);
					});
					that.$el.find(".attrDwgBox").show().find(".modleList").html(lis);
				}
			}
		});
	},

	//属性 数据获取
	fetchPropertData: function fetchPropertData(fetchType, callback) {

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
	fetchClassPropertData: function fetchClassPropertData(callback) {

		var Intersect = App.Project.Settings.ModelObj.intersect;

		var data = {
			projectId: App.Project.Settings.projectId
			//elementId: Intersect.userId,
			//classKey: id
		};

		//App.Comm.ajax(data, callback);
		$.ajax({
			url: "platform/setting/extensions/" + data.projectId + "/property/all"
		}).done(function (data) {
			callback(data);
		});
	},

	//成本树
	properCostTree: function properCostTree(data) {
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
	properCostTreeItem: function properCostTreeItem(item, i) {

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
	formatMark: function formatMark(location, color, id, shaType) {
		var _temp = location;
		if (typeof location === 'string') {
			_temp = JSON.parse(location);
		}
		_temp.shapeType = Number(_temp.shapeType || shaType || 0);
		_temp.state = Number(_temp.state || color || 0);
		_temp.userId = _temp.userId || _temp.componentId;
		_temp.id = id || '';
		return JSON.stringify(_temp);
	},
	//在模型中显示(开业验收、过程验收、隐患)
	showInModel: function showInModel($target, type, paramObj) {
		var _this = this,
		    key = "",
		    //楼层关键字
		componentId = paramObj ? paramObj.uuid : $target.data('uuid'),
		    //构件ID
		location = paramObj ? paramObj.location : $target.data('location'),
		    //位置信息
		color = $target.data('color'),
		    //标记颜色
		cat = $target.data('cat'),
		    //构件分类
		marginRule = _this.marginRule[cat] || {},
		    _files = App.Project.Settings.Viewer.FloorFilesData; //文件ID数据对象
		if ($target.hasClass("selected")) {
			return;
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		App.Project.recoverySilder();
		var _temp = location,
		    _loc = "",
		    _secenId = componentId.split('.')[0],
		    //用于过滤文件ID
		box = _this.formatBBox(_temp.boundingBox),
		    ids = [componentId];
		if (type == 3) {
			//隐患
			_loc = _this.formatMark(location, 'S021'.charAt(color), $target.data('id'), 1);
		} else {
			_loc = _this.formatMark(location, '543'.charAt(color), $target.data('id'));
		}
		_this.zoomModel(ids, box, marginRule.margin, marginRule.ratio);
		_this.showMarks(_loc);

		//过滤所属楼层 start
		var _floors = App.Project.Settings.Viewer.FloorsData;
		_.find(_floors, function (item) {
			if (_.contains(item.fileEtags, _secenId)) {
				key = item.floor;
				return true;
			}
		});
		//过滤所属楼层 end

		//没有分类的时候 只过滤单文件 start
		if (!cat) {
			_this.linkSilder('floors', key);
			var _hideFileIds = _.filter(_files, function (i) {
				return i != _secenId;
			});
			App.Project.Settings.Viewer.fileFilter({
				ids: _hideFileIds,
				total: [_secenId]
			});
			return;
		}
		//没有分类的时候 只过滤单文件 end

		//已有分类、过滤规则
		if (_this.filterRule.file.indexOf(cat) != -1) {
			var _hideFileIds = _.filter(_files, function (i) {
				return i != _secenId;
			});
			App.Project.Settings.Viewer.fileFilter({
				ids: _hideFileIds,
				total: [_secenId]
			});
		} else if (_this.filterRule.floor.indexOf(cat) != -1) {
			_this.linkSilder('floors', key);
		} else if (_this.filterRule.single.indexOf(cat) != -1) {
			_this.sigleRule(cat, key);
		} else {
			_this.linkSilder('floors', key);
		}
	},

	showMarks: function showMarks(marks) {
		if (!_.isArray(marks)) {
			marks = [marks];
		}
		App.Project.Settings.Viewer.loadMarkers(marks);
	},
	//通过userid 和 boundingbox 定位模型
	zoomModel: function zoomModel(ids, box, margin, ratio) {
		//定位
		App.Project.Settings.Viewer.setTopView(box, false, margin, ratio);
		//半透明
		//App.Project.Settings.Viewer.translucent(true);
		//高亮
		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: ids
		});
	},
	zoomToBox: function zoomToBox(ids, box) {
		App.Project.Settings.Viewer.zoomToBox(box);
		App.Project.Settings.Viewer.translucent(true);
		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: ids
		});
	},

	//取消zoom
	cancelZoomModel: function cancelZoomModel() {
		App.Project.Settings.Viewer.translucent(false);

		App.Project.Settings.Viewer.ignoreTranparent({
			type: "plan",
			//ids: [code[0]]
			ids: undefined
		});
		App.Project.Settings.Viewer.filter({
			type: "plan",
			ids: undefined
		});
	},

	//定位到模型
	zommBox: function zommBox($target) {
		var Ids = [],
		    boxArr = [];
		$target.parent().find(".selected").each(function () {
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
	planCostShowInModel: function planCostShowInModel(event) {

		var $target = $(event.target),
		    $parent = $target.parent();

		if ($target.data("box")) {

			if ($parent.hasClass("selected")) {
				$target.closest("table").find(".selected").removeClass("selected");
				App.Project.Settings.Viewer.translucent(false);
				App.Project.Settings.Viewer.highlight({
					type: 'userId',
					ids: []
				});
				return;
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
			};

			App.Comm.ajax(pars, function (data) {
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

	planCostzommBox: function planCostzommBox($target) {
		var Ids = [],
		    boxArr = [],
		    $code;

		$target.closest("table").find(".selected").each(function () {
			$code = $(this).find(".code");
			Ids.push($code.data("id"));
			boxArr = boxArr.concat($code.data("box"));
		});

		if (Ids.length > 0) {
			App.Project.Settings.Viewer.zoomToBox(boxArr);
			App.Project.Settings.Viewer.translucent(true);
			App.Project.Settings.Viewer.highlight({
				type: 'userId',
				ids: Ids
			});
		}
	},

	userProps: function userProps(param, callback) {
		var _this = this;
		var dataObj = {
			URLtype: "fetchFileByModel",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId,
				modelId: App.Project.Settings.ModelObj.intersect.object.userData.sceneId
			}
		};
		App.Comm.ajax(dataObj, function (data) {
			var _ = param[0].items;
			_.push({
				name: "文件名",
				value: data.data.name
			});
			_.push({
				name: "专业",
				value: data.data.specialty
			});
			_.push({
				name: "楼层",
				value: data.data.floor
			});
			if (callback) {
				callback(param);
			} else {
				_this.$el.html(_this.template(param));
				//if ($('.design').hasClass('selected')) {
				App.Project.propertiesOthers.call(_this, "plan|cost|quality|dwg");
				//}
			}
		});
	},

	//转换bounding box数据
	formatBBox: function formatBBox(data) {
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
	getName: function getName(name) {

		var searchText = App.Project.Settings.searchText;
		if (searchText) {
			name = name.replace(searchText, '<span class="searchText">' + searchText + '</span>');
		}
		return name;
	}
};
;/*!/projects/collections/project.cost.attr.js*/
/**
 * @require projects/collections/Project.es6
 */
App.Project.CostAttr={

		//清单 collection
	ReferenceCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostReference"


	})),

		// 变更 collection
	ChangeCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostChange"

	})),

		// 检验 collection
	VerificationCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostVerification"

	
	})),

	VerificationCollectionCate: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostVerificationCate" 

	})),

	VerificationCollectionCateDetail: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostVerificationCateDetail" 

	})),

	// 属性 collection
	PropertiesCollection: new(Backbone.Collection.extend({
	 
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchCostProperties",

		parse:function(response){
			if (response.message == "success") {
                 return response.data;
             }
		}

	}))


}
;/*!/projects/collections/project.design.attr.js*/
/**
 * @require projects/collections/Project.es6
 */
App.Project.DesignAttr={

		// 碰撞collection
	CollisionCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCollision"


	})),

	// 碰撞文件列表
	CollisionFiles: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignFiles"

	})),

	// 碰撞构件列表
	CollisionCategory: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCategory"

	})),

	// 碰撞任务列表
	CollisionTaskList: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignTaskList"


	})),

	// 碰撞点列表
	CollisionTaskDetail: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignTaskDetail"


	})),

	// 碰撞文件列表
	CollisionSetting: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignSetting"

	})),

		// 设计检查 collection
	CollisionList: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignCollisionList"

	})),
		// 设计检查 collection
	VerificationCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignVerification"

	})),

		// 属性 collection
	PropertiesCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType:"fetchDesignProperties",

		parse:function(response){

			if (response.message == "success") {
                 return response;
             }
		}

	}))


}

;/*!/projects/collections/project.plan.attr.es6*/
"use strict";

/**
 * @require projects/collections/Project.es6
 */
App.Project.PlanAttr = {

	// 模型  collection
	PlanModelCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanModel"

	}))(),

	// 模拟 collection
	PlanAnalogCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanAnalog"
	}))(),

	//关注
	PlanPublicityCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanPublicity"
	}))(),

	PlanPublicityCollectionMonth: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanPublicity"

	}))(),

	// 检验
	PlanInspectionCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanInspection"

	}))(),

	fetchPlanInspectionCate: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchPlanInspectionCate"

	}))(),

	// 属性 collection
	PlanPropertiesCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchDesignProperties",

		parse: function parse(response) {
			if (response.message == "success") {
				return response;
			}
		}

	}))()

};
;/*!/projects/collections/project.quality.attr.js*/
/**
 * @require /projects/collections/Project.js
 */
App.Project.QualityAttr = {

	zindex:(function(){
		var i=90000;
		return function(){
			return i++;
		}
	}()),

	showDisease:function(event,_this,type,flag){
		_this.currentDiseaseView && _this.currentDiseaseView.$el.remove();
		var 
			$target=$(event.currentTarget),
			id=$target.attr('data-id'),
			isShow=$target.attr('data-total'),
			_top=0,
			_flag='up',
			projectId = App.Project.Settings.projectId,
			projectVersionId = App.Project.Settings.CurrentVersion.id;
			
		//没有隐患数据,则不打开数据
		if(Number(isShow)<=0){
			return
		}
		if(($('body').height()-$target.offset().top)>=302){
			_top=$target.offset().top-175+24;
		}else{
			_top=$target.offset().top-300-175+24;
			_flag='down';
		}
		_top=_top<=10?10:_top;
		var p={
				top:_top+'px',
				zIndex:this.zindex()
			};
		_this.currentDiseaseView=new App.Project.ProcessDisease({
			params:{
				projectId:projectId,
				versionId:projectVersionId,
				acceptanceId:id,
				type:flag
			},
			viewConfig:p,
			_parent:$target,
			_flag:_flag,
			type:type
		})
	},

	// 材料设备  collection
	MaterialEquipmentCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityMaterialEquipment"


	})),

	// 过程验收 collection
	ProcessAcceptanceCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProcessAcceptance",

		parse: function (response) {
            if (response.message == "success") {
            	App.Project.cacheMarkers('process',response.data.items);
            }
			var data=App.Project.catchPageData('process');
			response.data=data;
            return response;
        }

	})),

	//过程检查
	ProcessCheckCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProcessCheck"


	})),

	// 开业验收
	OpeningAcceptanceCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityOpeningAcceptance",

		parse: function (response) {
            if (response.message == "success") {
            	App.Project.cacheMarkers('open',response.data.items);
            }
			var data=App.Project.catchPageData('open');
			response.data=data;
            return response;
        }
	})),


	//隐患
	ConcernsCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityConcerns",

		parse: function (response) {
            if (response.message == "success") {
            	App.Project.cacheMarkers('dis',response.data.items);
            }
			var data=App.Project.catchPageData('dis');
			response.data=data;
            return response;
        }

		

	})),

	// 属性 collection
	PropertiesCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "fetchQualityProperties"

		
	}))


}
;/*!/projects/collections/project.share.es6*/
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

App.Project.Share = {
	init: function init() {

		App.Project.Settings.isShare = true;
		//下拉箭头
		$(".breadcrumbNav .myIcon-slanting-right").remove();
		//绑定登录
		this.bindLogin();
	},


	//绑定登录 分享用
	bindLogin: function bindLogin() {

		//点击登录这
		if (App.Comm.getCookie("OUTSSO_AuthToken")) {

			App.Global.User = JSON.parse(localStorage.getItem("user"));
			//解析权限
			this.parseAuth();

			//设置权限
			App.Project.setPropertyByAuth();

			//销毁上传
			App.Comm.upload.destroy();

			$("#topBar .login").text(App.Global.User.name);

			App.TopNav.init();

			var $comment = $("#comment");
			//评论 登录状态
			if ($comment.find(".btnLogin").length > 0) {
				$comment.find(".noLogin").remove();
				$comment.find(".talkReMark").removeClass("hidden");
			}

			return;
		}

		$("#topBar .login").on("click", function () {
			App.Project.Share.initLogin();
		});
	},
	parseAuth: function parseAuth() {

		if (!App.Global.User) {
			return;
		}

		var Autharr = App.Global.User.function,
		    keys,
		    len;
		App.AuthObj = {};
		//遍历权限
		$.each(Autharr, function (i, item) {
			keys = item.code.split('-');
			len = keys.length;

			if (len == 1) {
				App.AuthObj[keys[0]] = true;
			} else {

				App.AuthObj[keys[0]] = App.AuthObj[keys[0]] || {};

				if (len == 2) {
					App.AuthObj[keys[0]][keys[1]] = true;
				} else {
					App.AuthObj[keys[0]][keys[1]] = App.AuthObj[keys[0]][keys[1]] || {};
					App.AuthObj[keys[0]][keys[1]][keys[2]] = true;
				}
			}
		});
	},


	//登录初始化
	initLogin: function initLogin() {

		var dialogHtml = _.templateUrl('/libsH5/tpls/comment/login.html', true),
		    opts = {
			title: "用户登录",
			width: 300,
			height: 220,
			isConfirm: false,
			cssClass: "loginDialog",
			message: dialogHtml
		},
		    that = this,
		    dialog = new App.Comm.modules.Dialog(opts);

		//登录
		dialog.element.find(".btnLogin").on("click", function () {
			//绑定登录
			that.signIn(dialog);
		});

		//登录
		dialog.element.find(".txtPwd").on("keyup", function (event) {
			//绑定登录
			if (event.keyCode == 13) {
				that.signIn(dialog);
			}
		});
	},


	//登录
	signIn: function signIn(dialog) {

		var $el = dialog.element,
		    $btnLogin = $el.find(".btnLogin");

		if ($btnLogin.data("islogin")) {
			return;
		}

		var userName = $el.find(".txtAccount").val().trim(),
		    userPwd = $el.find(".txtPwd ").val().trim();

		if (!userName) {
			alert("请输入用户名");
			return false;
		}

		if (!userPwd) {
			alert("请输入密码");
			return false;
		}

		$btnLogin.val("登录中").data("islogin", true);

		$.ajax({
			url: '/platform/login',
			type: 'post',
			data: {
				userid: userName,
				password: userPwd
			}
		}).done(function (data) {

			if (data.code == 0) {
				//写cookie
				var keys = [];
				if (data.data && _typeof(data.data) === 'object') {
					for (var p in data.data) {
						App.Comm.setCookie(p, data.data[p]);
						keys.push(p);
					}
				}

				//localStorage.setItem("keys", keys.join(','));

				App.Comm.delCookie("token_cookie");
				//获取用户信息
				App.Project.Share.getUserInfo(dialog);
			} else {
				alert("登录失败");
				//登录失败			
				$btnLogin.val("立即登录").data("islogin", false);
			}
		});
	},


	//获取用户信息
	getUserInfo: function getUserInfo(dialog) {

		var $el = dialog.element,
		    that = this;

		$.ajax({
			url: '/platform/user/current'
		}).done(function (data) {

			//失败
			if (data.code != 0) {
				alert("获取用户信息失败");
				$el.find(".btnLogin").val("立即登录").data("islogin", false);
				return;
			}

			App.Comm.dispatchIE('/?commType=loginIn');

			localStorage.setItem("user", JSON.stringify(data.data));
			App.Comm.setCookie('userId', data.data.userId);
			App.Comm.setCookie('isOuter', data.data.outer);
			//是否主动退出标记 2 默认状态 1 为主动退出
			App.Comm.setCookie('IS_OWNER_LOGIN', '2');
			//绑定登陆
			App.Project.Share.bindLogin();

			App.Project.init();
			// if (!$._data($("#topBar .login")[0], "events")) {
			// 	//绑定用户信息
			// 	App.TopNav.init();
			// }
			dialog.close();
		});
	}
};
;/*!/projects/collections/project.viewpoint.attr.es6*/
"use strict";

/**
 * @require /projects/collections/Project.js
 */
App.Project.ViewpointAttr = {
  ListCollection: new (Backbone.Collection.extend({
    model: Backbone.Model.extend(),
    urlType: "fetchModelViewpoint"
  }))()
};
;/*!/projects/js/comm.docUpload.js*/
/**
 * @author baoym@grandsoft.com.cn
 */
(function($) {

    'use strict';

    var docUpload = {

        __container: null,

        init: function(container, options) {
            var self = this;
            self.__options = options;
            self.__container = container;

            //添加元素
            var upload = $('<div>', {
                'class': 'mod-plupload'
            }).appendTo(container);

            //初始化
            App.Comm.upload.init(upload, {

                getParentId: function() {
                    return App.Project.Settings.fileId;
                },

                getQuotaInfo: function() {
                    return self.getQuotaInfo()
                },

                //是否可以上传
                canUploadFile: function() {

                    if (App.Project.Settings.fileId) {
                        return true;
                    } else {
                        return false;
                    }
                    //return App.Comm.modules.util.canUploadFile()
                },

                // getUploadedBytesUrl: function(parentId) {
                //     // return App.Comm.modules.util.getUrl(parentId, {
                //     //     bytes: false
                //     // })
                // },

                //获取上传url
                getUploadUrl: function(file) {


                    var data = {
                        data: {
                            projectId: App.Project.Settings.projectId,
                            projectVersionId: App.Project.Settings.CurrentVersion.id
                        },
                        URLtype: "uploadFile"
                    };

                    return App.Comm.getUrlByType(data).url;


                    //return "http://172.16.233.210:8080/bim/api/1232321/file/data?fileId=444444444444";
                    // return App.Comm.modules.util.getUrl(App.Comm.modules.util.getParentId(), {
                    //     upload: false,
                    //     returnFirst: false
                    // })
                },

                //上传成功
                fileUploaded: function(response, file) {


                    var data = JSON.parse(response.response);
                    //上传成功 且 是在当前文件夹下 才显示 上传的文件
                    if (App.Project.Settings.fileId && data.code == 0) {
                        //文件夹
                        if (data.data.folder) {
                            this.afterCreateNewFolder(data.data);
                            //App.Project.afterCreateNewFolder(data.data, data.data.parentId);
                        }
                        if (App.Project.Settings.fileId == data.data.parentId) {
                            App.Project.FileCollection.push(data.data);
                        }
                    }
                },


                //上传文件后操作
                afterCreateNewFolder:function(data) {

                    App.Project.afterCreateNewFolder(data, data.parentId);

                    if (data.children) {

                        var count=data.children.length;

                        for(var i=0;i<count;i++){
                            this.afterCreateNewFolder(data.children[i]);
                        }
                    }
                },

                //上传失败
                uploadError: function(file) {
                    console.log(file.message);
                    var  lockerId = (file.message.match(/\[(.|)+\]/))[0].replace(/(\[|\])/g,'');
                    var user = /user/.test(file.message);
                    if(user){
                        $.ajax({
                            url:App.API.URL.fetchServicesUserName + lockerId +"?outer=false",
                            type:"GET",
                            success:function(res){
                                if(res.success){
                                    alert('上传失败。'  + '文件：' + file.file.name + "已锁定！锁定人是：" +  res.data.name);  //+ file.message
                                }
                            },
                            error:function(err){
                            }
                        });
                    }else{
                        alert('上传失败。'  + '版本已经发布，不能上传');  //
                    }
                    //debugger;
                }
            });
            self.updateQuotaInfo()
        },

        //获取上传容量
        getQuotaInfo: function() {
            var quota = this.quota;
            return ""; //App.Comm.modules.util.format('共 $0，已用 $1', [App.common.modules.util.formatSize(quota.total), App.common.modules.util.formatSize(quota.used)])
        },

        //更新上传容量
        updateQuotaInfo: function() {
            App.Comm.upload.setQuotaInfo(this.getQuotaInfo())
        }
    }

    App.modules.docUpload = docUpload

})(jQuery)
;/*!/projects/views/project.ContentMode.js*/
App.Projects.ContentMode = Backbone.View.extend({

	tagName: 'div',

	id: 'projectModes',

	// 重写初始化
	initialize: function() {
		this.listenTo(App.Projects.ProjectCollection, "add", this.addOne);
		this.listenTo(App.Projects.ProjectCollection, "reset", this.emptyContent);
		Backbone.on('projectListNullData',this.showNullTip,this);
	},

	template: _.templateUrl('/projects/tpls/project.ContentMode.html', true),

	render: function() {
		this.$el.html(this.template);
		return this;
	},

	//切换改变
	addOne: function(model) { 
		
		var listView = new App.Projects.listView({
			model: model
		}),$proListBox=this.$el.find(".proListBox"); 

		$proListBox.find(".loading").remove(); 

		$proListBox.append(listView.render().el);

	 
	},

	//清空内容
	emptyContent:function(){
	//	this.$el.find(".proListBox").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问项目</div></li>');
		this.$el.find(".proListBox").html('<li class="loading">正在加载...</li>');
	},

	showNullTip:function(){

		if (App.Projects.Settings.pageIndex!=1) {
			this.$el.find(".proListBox").html('<li class="loading">此页没有数据</li>');
		}else{
			this.$el.find(".proListBox").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问项目</div></li>');
		}		
	}

});
;/*!/projects/views/project.displayMode.js*/

App.Projects.DisplayMode=Backbone.View.extend({

	tagName:'div',

	className:'displayModeBox',



	events:{
		"click .list":"projectList",
		"click .map":"proMap"
	},

	template:_.templateUrl("/projects/tpls/project.displayMode.html",true),

	render:function(){
		this.$el.html(this.template);
		return this;
	},

	//切换为列表
	projectList:function(){
		App.Projects.Settings.type="list";
		$("#projectModes").find(".proListBoxScroll").show().find(".item").remove().end().end().find(".proMapBox").hide();
		//App.Projects.fetch();
		//拉取数据
		App.Projects.loadData();
	},

	//切换为地图
	proMap:function(){
		App.Projects.Settings.type="map";
		$("#projectModes").find(".proListBoxScroll").hide().end().find(".proMapBox").show();
 		//初始化地图
 		//App.Projects.BaiduMap.initMap();
		//App.Projects.fetch();
	}

});

;/*!/projects/views/project.list.js*/


App.Projects.listView=Backbone.View.extend({

	tagName:'li',

	className:'item',

	events:{
		"click .aProName":"beforeBreak"
	},

	template:_.templateUrl("/projects/tpls/project.list.detail.html"), 

	render:function(){
		//渲染数据
		var data=this.model.toJSON();
		this.$el.html(this.template(data)).attr("cid",this.model.cid);
		return this;
	},

	//跳转之前
	beforeBreak:function(event){
		
		var $target=$(event.target);

		if ($target.prop("href").indexOf("noVersion")>-1) {
			alert('暂无版本'); 
			return false;
		} 

	}

});

;/*!/projects/views/project.map.js*/
App.Projects.mapView=Backbone.View.extend({



});
;/*!/projects/views/project.search.js*/
App.Projects.searchView = Backbone.View.extend({

	tagName: 'div',

	className: 'projectSearch',

	formData:{
		 name:"",
		 projectType:"",
		 estateType: "",
         province: "",
         region: "",
         complete: "",
         open: "",
         openTimeStart: "", 
         openTimEnd: ""
	},
	//
	events: {
		"click .seniorSearch": "seniorSearch",
		"click .btnSearch": "searchProject",
		"click .btnClear": "clearSearch",
		"change .txtSearch":"linkSearchWord"
	},

	template: _.templateUrl("/projects/tpls/project.search.html"),


	render: function() {
		var _this=this;
		this.$el.html(this.template());
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');

		this.$(".pickProjectType").myDropDown({
			zIndex:99,
			click:function($item){
				_this.formData.subType=$item.attr('data-val');
			}
		});
		this.$(".pickCategory").myDropDown({
			zIndex:98,
			click:function($item){
				_this.formData.estateType=$item.attr('data-val');
			}
		});
		this.$(".projectStatus").myDropDown({
			zIndex:98,
			click:function($item){
				_this.formData.projectType=$item.attr('data-val');
			}
		});
		this.$(".pickManager").myDropDown({
			zIndex:97,
			click:function($item){
				_this.formData.region=encodeURI($item.attr('data-val'));
			}
		});
		this.$(".pickProvince").myDropDown({
			zIndex:96,
			click:function($item){
				_this.formData.province=encodeURI($item.text());
			}
		});
		this.$(".pickOpening").myDropDown({
			zIndex:95,
			click:function($item){
				_this.formData.open=$item.attr('data-val');
			}
		});

		this.$('.btnRadio').on('click',function(){
			_this.formData.complete=$(this).attr('data-val');
		})

		this.$('#dateStar').on('change',function(){
			_this.formData.openTimeStart=$(this).val();
		})
		this.$('#dateEnd').on('change',function(){
			_this.formData.openTimEnd=$(this).val();
		})

		return this;

	},

	clearSearch:function(){
		this.formData={
			 name:"",
			 projectType:"",
			 estateType: "",
	         province: "",
	         region: "",
	         complete: "",
	         open: "",
	         openTimeStart: "", 
	         openTimEnd: ""
		};
		this.$(".pickProjectType .text").html('请选择');
		this.$(".pickCategory .text").html('请选择');
		this.$(".pickManager .text").html('请选择');
		this.$(".pickProvince .text").html('请选择');
		this.$(".pickOpening .text").html('请选择');

		this.$(".btnRadio").removeClass('selected');
		this.$('#dateStar').val('');
		this.$('#dateEnd').val('');
		this.$(".quickSearch .txtSearch").val('');
		this.$('.moreSeachText').val('');
		App.Projects.Settings.pageIndex=1;
		App.Projects.loadData(this.formData); 
	},

	//显示隐藏高级收缩
	seniorSearch: function() {

		var $advancedQueryConditions = this.$el.find(".advancedQueryConditions");
		if ($advancedQueryConditions.is(":hidden")) {
			this.$el.find(".quickSearch").hide();
			this.$el.find(".advancedQueryConditions").show();
			$("#projectModes").addClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").addClass('down');
		} else {
			this.$el.find(".quickSearch").show();
			this.$el.find(".advancedQueryConditions").hide();
			$("#projectModes").removeClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").removeClass('down');
		}
		this.$el.find(".seniorSearch i").toggleClass('icon-angle-down  icon-angle-up');

	},
	//搜索项目
	searchProject: function() {
		var quickSearchName =encodeURI($(".quickSearch .txtSearch").val().trim()),
			moreSearchName =encodeURI($('.moreSeachText').val().trim());
		this.formData.name=moreSearchName||quickSearchName||'';
		App.Projects.Settings.pageIndex=1;
 		App.Projects.loadData(this.formData); 

	},

	linkSearchWord:function(e){
		this.$('.moreSeachText').val($(e.currentTarget).val());
	}

});
;/*!/projects/views/project/cost/project.cost.property.change.es6*/
"use strict";

//成本 -> 变更
App.Project.CostChange = Backbone.View.extend({

	tagName: "div",

	className: "CostChange",

	initialize: function initialize() {
		this.listenTo(App.Project.CostAttr.ChangeCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.ChangeCollection, "reset", this.reset);
	},

	events: {},

	//渲染
	render: function render() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.change.html", true);
		this.$el.html(page);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/cost/project.cost.property.change.detail.html"),

	reset: function reset() {
		this.$(".tbCostChange tbody").html(App.Project.Settings.loadingTpl);
	},


	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbCostChange tbody").html(this.template(data));
	}

});
;/*!/projects/views/project/cost/project.cost.property.es6*/
"use strict";

App.Project.ProjectCostProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectCostPropetyContainer",

	template: _.templateUrl("/projects/tpls/project/cost/project.cost.property.html", true),

	events: {
		"click .projectCostNav .item": "navClick"
	},

	render: function render() {

		this.$el.html(this.template);

		if (App.AuthObj.project && App.AuthObj.project.cost) {

			var AuthCost = App.AuthObj.project.cost,
			    $projectCostNav = this.$(".projectCostNav"),
			    CostTpl = App.Comm.AuthConfig.Project.CostTab,
			    $planContainer = this.$(".planContainer");

			//清单
			//if (AuthCost.list) {
			//	$projectCostNav.append(CostTpl.list);
			$planContainer.append(new App.Project.CostReference().render().el);
			//}

			//变更
			//if (AuthCost.change) {
			//	$projectCostNav.append(CostTpl.change);
			$planContainer.append(new App.Project.CostVerification().render().el);
			//}

			//校验
			//if (AuthCost.proof) {
			//	$projectCostNav.append(CostTpl.proof);
			$planContainer.append(new App.Project.CostChange().render().el);
			//}

			//属性
			//if (AuthCost.prop) {
			//	$projectCostNav.append(CostTpl.prop);
			$planContainer.append(new App.Project.CostProperties().render().el);
			//}
		}

		return this;
	},

	navClick: function navClick(event) {

		var $target = $(event.target),
		    type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;

		if (type == "reference") {
			//清单\
			var $CostReference = this.$el.find(".CostReference");

			$CostReference.show().siblings().hide();

			if ($CostReference.find(".noLoading").length > 0) {
				App.Project.CostAttr.ReferenceCollection.reset();
				App.Project.CostAttr.ReferenceCollection.projectId = App.Project.Settings.projectId;
				App.Project.CostAttr.ReferenceCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
				App.Project.CostAttr.ReferenceCollection.fetch({
					success: function success() {
						//this.$(".tbBodyScroll .tbBodyContent li:visible:odd").addClass("odd");
					}
				});
			}
		} else if (type == "change") {
				//变更
				var $CostChange = this.$el.find(".CostChange");

				$CostChange.show().siblings().hide();

				if ($CostChange.find(".noLoading").length > 0) {
					App.Project.CostAttr.ChangeCollection.reset();
					App.Project.CostAttr.ChangeCollection.fetch({
						data: {
							projectId: App.Project.Settings.projectId
						}
					});
				}
			} else if (type == "verification") {
				//检查

				var $CostVerification = this.$el.find(".CostVerification");

				$CostVerification.show().siblings().hide();

				if ($CostVerification.find(".noLoading").length > 0) {
					this.loadVerificationCollection();
				}
			} else if (type == "poperties") {
				//属性
				this.$el.find(".CostProperties").show().siblings().hide();
				//属性渲染
				App.Project.renderProperty();
			}
	},

	//加载 成本效验
	loadVerificationCollection: function loadVerificationCollection() {

		var projectVersionId = App.Project.Settings.CurrentVersion.id,
		    projectId = App.Project.Settings.projectId;

		App.Project.CostAttr.VerificationCollection.reset();
		App.Project.CostAttr.VerificationCollection.projectId = projectId;
		App.Project.CostAttr.VerificationCollection.projectVersionId = projectVersionId;
		App.Project.CostAttr.VerificationCollection.fetch();

		App.Project.CostAttr.VerificationCollectionCate.reset();
		App.Project.CostAttr.VerificationCollectionCate.projectId = projectId;
		App.Project.CostAttr.VerificationCollectionCate.projectVersionId = projectVersionId;
		App.Project.CostAttr.VerificationCollectionCate.fetch();
	}
});
;/*!/projects/views/project/cost/project.cost.property.properties.es6*/
"use strict";

//成本 -> 属性
App.Project.CostProperties = Backbone.View.extend({

	tagName: "div",

	className: "CostProperties",

	initialize: function initialize() {
		//this.listenTo(App.Project.CostAttr.PropertiesCollection,"add",this.addOne);
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
	},

	events: {},

	//渲染
	render: function render() {

		this.$el.html('<div class="nullTip">请选择构件</div>');

		return this;
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});
;/*!/projects/views/project/cost/project.cost.property.reference.es6*/
"use strict";

//成本 -> 清单
App.Project.CostReference = Backbone.View.extend({

	tagName: "div",

	className: "CostReference",

	isExpand: false,

	initialize: function initialize() {
		this.listenTo(App.Project.CostAttr.ReferenceCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.ReferenceCollection, "reset", this.reset);
	},

	events: {
		"click .tbBodyContent": "showInModle",
		"click .tbBodyContent .nodeSwitch": "nodeSwitch",
		"keydown .txtSearch": 'search'
	},

	//渲染
	render: function render() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.html", true);
		this.$el.html(page);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.html"),

	rootTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.root.html"),

	itemTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.root.item.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		data.treeNode = this.itemTemplate;
		this.$(".tbBody .tbBodyContent").html(this.rootTemplate(data));

		App.Comm.initScroll(this.$(".tbBodyScroll"), "y");
		if (this.isExpand) {
			this.$('.nodeSwitch').addClass('on');
			this.$('.nodeSwitch').closest('.node').children("ul").show();
			this.isExpand = false;
		}
	},

	reset: function reset() {
		this.$(".tbBody .tbBodyContent").html(App.Project.Settings.loadingTpl);
	},

	//模型中显示
	showInModle: function showInModle(event) {
		App.Project.recoverySilder();
		var $target = $(event.target).closest(".item"),
		    ids = $target.data("userId"),
		    box = $target.data("box");
		if ($target.hasClass("selected")) {
			App.Project.cancelZoomModel();
			$target.removeClass("selected");
			return;
		} else {
			this.$(".tbBodyScroll").find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		if (ids && box) {
			if (App.Project.Settings.checkBoxIsClick) {
				App.Project.Settings.Viewer.filterByUserIds(undefined);

				App.Project.Settings.checkBoxIsClick = false;
			}

			App.Project.zoomToBox(ids, box);
			return;
		}
		var data = {
			URLtype: "fetchCostModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				costCode: $target.data("code")
			}
		};
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				if (!data.data.boundingBox) {
					App.Project.cancelZoomModel();
					return;
				}
				var box = App.Project.formatBBox(data.data.boundingBox);
				$target.data("userId", data.data.elements);
				$target.data("box", box);
				if (App.Project.Settings.checkBoxIsClick) {
					App.Project.Settings.Viewer.filterByUserIds(undefined);

					App.Project.Settings.checkBoxIsClick = false;
				}
				App.Project.zoomToBox(data.data.elements, box);
			}
		});
	},


	//收起展开
	nodeSwitch: function nodeSwitch(event) {

		var $target = $(event.target),
		    $node = $target.closest(".node");

		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$node.children("ul").hide();
		} else {
			$target.addClass("on");
			$node.children("ul").show();
		}

		//this.$(".tbBodyScroll .tbBodyContent li:visible:odd").addClass("odd");

		event.stopPropagation();
	},
	search: function search(e) {
		var _this = this;
		if (e.keyCode == 13) {
			var _key = $(e.currentTarget).val();
			App.Project.CostAttr.ReferenceCollection.reset();
			App.Project.CostAttr.ReferenceCollection.projectId = App.Project.Settings.projectId;
			App.Project.CostAttr.ReferenceCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
			App.Project.CostAttr.ReferenceCollection.fetch({
				data: {
					keyword: _key
				},
				success: function success(c, d, x) {
					if (d.data.length <= 0) {
						_this.$(".tbBody .tbBodyContent").html('<div class="nullPage costList"><i class="bg"></i>暂无搜索结果</div>');
					}
				}
			});
			if (_key) {
				this.isExpand = true;
			}
		}
	}
});
;/*!/projects/views/project/cost/project.cost.property.verification.es6*/
"use strict";

//成本 -> 校验
App.Project.CostVerification = Backbone.View.extend({

	tagName: "div",

	className: "CostVerification",

	initialize: function initialize() {
		this.listenTo(App.Project.CostAttr.VerificationCollection, "add", this.addOne);
		this.listenTo(App.Project.CostAttr.VerificationCollection, "reset", this.reset);

		this.listenTo(App.Project.CostAttr.VerificationCollectionCate, "add", this.addOneCate);
		this.listenTo(App.Project.CostAttr.VerificationCollectionCate, "reset", this.resetCate);
	},

	events: {
		"click .tbVerificationCate .nodeSwitch": "showNode",
		"click .tbVerficationContentContent .nodeSwitch": "nodeSwitch",
		"click .subData .code": "showInModel"
	},

	//渲染
	render: function render() {
		var page = _.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.html", true);
		this.$el.html(page);
		return this;
	},

	rootTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.detail.root.html"),

	itemTemplate: _.templateUrl("/projects/tpls/project/cost/project.cost.property.verification.detail.root.item.html"),

	//获取数据后处理
	addOne: function addOne(model) {

		var data = model.toJSON(),
		    $tbTop = this.$(".tbTop");
		data.treeNode = this.itemTemplate, $target = this.$(".tbVerficationContentContent");

		$target.html(this.rootTemplate(data));
		$target.prev().find(".count").text(data.data.length);
	},

	addOneCate: function addOneCate(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.html"),
		    data = model.toJSON(),
		    $tbBottom = this.$(".tbVerificationCate");

		$tbBottom.find("tbody").html(template(data));
		$tbBottom.prev().find(".count").text(data.data.length);
	},
	resetCate: function resetCate() {
		this.$(".tbVerificationCate tbody").html(App.Project.Settings.loadingTpl);
	},
	reset: function reset() {
		this.$(".tbTop tbody").html(App.Project.Settings.loadingTpl);
	},

	//图元未关联计划节点 暂开
	showNode: function showNode(event) {

		var $target = $(event.target),
		    $tr = $target.closest("tr");
		//展开
		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$tr.nextUntil(".odd").hide();
			return;
		}

		//加载过
		if (!$tr.next().hasClass("odd")) {
			$target.addClass("on");
			$tr.nextUntil(".odd").show();
			return;
		}
		//未加载过
		var data = {
			URLtype: "fetchNoCostCate",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				cateId: $target.data("cateid")
			}
		};
		$tr.after('<tr><td class="subData loading">正在加载，请稍候……</td></tr>');
		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {
				var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.detail.html");
				$tr.next().remove();
				$tr.after(tpl(data));
				$target.addClass("on");
			}
		});
	},

	//在模型中显示
	showInModel: function showInModel(event) {
		App.Project.recoverySilder();
		App.Project.planCostShowInModel(event);
	},


	//收起展开
	nodeSwitch: function nodeSwitch(event) {

		var $target = $(event.target),
		    $node = $target.closest(".node");

		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$node.children("ul").hide();
		} else {
			$target.addClass("on");
			$node.children("ul").show();
		}
		event.stopPropagation();
	}
});
;/*!/projects/views/project/design/project.design.collision.detail.es6*/
"use strict";

//设计属性 碰撞
App.Project.DesignCollisionDetail = Backbone.View.extend({

  tagName: "div",

  className: "designCollision",

  events: {
    "click tr": "setCollisionPoint",
    "click .prePage": "prePage",
    "click .nextPage": "nextPage",
    "click .viewSetting": "showSetting",
    "click .export": "download"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.collision.detail.html"),

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.CollisionTaskDetail, "add", this.addCollisionDetail);
  },

  render: function render() {
    this.$el.html("");
    return this;
  },

  addCollisionDetail: function addCollisionDetail(model) {
    // 加载碰撞点列表
    var data = model.toJSON();
    if (data.message == "success") {
      var pageIndex = data.data.pageIndex,
          pageCount = data.data.pageCount;
      this.list = data.data.items;
      this.prePage = pageIndex - 1;
      this.nextPage = pageIndex + 1;
    };
    this.$el.html(this.template(data));
    return this;
  },

  setCollisionPoint: function setCollisionPoint(event) {

    App.Project.recoverySilder();

    var self = this,
        that = $(event.target).closest("tr"),
        flag = that.is('.selected'),
        name = that.find(".ckName").text();
    if (flag) {
      App.Project.Settings.Viewer.collision("", "");
    } else {
      $.each(this.list, function (index, item) {
        if (item.name == name) {
          var box = self.getBox([item.leftElementBoxMin, item.leftElementBoxMax], [item.rightElementBoxMin, item.rightElementBoxMax]);
          App.Project.Settings.Viewer.collision(item.leftId, item.rightId);
          App.Project.Settings.Viewer.translucent(true);
          App.Project.Settings.Viewer.zoomToBox(box);
        }
      });
    }
    that.toggleClass("selected").siblings().removeClass("selected");
  },
  getBox: function getBox(boxA, boxB) {
    return getVolume(boxA) > getVolume(boxB) ? boxB : boxA;
    function getVolume(box) {
      var min = box[0],
          max = box[1],
          x = Math.abs(max[0] - min[0]),
          y = Math.abs(max[1] - min[1]),
          z = Math.abs(max[2] - min[2]);
      return x * y * z;
    }
  },
  prePage: function prePage(event) {
    var that = $(event.target);
    if (that.is('.disabled')) {
      return false;
    } else {
      App.Project.DesignAttr.CollisionTaskDetail.pageNo = this.prePage;
      App.Project.DesignAttr.CollisionTaskDetail.fetch();
    }
  },

  nextPage: function nextPage(event) {
    var that = $(event.target);
    if (that.is('.disabled')) {
      return false;
    } else {
      App.Project.DesignAttr.CollisionTaskDetail.pageNo = this.nextPage;
      App.Project.DesignAttr.CollisionTaskDetail.fetch();
    }
  },

  showSetting: function showSetting() {
    var that = this;
    var dialog = new App.Comm.modules.Dialog({
      width: 580,
      height: 360,
      limitHeight: false,
      title: '碰撞检查设置',
      cssClass: 'task-create-dialog',
      message: "",
      isAlert: true,
      isConfirm: false,
      okText: '关&nbsp;&nbsp;闭',
      readyFn: function readyFn() {
        this.element.find(".content").html(new App.Project.ProjectViewSetting().render().el);
        App.Project.DesignAttr.CollisionSetting.projectId = App.Project.Settings.projectId;
        App.Project.DesignAttr.CollisionSetting.projectVersionId = App.Project.Settings.CurrentVersion.id;
        App.Project.DesignAttr.CollisionSetting.collision = App.Project.Settings.collisionId;
        App.Project.DesignAttr.CollisionSetting.fetch();
      }
    });
  },
  download: function download() {
    window.open("/model/" + App.Project.Settings.collisionId + "/" + App.Project.Settings.collisionId + "_ClashReport.xls", "下载");
  }
});
;/*!/projects/views/project/design/project.design.collision.taskList.es6*/
"use strict";

//设计属性 碰撞
App.Project.DesignCollisionTaskList = Backbone.View.extend({

  tagName: "div",

  className: "collSelect",

  template: _.templateUrl("/projects/tpls/project/design/project.design.collision.taskList.html"),

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.CollisionTaskList, "add", this.addList);
  },

  render: function render() {
    this.$el.html('<p class="tips">加载中...</p>');
    return this;
  },

  addList: function addList(model) {
    // 加载碰撞点列表
    var data = model.toJSON();
    if (data.data.length == 0) {
      return this.$el.html('<p class="tips">没有碰撞</p>');
    } else {
      if (this.$el.find("ul").length == 0 || App.Project.DesignAttr.CollisionTaskList.isNew) {
        this.$el.html(this.template(data)).find('.collList').children().eq(0).trigger('click');
        if (App.Project.DesignAttr.CollisionTaskList.isNew) {
          App.Project.DesignAttr.CollisionTaskList.isNew = false;
        }
      } else {
        this.$el.html(this.template(data));
      }

      return this;
    }
  }

});
;/*!/projects/views/project/design/project.design.collison.files.es6*/
"use strict";

App.Project.CollisionFiles = Backbone.View.extend({

  tagName: "ul",

  className: "treeView",

  events: {
    "change": "getCategory"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.collision.files.html"),

  render: function render() {
    this.$el.html(this.template(this.model));
    return this;
  }
});
;/*!/projects/views/project/design/project.design.collison.setting.es6*/
"use strict";

App.Project.ProjectDesignSetting = Backbone.View.extend({

  tagName: "div",

  className: "designCollSetting",

  isCheck: false,

  events: {
    "click .itemContent": "openTree",
    "click .parentCheckbox": "selectAll",
    "blur .labelInput": "requireName"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.collision.setting.html", true),

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.CollisionFiles, "add", this.addFiles);
  },

  render: function render() {
    this.$el.html(this.template);
    App.Project.DesignAttr.CollisionFiles.sourceId = App.Project.Settings.DataModel.sourceId;
    App.Project.DesignAttr.CollisionFiles.etag = App.Project.Settings.DataModel.etag;
    App.Project.DesignAttr.CollisionFiles.fetch();
    return this;
  },

  addFiles: function addFiles(model) {
    var that = this;
    var data = model.toJSON();
    this.$el.find(".tree").append(new App.Project.CollisionFiles({
      model: data
    }).render().el);
    return this;
  },

  openTree: function openTree(event, $target) {
    var self = this,
        that = self.element = $(event.target).closest(".itemContent"),
        that = $target || that,
        etag = that.data('etag');
    if (!$target) {
      this.isCheck = false;
    }
    if (etag && !that.hasClass('open') && that.next('.subTree').length == 0) {
      App.Project.DesignAttr.CollisionCategory.sourceId = App.Project.Settings.DataModel.sourceId;
      App.Project.DesignAttr.CollisionCategory.etag = etag;
      App.Project.DesignAttr.CollisionCategory.fetch();
      this.listenTo(App.Project.DesignAttr.CollisionCategory, "add", this.addCategory);
    }
    if (!$target) {
      that.toggleClass("open");
    } else {
      if (!that.hasClass('open')) {
        that.addClass("open");
      }
    }
  },

  selectAll: function selectAll(e) {
    this.isCheck = true;
    var $target = $(e.target),
        $itemNode = $target.closest(".itemNode");

    this.openTree(e, $target.closest(".itemContent"));

    if ($target.prop("checked")) {
      $itemNode.find('.inputCheckbox').prop("checked", true);
    } else {
      $itemNode.find('.inputCheckbox').prop("checked", false);
    }
    e.stopPropagation();
  },

  addCategory: function addCategory(model) {
    var data = model.toJSON();
    data.isCheck = this.isCheck;
    this.element.after(new App.Project.DesignTreeView({
      model: data
    }).render().el);
  },

  requireName: function requireName(event) {
    var that = $(event.target);
    if (that.val()) {
      that.removeClass("error");
    } else {
      that.addClass("error").trigger("focus");
    }
  }
});
;/*!/projects/views/project/design/project.design.property.collision.es6*/
"use strict";

//设计属性 碰撞
App.Project.DesignCollision = Backbone.View.extend({

	tagName: "div",

	className: "detailList",

	events: {
		"click .selectBox .currColl": "showSelectList",
		"click .newColl": "collPanel",
		"click .collItem": "getDetail"
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.collision.html", true),

	render: function render() {
		this.$el.html(this.template);
		this.$el.find(".collBox").html(new App.Project.DesignCollisionDetail().render().el);
		this.$el.find(".selectBox").append(new App.Project.DesignCollisionTaskList().render().el);
		App.Project.DesignAttr.CollisionTaskDetail.add({ message: "none" });
		return this;
	},

	showSelectList: function showSelectList(event) {
		// 显示碰撞任务列表
		var $el = $(event.target).closest(".inputBox");
		var that = this;
		var list = that.$el.find('.collSelect');
		list.show();
		//	$('.collHead').height('240');
		if (true || $el.next(".collSelect").find("ul").length == 0) {
			App.Project.DesignAttr.CollisionTaskList.projectId = App.Project.Settings.CurrentVersion.projectId;
			App.Project.DesignAttr.CollisionTaskList.projectVerionId = App.Project.Settings.CurrentVersion.id;
			App.Project.DesignAttr.CollisionTaskList.fetch();
		}
		$(document).on('click', that.hideSelectList);
	},
	//重新请求列表
	refreshSelectList: function refreshSelectList() {
		// 显示碰撞任务列表
		App.Project.DesignAttr.CollisionTaskList.projectId = App.Project.Settings.CurrentVersion.projectId;
		App.Project.DesignAttr.CollisionTaskList.projectVerionId = App.Project.Settings.CurrentVersion.id;
		App.Project.DesignAttr.CollisionTaskList.fetch();
	},
	hideSelectList: function hideSelectList(event) {
		// 隐藏碰撞任务列表
		var that = this;
		var target = $(event.target);
		var list = $(that).find('.collSelect');
		if (!target.is('.selectBox,.selectBox *')) {
			list.hide();
			$('.collHead').height('auto');
			$(document).off('click', that.hideSelectList);
		}
	},

	collPanel: function collPanel() {
		var self = this;
		//判断是否重新发送碰撞检测
		if ($(event.target).text() == "点此重新碰撞") {
			var $selected = $('.collItem.selected');
			if ($selected.data('status') == 3) {
				$.ajax({
					url: "view/" + App.Project.Settings.projectId + "/" + App.Project.Settings.CurrentVersion.id + "/" + $selected.data('id') + "/setting",
					//headers: {
					//	"Content-Type": "application/json"
					//},
					type: "PUT"
				}).done(function (data) {
					if (data.code == 0) {
						App.Project.DesignAttr.CollisionTaskDetail.add({ message: "running" });
						self.refreshSelectList();
					} else if (data.code == 30009) {
						$('.designCollision .collTips p').text("文件发生变更，无法重新碰撞，请新建碰撞");
					} else {
						App.Project.DesignAttr.CollisionTaskDetail.add({ message: "failed" });
						alert(data.message);
					}
				});
				return;
			}
		}
		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 360,
			limitHeight: false,
			title: '碰撞检查设置',
			cssClass: 'task-create-dialog',
			message: "",
			cancelText: "取&nbsp;&nbsp;消",
			okText: '确&nbsp;&nbsp;认',
			readyFn: function readyFn() {
				this.element.find(".content").html(new App.Project.ProjectDesignSetting().render().el);
			},
			okCallback: function okCallback() {
				var formData = {},
				    taskName = $("#taskName").val(),
				    treeA = $("#treeA"),
				    treeB = $("#treeB");
				formData.name = taskName;
				formData.leftFiles = getSpecialty(treeA);
				formData.rightFiles = getSpecialty(treeB);
				formData.projectId = App.Project.Settings.projectId;
				formData.projectVersionId = App.Project.Settings.CurrentVersion.id;
				if (!formData.name) {
					$("#taskName").addClass("error");
					return false;
				}
				if (formData.leftFiles.length == 0 || formData.rightFiles.length == 0) {
					alert("请选择碰撞文件");
					return false;
				}
				var data = {
					type: 'post',
					URLtype: "creatCollisionTask",
					contentType: "application/json",
					data: JSON.stringify(formData)
				};
				App.Comm.ajax(data, function (data) {
					if (data.message == "success") {
						App.Project.DesignAttr.CollisionTaskDetail.add({ message: "running" });
					} else {
						App.Project.DesignAttr.CollisionTaskDetail.add({ message: "failed" });
						alert(data.message);
					}
					$('.detailList .collList').html('');
					App.Project.DesignAttr.CollisionTaskList.isNew = true;
					self.refreshSelectList();
				});
			}
		});
		function getSpecialty(element) {
			var data = [];
			element.find(".file").each(function () {
				var that = $(this),
				    etag = that.children('.itemContent').data("etag"),
				    categories = [];
				that.find(".inputCheckbox").each(function () {
					var _self = $(this),
					    code = _self.data("id");
					if (_self.is(":checked")) {
						categories.push(code);
					}
				});
				if (categories.length > 0) {
					data.push({
						"file": etag,
						"categories": categories
					});
				}
			});
			return data;
		}
	},

	getDetail: function getDetail(event) {
		var list = this.$el.find('.collSelect'),
		    that = $(event.target).closest(".collItem"),
		    name = that.find('.collName').text(),
		    collisionId = that.data('id'),
		    status = that.data('status'),
		    len = parseInt(($(".detailList").height() - 65) / 77),
		    currentInput = list.prev().find("input");
		currentInput.val(name);
		that.addClass("selected").siblings().removeClass("selected");
		list.hide();
		$('.collHead').height('auto');
		App.Project.Settings.collisionId = collisionId;
		if (status == "2") {
			App.Project.DesignAttr.CollisionTaskDetail.projectId = App.Project.Settings.projectId;
			App.Project.DesignAttr.CollisionTaskDetail.projectVersionId = App.Project.Settings.CurrentVersion.id;
			App.Project.DesignAttr.CollisionTaskDetail.collisionId = collisionId;
			App.Project.DesignAttr.CollisionTaskDetail.pageNo = 1;
			App.Project.DesignAttr.CollisionTaskDetail.pageSize = len;
			App.Project.DesignAttr.CollisionTaskDetail.fetch();
		} else if (status == "3") {
			App.Project.DesignAttr.CollisionTaskDetail.add({ message: "failed" });
		} else if (status == "0" || status == "1") {
			App.Project.DesignAttr.CollisionTaskDetail.add({ message: "running" });
		}
	}

});
;/*!/projects/views/project/design/project.design.property.es6*/
"use strict";

App.Project.ProjectDesignPropety = Backbone.View.extend({

	tagName: "div",

	className: "designPropetyBox",

	template: _.templateUrl("/projects/tpls/project/design/project.design.propety.html"),

	events: {
		"click .projectPropetyHeader .item": "navItemClick",
		"click .btnFilter": "filterVerification",
		"click .ckBox tr": "showInModel"
		//	"click .clearSearch": "clearSearch"
	},

	initialize: function initialize() {
		var _this = this;
		//监听子视图过滤参数change事件
		Backbone.on('projectDesignPropetyFilterDataChange', function (key, val) {
			_this.VerificationOptions[key] = val;
		}, this);
		Backbone.on('projectDesignPropetyFilterDataClear', function (key, val) {
			_this.clearSearch();
		}, this);
	},


	render: function render() {

		this.$el.html(this.template);

		//if (App.AuthObj.project && App.AuthObj.project.design) {

		// var Auth = App.AuthObj.project.design,
		// 	$projectNav = this.$(".projectPropetyHeader"),
		// 	CostTpl = App.Comm.AuthConfig.Project.DesignTab,
		// 	$container = this.$(".projectNavContentBox");

		var $container = this.$(".projectNavContentBox");

		//属性
		//if (Auth.prop) {
		//	$projectNav.append(CostTpl.prop);
		$container.append(new App.Project.DesignProperties().render().el);
		//}

		//碰撞
		//if (Auth.collision) {
		//	$projectNav.append(CostTpl.collision);
		$container.append(new App.Project.DesignCollision().render().el);
		//}

		//检查
		//if (Auth.check) {
		//	$projectNav.append(CostTpl.check);
		$container.append(new App.Project.DesignVerification().render({
			verOpts: this.VerificationOptions
		}).el);
		//}
		//}

		this.initVerificationOptions();

		return this;
	},

	//初始化设计检查产生
	initVerificationOptions: function initVerificationOptions() {
		this.VerificationOptions = {
			status: "", //	否	Integer	1：待整改；2：已整改；3：已关闭
			specialty: "", //	否	String	专业
			type: "", //	否	Integer	1：安全；2：功能；3：品质
			reporter: "", //	否	Integer	1：设计总包；2：第三方
			pageIndex: 1,
			pageItemCount: 400

		};
	},


	//切换tab
	navItemClick: function navItemClick(event) {
		var $target = $(event.target),
		    type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;

		if (type == "collision") {
			//碰撞
			this.$el.find(".detailList").show().siblings().hide();
			$('.detailList .currColl').trigger('click');
		} else if (type == "verifi") {

			//设计检查 

			var $designVerification = this.$el.find(".designVerification");

			$designVerification.show().siblings().hide();

			if ($designVerification.find(".noLoading").length > 0) {
				this.getVerificationData();
			}
		} else if (type == "poperties") {

			//属性
			this.$el.find(".designProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();
		}
	},

	//获取 设计检查数据
	getVerificationData: function getVerificationData() {
		App.Project.DesignAttr.VerificationCollection.reset();
		App.Project.DesignAttr.VerificationCollection.projectId = App.Project.Settings.projectId;
		App.Project.DesignAttr.VerificationCollection.versionId = App.Project.Settings.CurrentVersion.id;
		App.Project.DesignAttr.VerificationCollection.fetch({
			data: this.VerificationOptions
		});
	},


	//筛选设计检查
	filterVerification: function filterVerification() {
		this.getVerificationData();
	},


	clearSearch: function clearSearch() {
		this.initVerificationOptions();
		this.getVerificationData();
	},

	//设计检查点关联构件
	showInModel: function showInModel(e) {

		var $target = $(e.currentTarget),
		    _keyId = $target.data('id'),
		    //主键ID
		ids = $target.data('userId'),
		    box = $target.data('box');
		$target.parent().find('tr').removeClass('selected');
		$target.addClass('selected');
		//判断是否取过
		if (box && ids) {
			App.Project.zoomModel(ids, box);
			return;
		}
		App.Comm.ajax({
			URLtype: 'fetchDesignCheckPointMapParam',
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				id: _keyId
			}
		}, function (res) {

			if (res.code == 0) {

				var _data = res.data;

				if (_data) {
					var location = JSON.parse(_data.location),
					    bbox = location.bBox || location.boundingBox;
					if (bbox) {
						box = App.Project.formatBBox(bbox);
						ids = [location.userId || location.componentId];
						$target.data("userId", ids);
						$target.data("box", box);
						App.Project.zoomModel(ids, box);
					}
					//	_this.showMarks([_data.location]);
				}
			}
		});
	}
});
;/*!/projects/views/project/design/project.design.property.properties.es6*/
"use strict";

//设计属性 碰撞
App.Project.DesignProperties = Backbone.View.extend({

	tagName: "div",

	className: "designProperties",

	initialize: function initialize() {
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	render: function render() {
		this.$el.html('<div class="nullTip">请选择构件</div>');
		return this;
	},

	//添加
	addOne: function addOne(model) {
		//渲染数据
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});
;/*!/projects/views/project/design/project.design.property.treeView.es6*/
"use strict";

//设计属性 碰撞
App.Project.DesignTreeView = Backbone.View.extend({

  tagName: "ul",

  className: "subTree",

  events: {},

  template: _.templateUrl("/projects/tpls/project/design/project.design.treeView.html"),

  render: function render() {
    var data = this.model;
    if (data.message == "success" && data.data.length > 0) {
      this.$el.html(this.template(data));
    } else {
      this.$el.html("没有构件");
    }
    return this;
  }
});
;/*!/projects/views/project/design/project.design.property.verification.es6*/
"use strict";

//设计属性 检查
App.Project.DesignVerification = Backbone.View.extend({

  tagName: "div",

  className: "designVerification",

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.VerificationCollection, "add", this.addOne);
    this.listenTo(App.Project.DesignAttr.VerificationCollection, "reset", this.reset);
  },

  events: {
    "click .searchToggle": "searchToggle",
    "click .clearSearch": "clearSearch"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.property.verification.html"),

  render: function render(opts) {

    this.VerificationOptions = opts.verOpts;

    var template = _.templateUrl("/projects/tpls/project/design/project.design.property.verification.header.html");
    this.$el.html(template());
    this.initEvent();
    return this;
  },

  //显示隐藏搜索
  searchToggle: function searchToggle(e) {
    var $searchDetail = this.$(".searchDetail");
    if ($searchDetail.is(":animated")) {
      return;
    }
    $(e.currentTarget).toggleClass('expandArrowIcon');
    $searchDetail.slideToggle();
  },
  searchup: function searchup() {
    var $searchDetail = this.$(".searchDetail");
    if ($searchDetail.is(":animated")) {
      return;
    }
    this.$('.searchToggle').removeClass('expandArrowIcon');
    $searchDetail.slideUp();
  },
  clearSearch: function clearSearch() {
    this.$('.specialitiesOption .text').html('全部');
    this.$('.categoryOption .text').html('全部');
    this.$('.statusOption .text').html('全部');
    this.$('.inspectionUnitOption .text').html('全部');
    Backbone.trigger('projectDesignPropetyFilterDataClear');
  },
  dataChange: function dataChange(key, val) {
    Backbone.trigger('projectDesignPropetyFilterDataChange', key, val);
  },

  //初始化事件
  initEvent: function initEvent() {

    var that = this;
    //专业
    this.$(".specialitiesOption").myDropDown({
      click: function click($item) {
        //	that.VerificationOptions.specialty = $item.text();
        //	Backbone.trigger('projectDesignPropetyFilterDataChange','specialty',$item.text())
        that.dataChange('specialty', $item.attr('data-val'));
      }
    });

    //类别
    this.$(".categoryOption").myDropDown({
      click: function click($item) {
        //	that.VerificationOptions.type = $item.text();
        that.dataChange('type', $item.attr('data-val'));
      }
    });

    //状态
    this.$(".statusOption").myDropDown({
      click: function click($item) {

        //	that.VerificationOptions.status = $item.data("status");
        that.dataChange('status', $item.data("status"));
      }
    });

    //检查单位
    this.$(".inspectionUnitOption").myDropDown({
      click: function click($item) {

        //	that.VerificationOptions.reporter = $item.text();
        that.dataChange('reporter', $item.attr('data-val'));
      }
    });

    //显示搜索结果对应位置
    this.$(".groupRadio").myRadioCk();

    //	this.$("#dateStar").one("mousedown", function() {
    //日期控件初始化
    this.$('#dateStar').datetimepicker({
      language: 'zh-CN',
      autoclose: true,
      format: 'yyyy-mm-dd',
      minView: 'month'

    }).on("changeDate", function (ev) {
      //	that.VerificationOptions.startTime = ev.date.format("yyyy-MM-dd");
      var _dateStr = new Date(ev.date.getTime() + 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
      that.$('#dateEnd').datetimepicker('setStartDate', _dateStr);
      that.$('#dateEnd').val(_dateStr);
      that.dataChange('startTime', new Date(ev.date.format("yyyy-MM-dd") + " 00:00:00").getTime());
    });
    //	});

    //	this.$("#dateEnd").one("mousedown", function() {
    //日期控件初始化
    this.$('#dateEnd').datetimepicker({
      language: 'zh-CN',
      autoclose: true,
      format: 'yyyy-mm-dd',
      minView: 'month'

    }).on("changeDate", function (ev) {
      //that.VerificationOptions.endTime = ev.date.format("yyyy-MM-dd");
      var _dateStr = ev.date.format("yyyy-MM-dd");
      //that.$('#dateStar').datetimepicker('setEndDate',_dateStr);
      that.dataChange('endTime', new Date(_dateStr + " 23:59:59").getTime());
    });
    //	});
    this.$(".dateBox .iconCal").click(function () {
      $(this).next().focus();
    });
  },
  bindScroll: function bindScroll() {

    this.$(".ckBodyScroll").mCustomScrollbar({
      set_height: "100%",
      theme: 'minimal-dark',
      axis: 'y',
      keyboard: {
        enable: true
      },
      scrollInertia: 0
    });
  },


  //数据返回
  addOne: function addOne(model) {

    if (this.$el.closest('body').length <= 0) {
      this.remove();
    }
    var data = model.toJSON();
    this.$(".ckBox .ckBody tbody").html(this.template(data.data));

    if (!this.$(".ckBodyScroll").hasClass('mCustomScrollbar ')) {
      this.bindScroll();
    }
  },

  reset: function reset() {
    this.$(".ckBox .ckBody tbody").html(App.Project.Settings.loadingTpl);
    this.searchup();
  }

});
;/*!/projects/views/project/design/project.design.view.setting.es6*/
"use strict";

App.Project.ProjectViewSetting = Backbone.View.extend({

  tagName: "div",

  className: "designCollSetting",

  events: {
    "click .itemContent": "openTree",
    "blur .labelInput": "requireName"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.view.setting.html"),

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.CollisionSetting, "add", this.addFiles);
  },

  render: function render() {
    this.$el.html('');
    return this;
  },

  addFiles: function addFiles(model) {
    var that = this;
    var data = model.toJSON();
    this.$el.html(this.template(data));
    return this;
  },

  openTree: function openTree(event) {
    var self = this,
        that = self.element = $(event.target).closest(".itemContent");
    that.toggleClass("open");
  }
});
;/*!/projects/views/project/plan/project.plan.property.es6*/
"use strict";

App.Project.ProjectPlanProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectPlanPropertyContainer",

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.nav.html", true),

	events: {
		"click .projectPlanNav .item": "navItemClick",
		"change .selDate": "changeDate",
		'change .dateStar': 'loadPlanModelData',
		'change .dateEnd': 'loadPlanModelData',
		'click .clearFormLink': 'clearSearch'
	},

	planType: '1',

	render: function render() {

		this.$el.html(this.template);

		//if (App.AuthObj.project && App.AuthObj.project.plan) {

		// var Auth = App.AuthObj.project.plan,
		// 	$projectNav = this.$(".projectPlanNav"),
		// 	CostTpl = App.Comm.AuthConfig.Project.PlanTab,
		// 	$container = this.$(".planContainer");

		var $container = this.$(".planContainer");

		////模块化
		//if (Auth.modularization) {
		//	$projectNav.append(CostTpl.modularization);
		$container.append(new App.Project.PlanModel().render().el);
		//}

		//模拟
		//if (Auth.simulation) {
		//	$projectNav.append(CostTpl.simulation);
		$container.append(new App.Project.PlanAnalog().render().el);
		//}

		//关注
		//if (Auth.follow) {
		//	$projectNav.append(CostTpl.follow);
		$container.append(new App.Project.PlanPublicity().render().el);
		//}

		//效验
		//if (Auth.proof) {
		//	$projectNav.append(CostTpl.proof);
		$container.append(new App.Project.PlanInspection().render().el);
		//}

		//属性
		//if (Auth.prop) {
		//	$projectNav.append(CostTpl.prop);
		$container.append(new App.Project.PlanProperties().render().el);
		//}
		//}

		this.initDom();
		return this;
	},

	//初始化dom事件
	initDom: function initDom() {
		var _this = this;
		this.$('.planTimeType').myDropDown({
			click: function click($item) {
				_this.planType = $item.attr('data-val');
				_this.loadPlanModelData();
			}
		});

		this.$('.dateStar').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		}).on("changeDate", function (ev) {
			var _dateStr = new Date(ev.date.getTime() + 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
			_this.$('.dateEnd').datetimepicker('setStartDate', _dateStr);
			_this.$('.dateEnd').val('');
		});
		this.$('.dateEnd').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		});
		this.$(".dateBox .iconCal").click(function () {
			$(this).next().focus();
		});
	},
	loadPlanModelData: function loadPlanModelData() {
		var _start = this.$('.dateStar').val(),
		    _end = this.$('.dateEnd').val(),
		    projectId = App.Project.Settings.projectId,
		    projectVersionId = App.Project.Settings.CurrentVersion.id;

		_start = _start ? new Date(_start + ' 00:00:00').getTime() : '';
		_end = _end ? new Date(_end + ' 23:59:59').getTime() : '';
		App.Project.PlanAttr.PlanModelCollection.reset();
		App.Project.PlanAttr.PlanModelCollection.projectId = projectId;
		App.Project.PlanAttr.PlanModelCollection.projectVersionId = projectVersionId;
		App.Project.PlanAttr.PlanModelCollection.fetch({
			data: {
				startTime: _start,
				endTime: _end,
				type: this.planType
			}
		});
	},
	clearSearch: function clearSearch() {
		this.$('.dateStar').val('');
		this.$('.dateEnd').val('');
		this.$('.planTimeType .text').html('计划开始');
		this.planType = '1';
		this.loadPlanModelData();
	},

	//切换导航
	navItemClick: function navItemClick(event) {

		var $target = $(event.target),
		    type = $target.data("type"),
		    projectVersionId = App.Project.Settings.CurrentVersion.id,
		    projectId = App.Project.Settings.projectId;
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;

		if (type == "model") {
			//碰撞

			var $planModel = this.$el.find(".planModel");

			$planModel.show().siblings().hide();

			if ($planModel.find(".noLoading").length > 0) {
				App.Project.PlanAttr.PlanModelCollection.reset();
				App.Project.PlanAttr.PlanModelCollection.projectId = projectId;
				App.Project.PlanAttr.PlanModelCollection.projectVersionId = projectVersionId;
				App.Project.PlanAttr.PlanModelCollection.fetch();
			}
		} else if (type == "analog") {
			//设计检查

			var $planAnalog = this.$el.find(".planAnalog");

			$planAnalog.show().siblings().hide();

			if ($planAnalog.find(".noLoading").length > 0) {
				App.Project.PlanAttr.PlanAnalogCollection.reset();
				App.Project.PlanAttr.PlanAnalogCollection.projectId = projectId;
				App.Project.PlanAttr.PlanAnalogCollection.projectVersionId = projectVersionId;
				App.Project.PlanAttr.PlanAnalogCollection.fetch();
			}
		} else if (type == "publicity") {

			var $planPublicity = this.$el.find(".planPublicity");
			//关注
			$planPublicity.show().siblings().hide();

			if ($planPublicity.find(".noLoading").length > 0) {
				//计划关注列表
				this.loadPublicityData(projectId, projectVersionId);
			}
		} else if (type == "inspection") {
			//设计检查

			var $planInterest = this.$el.find(".planInterest");
			$planInterest.show().siblings().hide();

			if ($planInterest.find(".noLoading").length > 0) {
				this.loadPlanInspection(projectId, projectVersionId);
			}
		} else if (type == "poperties") {
			//属性

			this.$el.find(".planProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();
		}
	},

	//改变时间
	changeDate: function changeDate(event) {

		var $target = $(event.target),
		    val = $target.val(),
		    data = {
			projectCode: App.Project.Settings.CurrentVersion.projectNo,
			type: val,
			userId: App.Comm.user('userId')
		};

		if (val == 4 || val == 2) {
			App.Project.PlanAttr.PlanPublicityCollectionMonth.reset();
			App.Project.PlanAttr.PlanPublicityCollectionMonth.fetch({
				data: data
			});
		}
		if (val == 3 || val == 1) {
			App.Project.PlanAttr.PlanPublicityCollection.reset();
			App.Project.PlanAttr.PlanPublicityCollection.fetch({
				data: data
			});
		}
	},


	//加载计划关注列表
	loadPublicityData: function loadPublicityData(projectId, projectVersionId, isEnd) {

		var weekType = 4,
		    monthType = 3;
		if (isEnd) {
			weekType = 2;
			monthType = 1;
		}

		App.Project.PlanAttr.PlanPublicityCollection.reset();
		//App.Project.PlanAttr.PlanPublicityCollection.projectId = projectId;
		//App.Project.PlanAttr.PlanPublicityCollection.projectVersionId = projectVersionId;

		App.Project.PlanAttr.PlanPublicityCollection.fetch({
			data: {
				projectCode: App.Project.Settings.CurrentVersion.projectNo,
				type: monthType,
				userId: App.Comm.user('userId')
			}
		});

		App.Project.PlanAttr.PlanPublicityCollectionMonth.reset();
		//App.Project.PlanAttr.PlanPublicityCollectionMonth.projectId = projectId;
		//App.Project.PlanAttr.PlanPublicityCollectionMonth.projectVersionId = projectVersionId;

		App.Project.PlanAttr.PlanPublicityCollectionMonth.fetch({
			data: {
				projectCode: App.Project.Settings.CurrentVersion.projectNo,
				type: weekType,
				userId: App.Comm.user('userId')
			}
		});
	},


	//加载设计检查
	loadPlanInspection: function loadPlanInspection(projectId, projectVersionId) {

		App.Project.PlanAttr.PlanInspectionCollection.reset();
		App.Project.PlanAttr.PlanInspectionCollection.projectVersionId = projectVersionId;
		App.Project.PlanAttr.PlanInspectionCollection.projectId = projectId;
		App.Project.PlanAttr.PlanInspectionCollection.fetch();

		App.Project.PlanAttr.fetchPlanInspectionCate.reset();
		App.Project.PlanAttr.fetchPlanInspectionCate.projectVersionId = projectVersionId;
		App.Project.PlanAttr.fetchPlanInspectionCate.projectId = projectId;
		App.Project.PlanAttr.fetchPlanInspectionCate.fetch();
	}
});
;/*!/projects/views/project/plan/project.plan.property.planAnalog.es6*/
"use strict";

//模拟
App.Project.PlanAnalog = Backbone.View.extend({

	tagName: "div",

	className: "planAnalog",

	events: {
		"click .playOrPause": "playAnalog",
		"click .tbPlan tr.itemClick": "pickPlayAnalog"
	},

	initialize: function initialize() {
		this.listenTo(App.Project.PlanAttr.PlanAnalogCollection, "add", this.addOne);
	},

	render: function render() {
		var html = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.html", true);
		this.$el.html(html);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),

	addOne: function addOne(model) {

		var data = model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));

		var OrderArr = _.sortBy(data.data, "planStartTime"),
		    PlayArr = [],
		    toTranslucent = [],
		    inners = [],
		    ifOuter = {},
		    allCodes = [],
		    allPlayArr = [];

		$.each(OrderArr, function (i, item) {
			allCodes.push(item.code);
			if (item.join) {
				PlayArr.push(item.code);
				if (!item.inner) {
					ifOuter[item.code] = {
						index: toTranslucent.length,
						isout: true
					};
					toTranslucent.push(item.code);
				} else {
					ifOuter[item.code] = {
						index: inners.length,
						isout: false
					};
					inners.push(item.code);
				}

				ifOuter[item.code]['join'] = item.join;
				ifOuter[item.code]['demerge'] = item.demerge;
			} else {
				allPlayArr.push(item.code);
			}
		});

		if (PlayArr.length > 0) {
			PlayArr.push(-1);
		}

		this.SourcePlay = PlayArr;
		this.analogCount = this.SourcePlay.length;
		this.ifOuter = ifOuter;
		this.toTranslucent = toTranslucent;
		this.inners = inners;
		this.allPlayArr = allPlayArr;
	},

	//挑选播放
	pickPlayAnalog: function pickPlayAnalog(event) {
		//进度模拟中 不做操作
		if (this.timer) {
			return;
		}

		//高亮钱取消
		App.Project.cancelZoomModel();

		//取消 样式
		App.Project.Settings.Viewer.highlight({
			type: "plan",
			ids: undefined
		});
		if (App.Project.Settings.checkBoxIsClick) {
			App.Project.Settings.Viewer.filterByUserIds(undefined);

			App.Project.Settings.checkBoxIsClick = false;
		}
		this.showInModle($(event.currentTarget));

		//.addClass("selected").siblings().removeClass("selected").end()
		var code = $(event.target).closest("tr").data("code"),
		    index = this.SourcePlay.indexOf(code);

		this.PlayArr = this.SourcePlay.slice(index);
	},


	//开始模拟
	playAnalog: function playAnalog(event) {

		if (App.Project.Settings.checkBoxIsClick) {
			App.Project.Settings.Viewer.filterByUserIds(undefined);

			App.Project.Settings.checkBoxIsClick = false;
		}
		var $target = $(event.target);

		//没有模拟数据
		if (!this.SourcePlay || this.SourcePlay.length <= 0) {
			alert("没有模拟数据");
			return;
		}

		if ($target.hasClass("myIcon-play")) {

			//克隆数据
			if (!this.PlayArr || this.PlayArr.length <= 0) {
				this.PlayArr = $.extend([], this.SourcePlay);
			}

			//隐藏全部
			App.Project.Settings.Viewer.filter({
				type: "plan",
				ids: this.PlayArr.concat(this.allPlayArr)
			});

			App.Project.Settings.Viewer.zoomToBuilding(0.05, 1);
			//开始模拟
			this.starAnalog();
		} else {
			clearInterval(this.timer);
			this.timer = null;
		}

		$target.toggleClass("myIcon-play myIcon-pause");
	},


	//开始模拟
	starAnalog: function starAnalog() {
		var _this = this;

		this.timer = setInterval(function () {

			//判断是否需要拆分
			if (_this.demerge) {
				if (_this.floorNum < 7) {
					$('#floors .tree input').eq(_this.floorNum).trigger('click');
					_this.floorNum++;
					return;
				} else {
					_this.demerge = false;
					var tree = $('#specialty>ul.tree>li').eq(1);
				}
			} else {
				if (_this.PlayArr[0] == -1) {
					//停止模拟
					_this.stopAnalog();
					App.Project.Settings.Viewer.translucent(false);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						ids: undefined
					});
					App.Project.Settings.Viewer.filter({
						type: "plan",
						ids: undefined
					});
					if (!$('#floors>div input').prop('checked')) {
						$('#floors>div input').trigger('click');
					}
					_this.PlayArr = [];
					if ($('#specialty>div input').prop('checked')) {
						$('#specialty>div input').trigger('click').trigger('click');
					} else {
						$('#specialty>div input').trigger('click');
					}
					return;
				}
				if (_this.ifOuter[_this.PlayArr[0]]['demerge']) {
					_this.demerge = true;
					_this.flag = true;
					_this.floorNum = 3;
					//this.PlayArr.push(this.SourcePlay[0],this.SourcePlay[1],this.SourcePlay[2],this.SourcePlay[3]);
					if ($('#floors>div input').prop('checked')) {
						$('#floors>div input').trigger('click');
					} else {
						$('#floors>div input').trigger('click').trigger('click');
					}
					$('#floors .tree input').eq(2).trigger('click');
					//$('#floors .tree input').eq(0).trigger('click');
					//$('#floors .tree input').eq(6).trigger('click');
					//专业隐藏
					var tree = $('#specialty>ul.tree>li').eq(1);

					if (tree.find('input').eq(7).prop('checked')) {
						tree.find('input').eq(7).trigger('click');
					}
					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
					if (tree.find('input').eq(8).prop('checked')) {
						tree.find('input').eq(8).trigger('click');
					}
					if (tree.find('input').eq(9).prop('checked')) {
						tree.find('input').eq(9).trigger('click');
					}
					if (tree.find('input').eq(10).prop('checked')) {
						tree.find('input').eq(10).trigger('click');
					}
					if (tree.find('input').eq(11).prop('checked')) {
						tree.find('input').eq(11).trigger('click');
					}
					if (tree.find('input').eq(12).prop('checked')) {
						tree.find('input').eq(12).trigger('click');
					}
					//建筑隐藏
					var tree = $('#specialty>ul.tree>li').eq(0);

					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
					if (tree.find('input').eq(3).prop('checked')) {
						tree.find('input').eq(3).trigger('click');
					}
					if (tree.find('input').eq(4).prop('checked')) {
						tree.find('input').eq(4).trigger('click');
					}
					//内饰隐藏
					var tree = $('#specialty>ul.tree>li').eq(7);

					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
				}
			}

			if (_this.PlayArr.length == _this.analogCount) {
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});

				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: _this.PlayArr.concat(_this.allPlayArr)
				});
			}

			if (_this.PlayArr.length) {

				var code = _this.PlayArr.splice(0, 1);

				//judge(code);
				var $tr = _this.$(".planContent tbody tr[data-code='" + code[0] + "']"),
				    $planContent = _this.$(".planContent");

				_this.$(".planContent tbody .selected").removeClass('selected');

				$tr.addClass("selected");
				//滚动条位置
				$planContent.scrollTop($tr.index() * 30);

				if (code[0] == -1) {} else if (!_this.ifOuter[code[0]]['isout']) {
					if (_this.flag) {
						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
						});
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							ids: undefined
						});
						App.Project.Settings.Viewer.translucent(true);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: _this.inners.slice(0, _this.ifOuter[code[0]]['index']).concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
						});
					} else {
						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr)
						});
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							ids: undefined
						});
						App.Project.Settings.Viewer.translucent(true);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: _this.inners.slice(0, _this.ifOuter[code[0]]['index']).concat(_this.allPlayArr)
						});
					}
				} else {
					if (_this.flag) {
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});

						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
						});
					} else {
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});

						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr)
						});
					}
				}

				var processAnalog = (_this.analogCount - _this.PlayArr.length) / _this.analogCount,
				    sourceWidth = _this.$(".progressAnalog .bg").width(),
				    width = sourceWidth * processAnalog;

				//不可以超过最大
				if (width > sourceWidth) {
					width = sourceWidth;
				}

				//this.showInModle($tr);

				_this.$(".progressAnalog .processBg").width(width);
				_this.$(".progressAnalog .processPos").css("left", width - 10);

				//底部文字
				_this.$(".desctionAnalog .analogDate").text($tr.find(".start").text());
				_this.$(".desctionAnalog .analogTitle").text($tr.find(".operationalMatters").text());
			} else {
				//停止模拟
				_this.stopAnalog();
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					ids: undefined
				});
				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: undefined
				});

				if (!$('#floors>div input').prop('checked')) {
					$('#floors>div input').trigger('click');
				}
			}
		}, 2000);
	},


	//停止模拟
	stopAnalog: function stopAnalog() {
		clearInterval(this.timer);
		this.timer = null;
		this.flag = false;
		this.$(".planContent tbody tr").removeClass("selected");
		this.$(".playOrPause").toggleClass("myIcon-play myIcon-pause");
		this.$(".progressAnalog .processBg").width(0);
		this.$(".progressAnalog .processPos").css("left", 0);
	},
	showInModle: function showInModle(event) {
		var $target = event,
		    ids = $target.data("userId"),
		    box = $target.data("box");
		if ($target.hasClass("selected")) {
			$target.parent().find(".selected").removeClass("selected");
			App.Project.cancelZoomModel();
			return;
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		if (box && ids) {
			App.Project.zoomToBox(ids, box);
			return;
		}
		var data = {
			URLtype: "fetchModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				planCode: $target.data("code")
			}
		};
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				var box = App.Project.formatBBox(data.data.boundingBox);
				if (box && box.length) {
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					App.Project.zoomToBox(data.data.elements, box);
				}
			}
		});
	}
});
;/*!/projects/views/project/plan/project.plan.property.planInspection.es6*/
"use strict";

//检查
App.Project.PlanInspection = Backbone.View.extend({

	tagName: "div",

	className: "planInterest",

	initialize: function initialize() {
		this.listenTo(App.Project.PlanAttr.PlanInspectionCollection, "add", this.addOne);
		this.listenTo(App.Project.PlanAttr.fetchPlanInspectionCate, "add", this.addOne2);

		this.listenTo(App.Project.PlanAttr.PlanInspectionCollection, "reset", this.reset);
		this.listenTo(App.Project.PlanAttr.fetchPlanInspectionCate, "reset", this.reset2);
	},

	events: {
		"click .tbBottom .nodeSwitch": "showNode",
		"click .subData .code": "showInModel",
		"click .exportList": "exportList"
	},

	render: function render() {
		var page = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.html", true);
		this.$el.html(page);
		return this;
	},

	//导出列表
	exportList: function exportList() {

		var data = {
			URLtype: "downloadPlanVer",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.versionId
			}
		};

		window.location.href = App.Comm.getUrlByType(data).url;
	},

	//计划节点未关联图元
	addOne: function addOne(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.html");
		var data = model.toJSON();
		var $tbTop = this.$(".tbTop");
		$tbTop.find("tbody").html(template(data));
		$tbTop.prev().find(".count").text(data.data.length);
		this.bindScroll();
	},

	//图元未关联计划节点
	addOne2: function addOne2(model) {
		var template = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.html");
		var data = model.toJSON();
		var $tbBottom = this.$(".tbBottom"),
		    count = data.data && data.data.length || 0;
		$tbBottom.find("tbody").html(template(data));
		$tbBottom.prev().find(".count").text(count);
		this.bindScroll();
	},
	bindScroll: function bindScroll() {
		this.$('.nullLinkData').hide();
		this.$('.exportList').show();
		App.Comm.initScroll(this.$(".contentBody .contentScroll"), "y");
	},
	reset: function reset() {
		this.$(".tbTop tbody").html(App.Project.Settings.loadingTpl);
	},
	reset2: function reset2() {
		this.$(".tbBottom tbody").html(App.Project.Settings.loadingTpl);
	},


	//图元未关联计划节点 暂开
	showNode: function showNode(event) {

		var $target = $(event.target),
		    $tr = $target.closest("tr");
		//展开
		if ($target.hasClass("on")) {
			$target.removeClass("on");
			$tr.nextUntil(".odd").hide();
			return;
		}

		//加载过
		if (!$tr.next().hasClass("odd")) {
			$target.addClass("on");
			$tr.nextUntil(".odd").show();
			return;
		}
		//未加载过
		var data = {
			URLtype: "fetchComponentByCateId",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				cateId: $target.data("cateid")
			}
		};

		$tr.after('<tr><td class="subData loading">正在加载，请稍候……</td></tr>');
		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {
				var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.inspection.detail.cate.detail.html");
				$tr.next().remove();
				$tr.after(tpl(data));
				$target.addClass("on");
			}
		});
	},

	cancelZoomModel: function cancelZoomModel() {
		//	App.Project.Settings.Viewer.fit();
		App.Project.cancelZoomModel();
	},
	//在模型中显示
	showInModel: function showInModel(event) {
		App.Project.planCostShowInModel(event);
	}
});
;/*!/projects/views/project/plan/project.plan.property.planModel.es6*/
"use strict";

App.Project.PlanModel = Backbone.View.extend({

	tagName: "div",

	className: "planModel",

	initialize: function initialize() {
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "add", this.addOne);
	},

	events: {
		"click .tbPlan tr.itemClick": "showInModle",
		"click .treeCheckbox": "switch"

	},

	render: function render() {
		var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planModel.html", true);
		this.$el.html(tpl);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),

	addOne: function addOne(model) {

		var data = model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));
		var codes = [];
		$('.planSearch .treeCheckbox input').prop('checked', false);

		$.each(data.data, function (i, item) {

			item.code ? codes.push(item.code) : '';
		});
		if (codes.length > 0) {
			codes.push(-1);
		}

		//App.Project.PlanAttr.PlanAnalogCollection.reset();
		//App.Project.PlanAttr.PlanAnalogCollection.projectId = App.Project.Settings.projectId;
		//App.Project.PlanAttr.PlanAnalogCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		//App.Project.PlanAttr.PlanAnalogCollection.fetch();
		this.codes = codes;
	},
	//切换显示此节点关联模型
	switch: function _switch() {
		if ($('.planModel .itemClick.selected').length > 0) {
			var self = this;
			App.Project.Settings.checkBoxIsClick = true;
			setTimeout(function () {
				self.showInModle('', $('.planModel .itemClick.selected'));
			}, 100);
		}
	},

	//模型中显示
	showInModle: function showInModle(event, $el) {

		App.Project.recoverySilder();

		var $target, ids, box;
		if ($el) {
			$target = $el;
		} else {
			$target = $(event.target).closest("tr");
		}
		ids = $target.data("userId");
		box = $target.data("box");

		//高亮钱取消
		App.Project.cancelZoomModel();
		App.Project.Settings.Viewer.translucent(false);

		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: undefined
		});
		//App.Project.Settings.Viewer.filter({
		//	type: "plan",
		//	ids: undefined
		//});
		if (!$el) {
			if ($target.hasClass("selected")) {
				$target.parent().find(".selected").removeClass("selected");
				return;
			} else {
				$target.parent().find(".selected").removeClass("selected");
				$target.addClass("selected");
			}
		}

		//if($('.planSearch .treeCheckbox input').prop('checked')){
		//
		//	var codesToFilter = _.filter(this.codes,function(num){return num!=$target.data("code")});
		//	App.Project.Settings.Viewer.translucent(false);
		//
		//	App.Project.Settings.Viewer.filter({
		//		type: "plan",
		//		ids: codesToFilter
		//	});
		//
		//	//App.Project.Settings.Viewer.translucent(true);
		// //
		//	//App.Project.Settings.Viewer.highlight({
		//	//	type: "plan",
		//	//	ids: [$target.data("code")]
		//	//});
		//	//App.Project.Settings.Viewer.zoomToBuilding(0.05,1);
		//	return
		//}

		if (box && ids) {
			if ($('.planSearch .treeCheckbox input').prop('checked')) {
				App.Project.Settings.checkBoxIsClick = true;
				App.Project.Settings.Viewer.filterByUserIds(ids);

				return;
			}
			if ($el) {
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});
				//App.Project.Settings.Viewer.filter({
				//	type: "plan",
				//	ids: undefined
				//});
				App.Project.Settings.Viewer.filterByUserIds(undefined);

				App.Project.Settings.Viewer.translucent(true);
				App.Project.Settings.Viewer.highlight({
					type: 'userId',
					ids: ids
				});
			} else {
				App.Project.zoomToBox(ids, box);
			}
			return;
		}
		var data = {
			URLtype: "fetchModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				planCode: $target.data("code")
			}
		};
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				var box = App.Project.formatBBox(data.data.boundingBox);
				if (box && box.length) {
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					if ($('.planSearch .treeCheckbox input').prop('checked')) {
						App.Project.Settings.checkBoxIsClick = true;
						App.Project.Settings.Viewer.filterByUserIds(data.data.elements);

						return;
					}
					if ($el) {
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});
						//App.Project.Settings.Viewer.filter({
						//	type: "plan",
						//	ids: undefined
						//});
						App.Project.Settings.Viewer.filterByUserIds(undefined);

						App.Project.Settings.Viewer.translucent(true);
						App.Project.Settings.Viewer.highlight({
							type: 'userId',
							ids: data.data.elements
						});
					} else {
						App.Project.zoomToBox(data.data.elements, box);
					}
				}
			} else {
				App.Project.cancelZoomModel();
			}
		});
	}
});
;/*!/projects/views/project/plan/project.plan.property.planProperties.es6*/
"use strict";

App.Project.PlanProperties = Backbone.View.extend({

	tagName: "div",

	className: "planProperties",

	initialize: function initialize() {
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
		//this.listenTo(App.Project.PlanAttr.PlanPropertiesCollection, "add", this.addOne);
	},

	render: function render() {

		this.$el.html('<div class="nullTip">请选择构件</div>');
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	addOne: function addOne(model) {
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});
;/*!/projects/views/project/plan/project.plan.property.planPublicity.es6*/
"use strict";

//关注
App.Project.PlanPublicity = Backbone.View.extend({

	tagName: "div",

	className: "planPublicity",

	initialize: function initialize() {
		this.listenTo(App.Project.PlanAttr.PlanPublicityCollection, "add", this.addOne);
		this.listenTo(App.Project.PlanAttr.PlanPublicityCollectionMonth, "add", this.addOneMonth);
	},

	render: function render() {
		var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.publicityCollection.html");
		this.$el.html(tpl);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.publicityCollection.detail.html"),

	//周
	addOne: function addOne(model) {

		var data = model.toJSON();
		this.$(".tbTop tbody").html(this.template(data));
		App.Comm.initScroll(this.$(".tbTopScroll"), "y");
	},

	//月份
	addOneMonth: function addOneMonth(model) {
		var data = model.toJSON();
		this.$(".tbBottom tbody").html(this.template(data));
		App.Comm.initScroll(this.$(".tbBottomScroll"), "y");
	}

});
;/*!/projects/views/project/project.app.js*/
// 项目总控
App.Project.ProjectApp = Backbone.View.extend({

	tagName: "div",

	className: "projectContainerApp",

	events: {
		"click .projectTab .item": "SwitchProjectNav"
	},

	render: function() { 
		//nav
		this.$el.html(new App.Project.ProjectContainer().render().$el); 
		return this;
	}, 
	

	// 切换项目Tab
	SwitchProjectNav: function(event) { 

		var $el = $(event.target);
		//样式处理
		$el.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.projectNav = $el.data("type");
		//非文件导航 设计 计划 成本 质量
		if (App.Project.Settings.fetchNavType != "file") { 
			//根据类型渲染数据
			App.Project.renderModelContentByType();  
		} 
	}
	



});
;/*!/projects/views/project/project.container.es6*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

App.Project.ProjectContainer = Backbone.View.extend({

	tagName: 'div',

	className: 'projectContent',

	template: _.templateUrl('/projects/tpls/project/project.container.html'),

	initialize: function initialize() {
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.renderProperties);
	},


	events: {
		"click .breadItem": "breadItemClick", //点击头部导航  项目  版本  列表 模型
		"click .projectList .projectBox .item,.projectVersionList .container .item": "beforeChangeProject", //切换项目 之前 处理
		"click .slideBar": "navBarShowAndHide",
		"mousedown .dragSize": "dragSize",
		"click .projectVersionList .nav .item": "changeVersionTab",
		"click .fileNav .commSpan": "switchFileMoldel",
		"keyup .projectList .txtSearch": "filterProject",
		"keyup .projectVersionList .txtSearch": "filterProjectVersion",
		"click .modleTitleBar": "triggerUpDown",
		"click .modleShowHide": "slideUpAndDown"

	},

	render: function render() {
		this.$el.html(this.template({}));
		//导航
		this.$el.find("#projectContainer").prepend(new App.Project.leftNav().render().el);

		//加载文件
		this.$el.find(".projectCotent").append(new App.Project.FileContainer().render().el);
		this.$el.find(".projectCotent").append('<div class="modelContainer"> <div class="modelContainerScroll"><div class="modelContainerContent"></div></div> </div>');
		return this;
	},

	//过滤项目
	filterProject: function filterProject(event) {

		var $target = $(event.target),
		    val = $target.val().trim(),
		    $list = $target.parent().find(".container a.item");

		if (!val) {
			$list.show();
		} else {
			$list.each(function () {

				if ($(this).text().indexOf(val) < 0) {
					$(this).hide();
				}
			});
		}
	},


	//过滤项目版本
	filterProjectVersion: function filterProjectVersion(event, t) {
		var $target = t || $(event.target),
		    val = $target.val().trim(),
		    type = this.currentVersionType || 'release';
		$list = $target.parent().find(".container " + " ." + type + "VersionBox" + " a.item"), $noheader = $target.parent().find('.' + type + 'VersionBox' + ' .versionNoheader');
		$noheader.show();
		$list.show();
		$list.each(function () {
			if ($(this).find(".vName").text().indexOf(val) < 0) {
				$(this).hide();
			}
		});
		$noheader.each(function () {
			if (!$(this).find('.item').is(':visible')) {
				$(this).hide();
			}
		});
		/*if (!val) {
  	$list.show();
  } else {
  	
  }*/
	},


	triggerUpDown: function triggerUpDown(e) {
		//debugger
		this.slideUpAndDown(e, $(e.currentTarget), $(e.currentTarget).find('.modleShowHide'));
	},

	//展开和收起
	slideUpAndDown: function slideUpAndDown(event, _$parent, $current) {
		var $parent = _$parent || $(event.target).closest('.modle'),
		    classkey,
		    $modleList = $parent.find(".modleList");
		$modleList = $modleList.length == 0 ? $parent.next() : $modleList;
		_$current = $current || $(event.target);
		_$current.toggleClass("down");
		if ($modleList.is(":hidden")) {
			$modleList.slideDown();
		} else {
			$modleList.slideUp();
		}
		//classkey临时请求数据
		if (_$current.is('.getdata') || _$current.find('.modleShowHide').is('.getdata')) {
			if (_$current.is('.getdata')) {
				classkey = _$current.data('classkey');
				_$current.removeClass('getdata');
			} else {
				classkey = _$current.find('.modleShowHide').data('classkey');
				_$current.find('.modleShowHide').removeClass('getdata');
			}
			$modleList.slideDown();
			$.ajax({
				url: "platform/setting/extensions/" + App.Project.Settings.projectId + "/" + App.Project.Settings.CurrentVersion.id + "/property?classKey=" + classkey + "&elementId=" + App.Project.Settings.ModelObj.intersect.userId
			}).done(function (res) {
				if (res.code == 0) {
					var props = res.data.properties;
					for (var str = '', i = 0; i < props.length; i++) {
						if (res.data.className == '成本管理' || props[i]['type'] == 'tree') {
							try {
								str += App.Project.properCostTree(props[i]['value']);
							} catch (e) {
								_$current.parent().siblings('.modleList').html(App.Project.costDataHtml);
								return;
							}
						} else if (props[i]['type'] == 'list') {
							str += '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">' + props[i]['property'] + '</div></span> <span class="modleVal rEnd"></span> </li>';

							if (props[i]['elementType'] && props[i]['elementType'] == 'link') {
								var type1 = '',
								    type2 = '';
								for (var j = 0; j < props[i]['value'].length; j++) {
									if (props[i]['value'][j]['unit'] && props[i]['value'][j]['unit'].slice(0, 2) == "01") {

										type1 += '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2"><a target="_blank" href="' + props[i]['value'][j]['value'] + '">' + props[i]['value'][j]['name'] + '</a>&nbsp;&nbsp;</div></li>';
									} else if (props[i]['value'][j]['unit'] && props[i]['value'][j]['unit'].slice(0, 2) == "02") {

										type2 += '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2"><a target="_blank" href="' + props[i]['value'][j]['value'] + '">' + props[i]['value'][j]['name'] + '</a>&nbsp;&nbsp;</div></li>';
									} else {
										str += '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2"><a target="_blank" href="' + props[i]['value'][j]['value'] + '">' + props[i]['value'][j]['name'] + '</a>&nbsp;&nbsp;</div></li>';
									}
								}
								type1 ? str += '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">过程验收</div></span> <span class="modleVal rEnd"></span> </li>' + type1 : '';
								type2 ? str += '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">开业验收</div></span> <span class="modleVal rEnd"></span> </li>' + type2 : '';
							} else {
								str += '<li class="modleItem"><div class="modleNameText overflowEllipsis modleName2">' + props[i]['property'] + '</div></li>';
								for (var j = 0; j < props[i]['value'].length; j++) {
									str += '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">' + props[i]['value'][j]['property'] + '</div></span> <span class="modleVal rEnd">' + props[i]['value'][j]['value'] + '</span> </li>';
								}
							}
						} else if (props[i]['type'] == 'character') {
							str += '<li class="modleItem"><span class="modleName overflowEllipsis"><div class="modleNameText overflowEllipsis">' + props[i]['property'] + '</div></span> <span class="modleVal rEnd">' + props[i]['value'] + '</span> </li>';
						}
					}
					//_$current.parent().siblings('.modleList').html(str);

					if (res.data.className == '质量管理') {
						//_$current.parent().append(str);
						//_$current.parent().siblings('.modleList').html(str);
						$('.attrClassBox [data-classkey=4]').parent().siblings('.modleList').html(str);
					} else {
						_$current.parent().siblings('.modleList').html(str);
					}
					//str += '<li class="modleItem">'+
					//	'<span class="modleName"><div title='<%=subItem.name%>' class="modleNameText overflowEllipsis"><%=subItem.name%></div></span> <span class="modleVal overflowEllipsis"><%=subItem.value%><%=subItem.unit%></span>'+
					//	'</li>'
				}
			});
		}
		event.stopPropagation();
	},

	//点击面包靴
	breadItemClick: function breadItemClick(event) {

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
	beforeChangeProject: function beforeChangeProject(event) {

		var $target = $(event.target).closest(".item"),
		    href = $target.prop("href");

		if ($target.prop("href").indexOf("noVersion") > -1) {
			alert('暂无版本');
			return false;
		}

		App.count = App.count || 1;
		//destroy 清除不干净 没5次 reload page
		if (App.count > 4) {
			$("#pageLoading").show();
			location.reload();
		} else {
			App.count++;
			if ($target.prop("href") != location.href && App.Project.Settings.Viewer) {
				App.Project.Settings.Viewer.destroy();
				App.Project.Settings.Viewer = null;
			}
		}
	},


	//加载分组项目
	loadProjectList: function loadProjectList() {

		var data = {
			URLtype: "fetchCrumbsProject"
		};

		//渲染数据
		App.Comm.ajax(data, function (data) {

			var $projectList = $(".breadItem .projectList");
			var template = _.templateUrl("/projects/tpls/project/project.container.project.html");
			$projectList.find(".container").html(template(data.data));
			$projectList.find(".loading").hide();
			$projectList.find(".listContent").show();
		});
	},

	//加载版本
	loadProjectVersionList: function loadProjectVersionList() {

		App.Project.loadVersion(function (data) {

			var $projectVersionList = $(".breadItem .projectVersionList");
			var template = _.templateUrl("/projects/tpls/project/project.container.version.html");
			$projectVersionList.find(".container").html(template(data.data));

			//显示

			$projectVersionList.find(".loading").hide();
			$projectVersionList.find(".listContent").show();
			$projectVersionList.find('.item.selected').click();
		});
	},

	//版本tab 切换
	changeVersionTab: function changeVersionTab(event) {

		var $target = $(event.target),
		    type = $target.data("type"),
		    that = this;
		this.currentVersionType = type;
		$target.addClass("selected").siblings().removeClass("selected");
		this.$('.projectVersionList .txtSearch').val('');
		setTimeout(function () {
			that.filterProjectVersion(null, that.$('.projectVersionList .txtSearch'));
		}, 10);
		//发布版本
		if (type == "release") {
			var $releaseVersionBox = $target.closest(".listContent").find(".releaseVersionBox");
			if ($releaseVersionBox.length <= 0) {
				var _null = $('<div class="releaseVersionBox"><span class="GlobalBlankMessage"><i></i>暂无发布版本</span></div>');
				_null.css({
					'textAlign': 'center',
					'color': '#ccc'
				});
				$target.closest(".listContent").find(".container").append(_null);
			}
			$target.closest(".listContent").find(".releaseVersionBox").show().siblings().hide();
		} else {

			var $changeVersionBox = $target.closest(".listContent").find(".changeVersionBox");
			if ($changeVersionBox.length <= 0) {
				var _null = $('<div class="changeVersionBox"><span class="GlobalBlankMessage"><i></i>暂无变更版本</span></div>');
				_null.css({
					'textAlign': 'center',
					'color': '#ccc'
				});
				$target.closest(".listContent").find(".container").append(_null);
			}
			$target.closest(".listContent").find(".changeVersionBox").show().siblings().hide();
		}
	},

	//显示和隐藏
	navBarShowAndHide: function navBarShowAndHide(event) {
		var $target = $(event.target);
		if ($target.closest(".leftNav").length > 0) {
			this.navBarLeftShowAndHide();
		} else {
			this.navBarRightShowAndHide();
		}
	},

	//收起和暂开
	navBarLeftShowAndHide: function navBarLeftShowAndHide() {
		App.Comm.navBarToggle($("#projectContainer .leftNav"), $("#projectContainer .projectCotent"), "left", App.Project.Settings.Viewer);
	},

	//右侧收起和暂开
	navBarRightShowAndHide: function navBarRightShowAndHide() {

		App.Comm.navBarToggle($("#projectContainer .rightProperty "), $("#projectContainer .projectCotent"), "right", App.Project.Settings.Viewer);
	},

	//拖拽改变尺寸
	dragSize: function dragSize(event) {
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
	switchFileMoldel: function switchFileMoldel(event) {

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
			var status = App.Project.Settings.CurrentVersion.status;
			if (status != 9 && status != 4 && status != 7) {
				$(".fileContainer .btnFileUpload").show();
				//上传
				App.Project.upload = App.modules.docUpload.init($(document.body));
			} else {
				$(".fileContainer .btnFileUpload").hide();
			}
			//隐藏下拉
			$target.addClass("selected").siblings().removeClass("selected");
		} else {

			if (!(typeof Worker === 'undefined' ? 'undefined' : _typeof(Worker))) {
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
	typeContentChange: function typeContentChange() {

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
	fetchModelIdByProject: function fetchModelIdByProject() {

		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id
			}
		};
		var that = this;

		App.Comm.ajax(data, function (data) {

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
	renderModel: function renderModel() {

		//设置onlymodel
		App.Comm.setOnlyModel();

		var that = this;

		this.typeContentChange();

		//渲染模型属性
		//App.Project.renderModelContentByType();
		//return;

		var viewer = App.Project.Settings.Viewer = new bimView({
			type: 'model',
			element: $("#projectContainer .modelContainerContent"),
			sourceId: App.Project.Settings.DataModel.sourceId,
			etag: App.Project.Settings.DataModel.etag, //"f3159e36f65d275ab67867a2187f857c" ||
			projectId: App.Project.Settings.projectId,
			projectVersionId: App.Project.Settings.CurrentVersion.id
		});

		viewer.on('viewpoint', function (point) {
			$("#projectContainer .projectNavModelContainer .tree-view:eq(1) .item-content:eq(0)").addClass('open');
			App.Project.ViewpointAttr.ListCollection.add({
				data: [{
					id: '',
					name: '新建视点',
					viewPoint: point
				}]
			});
		});

		viewer.on("click", function (model) {

			//取消计划高亮
			var result = that.cancelhighlightPlan(),
			    selectedIds = App.Project.Settings.Viewer.getSelectedIds();

			App.Project.Settings.ModelObj = null;
			if (!model.intersect) {

				if (selectedIds) {
					var obj,
					    arr = [];

					if (Object.keys(selectedIds).length == 1) {
						for (var i in selectedIds) {
							obj = {
								userId: i,
								sceneId: selectedIds[i]['sceneId']
							};
						}
						App.Project.Settings.ModelObj = {
							intersect: {
								userId: obj.userId,
								object: {
									userData: {
										sceneId: obj.sceneId
									}
								}
							}

						};
						that.viewerPropertyRender();
					} else {
						for (var i in selectedIds) {
							if (arr[0]) {
								if (arr[0] != selectedIds[i]['classCode']) {
									that.resetProperNull();
									return;
								}
							} else {
								arr[0] = selectedIds[i]['classCode'];
							}
						}

						var uid = Object.keys(selectedIds)[0],
						    info = selectedIds[uid];

						obj = {
							userId: uid,
							sceneId: info['sceneId']
						};

						App.Project.Settings.ModelObj = {
							intersect: {
								userId: obj.userId,
								object: {
									userData: {
										sceneId: obj.sceneId
									}
								}
							}

						};
						that.viewerPropertyRender();
					}
				} else {
					that.resetProperNull();
				}

				return;
			} else if (Object.keys(selectedIds).length > 1) {

				var arr = [];

				for (var i in selectedIds) {
					if (arr[0]) {
						if (arr[0] != selectedIds[i]['classCode']) {
							that.resetProperNull();
							return;
						}
					} else {
						arr[0] = selectedIds[i]['classCode'];
					}
				}
			}

			// if (result) {
			// 	viewer.highlight({
			// 		type: 'userId',
			// 		ids: [model.intersect.userId]
			// 	});
			// }

			App.Project.Settings.ModelObj = model;
			//App.Project.Settings.modelId = model.userId;
			that.viewerPropertyRender();
			//展开
			//		$("#projectContainer .rightProperty").css('marginRight', '0');
			//		$("#projectContainer .rightProperty .icon-caret-left").attr('class', 'icon-caret-right');
		});

		//分享
		if (App.Project.Settings.type == "token" && location.hash.indexOf("share") > 0 || App.Project.Settings.viewPintId) {

			viewer.on("loaded", function () {
				//加载数据
				$(".modelSidebar  .bar-item.m-camera").click();
			});
		}

		if (App.Project.Settings.type == "token" && App.Project.Settings.PlanElement && App.Project.Settings.PlanElement.elements.length > 0) {

			viewer.on("loaded", function () {
				var data = {
					type: "userId",
					ids: App.Project.Settings.PlanElement.elements
				};
				//高亮
				viewer.highlight(data);
				//半透明
				viewer.translucent(true);

				//var box = App.Project.formatBBox(App.Project.Settings.PlanElement.boundingBox);
				//if (box && box.length) {
				//	App.Project.zoomToBox(App.Project.Settings.PlanElement.elements, box);
				//}
				viewer.zoomToBuilding(0.05, 1);
			});
		}

		viewer.on("loaded", function () {
			//加载数据
			that.loadFiveMajor();
		});
	},

	//取消高亮
	cancelhighlightPlan: function cancelhighlightPlan() {

		var result = false;

		if ($(".projectHeader .plan").hasClass("selected")) {

			if (!$(".projectPlanNav .item[data-type='model']").hasClass("selected")) {
				//计划 模块化
				var $select = $("#projectContainer .planContainer .planModel").find(".selected");
				if ($select.length > 0) {
					$select.click();
					result = true;
				}
			}

			if (!$(".projectPlanNav .item[data-type='analog']").hasClass("selected")) {
				//进度模拟的时候点击其他的
				var $play = $("#projectContainer .planContainer .planAnalog .playOrPause");
				if ($play.hasClass("myIcon-pause")) {
					$play.click();
					result = true;
				}

				var $select = $("#projectContainer .planContainer .planAnalog").find(".selected");
				if ($select.length > 0) {
					$select.click();
					result = true;
				}
			}
		} else {
			//计划 模块化
			var $select = $("#projectContainer .planContainer .planModel").find(".selected");
			if ($select.length > 0) {
				$select.click();
				result = true;
			}
			//进度模拟的时候点击其他的
			var $play = $("#projectContainer .planContainer .planAnalog .playOrPause");
			if ($play.hasClass("myIcon-pause")) {
				$play.click();
				result = true;
			}

			var $select = $("#projectContainer .planContainer .planAnalog").find(".selected");
			if ($select.length > 0) {
				$select.click();
				result = true;
			}
		}

		return result;
	},


	//只加载5大专业
	loadFiveMajor: function loadFiveMajor() {
		var $this,
		    test = /建筑|结构|幕墙|采光顶|景观|内装&标识|内装&导识/;
		$(".bim .itemNode:first>ul>li>.itemContent>.treeText").each(function () {
			$this = $(this);
			if (!test.test($this.text())) {
				$this.prev().click();
			}
		});
	},


	//重置 内容为空
	resetProperNull: function resetProperNull() {

		var projectNav = App.Project.Settings.projectNav,
		    property = App.Project.Settings.property,
		    $el;
		if (property == "poperties") {

			//if (projectNav == "design") {
			//	//设计
			//	$el = $(".rightPropertyContentBox .designProperties");

			if (projectNav == "cost") {
				//成本
				$el = $(".rightPropertyContentBox .CostProperties");
			} else if (projectNav == "quality") {
				//质量
				$el = $(".rightPropertyContentBox .QualityProperties");
			} else if (projectNav == "plan") {
				//计划
				$el = $(".rightPropertyContentBox .planProperties");
			} else {
				//设计  或者没有选中任何一栏时的默认属性页
				$el = $(".rightPropertyContentBox .designProperties");
			}
		}
		if ($el) {
			$el.html('<div class="nullTip">请选择构件</div>');
		}
	},


	//设置渲染
	viewerPropertyRender: function viewerPropertyRender() {
		var projectNav = App.Project.Settings.projectNav,
		    property = App.Project.Settings.property,
		    Intersect = App.Project.Settings.ModelObj.intersect;

		//属性，四个tab 都一样
		if ((projectNav == "design" || projectNav == "cost" || projectNav == "quality" || projectNav == "plan" || projectNav == '') && property == "poperties") {

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
	renderProperties: function renderProperties(model) {
		var data = model.toJSON().data,
		    templateProperties = _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),
		    $designProperties = this.$el.find(".singlePropetyBox .designProperties");
		App.Project.userProps.call(this, data, function (data) {
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
;/*!/projects/views/project/project.container.file.detail.es6*/
"use strict";

App.Project.FileContainerDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	//初始化
	initialize: function initialize() {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.destroy);
	},

	//事件绑定
	events: {
		"click .fileName  .text": "fileClick",
		"click .ckAll": "singleCheck",
		"click .btnCalcel": "cancelEdit",
		"click .btnEnter": "enterEditNameOrCreateNew"
	},

	template: _.templateUrl("/projects/tpls/project/project.container.file.detail.html"),

	//渲染
	render: function render() {

		var data = this.model.toJSON();
		data.isSearch = data.isSearch || false;
		if (data.isSearch) {
			$('#projectContainer .fileContainer .ckAll').hide();
		} else {
			$('#projectContainer .fileContainer .ckAll').show();
		}
		this.$el.html(this.template(data));

		if (data.isAdd) {
			this.$el.addClass('createNew');
		} else {
			this.$el.removeClass('createNew');
		}

		App.Project.bindContextMenu(this.$el);
		return this;
	},

	//文件或者文件夹点击
	fileClick: function fileClick(event) {
		var $target = $(event.target),
		    id = $target.data("id"),
		    isFolder = $target.data("isfolder");
		//文件夹
		if (isFolder) {

			var $leftItem = $("#projectContainer .projectNavContentBox .treeViewMarUl span[data-id='" + id + "']");

			if ($leftItem.length > 0) {

				var $nodeSwitch = $leftItem.parent().find(".nodeSwitch");

				if ($nodeSwitch.length > 0 && !$nodeSwitch.hasClass('on')) {
					$nodeSwitch.click();
				}
				$leftItem.click();
			}
			$('#projectContainer .returnBack').attr('isReturn', '1').removeClass('theEnd').html('返回上级');
		} else {

			//this.fetchFileModelIdByFileVersionId(id,$target);

		}
	},

	//获取文件模型id
	fetchFileModelIdByFileVersionId: function fetchFileModelIdByFileVersionId(id, $target) {

		var data = {
			URLtype: "fetchFileModelIdByFileVersionId",
			data: {
				projectId: App.Project.Settings.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				fileVersionId: id
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.message == "success") {

				if (data.data.modelId) {} else {
					$target.prop("href", "javascript:void(0);");
					alert("模型转换中");
				}
			} else {
				alert(data.message);
			}
		});
	},

	cancelEdit: function cancelEdit(e) {
		App.Project.calcelEditName(e);
	},
	enterEditNameOrCreateNew: function enterEditNameOrCreateNew(e) {
		var $item = $(e.target).closest(".item");
		var $target = $(e.currentTarget);
		if ($target.hasClass('createNewCls')) {
			App.Project.createNewFolder($item);
		} else {
			App.Project.editFolderName($item);
		}
		//;
	},

	//是否全选
	singleCheck: function singleCheck(event) {

		if (this.$el.parent().find(".ckAll:not(:checked)").length > 0) {
			$(".fileContentHeader  .header .ckAll").prop("checked", false);
		} else {
			$(".fileContentHeader  .header .ckAll").prop("checked", true);
		}
	},
	destroy: function destroy(model) {
		this.$el.remove();
		App.Project.afterRemoveFolder(model.toJSON());
	}
});
;/*!/projects/views/project/project.container.file.es6*/
"use strict";

App.Project.FileContainer = Backbone.View.extend({

	tagName: "div",

	className: "fileContainer",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Project.FileCollection, "reset", this.reset);
		this.listenTo(App.Project.FileCollection, "add", this.addOneFile);
		this.listenTo(App.Project.FileCollection, "searchNull", this.searchNull);
	},

	events: {
		"click .header .ckAll": "ckAll",
		"click .btnFileSearch": "fileSearch",
		"click .clearSearch": "clearSearch",
		"keyup #txtFileSearch": "enterSearch"

	},

	template: _.templateUrl("/projects/tpls/project/project.container.file.html"),

	//渲染
	render: function render() {
		this.$el.html(this.template());
		var $container = this.$el.find('.serviceNav'),
		    Auth = App.AuthObj && App.AuthObj.project && App.AuthObj.project.prjfile,
		    projectId = App.Project.Settings.CurrentVersion.projectId;

		/*if (!Auth) {
  	Auth = {};
  }
   
  if (!Auth.edit) {
  	this.$('.btnFileUpload').addClass('disable');
  	if (!Auth.downLoad) {
  		this.$('.btnFileDownLoad').addClass('disable');
  	}
  }
  if (App.Project.Settings.CurrentVersion.status == 9 ||
  	App.Projects.fromCache(projectId,'subType') == 1) {
  	this.$('.btnNewFolder').addClass('disable');
  	this.$('.btnFileDel').addClass('disable');
  }
  
  if(App.Projects.fromCache(projectId,'subType') == 1){
  	this.$('.btnNewFolder').addClass('disable');
  	this.$('.btnFileDel').addClass('disable');
  }
  if (!Auth.create) {
  	this.$('.btnNewFolder').addClass('disable');
  }
  if (!Auth.delete) {
  	this.$('.btnFileDel').addClass('disable');
  }*/

		if (!App.Comm.isAuth('create')) {
			this.$('.btnNewFolder').addClass('disable');
		}
		//删除、上传、重命名权限判断方式一样
		if (!App.Comm.isAuth('upload')) {
			this.$('.btnFileUpload ').addClass('disable');
		}
		if (!App.Comm.isAuth('delete')) {
			this.$('.btnFileDel').addClass('disable');
		}
		return this;
	},

	ckAll: function ckAll(event) {
		this.$el.find(".fileContent .ckAll").prop("checked", event.target.checked);
	},


	//回车搜索
	enterSearch: function enterSearch(event) {
		if (event.keyCode == 13) {
			this.fileSearch();
		}
	},


	//搜索
	fileSearch: function fileSearch() {
		var _this = this;

		var txtSearch = $("#txtFileSearch").val().trim();

		//没有搜索内容
		if (!txtSearch) {
			return;
		}
		//搜索赋值
		App.Project.Settings.searchText = txtSearch;
		var data = {
			URLtype: "fileSearch",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId,
				key: txtSearch
			}
		};

		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {
				var count = data.data.length;
				_this.$(".clearSearch").show();
				_this.$(".opBox").hide();
				_this.$(".searchCount").show().find(".count").text(count);
				App.Project.FileCollection.reset();

				if (count > 0) {
					var _temp = data.data || [];
					_.each(_temp, function (item) {
						item.isSearch = 'search';
					});
					App.Project.FileCollection.push(_temp);
				} else {
					App.Project.FileCollection.trigger("searchNull");
				}
			}
		});
	},


	//搜索为空
	searchNull: function searchNull() {
		this.$el.find(".fileContent").html('<li class="loading"><i class="iconTip"></i>未搜索到相关文件/文件夹</li>');
	},


	//清除搜索
	clearSearch: function clearSearch() {

		this.$(".clearSearch").hide();
		this.$(".opBox").show();
		this.$(".searchCount").hide();
		$("#txtFileSearch").val("");
		App.Project.Settings.searchText = "";
		App.Project.FileCollection.reset();

		var $selectFile = $(".projectNavFileContainer .selected");

		if ($selectFile.length > 0) {
			App.Project.FileCollection.fetch({
				data: {
					parentId: $selectFile.data("file").fileVersionId
				}
			});
		} else {
			App.Project.FileCollection.fetch();
		}
	},


	//添加单个li
	addOneFile: function addOneFile(model) {

		var view = new App.Project.FileContainerDetail({
			model: model
		});

		this.$el.find(".fileContent .loading").remove();

		this.$el.find(".fileContent").append(view.render().el);

		//绑定滚动条
		App.Comm.initScroll(this.$el.find(".fileContainerScrollContent"), "y");
	},

	//重置加载
	reset: function reset() {

		this.$el.find(".fileContent").html('<li class="loading">正在加载，请稍候……</li>');
	}
});
;/*!/projects/views/project/project.leftNav.es6*/
"use strict";

App.Project.leftNav = Backbone.View.extend({

	tagName: "div",

	className: "leftNav",

	template: _.templateUrl('/projects/tpls/project/project.leftNav.html', true),

	render: function render() {
		this.$el.html(this.template);
		return this;
	}

});
;/*!/projects/views/project/quality/project.quality.property.concerns.es6*/
"use strict";

// 隐患 project.quality.property.concerns.es6

//隐患
App.Project.QualityConcerns = Backbone.View.extend({

	tagName: "div",

	className: "QualityConcerns",

	initialize: function initialize() {
		this.listenTo(App.Project.QualityAttr.ConcernsCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.ConcernsCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .tbConcernsBody tr": "showInModel",
		"click .clearSearch": "clearSearch",
		'click .btnCk': 'showSelectMarker'

	},

	//渲染
	render: function render(options) {

		this.ConcernsOptions = options.Concerns;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.html");

		this.$el.html(tpl);

		this.bindEvent();

		return this;
	},

	//隐患过滤条件change事件
	changeHC: function changeHC(key, val) {
		Backbone.trigger('qualityFilterDataChange', 'ConcernsOptions', key, val);
	},
	showSelectMarker: function showSelectMarker(e) {
		App.Project.isShowMarkers('dis', $(e.currentTarget).hasClass('selected'));
	},

	//事件初始化
	bindEvent: function bindEvent() {

		var that = this;
		//列别
		this.$(".categoryOption").myDropDown({
			zIndex: 9,
			click: function click($item) {
				//	that.ConcernsOptions.category=$item.text();
				that.changeHC('category', $item.attr('data-val'));
			}
		});
		//状态
		this.$(".statusOption").myDropDown({
			zIndex: 8,
			click: function click($item) {
				//	that.ConcernsOptions.status=$item.data("status");
				that.changeHC('status', $item.data("val"));
			}
		});

		//填报人
		this.$(".operatorOption").myDropDown({
			zIndex: 7,
			click: function click($item) {
				//	that.ConcernsOptions.reporter=$item.text();
				that.changeHC('reporter', $item.attr('data-val'));
			}
		});
		//等级
		this.$(".gradeOption").myDropDown({
			zIndex: 6,
			click: function click($item) {
				//	that.ConcernsOptions.level=$item.data("status");
				that.changeHC('level', $item.data("val"));
			}
		});
		//类型
		this.$(".typeOption").myDropDown({
			zIndex: 5,
			click: function click($item) {
				//	that.ConcernsOptions.type=$item.text();
				that.changeHC('type', $item.attr('data-val'));
			}
		});

		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();

		//	this.$("#dateStar2").one("mousedown",function() {
		//日期控件初始化
		this.$('#dateStar2').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		}).on("changeDate", function (ev) {
			var _dateStr = new Date(ev.date.getTime()).format('yyyy-MM-dd');
			that.$('#dateEnd2').datetimepicker('setStartDate', _dateStr);
			that.$('#dateEnd2').val();
			that.changeHC('startTime', ev.date.getTime() - 8 * 60 * 60 * 1000);
		});
		//	});

		//		this.$("#dateEnd2").one("mousedown",function() {
		//日期控件初始化
		this.$('#dateEnd2').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		}).on("changeDate", function (ev) {
			that.changeHC('endTime', ev.date.getTime() - 8 * 60 * 60 * 1000);
		});
		//		});

		this.$(".dateBox .iconCal").click(function () {
			$(this).next().focus();
		});
	},


	//显示隐藏搜索
	searchToggle: function searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup: function searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},


	//清空搜索条件
	clearSearch: function clearSearch() {
		this.$(".categoryOption .text").html('全部');
		this.$(".statusOption .text").html('全部');
		this.$(".operatorOption .text").html('全部');
		this.$(".gradeOption .text").html('全部');
		this.$(".typeOption .text").html('全部');
		this.$("#dateStar2").val('');
		this.$("#dateEnd2").val('');
		Backbone.trigger('qualityFilterDataClear');
	},


	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.concerns.body.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbConcernsBody tbody").html(this.template(data));
		this.bindScroll();
	},
	//绑定滚动条
	bindScroll: function bindScroll() {

		var $materialequipmentListScroll = this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
			return;
		}

		$materialequipmentListScroll.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	},

	//加载
	loading: function loading() {

		this.$(".tbConcernsBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
	},


	//在模型中显示
	showInModel: function showInModel(event) {
		var $target = $(event.target).closest("tr");
		$.ajax({
			url: "/platform/api/project/" + $target.data('code') + "/meta"
		}).done(function (data) {
			var _fileId = $target.data('uuid').split('.')[0];
			if (_fileId) {
				$.ajax({
					url: "/doc/api/" + data.data.projectId + '/' + data.data.versionId + "?fileId=" + _fileId
				}).done(function (data) {
					if (data.code == 0 && data) {
						var modelId = data.data.modelId;
						var obj = {
							uuid: modelId + $target.data('uuid').slice($target.data('uuid').indexOf('.')),
							location: {
								boundingBox: $target.data('location').boundingBox,
								position: $target.data('axis').position
							}
						};
						App.Project.showInModel($target, 3, obj);
					}
				});
			}
		});
	}
});
;/*!/projects/views/project/quality/project.quality.property.es6*/
"use strict";

App.Project.ProjectQualityProperty = Backbone.View.extend({

	tagName: "div",

	className: "ProjectQualityNavContainer",

	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.html", true),

	events: {
		"click .projectQualityNav .item": "navClick",
		"click .paginationBottom .pageInfo .next": "nextPage",
		"click .paginationBottom .pageInfo .prev": "prevPage",
		"click .btnFilter": "filterData",
		//	"click .clearSearch": "clearSearch",
		"click .diseaseItem": "diseaseItemLinkClick"
	},

	initialize: function initialize() {
		var _this = this;
		Backbone.on('qualityFilterDataChange', function (obj, key, val) {
			_this[obj][key] = val;
		}, this);
		Backbone.on('qualityFilterDataClear', function () {
			_this.clearSearch();
		}, this);
	},


	render: function render() {

		this.$el.html(this.template);

		if (App.AuthObj.project && App.AuthObj.project.quality) {

			var Auth = App.AuthObj.project.quality,
			    $projectNav = this.$(".projectQualityNav"),
			    CostTpl = App.Comm.AuthConfig.Project.QualityTab,
			    $container = this.$(".qualityContainer");

			//材料设备
			//if (Auth.material) {
			//	$projectNav.append(CostTpl.material);
			$container.append(new App.Project.QualityMaterialEquipment().render({
				MaterialEquipmentOptions: this.MaterialEquipmentOptions
			}).el);
			//}

			//过程验收
			//if (Auth.processAcceptanc) {
			//	$projectNav.append(CostTpl.processAcceptanc);
			$container.append(new App.Project.QualityProcessAcceptance().render({
				ProcessAcceptance: this.ProcessAcceptanceOptions
			}).el);
			//}

			//开业验收
			//if (Auth.openAcceptance) {
			//	$projectNav.append(CostTpl.openAcceptance);
			$container.append(new App.Project.QualityOpeningAcceptance().render({
				OpeningAcceptance: this.OpeningAcceptanceOptions
			}).el);
			//}

			//隐患
			//if (Auth.latentDanger) {
			//	$projectNav.append(CostTpl.latentDanger);
			$container.append(new App.Project.QualityConcerns().render({
				Concerns: this.ConcernsOptions
			}).el);
			//}

			//属性
			//if (Auth.prop) {
			//	$projectNav.append(CostTpl.prop);
			$container.append(new App.Project.QualityProperties().render().el);
			//}
		}

		this.initOptions();

		return this;
	},

	//过程v开业 隐患 顶啊及
	diseaseItemClick: function diseaseItemClick(event) {
		var data = $(event.target).closest("li").data("location");
		data = JSON.stringify(data);
		App.Project.Settings.Viewer.loadMarkers([data]);
		event.stopPropagation();
	},


	//过程、开业验收-隐患列表关联构件
	diseaseItemLinkClick: function diseaseItemLinkClick(event) {
		var _$target = $(event.target).closest("li"),
		    data = _$target.data("location");
		data = JSON.stringify(data);
		App.Project.showInModel(_$target, 2);
		//	App.Project.Settings.Viewer.loadMarkers([data]);
		event.stopPropagation();
	},


	//切换tab
	navClick: function navClick(event) {
		var $target = $(event.target),
		    type = $target.data("type"),
		    isLoadData = false;
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;

		if (type == "materialequipment") {
			//材料设备
			var $QualityMaterialEquipment = this.$el.find(".QualityMaterialEquipment");

			$QualityMaterialEquipment.show().siblings().hide();

			if ($QualityMaterialEquipment.find(".noLoading").length > 0) {
				isLoadData = true;
			}
			App.Project.isShowMarkers('other');
		} else if (type == "processacceptance") {
			//过程验收
			var $QualityProcessAcceptance = this.$el.find(".QualityProcessAcceptance");

			$QualityProcessAcceptance.show().siblings().hide();

			if ($QualityProcessAcceptance.find(".noLoading").length > 0) {
				isLoadData = true;
			}
			App.Project.isShowMarkers('process', $QualityProcessAcceptance.find('.btnCk').hasClass('selected'));
			App.Project.currentQATab = 'process';
		} else if (type == "openingacceptance") {
			//开业验收

			var $QualityOpeningAcceptance = this.$el.find(".QualityOpeningAcceptance");

			$QualityOpeningAcceptance.show().siblings().hide();

			if ($QualityOpeningAcceptance.find(".noLoading").length > 0) {
				isLoadData = true;
			}
			App.Project.isShowMarkers('open', $QualityOpeningAcceptance.find('.btnCk').hasClass('selected'));
		} else if (type == "concerns") {
			//隐患

			var $QualityConcerns = this.$el.find(".QualityConcerns");

			$QualityConcerns.show().siblings().hide();

			if ($QualityConcerns.find(".noLoading").length > 0) {
				isLoadData = true;
			}
			App.Project.isShowMarkers('dis', $QualityConcerns.find('.btnCk').hasClass('selected'));
		} else if (type == "poperties") {
			//属性
			App.Project.isShowMarkers('other');
			this.$el.find(".QualityProperties").show().siblings().hide();
		}

		if (type !== "poperties") {
			if (isLoadData) {
				this.getData(1);
			}
		} else {
			App.Project.renderProperty();
		}
	},

	//初始化参数
	initOptions: function initOptions() {
		this.initOptionsMaterialEquipment();
		this.initOptionsProcessAcceptance();
		this.initOptionsOpeningAcceptance();
		this.initOptionsConcerns();
	},


	//初始化 材料设备
	initOptionsMaterialEquipment: function initOptionsMaterialEquipment() {
		this.MaterialEquipmentOptions = {
			specialty: "", //专业
			category: "", //类别
			status: "", //	状态：1，合格 2，不合格
			name: "", //	名称
			startTime: "", //查询时间范围：开始
			endTime: "", //查询时间范围：结束
			pageIndex: 1, //第几页，默认第一页
			pageItemCount: App.Comm.Settings.pageItemCount //页大小
		};
	},


	//初始化 过程验收
	initOptionsProcessAcceptance: function initOptionsProcessAcceptance() {
		this.ProcessAcceptanceOptions = {
			locationName: '',
			floor: '',
			category: "", //类别
			problemCount: "", // 无隐患 1， 有隐患
			pageIndex: 1, //第几页，默认第一页
			pageItemCount: App.Comm.Settings.pageSize //页大小
		};
	},


	//初始化 开业验收
	initOptionsOpeningAcceptance: function initOptionsOpeningAcceptance() {
		this.OpeningAcceptanceOptions = {
			locationName: '',
			floor: '',
			specialty: "", //专业
			category: "", //类别
			problemCount: "", // 无隐患 1， 有隐患
			pageIndex: 1, //第几页，默认第一页
			pageItemCount: App.Comm.Settings.pageSize //页大小
		};
	},


	//初始化 隐患
	initOptionsConcerns: function initOptionsConcerns() {
		this.ConcernsOptions = {
			category: "", //类别
			type: "", //类型
			status: "", //状态 1:待整改 2:已整改 3:已关闭
			level: "", //等级 1:一般 2:较大 3:重大 4:特大
			reporter: "", //填报人
			startTime: "", //查询时间范围：开始
			endTime: "", //查询时间范围：结束
			pageIndex: 1, //第几页，默认第一页
			pageItemCount: App.Comm.Settings.pageSize //页大小
		};
	},
	getDataFromCache: function getDataFromCache(pageIndex) {

		var type = App.Project.Settings.property,
		    pageSize = App.Comm.Settings.pageItemCount,
		    that = this,
		    projectId = App.Project.Settings.projectId,
		    projectVersionId = App.Project.Settings.CurrentVersion.id;

		if (type == "materialequipment") {

			this.MaterialEquipmentOptions.pageIndex = pageIndex;
			//材料设备
			App.Project.QualityAttr.MaterialEquipmentCollection.reset();
			App.Project.QualityAttr.MaterialEquipmentCollection.projectId = projectId;
			App.Project.QualityAttr.MaterialEquipmentCollection.projectVersionId = projectVersionId;
			App.Project.QualityAttr.MaterialEquipmentCollection.fetch({
				data: that.MaterialEquipmentOptions,
				success: function success(data) {
					that.pageInfo.call(that, data, type);
				}

			});
		} else if (type == "processacceptance") {
			this.ProcessAcceptanceOptions.pageIndex = pageIndex;
			//过程验收
			App.Project.QualityAttr.ProcessAcceptanceCollection.reset();
			var data = App.Project.catchPageData('process', {
				pageNum: pageIndex
			});
			App.Project.QualityAttr.ProcessAcceptanceCollection.push({ data: data });
			that.pageInfo.call(that, data, type, true);
		} else if (type == "openingacceptance") {
			this.OpeningAcceptanceOptions.pageIndex = pageIndex;
			//开业验收
			App.Project.QualityAttr.OpeningAcceptanceCollection.reset();
			var data = App.Project.catchPageData('open', {
				pageNum: pageIndex
			});
			App.Project.QualityAttr.OpeningAcceptanceCollection.push({ data: data });
			that.pageInfo.call(that, data, type, true);
		} else if (type == "concerns") {
			this.ConcernsOptions.pageIndex = pageIndex;
			//隐患
			App.Project.QualityAttr.ConcernsCollection.reset();
			var data = App.Project.catchPageData('dis', {
				pageNum: pageIndex
			});
			App.Project.QualityAttr.ConcernsCollection.push({ data: data });
			that.pageInfo.call(that, data, type, true);
		}
	},


	//获取材料设备
	getData: function getData(pageIndex, projectId, projectVersionId) {

		var type = App.Project.Settings.property,
		    pageSize = App.Comm.Settings.pageItemCount,
		    that = this,
		    projectId = App.Project.Settings.projectId,
		    projectVersionId = App.Project.Settings.CurrentVersion.id;

		if (type == "materialequipment") {

			this.MaterialEquipmentOptions.pageIndex = pageIndex;
			//材料设备
			App.Project.QualityAttr.MaterialEquipmentCollection.reset();
			App.Project.QualityAttr.MaterialEquipmentCollection.projectId = projectId;
			App.Project.QualityAttr.MaterialEquipmentCollection.projectVersionId = projectVersionId;
			App.Project.QualityAttr.MaterialEquipmentCollection.fetch({
				data: that.MaterialEquipmentOptions,
				success: function success(data) {
					that.pageInfo.call(that, data, type);
				}

			});
		} else if (type == "processacceptance") {
			this.ProcessAcceptanceOptions.pageIndex = pageIndex;
			//过程验收
			App.Project.QualityAttr.ProcessAcceptanceCollection.reset();
			App.Project.QualityAttr.ProcessAcceptanceCollection.projectId = projectId;
			App.Project.QualityAttr.ProcessAcceptanceCollection.projectVersionId = projectVersionId;
			App.Project.QualityAttr.ProcessAcceptanceCollection.fetch({
				data: that.ProcessAcceptanceOptions,
				success: function success(data) {
					that.pageInfo.call(that, data, type);
				}
			});
		} else if (type == "openingacceptance") {
			this.OpeningAcceptanceOptions.pageIndex = pageIndex;
			//开业验收
			App.Project.QualityAttr.OpeningAcceptanceCollection.reset();
			App.Project.QualityAttr.OpeningAcceptanceCollection.projectId = projectId;
			App.Project.QualityAttr.OpeningAcceptanceCollection.projectVersionId = projectVersionId;
			App.Project.QualityAttr.OpeningAcceptanceCollection.fetch({
				data: that.OpeningAcceptanceOptions,
				success: function success(data) {
					that.pageInfo.call(that, data, type);
				}
			});
		} else if (type == "concerns") {
			this.ConcernsOptions.pageIndex = pageIndex;
			//隐患
			App.Project.QualityAttr.ConcernsCollection.reset();
			App.Project.QualityAttr.ConcernsCollection.projectId = projectId;
			App.Project.QualityAttr.ConcernsCollection.projectVersionId = projectVersionId;
			App.Project.QualityAttr.ConcernsCollection.fetch({
				data: that.ConcernsOptions,
				success: function success(data) {
					that.pageInfo.call(that, data, type);
				}
			});
		}
	},


	//下一页
	nextPage: function nextPage(event) {

		if ($(event.target).hasClass("disable")) {
			return;
		}
		var $el = this.getContainer();
		var next = +$el.find(".paginationBottom .pageInfo .curr").text() + 1;

		var type = App.Project.Settings.property;
		if (type == "processacceptance" || type == "openingacceptance" || type == "concerns") {
			this.getDataFromCache(next);
		} else {
			this.getData(next);
		}
	},


	//上一页
	prevPage: function prevPage(event) {
		if ($(event.target).hasClass("disable")) {
			return;
		}
		var $el = this.getContainer();
		var prev = +$el.find(".paginationBottom .pageInfo .curr").text() - 1;
		var type = App.Project.Settings.property;
		if (type == "processacceptance" || type == "openingacceptance" || type == "concerns") {
			this.getDataFromCache(prev);
		} else {
			this.getData(prev);
		}
	},


	//帅选
	filterData: function filterData() {

		this.getData(1);
	},


	//清空帅选
	clearSearch: function clearSearch() {

		var type = App.Project.Settings.property;

		if (type == "materialequipment") {
			this.initOptionsMaterialEquipment();
		} else if (type == "processacceptance") {
			this.initOptionsProcessAcceptance();
		} else if (type == "openingacceptance") {
			this.initOptionsOpeningAcceptance();
		} else if (type == "concerns") {
			this.initOptionsConcerns();
		}
		this.getData(1);
	},
	getContainer: function getContainer(tabType) {
		var type = tabType || App.Project.Settings.property;
		var $el;
		if (type == "materialequipment") {
			//材料设备
			$el = this.$el.find(".QualityMaterialEquipment");
		} else if (type == "processacceptance") {
			//过程验收
			$el = this.$el.find(".QualityProcessAcceptance");
		} else if (type == "openingacceptance") {
			//开业验收
			$el = this.$el.find(".QualityOpeningAcceptance");
		} else if (type == "concerns") {
			//隐患
			$el = this.$el.find(".QualityConcerns");
		}
		return $el;
	},


	//分页信息
	pageInfo: function pageInfo(data, type, isObject) {

		var $el = this.getContainer(type);
		if (!isObject) {
			data = data.toJSON()[0].data;
		}
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
	}
});
;/*!/projects/views/project/quality/project.quality.property.materialEquipment.es6*/
"use strict";

//project.quality.property.materialEquipment.es6

//材料设备
App.Project.QualityMaterialEquipment = Backbone.View.extend({

	tagName: "div",

	className: "QualityMaterialEquipment",

	initialize: function initialize() {

		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.MaterialEquipmentCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch"

	},

	//渲染
	render: function render(options) {

		this.MaterialEquipmentOptions = options.MaterialEquipmentOptions;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.html");

		this.$el.html(tpl());

		this.bindEvent();

		return this;
	},

	//显示隐藏搜索
	searchToggle: function searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup: function searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},

	//清空搜索条件
	clearSearch: function clearSearch() {
		this.$(".specialitiesOption .text").html('全部');
		this.$(".categoryOption .text").html('全部');
		this.$(".statusOption .text").html('全部');
		this.$(".txtSearchName").val('');
		this.$("#dateStar").val('');
		this.$("#dateEnd").val('');
		Backbone.trigger('qualityFilterDataClear');
	},

	//材料设备过滤条件change事件
	changeME: function changeME(key, val) {
		Backbone.trigger('qualityFilterDataChange', 'MaterialEquipmentOptions', key, val);
	},

	//事件绑定
	bindEvent: function bindEvent() {

		var that = this;
		//专业
		this.$(".specialitiesOption").myDropDown({
			click: function click($item) {
				//that.MaterialEquipmentOptions.specialty = $item.text();
				that.changeME('specialty', $item.attr('data-val'));
			}
		});

		//类别
		this.$(".categoryOption").myDropDown({
			click: function click($item) {
				//	that.MaterialEquipmentOptions.category = $item.text();
				that.changeME('category', $item.attr('data-val'));
			}
		});

		this.$(".statusOption").myDropDown({
			click: function click($item) {
				//that.MaterialEquipmentOptions.status = $item.data("status");
				that.changeME('status', $item.data("status"));
			}
		});

		this.$(".txtSearchName").blur(function () {
			//that.MaterialEquipmentOptions.name = $(this).val().trim();
			that.changeME('name', $(this).val().trim());
		});

		//	this.$("#dateStar").one("mousedown",function() {
		//日期控件初始化
		this.$('#dateStar').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'
		}).on("changeDate", function (ev) {
			//that.MaterialEquipmentOptions.startTime = ev.date.format("yyyy-MM-dd");
			var _dateStr = new Date(ev.date.getTime() + 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
			that.$('#dateEnd').datetimepicker('setStartDate', _dateStr);
			that.$('#dateEnd').val(_dateStr);
			that.changeME('startTime', new Date(ev.date.format("yyyy-MM-dd") + ' 00:00:00').getTime());
		});
		//	});

		//	this.$("#dateEnd").one("mousedown",function() {
		//日期控件初始化
		this.$('#dateEnd').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month'

		}).on("changeDate", function (ev) {
			//that.MaterialEquipmentOptions.endTime = ev.date.format("yyyy-MM-dd");
			that.changeME('endTime', new Date(ev.date.format("yyyy-MM-dd") + ' 23:59:59').getTime());
		});
		//	});

		this.$(".dateBox .iconCal").click(function () {
			$(this).next().focus();
		});
	},

	//绑定滚动条
	bindScroll: function bindScroll() {

		var $materialequipmentListScroll = this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
			return;
		}

		$materialequipmentListScroll.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	},


	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.materialEquipment.body.html"),

	//获取数据后处理
	addOne: function addOne(model) {

		//移除重复监听
		if (this.$el.closest("body").length <= 0) {
			this.remove();
		}

		var data = model.toJSON();
		this.$(".tbMaterialequipmentBody tbody").html(this.template(data));

		this.bindScroll();
	},
	//加载
	loading: function loading() {

		this.$(".tbMaterialequipmentBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
	}
});
;/*!/projects/views/project/quality/project.quality.property.openingAcceptance.es6*/
"use strict";

// 开业验收 project.quality.property.openingAcceptance.es6

//开业验收
App.Project.QualityOpeningAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityOpeningAcceptance",

	currentDiseaseView: null,

	initialize: function initialize() {
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.OpeningAcceptanceCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch",
		"click .tbOpeningacceptanceBody tr": "showInModel",
		'click .resultStatusIcon': 'showDiseaseList',
		'click .btnCk': 'showSelectMarker'

	},

	//渲染
	render: function render(options) {

		this.OpeningAcceptanceOptions = options.OpeningAcceptance;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.html");
		this.$el.html(tpl);
		this.bindEvent();
		return this;
	},

	//开业验收过滤条件change事件
	changeOA: function changeOA(key, val) {
		Backbone.trigger('qualityFilterDataChange', 'OpeningAcceptanceOptions', key, val);
	},


	//事件初始化
	bindEvent: function bindEvent() {

		var that = this;

		this.$('.txtLocationName').change(function () {
			that.changeOA('locationName', $(this).val());
		});
		//隐患
		this.$(".riskOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.problemCount = $item.data("status");
				that.changeOA('problemCount', $item.data("val"));
			}
		});
		this.$(".floorOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.problemCount = $item.data("status");
				that.changeOA('floor', $item.data("val"));
			}
		});
		//类别
		this.$(".categoryOption").myDropDown({
			zIndex: 20,
			click: function click($item) {
				//that.OpeningAcceptanceOptions.category = $item.text();
				that.changeOA('category', $item.attr('data-val'));
			}
		});

		//状态
		this.$(".statusOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.specialty = $item.text();
				that.changeOA('specialty', $item.attr('data-val'));
			}
		});

		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();
	},
	showSelectMarker: function showSelectMarker(e) {
		App.Project.isShowMarkers('open', $(e.currentTarget).hasClass('selected'));
	},


	//显示隐藏搜索
	searchToggle: function searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup: function searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},

	//清空搜索条件
	clearSearch: function clearSearch() {
		this.$(".riskOption .text").html('全部');
		this.$(".categoryOption .text").html('全部');
		this.$(".specialitiesOption .text").html('全部');
		Backbone.trigger('qualityFilterDataClear');
	},


	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.openingAcceptance.body.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbOpeningacceptanceBody tbody").html(this.template(data));
		this.bindScroll();
	},
	//绑定滚动条
	bindScroll: function bindScroll() {

		var $materialequipmentListScroll = this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
			return;
		}

		$materialequipmentListScroll.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	},

	//加载
	loading: function loading() {

		this.$(".tbOpeningacceptanceBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
	},


	//模型中显示
	showInModel: function showInModel(event) {
		App.Project.showInModel($(event.target).closest("tr"), 0);
	},
	showDiseaseList: function showDiseaseList(event) {
		App.Project.QualityAttr.showDisease(event, this, 'open', 2); // showDiseaseList
		event.stopPropagation();
	}
});
;/*!/projects/views/project/quality/project.quality.property.process.disease.es6*/
"use strict";

//隐患列表视图
App.Project.ProcessDisease = Backbone.View.extend({

	tagName: "div",

	className: "disease",

	template: _.templateUrl('/projects/tpls/project/quality/project.quality.disease.html'),

	initialize: function initialize(data) {
		this.loadData(data);
		return this;
	},
	events: {
		'click .closeBtn': 'closeView',
		'click .diseaseItem': 'linkModelComponent'
	},

	//渲染
	render: function render(data) {
		this.$el.html(this.template(data));
		return this;
	},

	loadData: function loadData(data) {
		var _this = this,
		    url = 'fetchQualityProcessDisease';
		App.Comm.ajax({
			URLtype: url,
			type: 'get',
			data: data.params
		}, function (response) {
			_this.render(response || { data: [] }).show(data);
		}).fail(function () {
			//失败流程处理
		});
	},
	show: function show(options) {
		var _right = options._parent[0].offsetParent.clientWidth - options._parent[0].offsetLeft - 14;
		this.$el.css(options.viewConfig);

		if (options._flag == 'up') {
			this.$(".safter").css({
				right: _right + 1 + 'px'
			});
			this.$(".sbefore").css({
				right: _right + 'px'
			});
			this.$(".dafter").css({
				border: 'none'
			});
			this.$(".dbefore").css({
				border: 'none'
			});
		} else {
			this.$(".dafter").css({
				right: _right + 1 + 'px'
			});
			this.$(".dbefore").css({
				right: _right + 1 + 'px'
			});
			this.$(".safter").css({
				border: 'none'
			});
			this.$(".sbefore").css({
				border: 'none'
			});
		}
		if (options.type == 'open') {
			$('.openingacceptanceList').append(this.$el);
		} else {
			$('.processAccessList').append(this.$el);
		}
		App.Comm.initScroll(this.$('.scrollWrap'), "y");

		clearMask();

		return this;
	},
	closeView: function closeView() {
		this.$el.remove();
	},
	linkModelComponent: function linkModelComponent(e) {
		e.stopPropagation();
		var $target = $(e.currentTarget),
		    id = $target.attr('data-id'),
		    type = $target.attr('data-type');
		$.ajax({
			url: "/platform/api/project/" + $target.data('code') + "/meta?token=123"
		}).done(function (data) {
			var _fileId = $target.data('uuid').split('.')[0];
			if (_fileId) {
				$.ajax({
					url: "/doc/api/" + data.data.projectId + '/' + data.data.versionId + "?fileId=" + _fileId
				}).done(function (data) {
					if (data.code == 0 && data) {
						var modelId = data.data.modelId;
						var obj = {
							uuid: modelId + $target.data('uuid').slice($target.data('uuid').indexOf('.')),
							location: {
								boundingBox: $target.data('location').boundingBox,
								position: $target.data('axis').position
							}
						};
						App.Project.showInModel($target, 3, obj);
					}
				});
			}
		});
	}
});
;/*!/projects/views/project/quality/project.quality.property.processAcceptance.es6*/
"use strict";

//project.quality.property.processAcceptance.es6 过程验收

//过程验收
App.Project.QualityProcessAcceptance = Backbone.View.extend({

	tagName: "div",

	className: "QualityProcessAcceptance",

	currentDiseaseView: null,

	initialize: function initialize() {
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection, "add", this.addOne);
		this.listenTo(App.Project.QualityAttr.ProcessAcceptanceCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .clearSearch": "clearSearch",
		'click .resultStatusIcon': 'showDiseaseList',
		"click .tbProcessAccessBody tr": "showInModel",
		'click .btnCk': 'showSelectMarker'
	},

	//过程验收过滤条件change事件
	changePA: function changePA(key, val) {
		Backbone.trigger('qualityFilterDataChange', 'ProcessAcceptanceOptions', key, val);
	},

	//渲染
	render: function render(options) {

		this.ProcessAcceptanceOptions = options.ProcessAcceptance;

		var tpl = _.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.html");
		this.$el.html(tpl());
		this.bindEvent();
		return this;
	},
	showSelectMarker: function showSelectMarker(e) {
		App.Project.isShowMarkers('process', $(e.currentTarget).hasClass('selected'));
	},

	//事件初始化
	bindEvent: function bindEvent() {
		var that = this;
		this.$('.txtLocationName').change(function () {
			that.changePA('locationName', $(this).val());
		});

		this.$(".floorOption").myDropDown({
			click: function click($item) {
				//	that.OpeningAcceptanceOptions.problemCount = $item.data("status");
				that.changePA('floor', $item.data("val"));
			}
		});

		//隐患
		this.$(".riskOption").myDropDown({
			click: function click($item) {
				//	that.ProcessAcceptanceOptions.problemCount = $item.data("status");
				that.changePA('problemCount', $item.data("val"));
			}
		});
		//列别
		this.$(".categoryOption").myDropDown({
			zIndex: 20,
			click: function click($item) {
				//	that.ProcessAcceptanceOptions.category = $item.text();
				that.changePA('category', $item.attr('data-val'));
			}
		});
		//显示搜索结果对应位置
		this.$(".groupRadio").myRadioCk();
	},


	//显示隐藏搜索
	searchToggle: function searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},
	searchup: function searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},

	//清空搜索条件
	clearSearch: function clearSearch() {
		this.$(".categoryOption .text").html('全部');
		this.$(".categoryOption .text").html('全部');
		Backbone.trigger('qualityFilterDataClear');
	},


	template: _.templateUrl("/projects/tpls/project/quality/project.quality.property.processAcceptance.body.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON();
		this.$(".tbProcessAccessBody tbody").html(this.template(data));
		this.bindScroll();
	},

	//绑定滚动条
	bindScroll: function bindScroll() {

		var $materialequipmentListScroll = this.$(".materialequipmentListScroll");

		if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
			return;
		}

		$materialequipmentListScroll.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	},

	//加载
	loading: function loading() {

		this.$(".tbProcessAccessBody tbody").html(App.Project.Settings.loadingTpl);
		this.searchup();
	},


	//模型中显示
	showInModel: function showInModel(event) {

		App.Project.showInModel($(event.target).closest("tr"), 1);
	},


	//显示隐患列表
	showDiseaseList: function showDiseaseList(event) {
		App.Project.QualityAttr.showDisease(event, this, 'pro', 1); // showDiseaseList
		event.stopPropagation();
	}
});
;/*!/projects/views/project/quality/project.quality.property.properties.es6*/
"use strict";

//属性 project.quality.property.properties.es6

//过程检查
App.Project.QualityProperties = Backbone.View.extend({

	tagName: "div",

	className: "QualityProperties",

	initialize: function initialize() {
		//this.listenTo(App.Project.QualityAttr.PropertiesCollection,"add",this.addOne);
		this.listenTo(App.Project.DesignAttr.PropertiesCollection, "add", this.addOne);
	},

	events: {},

	//渲染
	render: function render() {

		this.$el.html('<div class="nullTip">请选择构件</div>');

		return this;
	},

	template: _.templateUrl("/projects/tpls/project/design/project.design.property.properties.html"),

	//获取数据后处理
	addOne: function addOne(model) {
		var data = model.toJSON().data;
		var temp = JSON.stringify(data);
		temp = JSON.parse(temp);
		App.Project.userProps.call(this, temp);
	}

});