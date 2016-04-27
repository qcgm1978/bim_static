/*
* @require  /service/views/role/Service.role.list.js
* */
var App = App || {};
App.Service.ozRole ={
    collection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServiceOzRoleList",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    loadData : function(orgId,func) {
        //数据重置
        App.Service.ozRole.collection.reset();
        // load list
        App.Service.ozRole.collection.fetch({
            data: {
                orgId : orgId || ""
            },
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    func();
                }
            }
        });
    },

    init :function(){
        App.Service.ozRole.loadData();//加载成员列表
    }
};






