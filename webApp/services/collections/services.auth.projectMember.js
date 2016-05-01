/**
 * @require /services/collections/index.es6
 */

App.Services.projectMember = {
	//初始化
	init: function() {
		$('.serviceBody').html(new App.Services.projectMember.mainView().render().el);
		this.loadData(this.projectMemberProjectCollection);
		
		$( "#moduleWindow" ).dialog();

	},

	projectMemberProjectCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchServicesProjectMemberProjectList",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	})),

	loadData: function(collection) {
		collection.fetch({
			reset: true,
			data: {},
			success:function(collection, response, options){}
		});
	}

}