/*
* @require  /service/js/view/mem/Service.MemCtrl.ozList.js
* */
var App = App || {};
//组织部分
/*App.Service.memCtrloz ={

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
 return response.data;
 }
 }
 })),

 loadData : function() {
 //数据重置
 App.Service.memCtrloz.collection.reset();
 // load list
 App.Service.memCtrloz.collection.fetch({
 data: {
 },
 success: function(collection, response, options) {
 }
 });
 }
 };*/
//成员部分
App.Service.memCtrlBlend ={

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


    /*ajax : function(data){
        App.Comm.ajax(data,function(data){
            Service.log(data);
        });
    },*/

    outerCollection:new(Backbone.Collection.extend({
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
                return response.data.org;
            }
        }
    })),




    loadData : function(collection,data) {
        data = data || {};
        //数据重置
        collection.reset();
        // load list
        collection.fetch({
            data:data,
                //https://bim.wanda.cn/platform/auth/org?outer={outer}&parentId={parentId}&includeUsers={includeUsers}
            success: function(collection, response, options) {
                console.log(response);
            }
        });
    },

    init :function(){
        $(".serviceBody").empty().html( new App.Service.MemCtrl().render().$el);
        $(".content").html( new App.Service.MemCtrlBlendList().render().$el);
        //App.Service.memCtrloz .loadData();//加载组织列表
        App.Service.memCtrlBlend.loadData(App.Service.memCtrlBlend.collection);//加载成员列表
    }
};






