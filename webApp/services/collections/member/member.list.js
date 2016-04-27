/*
* @require  /service/views/mem/Services.memCtrl.blendList.js
* */
var App = App || {};
//组织部分
/*App.Services.memCtrloz ={

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
 App.Services.memCtrloz.collection.reset();
 // load list
 App.Services.memCtrloz.collection.fetch({
 data: {
 },
 success: function(collection, response, options) {
 }
 });
 }
 };*/
//成员部分
App.Services.Member ={

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
                App.Services.Member.setter(response);//设定特征
                return response.data.user;
            }
        }
    })),


    outerCollection:Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        })
    }),

///设置oz属性，判断是否组织，注意这个只需读取无需存储
    setter:function(response){
        for(var i = 0; i < response.data.user.length; i++){
            response.data.user[i]["oz"] = false;
        }
        for(var j = 0; j < response.data.org.length; j++){
            response.data.org[j]["oz"] = true;
        }
    },


    loadData : function(collection,data) {
        data = data || {};
        collection.reset();
        collection.fetch({
            data:data,
            success: function(collection, response, options) {
            }
        });
    },

    init :function(){
        $(".serviceBody").empty().html( new App.Services.MemberNav().render().el);
        $(".content").html( new App.Services.memberList().render().el);
        //App.Services.memCtrloz .loadData();//加载组织列表
        App.Services.Member.loadData(App.Services.Member.collection);//加载成员列表
    }
};






