/*
* @require  /services/collections/index.es6
*/
App.Services.Member ={

    //组织
    collection:Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        parse: function (response) {
            if (response.message == "success") {
                return response.data.org;
            }
        }
    }),

    //内部用户
    innerCollection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesMemberInnerList",
        parse: function (response) {
            if (response.message == "success") {
                return App.Services.Member.list(response);
            }
        }
    })),


    //外部用户
    outerCollection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesMemberOuterList",
        //返回品牌或者公司或者成员
        parse: function (response) {
            if (response.message == "success") {
                return App.Services.Member.list(response);
            }
        }
    })),

    //存储角色
    SubRoleCollection : new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesSaveRole",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    //创建组织／成员混合列表
    list:function(response){
        var a = [],blendList = [];
        if(response.data.user && response.data.user.length) {
            for (var i = 0; i < response.data.user.length; i++) {
                a.push(response.data.user[i])
            }
        }
        if(response.data.org && response.data.org.length){
            for(var j = 0 ; j < response.data.org.length ; j++ ){
                a.push(response.data.org[j])
            }
        }
        blendList = a;
        return blendList;
    },

    loadData : function(collectionType,data,fn) {
        data = data || {};
        collectionType.reset();
        collectionType.fetch({
            data:data,
            success: function(collection, response, options) {
                if(fn && typeof fn == "function"){
                    fn(response);
                }
            }
        });
    },
    init :function(){
        $(".serviceBody").html( new App.Services.MemberNav().render().el);
        $(".serviceBody .content").html(new App.Services.MemberList().render().el);
        App.Services.Member.loadData(App.Services.Member.innerCollection);//默认加载内部列表
    }
};





