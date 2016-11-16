App.Services=App.Services||{};

App.Services.More=Backbone.View.extend({

	tagName:"div",

	className:"servicesMore",

	template:_.templateUrl("/services/tpls/services.more.html"),

	render:function(){
		this.$el.html(this.template({data:[]}));
		return this;
	},

	bindEvent : function(){
		$('#resourceMore .fileName a').on('click',function(){
			var id=$(this).data('id');
			window.open(id,'_blank');
		})
	}

});
