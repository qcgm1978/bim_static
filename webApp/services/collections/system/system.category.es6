App.Services.SystemCollection = {

	//分类列表
	CategoryCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "servicesCategoryList",
		parse(response) {
			if (response.code == 0) {
                 return response.data.items;
             }
		}
	}))

}