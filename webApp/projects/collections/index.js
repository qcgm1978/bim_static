 App.Projects = {

 	ProjectCollection: new(Backbone.Collection.extend({
 		model: Backbone.Model.extend({
 			defaults: function() {
 				return {
 					url: ''
 				}
 			}
 		})
 	})),

 	Settings: {
 		type: "list",
 		isInitMap: false,
 		initBodyEvent:false
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
 			App.Projects.Settings.initBodyEvent=true;
 			App.Projects.initBodyEvent();
 		}

 		//拉取数据
 		App.Projects.fetch();

 	},

 	initBodyEvent:function(){
 		$("body").on("click",function(event){
 			var $target=$(event.target);
 			if ($target.closest("#mapProjects").length<=0 && $target.closest(".BMap_Marker").length<=0 ) {
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
 			App.Projects.BaiduMap.initMap();

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
 		 
 		App.Projects.BaiduMap.Settings.defaultZoom=6;
 		//地图
 		// 百度地图API功能
 		var map = new BMap.Map("container"); // 创建Map实例 
		map.centerAndZoom(new BMap.Point(116.404, 37.915), 5); // 初始化地图,设置中心点坐标和地图级别
 		//var potitionControl = new App.Projects.BaiduMap.potitionControl();
 		//map.addControl(potitionControl); // 添加到地图当中
 		//map.addControl(new BMap.ScaleControl()); //添加地图类型控件

 		map.setCurrentCity("上海"); // 设置地图显示的城市 此项是必须设置的
 		map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放

 		App.Projects.BaiduMap.addProjectPoints(map,5);

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
 				var point = new BMap.Point(116.404+i, 39.915 + i); 
 				var marker = new BMap.Marker(point,zoom); // 创建标注
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
 				var point = new BMap.Point(116.404+i, 39.915 + i); 
 				var marker = new BMap.Marker(point,zoom); // 创建标注  
 				marker.addEventListener("click", function() {
 					 
 					//项目详情
 					App.Projects.BaiduMap.showMapProject(arguments);
 				});
 				map.addOverlay(marker);
 				
 				mapSettings.MarkerArr.push(marker);
 			}
 		}

 		mapSettings.defaultZoom=zoom; 

 	},

 	showMapProject:function(){

 		$("#mapProjects").remove();

 		var event=arguments[0][0], offsetX=event.clientX,offsetY=event.clientY;

 		var temp=_.templateUrl('/projects/tpls/project.map.list.html'); 

 	 
 		$("body").append(temp({}));

 		$("#mapProjects").css({'top':offsetY,'left':offsetX}); 
 		 
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



 //百度地图
 //  下面示例显示一个地图，等待两秒钟后，它会移动到新中心点。panTo()方法将让地图平滑移动至新中心点，如果移动距离超过了当前地图区域大小，则地图会直跳到该点。
 // var map = new BMap.Map("container");    
 // var point = new BMap.Point(116.404, 39.915);    
 // map.centerAndZoom(point, 15);    
 // window.setTimeout(function(){  
 //     map.panTo(new BMap.Point(116.409, 39.918));    
 // }, 2000);

 // 地图API中提供的控件有：
 // Control：控件的抽象基类，所有控件均继承此类的方法、属性。通过此类您可实现自定义控件。
 // NavigationControl：地图平移缩放控件，PC端默认位于地图左上方，它包含控制地图的平移和缩放的功能。移动端提供缩放控件，默认位于地图右下方。
 // OverviewMapControl：缩略地图控件，默认位于地图右下方，是一个可折叠的缩略地图。
 // ScaleControl：比例尺控件，默认位于地图左下方，显示地图的比例关系。
 // MapTypeControl：地图类型控件，默认位于地图右上方。
 // CopyrightControl：版权控件，默认位于地图左下方。
 // GeolocationControl：定位控件，针对移动端开发，默认位于地图左下方。
 // var opts = {offset: new BMap.Size(150, 5)}    
 // // map.addControl(new BMap.ScaleControl(opts));
 // BMAP_NAVIGATION_CONTROL_LARGE 表示显示完整的平移缩放控件。
 // BMAP_NAVIGATION_CONTROL_SMALL 表示显示小型的平移缩放控件。
 // BMAP_NAVIGATION_CONTROL_PAN 表示只显示控件的平移部分功能。
 // BMAP_NAVIGATION_CONTROL_ZOOM 表示只显示控件的缩放部分功能。