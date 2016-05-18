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
	
	render(){
		var _this=this,
			data=this.model.toJSON();
		this.formData=data;
		_this.$el.html(_this.template(data));
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
	
	
	toggleProFrom(e){
		var $this=typeof e ==='string'?this.$(e):this.$(e.target),
			$accord=$this.parent().next();
		if($this.hasClass('accordOpen')){
			$accord.slideDown();
			
			var $all=$('.projectBaseHole .accordionDatail');
			$all.each(function(){
				if(!$(this).hasClass('accordOpen')){
					$(this).addClass('accordOpen');
					$(this).parent().next().slideUp();
				}
			})
			
		}else{
			$accord.slideUp();
		}
		$this.toggleClass('accordOpen');
	},
	
	saveBasehole(args,type){
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
		},function(res){
			$.tip({message:'新增成功'});
	 		Backbone.trigger('baseholeUserStatus','read');
	 		_this.formData.id=res.data.pitId;
	 		if(type){
	 			_this.formData=res.data;
	 		}
	 		_this.model.set(_this.formData);
	 		_this.$('.accordionDatail').trigger('click');
	 		_this.reloadView();
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
		App.Services.ProjectCollection.ProjecDetailBaseHoleCollection.pop();
		Backbone.trigger('baseholeUserStatus','read');
	},
	
	//刷新基坑页面、同时刷新楼层、剖面视图，保证数据一致性
	reloadView(){
		var _this=this,
			_proId=_this.formData.projectId,
			AppCollection=App.Services.ProjectCollection,
			collectionBasehole=AppCollection.ProjecDetailBaseHoleCollection,
			collectionFloor=AppCollection.ProjecDetailFloorCollection,
			collectionSection=AppCollection.ProjecDetailSectionCollection;
		
 		collectionBasehole.projectId=_proId;
 		collectionFloor.projectId=_proId;
 		collectionSection.projectId=_proId;

 		collectionBasehole.reset();
 		collectionBasehole.fetch({
 			success(child, data) {
 				AppCollection.datas.pitData=data.data.pits;
 				collectionFloor.reset();	
 				collectionFloor.fetch();
 				collectionSection.reset();
		 		collectionSection.fetch();
 			}
 		});
 		
	}
	
})