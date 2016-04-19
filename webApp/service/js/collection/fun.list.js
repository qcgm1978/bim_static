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

    loadData : function(selected) {
        //数据重置
        App.Service.fun.collection.reset();
        // load list
        App.Service.fun.collection.fetch({
            data: {
            },
            success: function(collection, response, options) {

                var func = collection.models;
                collection.reset();
                collection.add(selected);
                collection.add(func);
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






