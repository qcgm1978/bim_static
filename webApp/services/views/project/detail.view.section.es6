App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.Section=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom',
		'click .save':'saveSection',
		'click .update':'updateSection',
		'click .delete':'deleteSection',
		'click .cancel':'cancelSection'
	},
	
	template:_.templateUrl('/services/tpls/project/view.section.html',true),
	
	initialize(data){
		this.formData.projectID=data.projectId;
		this._parentView=data._parentView;
	},
	
	formData:{},
	
	render(data){
	
		if(data){
			this.formData=data;
		}
		
		this.$el.html(this.template);
		this.$(".supportType").myDropDown();
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
	saveSection(){},
	updateSection(){},
	deleteSection(){},
	cancelSection(){
		this.$el.remove();
		this._parentView.trigger('read');
	}
	
})