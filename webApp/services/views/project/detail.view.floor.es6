App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.Floor=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom',
		'click .save':'saveFloor',
		'click .update':'updateFloor',
		'click .delete':'deleteFloor',
		'click .cancel':'cancelFloor'
	},
	
	template:_.templateUrl('/services/tpls/project/view.floor.html'),
	
	formData:{
		"id":"",//栋号编码
        "pitId":"",//    基坑编码
        "projectId":"",//    项目编码
        "buildingName":"",//  栋号名称
        "height":0,//   高度
        "area":0,// 面积
        "groundLayers":0,//   地上层数
        "undergroundlayers":0,//  地下层数
        "layerHeight":0,//    层高
        "seismicIntensityId":"",//    抗震设防烈度
        "seismicLevelId":"",//    抗震等级
        "roofStayWarm":"",//  屋面保温
        "roofStayWarmLev":"",//    屋面保温防火等级
        "outWallStayWarm":"",//   外墙保温
        "outWallStayWarmLev":"",// 外墙保温防火等级
        "lowStrainPercentage":0,//  低应变检测百分比
        "highStrainPercentage":0,// 高应变检测百分比
        "ultrasonicPercentage":0,//   超声波检测百分比
        "corebitPercentage":0,//  钻芯检测百分比
        "outsideDecorationType":"0",//   外装方式
        "structureType":"0"
	},
	
	initialize(data){
		this.formData.projectId=data.projectId;
		this._parentView=data._parentView;
	},
	
	render(data){
		//判断是否是新增
		if(data){
			this.formData=data;
		}
		this.$el.html(this.template(this.formData));
		this.$(".structure").myDropDown();
		this.$(".outerInstall").myDropDown();
		this.$(".outDoorFireLevel").myDropDown();
		this.$(".inDoorFireLevel").myDropDown();
		this.$(".seiGrade").myDropDown();
		this.$(".intensity").myDropDown();
		return this;
	},
	
	
	toggleProFrom(e){
	
		var $this=this.$(e.target),
			$accord=$this.parent().next();
		
		if($this.hasClass('accordOpen')){
			$accord.slideDown();
		}else{
			$accord.slideUp();
		}
		$this.toggleClass('accordOpen');
	},
	
	saveFloor(){},
	updateFloor(){},
	deleteFloor(){},
	cancelFloor(){
		this.$el.remove();
		this._parentView.trigger('read');
	}
	
})