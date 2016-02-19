App.Projects = {


	TodoCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({

			defaults: function() {
				return {
					title: ''
				}
			}
		})

		//parse 
	})),


	init: function() {

		//nav
		$("#contains").html(new App.Projects.NavView().render().$el);
	 

	}

	 

}