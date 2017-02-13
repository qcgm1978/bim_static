App.Flow=App.Flow||{};

App.Flow.Controller={
    default:{
        tabType:''
    },
    icon:{
        '成本管理':'m-chengbenguanli',
        '商管工程':'m-shangguangongcheng',
        '发展管理':'m-fazhanguanli',
        '计划管理':'m-jihuaguanli',
        '设计管理':'m-shejiguanli',
        '招商管理':'m-zhaoshangguanli',
        '质量管理':'m-zhiliangguanli',
        '经营管理':'m-jingyingguanli32'
    },

    toIcon:function(key){
      return this.icon[key]||'m-moren';
    },

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
	flowPageName:function(pageName){
        var ContentAdminBasiPageView = new App.Flow.ContentAdminBasiPageView().render(pageName).el;
        $('#contains').empty("");
        $('#contains').html(ContentAdminBasiPageView);
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