App.Services.ProjectCollection = {

	//分类列表
		ProjectSlideBarCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjects",
		parse(response) {
			if (response.code == 0) {
                 return response.data.items;
            }
		}
	}))

 

}