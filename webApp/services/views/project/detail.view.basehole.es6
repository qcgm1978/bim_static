App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.BaseHole=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom',
		'click .save':'saveBasehole',
		'click .update':'updateBasehole',
		'click .delete':'deleteBasehole',
		'click .cancel':'cancelBasehole'
	},
	
	formData:{
		"id" : '',
		"projectId" : '',
		"pitName" : '',
		"pitDepth" : 0,
		"pitLevel" : '',
		"pitLevelRemark" : '',
		"soldierPilePercentage" : 0,
		"anchorCablePercentage" : 0,
		"soilnailwallPercentage" : 0,
		"isHaveBracingType" : '',
		"isAnchorrodSoilnail" : ''
	},
	
	template:_.templateUrl('/services/tpls/project/view.basehole.html'),
	
	initialize(data){
		//设置projectId 默认传递
		this.formData.projectId=data.projectId;
		this._parentView=data._parentView;
	},
	
	render(data){
		var _this=this;
		if(data){
			_this.formData=data;
		}
		_this.$el.html(_this.template(_this.formData));
		_this.$(".isAnchor").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				_this.formData.isAnchorrodSoilnail=$item.text();
			}
		});
		_this.$(".isSupport").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				_this.formData.isHaveBracingType=$item.text();
			}
		});
		_this.$(".baseholeLevel").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				_this.formData.pitLevel=$item.text();
			}
		});
		return _this;
	},
	
	load(){
	},
	
	toggleProFrom(e){
		var $this=typeof e ==='string'?this.$(e):this.$(e.target),
			$accord=$this.parent().next();
		if($this.hasClass('accordOpen')){
			$accord.slideDown();
		}else{
			$accord.slideUp();
		}
		$this.toggleClass('accordOpen');
	},
	
	saveBasehole(args,type){
		$('.projectBaseHole').mmhMask();	
		var _this=this;
		_this.$('input').each(function(){
			var _=$(this);
			_this.formData[_.attr('name')]=_.val();
		})
		args= typeof args === 'string' ? args:'fetchProjectCreateBaseHole';
		_this.formData.soldierPilePercentage=(_this.formData.soldierPilePercentage||0)/100;
		_this.formData.anchorCablePercentage=(_this.formData.anchorCablePercentage||0)/100;
		_this.formData.soilNailWallPercentage=(_this.formData.soilNailWallPercentage||0)/100;
		
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
	
	updateBasehole(){
		this.saveBasehole('fetchProjectUpdateBaseHole','put');
	},
	
	deleteBasehole(){
		var _this=this;
		App.Comm.ajax({
			URLtype:'removeProjectDetailBasehole',
			type:'delete',
			data:{
				pitId:_this.formData.id
			}
		},function(){
			_this.reloadView();
		}).fail(function(){
		})
	},
	
	cancelBasehole(){
		this.$el.remove();
		this._parentView.trigger('read');
	},
	
	reloadView(){
		var _this=this;
		let collectionBasehole=App.Services.ProjectCollection.ProjecDetailBaseHoleCollection;
 		collectionBasehole.projectId=_this.formData.projectId;
 		collectionBasehole.fetch({
 			reset:true,
 			success(child, data) {
 				_this.remove();
 				clearMask();
 			}
 		});
	}
	
})