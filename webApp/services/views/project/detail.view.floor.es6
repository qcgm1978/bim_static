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
        "undergroundLayers":0,//  地下层数
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
        "outSidedecorationType":"0",//   外装方式
        "structureType":""
	},
	
	initialize(data){
		this.formData.projectId=data.projectId;
		this._parentView=data._parentView;
	},
	
	render(data){
		var _this=this;
		//判断是否是新增
		if(data){
			this.formData=data;
		}
		
		this.$el.html(this.template(this.formData));
		
		this.$(".structure").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".outerInstall").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".outDoorFireLevel").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".inDoorFireLevel").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".seiGrade").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".intensity").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
			}
		});
		this.$(".pit").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=$item.attr('data-pitId');
			}
		});
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
	
	saveFloor(args,type){
		$('.projectBaseHole').mmhMask();	
		var _this=this;
		_this.$('input').each(function(){
			var _=$(this);
			_this.formData[_.attr('name')]=_.val();
		})
		args= typeof args === 'string'? args : 'fetchProjectCreateFloor';
		//百分比数值转换
		_this.formData.lowStrainPercentage=(_this.formData.lowStrainPercentage||0)/100;
		_this.formData.highStrainPercentage=(_this.formData.highStrainPercentage||0)/100;
		_this.formData.ultrasonicPercentage=(_this.formData.ultrasonicPercentage||0)/100;
		_this.formData.corebitPercentage=(_this.formData.corebitPercentage||0)/100;
		
		App.Comm.ajax({
			URLtype:args,
			type:type||'post',
			data:JSON.stringify(_this.formData),
			contentType:'application/json'
		},function(){
	 		_this.reloadView();
	 		_this._parentView.trigger('read');
		}).fail(function(){
			clearMask();
		})
	},
	updateFloor(){
		this.saveFloor('fetchProjectUpdateFloor','put');
	},
	deleteFloor(){
		var _this=this;
		App.Comm.ajax({
			URLtype:'removeProjectDetailFloor',
			type:'delete',
			data:{
				floorId:_this.formData.id
			}
		},function(){
			_this.reloadView();
		}).fail(function(){
		})
	},
	cancelFloor(){
		this.$el.remove();
		this._parentView.trigger('read');
	},
	reloadView(){
		var _this=this;
		let _collection=App.Services.ProjectCollection.ProjecDetailFloorCollection;
 		_collection.projectId=_this.formData.projectId;
 		_collection.fetch({
 			reset:true,
 			success(child, data) {
 				_this.remove();
 				clearMask();
 			}
 		});
	}
	
})