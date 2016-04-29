/*
* @require  /services/collections/index.es6
*/
App.Services.Member ={

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

    outerCollection:Backbone.Collection.extend({
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
    }),

    //创建组织／成员混合列表
    list:function(response){
        var blendList = [];
        if(response.data.user.length) {
            for (var i = 0; i < response.data.user.length; i++) {
                blendList.push(response.data.user[i])
            }
        }else if(response.data.org){
            for(var j = 0 ; j < response.data.org.length ;j++ ){
                blendList.push(response.data.org[j])
            }
        }
        return blendList;
    },

/////设置oz属性，判断是否组织，注意这个只需读取无需存储
//    setter:function(response){
//        for(var i = 0; i < response.data.user.length; i++){
//            response.data.user[i]["oz"] = false;
//        }
//        for(var j = 0; j < response.data.org.length; j++){
//            response.data.org[j]["oz"] = true;
//        }
//    },


    loadData : function(collection,data,fn) {

        data = data || {};
        collection.reset();
        collection.fetch({
            data:data,
            success: function(collection, response, options) {
                if(fn || typeof fn == "function"){

                    fn(response);
                }
            }
        });
    },



    init :function(){

        $(".serviceBody").empty().html( new App.Services.MemberNav().render().el);
        $(".content").html(new App.Services.MemberList().render().el);
        App.Services.Member.loadData(App.Services.Member.innerCollection);//默认加载内部列表

    }
};






