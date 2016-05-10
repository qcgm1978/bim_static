App.Services.DetailView=App.Services.DetailView||{};

App.Services.DetailView.Floor=Backbone.View.extend({
	
	events:{
		'click .accordionDatail':'toggleProFrom'
	},
	
	template:_.templateUrl('/services/tpls/project/view.floor.html'),
	
	initialize(){
	},
	
	render(){
		this.$el.html(this.template());
		this.$(".structure").myDropDown();
		this.$(".outerInstall").myDropDown();
		this.$(".outDoorFireLevel").myDropDown();
		this.$(".inDoorFireLevel").myDropDown();
		this.$(".seiGrade").myDropDown();
		this.$(".intensity").myDropDown();
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