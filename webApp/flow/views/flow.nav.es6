App.Flow=App.Flow||{};

App.Flow.NavView=Backbone.View.extend({

	tagName:"ul",

	className:"flowTabNav",

	template:_.templateUrl("/flow/tpls/flow.nav.html",true),

	events:{
		'click .tabNavItem':'switchModel'
	},
	
	initialize(){
		this.listenTo(App.Flow.Controller.flowNavCollection,'reset',this.load);
	},

	switchModel(e){
		var $target=$(e.currentTarget);
		$('.arrowSelected').removeClass('arrowSelected').addClass('arrowNoSelected');
		if($target.hasClass('arrowNoSelected')){
			$target.removeClass('arrowNoSelected');
			$target.addClass('arrowSelected');
			var id=$target.data('id');
			this.$("#flowMoreBtn a").attr('href',$target.data('link'))
			this.loadContent(id);
		}
	},

	load:function(m){
		var data=m.toJSON()[0];
		var _html=_.template(this.template);
		this.$el.html(_html(data));
		$("#flowTabNavContainer").html(this.$el);
		this.loadContent(data.data[0].id);
		return this;
	},

	loadContent(id){
		App.Flow.Controller.flowCollection.phaseId=id;
		App.Flow.Controller.flowCollection.fetch({
			reset:true
		})
	}
});
