App.Flow=App.Flow||{};

App.Flow.Controller={
	
	init:function(){
	
		//实例化
		new App.Flow.View();
		
		var _collection=this.flowCollection;
		_collection.fetch({
			reset:true
		});
		
		$("#pageLoading").hide();
		
	},
	
	flowCollection:new (Backbone.Collection.extend({
         model: Backbone.Model.extend({
             defaults: function() {
                 return {
                     url: ''
                 }
             }
         }),
         urlType: "fetchFlow",
         parse: function(response) {
             if (response.message == "success") {
                 return response;
             }
         }
	
	}))
	
}