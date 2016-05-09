/*
* @require  /services/collections/index.es6
*/
App.Services.Member.RunStatus= 0;//0,1,2
App.Services.Member.PresentMemberRoleQueue= [];
App.Services.Member.PresentMemberRoleCount= 0;
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


    roleCollection: new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        })
    })),


    roleList:function(fn){
        var _this=this,
            s,//当前
            length,//队长
            status = App.Services.Member.RunStatus,//运行状态
            queue= App.Services.Member.PresentMemberRoleQueue,//队列
            collection  = App.Services.Member[App.Services.MemberType + "Collection"],//集合

            modelList  = collection.models;//模型列表

        collection.each(function(item){
            queue.push(item.cid);
        });

        s = length  = queue;

        while(s) {
            if(!status ){//状态判断是否加载，暂停还是停止
                if(status ==1){
                    //pause  1
                    if(fn && typeof fn == "function"){
                        fn(this.loadSingleRole); //callback实现，需要传入当前的model
                    }
                }else if(status ==2){
                    //cancel   2
                }
                return
            }
            this.loadSingleRole( modelList[length-s]);
            App.Services.Member.PresentMemberRoleCount  = s; //保存当前状态
            s --; //记录当前选项
        }
    },


    //队列
    line:function(){

    },

    loadSingleRole:function(item){
        var a, b, c,cid,rdata={};
        a = item.get("userId");
        b = item.get("orgId");
        c = item.get("outer");
        cid = item.cid;

        b = b || 'false';
        rdata.type = "GET";

        if(a){
            rdata.URLtype = "fetchServicesUserRoleList";
            rdata.data = {
                userId:a,
                outer:c
            }
        }else if(b){
            rdata.URLtype = "fetchServicesOzRoleList";
            rdata.data = {
                orgId:b,
                outer:c
            }
        }else{
            console.log("no userId or orgId");
        }


        App.Comm.ajax(rdata,function(response){
            if (response.message == "success" && response.data.length) {
                App.Services.Member.roleCollection.add(response.data);
                return response.data;
            }
        });
    },



//延迟加载
    lazyLoad:function(a,s){
        var n = a/ s, n2 = a%s;
        if(n > 1){
            setTimeout(function(){
                this.lazyLoad();
            },0);
        }else{

            //return blendList;
        }
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





