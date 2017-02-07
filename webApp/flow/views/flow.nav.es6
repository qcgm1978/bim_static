App.Flow=App.Flow||{};

App.Flow.NavView=Backbone.View.extend({

	tagName:"ul",

	className:"flowTabNav",

	template:_.templateUrl("/flow/tpls/flow.nav.html",true),

	events:{
		'click .flowTabItem':'switchModel',
		'click #flowAdminBtn a':'flowAdminBtnFun',
	},
	
	initialize(){
		this.listenTo(App.Flow.Controller.flowNavCollection,'reset',this.load);
	},
	flowAdminBtnFun(){//管理依据的按钮点击之后的方法
		var ContentAdminBasiView = new App.Flow.ContentAdminBasiView();
		$("#flowContainer").empty();
		$("#flowContainer").html(ContentAdminBasiView.render().el);
	},
	switchModel(e){
		var $target=$(e.currentTarget);
		if(!$target.hasClass('itemSelected')){
			$('.itemSelected').removeClass('itemSelected');
			$target.addClass('itemSelected');
			var id=$target.data('id');
			this.$("#flowMoreBtn a").attr('href',$target.data('link'));
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
