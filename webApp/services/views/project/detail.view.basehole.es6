App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.BaseHole=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom'
	},
	
	template:_.templateUrl('/services/tpls/project/view.basehole.html',true),
	
	initialize(){
	},
	
	render(){
		this.$el.html(this.template);
		this.$(".outerInstall").myDropDown();
		this.$(".structure").myDropDown();
		return this;
	},
	
	load(){
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
	}
	
})