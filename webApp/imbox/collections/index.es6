App.IMBox = {

	init() {
		$('#pageLoading').hide();
		$('#dataLoading').hide();
		$("#topBar li").hide();
		$("#topBar li.imbox").show();
		$("#topBar li.user").show();
		$("#contains").html(new App.IMBox.NavView().render().$el);
		$("#contains").append(new App.IMBox.imboxContainerView().render().$el);

		this.messageCollection.fetch({
			reset:true,
			data:{
				status:0
			}
		});
	},

	messageCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchIMBoxList",
		parse: function(response) {
			return response.data;
		}
	})),

	messageAllCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchIMBoxList",
		parse: function(response) {
			return response.data;
		}
	}))

}