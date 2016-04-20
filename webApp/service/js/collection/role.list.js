/*
* @require  /service/js/view/role/Service.role.list.js
* */
var App = App || {};
App.Service.role ={

    collection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServiceRolesList",
        parse: function (response) {
            if (response.message == "success") {
                return response.data.role;
            }
        }
    })),

    loadData : function(func) {
        //数据重置
        App.Service.role.collection.reset();
        // load list
        App.Service.role.collection.fetch({
            data: {
            },
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    func();
                }
            }
        });
    },

    init :function(){
        $(".serviceBody").empty().html( new App.Service.roleList().render().$el);
        App.Service.role.loadData();//加载成员列表
    }
};






