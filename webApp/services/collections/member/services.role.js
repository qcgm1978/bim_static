/*
* @require  /services/views/auth/role/Services.role.list.js
* */
var App = App || {};
App.Services.role ={

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
        App.Services.role.collection.reset();
        // load list
        App.Services.role.collection.fetch({
            data:{},
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    func();
                }
            }
        });
    },

    init :function(){
        $(".serviceBody").empty().html( new App.Services.roleList().render().el);
        App.Services.role.loadData();//加载成员列表
    }
};



App.Services.ozRole ={

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

    loadData : function(data,func) {
        //数据重置
        App.Services.role.collection.reset();
        // load list
        App.Services.role.collection.fetch({
            data:data,
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    App.Service.memCtrlBlend.setter(response);//设定特征
                    func();
                }
            }
        });
    }

};






