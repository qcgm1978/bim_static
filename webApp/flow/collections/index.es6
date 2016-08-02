App.Flow=App.Flow||{};

App.Flow.Controller={
	
	init:function(){
	
		//实例化
		$('#contains').html(new App.Flow.View().render().$el);
        new App.Flow.NavView();
        new App.Flow.ContentView();
		
        this.flowNavCollection.fetch({
            reset:true
        })

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
	
	})),

    flowNavCollection:new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchNavFlow",
        parse: function(response) {
            if (response.message == "success") {
                return response;
            }
        }

    }))
	
}