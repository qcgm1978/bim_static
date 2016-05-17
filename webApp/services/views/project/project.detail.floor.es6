App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Floor=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	status:'read',
	
	events:{
		'click .createFloor':'createFloor'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.floor.html',true),
	
	initialize(){

		var _this=this;
		this.listenTo(App.Services.ProjectCollection.ProjecDetailFloorCollection,'add',this.addOne);
		this.listenTo(App.Services.ProjectCollection.ProjecDetailFloorCollection,'reset',this.resetView);
	
		Backbone.on('floorUserStatus',function(status){
			_this.status=status
		},this)
	
	},
	
	setUserData(data){
		this.userData=data;
	},
	
	render(){
		this.$el.html(this.template);   
		return this;
	},
	
	addView(items){
		var _this=this;
		var view=new App.Services.DetailView.Floor({
			projectId:_this.userData.projectId
		});
		_this.$('.detailContainer .scrollWrapContent').append(view.render(items.toJSON()).el);
		view.toggleProFrom('.accordionDatail');
	},
	
	addOne(model){
		debugger
		var $container=this.$('.detailContainer .scrollWrapContent');
		var view=new App.Services.DetailView.Floor({
			model:model
		});
		$container.append(view.render().el);
	},

	resetView(){
		this.$('.detailContainer .scrollWrapContent').html("");
	},

	createFloor(){
		var _this=this;
		if(this.status !=='create'){
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');

			var model={
				"id":"",//栋号编码
		        "pitId":"",//    基坑编码
		        "projectId":_this.userData.projectId,//    项目编码
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
			}

			App.Services.ProjectCollection.ProjecDetailFloorCollection.push(model);

			this.status='create';
		}else{
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
		
	}
	
})