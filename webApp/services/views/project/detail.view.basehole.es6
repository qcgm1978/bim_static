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
		pitID:'',
		projectID:''
	},
	
	defaultData:{
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
		this.formData.projectID=data.projectId;
		this._parentView=data._parentView;
	},
	
	render(data){
		var _this=this;
		if(data){
			_this.formData.pitID=data.id;
		}else{
			data=_this.defaultData;
		}
		_this.$el.html(_this.template(data));
		_this.$(".isAnchor").myDropDown({
			click:function($item){
				_this.formData.isAnchorRodSoilNail=$item.text();
			}
		});
		_this.$(".isSupport").myDropDown({
			click:function($item){
				_this.formData.isHaveBracingType=$item.text();
			}
		});
		_this.$(".baseholeLevel").myDropDown({
			click:function($item){
				_this.formData.pitLevels=$item.text();
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
	
	saveBasehole(){
		$('.projectBaseHole').mmhMask();	
		var _this=this;
		_this.$('input').each(function(){
			var _=$(this);
			_this.formData[_.attr('name')]=_.val();
		})
		App.Comm.ajax({
			URLtype:'fetchProjectCreateBaseHole',
			type:'post',
			data:JSON.stringify(_this.formData),
			contentType:'application/json'
		},function(){
	 		_this.reloadView();
	 		_this._parentView.trigger('read');
		}).fail(function(){
			clearMask();
		})
	},
	
	deleteBasehole(){
		var _this=this;
		App.Comm.ajax({
			URLtype:'removeProjectDetailBasehole',
			type:'delete',
			data:{
				pitId:_this.formData.pitID
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
 		collectionBasehole.projectId=_this.formData.projectID;
 		collectionBasehole.fetch({
 			reset:true,
 			success(child, data) {
 				_this.remove();
 				clearMask();
 			}
 		});
	}
	
})