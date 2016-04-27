/*
* @require  /service/model/model.js
* */
var App = App || {};
App.Service.windowBlend ={

    collection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServiceMCBlendList",
        parse: function (response) {
            if (response.message == "success") {
                return response.data.user;
            }
        }
    })),
    loadData : function() {
        //数据重置
        App.Service.windowBlend.collection.reset();
        // load list
        App.Service.windowBlend.collection.fetch({
            data: {
                //https://bim.wanda.cn/platform/auth/org?outer={outer}&parentId={parentId}&includeUsers={includeUsers}
            },
            success: function(collection, response, options) {
            }
        });
    },

    init :function(){
        App.Service.windowBlend.loadData();//加载成员列表
    }
};






