/*
 * @require  /service/js/model/fun.model.js
 * */
var App = App || {};
App.Service.fun ={

    collection:new(Backbone.Collection.extend({
        model: App.Service.funModel,
        urlType: "fetchServiceFunList",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    loadData : function(fn) {
        //数据重置
        App.Service.fun.collection.reset();
        // load list
        App.Service.fun.collection.fetch({
            data: {
            },
            success: function(collection, response, options) {
                if(fn && typeof  fn == "function"){
                    fn();
                }
            }
        });
    }
/*    ajax:function() {
        var data={
            urlType: "fetchServiceFunList",
            set:{}
        };
        App.Comm.ajax(data,"GET",function(response){

        });

    }*/
};






