App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.Section=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom',
		'click .save':'saveSection',
		'click .update':'updateSection',
		'click .delete':'deleteSection',
		'click .cancel':'cancelSection'
	},
	
	template:_.templateUrl('/services/tpls/project/view.section.html'),
	
	formData:{
		"id":"", //剖面ID
        "pitId":"",//    基坑编码
        "projectId":"",//    项目编码
        "profileName":"",//  剖面
        "bracingType":0 //支护类型
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
		
		this.$(".pit").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData.pitId=$item.attr('data-pitId');
			}
		});
		
		this.$(".supportType").myDropDown({
			zIndex:App.Services.ProjectCollection.methods.zIndex(),
			click:function($item){
				var _=$(this);
				_this.formData[_.attr('name')]=_.val();
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
	
	saveSection(args,type){
		var _this=this;
		_this.$('input').each(function(){
			var _=$(this);
			_this.formData[_.attr('name')]=_.val();
		})
		args= typeof args === 'string'? args : 'fetchProjectCreateSection';
		
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
	updateSection(){
		this.saveSection('fetchProjectUpdateSection','put');
	},
	deleteSection(){
		var _this=this;
		App.Comm.ajax({
			URLtype:'removeProjectDetailSection',
			type:'delete',
			data:{
				sectionId:_this.formData.id
			}
		},function(){
			_this.reloadView();
		}).fail(function(){
		})
	},
	cancelSection(){
		this.$el.remove();
		this._parentView.trigger('read');
	},
	reloadView(){
		var _this=this;
		let _collection=App.Services.ProjectCollection.ProjecDetailSectionCollection;
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