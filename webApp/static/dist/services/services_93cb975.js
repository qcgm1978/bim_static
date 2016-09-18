;/*!/services/collections/index.es6*/
"use strict";

//服务
App.Services = {

	DefaultSettings: {
		type: ""
	},

	//初始化
	init: function init(type, tab) {

		this.Settings = $.extend({}, this.DefaultSettings);

		this.Settings.type = type;
		this.Settings.tab = tab;

		if (type) {

			var viewer;
			if (type == "auth") {
				//权限管理
				viewer = new App.Services.Auth();
			} else if (type == "project") {
				//项目管理
				viewer = new App.Services.Project();
			} else if (type == "application") {
				//应用管理
				viewer = new App.Services.Application();
			} else if (type == "system") {
				//系统管理
				viewer = new App.Services.System();
			} else if (type == "log") {
				// 日志管理
				viewer = new App.Services.Log();
			} else if (type == "workbook") {
				//操作手册
				viewer = new App.Services.WorkBook();
			} else if (type == "issue") {
				//问题反馈
				viewer = new App.Services.Issue();
			}

			$("#contains").html(viewer.render().el);
			$("#pageLoading").hide();
			if (type == "project") {
				App.Comm.initScroll($('#contains .scrollWrap'), "y");
			}
		} else {
			var indexTpl = _.templateUrl('/services/tpls/index.html');
			$("#contains").html(indexTpl);
			//设置权限
			this.setAuth();
			$("#pageLoading").hide();
		}
	},

	//权限设置
	setAuth: function setAuth() {
		var $serviceNav = $(".servicesIndexBox .servicesIndex"),
		    user = JSON.parse(localStorage.user || "{}"),
		    isKeyUser = user.isKeyUser || false,
		    _AuthObj = App.AuthObj || {};

		if (_AuthObj && !_AuthObj.service) {
			$serviceNav.remove();
		} else {
			var Auth = _AuthObj.service || {};

			if (!Auth.app) {
				$serviceNav.find(".application").remove();
			}

			if (!Auth.auth && !isKeyUser) {
				$serviceNav.find(".notice").remove();
			}

			if (!Auth.log) {
				$serviceNav.find(".log").remove();
			}

			if (!Auth.operationManual) {
				$serviceNav.find(".workbook").remove();
			}

			if (!Auth.sys) {
				$serviceNav.find(".systen").remove();
			}

			if (!Auth.project) {
				$serviceNav.find(".project").remove();
			}
		}
		//判断是否是空页面
		this.isNullPage();
	},
	isNullPage: function isNullPage() {

		var $page = $(".servicesIndexBox");
		//空页面
		if ($page.find(".item").length <= 0) {
			$page.html(_.templateUrl('/services/tpls/nullPage.html'), true);
		}
	}
};
;/*!/services/collections/auth/member/member.list.js*/
/*
* @require  services/collections/index.es6
*/

App.Services.memberWindowData = {"roleId":[], "outer":{"orgId":[],"userId":[]},"inner":{"orgId":[], "userId":[]}};
App.Services.Member ={
    memLoadingStatus: true,
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
            if (response.code == 0) {
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
            if (response.code == 0) {
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
            if (response.code == 0) {
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
            if (response.code == 0) {
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
                //设置...
                _.each($("#blendList .roles span"),function(item){
                    App.Services.exetor($(item));
                });
            }
        });
    },
    //以下缓存和重置POST的数据
    saveMemData:function(obj){
        App.Services.memberWindowData = obj;
    },
    resetMemData:function(){
        App.Services.memberWindowData = {"roleId":[], "outer":{"orgId":[],"userId":[]},"inner":{"orgId":[], "userId":[]}};
    },
    resetRoleData:function(){
        App.Services.memberWindowData = {};
    }
};
;/*!/services/views/auth/member/services.member.detail.js*/
/*
 * @require  services/collections/auth/member/member.list.js
 * */
App.Services.memberDetail=Backbone.View.extend({
    tagName : 'li',
    className : 'choose',

    template:_.templateUrl("/services/tpls/auth/member/services.member.detail.html"),
    events:{
        "click .pers":"modify",
        "click .sele":"choose",
        "click .name":"loadMenu"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        App.Services.exetor(this);
        return this;
    },

    initialize:function(){
        this.model.set({"checked":false},{silent:true});//预设选择状态
        this.listenTo(this.model, 'change:role', this.render);
        Backbone.on("serviceMemberSearchSelect",this.serviceMemberSearchSelect,this);
    },
    cancelBubble:function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            window.cancelBubble = true;
        }
    },
    serviceMemberSearchSelect:function(id){
        if(this.model.get("userId")){
            if(this.model.get("userId") == id){
                this.$(".sele").click();
            }
        }else if(this.model.get("orgId")){
            if(this.model.get("orgId") == id){
                this.$(".sele").click();
            }
        }
    },
    loadMenu:function(e){
        var _this = this;
        this.cancelBubble(e);
        if(App.Services.queue.que > 1 ){ return}
        if(this.model.get("userId")){return}//用户，可能需要另行处理
        //Backbone.trigger("serviceMemberOrgLoad" ,this.model.get("orgId"));
        var pre = _.filter($('.ozName'),function(item){
            return $(item).attr('data-id') == _this.model.get("orgId");
        });
        $(pre[0]).trigger('click');
    },

    //单个修改
    modify:function(e){
        this.cancelBubble(e);
        var  pre = $("#ozList span.active"), _this = this,frame,disable,selected;
        if(pre.closest(".inner").length || pre.closest(".outer").length){
            App.Services.memOz = "-";
        }else{
            App.Services.memOz = pre.html();
            App.Services.searchOrg(pre);     //获取所属组织列表
        }
        frame = new App.Services.MemberWindowIndex().render().el;//外框
        _this.window(frame);
        _this.chooseSelf();
        _this.save();
        $(App.Services.maskWindow.element[0]).addClass("services_loading");

        //获取所有列表，继承项设置不可修改
        App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){
            $(App.Services.maskWindow.element[0]).removeClass("services_loading");
            var role = _this.model.get("role");
            if(role && role.length) {
                selected  = _.filter(role,function(item){
                    return !item.inherit
                });
                _this.selected(selected);
                disable = _.filter(role,function(item){
                    return item.inherit
                });
                _this.disable(disable);
            }
            App.Services.maskWindow.find(".memRoleList h2 i").text(role.length);
        });
    },
    //不可选状态
    disable:function(arr){
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    item.set({"inherit": true});
                }
            }
        });
    },
    //已选状态
    selected:function(arr){
        var n = 0;//统计
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    if(arr[i]["inherit"]){
                        item.set("inherit", true);
                        return
                    }
                    item.set("checked", true);
                }
            }
        });
        return n;
    },
    //保存数据到全局变量
    save:function(){
        var type =  App.Services.MemberType || "inner",
            data =  App.Services.memberWindowData,
            userId = this.model.get("userId"),
            orgId  = this.model.get("orgId");
        if(userId){
            data[type].userId.push(userId);
        }else if(orgId){
            data[type].orgId.push(orgId);
        }
        App.Services.Member.saveMemData(data);
    },
    //已选部分，当弹窗加载时使用当前成员的角色列表，将弹窗的父角色内与当前成员角色重叠的部分设置为已选
    chooseSelf:function(){
        var type =  App.Services.MemberType || "inner";
        App.Services.Member.SubRoleCollection.each(function(item){
            item.set("checked",false);
        });
        App.Services.Member[type + "Collection"].each(function(item){
            item.set("checked",false);
        });
        $("#blendList li").removeClass("active");
        this.$el.addClass("active");
        this.model.set("checked",true);
    },
   //选择选项时作的操作。
    choose:function(){
        var boolean = this.model.get("checked");
        if(!boolean){
            this.$el.addClass("active");
        }else{
            this.$el.removeClass("active");
        }
        this.model.set({"checked": !boolean});
    },

    //初始化窗口
    window:function(frame){
        var _this =this;
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"角色授权",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Services.Member.resetMemData();
                $(".showAll").remove();
            },
            message:frame
        });
        $(".mod-dialog").css({"min-height": "545px"});
        $(".mod-dialog .wrapper .content").css({"min-height": "500px"});
        _this.model.set("namePath",App.Services.memOz);
        $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:_this.model}).render().el);//当前用户
        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表
    }
});

;/*!/services/views/auth/member/services.member.list.js*/
/*
 * @require  services/views/auth/member/services.member.detail.js
 */

App.Services.MemberList=Backbone.View.extend({

    tagName:"div",

    events:{
        "click .batchAward":"batchAward",
        "click .selectAll":"selectAll"//全选
    },

    template:_.templateUrl("/services/tpls/auth/member/services.member.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.Services.Member.innerCollection,"add",this.addOne);
        this.listenTo(App.Services.Member.innerCollection,"reset",this.render);
        this.listenTo(App.Services.Member.outerCollection,"add",this.addOne);
        this.listenTo(App.Services.Member.outerCollection,"reset",this.render);
        Backbone.on("servicesMemberControlCancelSelectAll",this.cancelSelectAll,this);
        Backbone.on("servicesMemberControlNoSelect",this.servicesMemberControlNoSelect,this);
    },
    servicesMemberControlNoSelect:function(){
        this.$("#blendList").html("<li><span class='sele'>没有选择任何组织，请点击左侧组织名选择</span></li>");
    },

    //数据加载
    addOne:function(model){
        if(App.Services.Member.memLoadingStatus){
            var newView = new App.Services.memberDetail({model:model}).render();
            this.$("#blendList").append(newView.el);
            if(!newView.$(".roles i").length){
                App.Services.exetor(newView);
            }
            App.Comm.initScroll(this.$el.find(".readyForScroll"),"y");
        }
    },

    cancelSelectAll:function(){
        this.$(".selectAll input").attr("checked",false);
        this.$("#blendList").html("<li><span class='sele'>暂无数据</span></li>");
    },

    //选中事件
    selectAll:function(){
        var type =  App.Services.MemberType,
            _this = this,
            preSele= this.$(".head input")[0].checked,
            collection = App.Services.Member[type + "Collection"];
        if(!$("#blendList li .memCheck").length){
            return
        }
        this.$(":checkbox").each(function(checkbox){
            checkbox.checked = preSele;
            if(preSele){
                _this.$("li").addClass("active");
                collection.each(function(item){item.set({"checked":true})})
            }else{
                _this.$("li").removeClass("active");
                collection.each(function(item){item.set({"checked":false})})
            }
        })
    },

    //批量授权
    batchAward:function(){
        App.Services.Member.resetMemData();
        var  _this =this,//提交地址
            type =  App.Services.MemberType,//组织类型
            seleUser,
            selected,
            disable,
            singleModel; //单选模型

        var  pre = $("#ozList span.active");
        if(pre.hasClass(".inner") || pre.hasClass(".outer")){
            App.Services.memOz = "-";
        }else{
            App.Services.memOz = pre.html();
            App.Services.searchOrg(pre);     //获取所属组织列表
        }


        //获取所选项
        seleUser = App.Services.Member[type + "Collection"].filter(function(item){
            if(item.get("checked")){
                return item.get("checked");
            }
        });
        //无选择
        if(seleUser && !seleUser.length){
            alert("您没有选择任何成员或组织，无法设置角色！");return
        }
        //弹窗框架
        _this.window();

        //单选
        if(seleUser.length == 1) {
            singleModel = seleUser[0];
            //角色数据
            App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){
                seleUser[0].set("namePath",App.Services.memOz);
                $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:seleUser[0]}).render().el);
                $(App.Services.maskWindow.element[0]).removeClass("services_loading");
                var role = singleModel.get("role");
                if(role && role.length) {
                    App.Services.maskWindow.find(".memRoleList h2 i").text(role.length);
                    selected =  _.filter(role,function(item){
                        return !item.inherit
                    });
                    _this.selected(selected);
                    disable = _.filter(role,function(item){
                        return item.inherit
                    });

                    _this.disable(disable);
                }
            });
            _this.saveData(seleUser);
            return
        }

        //多选，写入已选用户和组织
        _.each(seleUser,function(item){
            item.set("namePath",App.Services.memOz);
            $(".seWinBody .aim ul").append(new App.Services.MemberWindowDetail({model:item}).render().el);
            App.Comm.initScroll(App.Services.maskWindow.find(".selec"),"y");
        });
        this.saveData(seleUser); //缓存已选数据相关数据方便提交

        App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){

            _this.getFatherData();//父项
        });

    },

    //获取父项数据
    getFatherData:function(){
        var parentId = App.Services.memFatherId,
            _this =this ;
        //无父项时获取缺省角色列表，此处为可能出错
        if(!parentId){
            App.Services.Member.loadData(App.Services.Member.SubRoleCollection,{},function(response){
                $(App.Services.maskWindow.element[0]).removeClass("services_loading");
            });
            return
        }
        var cdata = {
            URLtype:"fetchServicesOzRoleList",
            type:"GET",
            data: {
                orgId:parentId,
                outer:!(App.Services.MemberType == "inner")
            }
        };

        App.Comm.ajax(cdata,function(response){
            if(response.message=="success"){
                if(!response.data.length){
                    $(App.Services.maskWindow.element[0]).removeClass("services_loading");
                    return;}

                var role = response.data;

                if(role && role.length) {
                    _this.disable( role);
                    App.Services.maskWindow.find(".memRoleList h2 i").text(role.length);
                }

                $(App.Services.maskWindow.element[0]).removeClass("services_loading");
            }
        });
    },

    disable:function(arr){
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    item.set("inherit", true);
                }
            }
        });
    },

    //已选状态
    selected:function(arr){
        App.Services.Member.SubRoleCollection.each(function(item){
            for(var i = 0 ; i< arr.length ; i++){
                if(item.get("roleId") == arr[i]["roleId"]){
                    item.set("checked", true);
                    if(arr[i]["inherit"]){
                        item.set("inherit", true);
                        item.set("checked", false);
                    }
                }
            }
        });
    },

    //保存要提交的数据模块，将数据混编成可提交形式
    saveData:function(seleUser){
        var saveType =  App.Services.MemberType || "inner",
            data= App.Services.memberWindowData,
            userId,
            orgId;
        //userId和orgId
        _.each(seleUser,function(item){
            userId = item.get("userId");
            orgId = item.get("orgId");
            if(saveType){
                if(userId){
                    data[saveType].userId.push(userId);
                }
                if(orgId){
                    data[saveType].orgId.push(orgId);
                }
            }
            App.Services.Member.saveMemData(data);
        });
    },

    //弹窗管理
    window:function(){
        var frame = new App.Services.MemberWindowIndex().render().el; //渲染框架
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"角色授权",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Services.Member.resetMemData();
            },
            message:frame
        });
        $(".mod-dialog").css({"min-height": "545px"});
        $(".mod-dialog .wrapper .content").css({"min-height": "500px"});

        $(".memRoleList").append(new App.Services.windowRoleList().render().el);//角色列表框架
        $(App.Services.maskWindow.element[0]).addClass("services_loading");//状态
    },
    //排序
    comparator:function(){}
});
;/*!/services/views/auth/member/services.member.ozDetail.js*/
/*
 * @require  services/views/auth/member/services.member.list.js
 * */
App.Services.MemberozDetail=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.orgdetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change:active",this.sele);
        Backbone.on("serviceMemberOrgLoad",this.unfold,this);
        Backbone.on("serviceMemberSelectStatus",this.serviceMemberSelectStatus,this);

    },

    sele:function(){
        if(this.model.get("active")){
            this.$(".ozName").addClass("active");
            this.$(".ozName span").addClass("active");
        }
    },



    serviceMemberSelectStatus:function(){
        this.$(".ozName span").removeClass("active");//清除内部所有的激活的元素
        if(!this.model.get("hasChildren")){
            this.$(".ozName").removeClass("active");
        }
    },

    unfold:function(pram){
        if(pram == parseInt(this.$(".ozName").attr("data-id")) || typeof pram == "object"){//为右侧触发，参数为父级id
            var _this =  this,
                container = this.$el.siblings(".childOz");

            if(typeof pram == "object") {
                //如果是快速点击，属于误操作，跳过
                //if (!App.Services.queue.permit) {
                //    return;
                //}
                //if (App.Services.queue.que > 2) {
                //    return
                //}
            }
            //选择和加载状态
            if (this.$(".ozName span").hasClass("active")) {  //已选（必然已加载），收起
                if(container.html()){
                    this.$(".ozName").removeClass("active").find("span").removeClass("active");
                    App.Services.queue.certificates();
                    //清空右侧列表
                    Backbone.trigger("servicesMemberControlNoSelect");
                    container.hide();
                    return;
                }
            }else if (container.html()) {   //未选但已加载，选择，显示已加载项
                if (!container.is(":hidden")) {
                    container.find(".childOz").hide();
                    var preOrg = _.filter($(".ozName span"), function (item) {
                        return _this.model.get("orgId") == $(item).attr("data-id")
                    });
                    $(preOrg[0]).closest(".ozName").removeClass("active");
                    this.$(".ozName").removeClass("active");
                    container.find(".ozName").removeClass("active");
                    container.find(".ozName span").removeClass("active");
                    container.hide();
                    //return;
                }
                Backbone.trigger("serviceMemberTopSelectStatus");
                Backbone.trigger("serviceMemberSelectStatus");//清除内部所有的激活的元素
                this.$(".ozName").addClass("active").find("span").addClass("active");
                container.find(".childOz").hide();
                container.show();
            } else { //未加载 ，移除所有加载项再选择和显示
                Backbone.trigger("serviceMemberTopSelectStatus");
                Backbone.trigger("serviceMemberSelectStatus");
                this.$(".ozName").addClass("active").find("span").addClass("active");
                container.show();
            }
            //App.Services.queue.promise(_this.pull, _this);
            this.pull();
        }
    },

    //队列请求
    pull:function(){
        var _this = this;//this
        var _thisType = App.Services.MemberType;
        var _thisId = App.Services.memFatherId =  _this.$(".ozName").data("id") ;
        var collection = App.Services.Member[_thisType + "Collection"];
        //样式操作
        $("#blendList").empty();
        $(".serviceBody .content").addClass("services_loading");
        var cdata = {
            URLtype: "fetchServicesMemberList",
            type:"GET",
            data:{
                parentId:_thisId,
                outer:  !(_thisType == "inner"),
                includeUsers:true
            }
        };
        //此处为延迟
        App.Comm.ajax(cdata,function(response){
            var alreadyMenu = _this.$el.siblings(".childOz");//已加载菜单将不再加载
            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                Backbone.trigger("servicesMemberControlCancelSelectAll");
                return
            }
            //搜索状态，如果是搜索项则不刷新右侧列表（搜索的父项除外）
            App.Services.Member.memLoadingStatus = true;
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                if(alreadyMenu.html()){return}//判断不再刷新菜单
                alreadyMenu.html(App.Services.tree(response));
            }

            if(App.Services.memSearchParentOz.id){
                Backbone.trigger("serviceMemberSearchSelect",App.Services.memSearchParentOz.id);
            }
            App.Services.Member.memLoadingStatus = false;
        }).done(function(){
            //删除执行完毕的 ，添加执行新的
            //App.Services.queue.next();
            //搜索队列
            //if(searchQueue.count && searchQueue.count != 1){
            //    if(_this.$(".ozName").attr("data-id") == searchQueue.arr[searchQueue.count].id){
            //        _this.$(".ozName").click();
            //    }
            //    searchQueue.count--;
            //}else{
            //    App.Services.memSearchParentOz.reset();
            //}
        });
    }
});
;/*!/services/collections/application/index.app.es6*/
"use strict";

/**
 * @require services/collections/index.es6
 */

App.Services.AppCollection = {

	//分类列表
	AppListCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "appList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data;
			}
		}
	}))()

};
;/*!/services/collections/auth/keyUser/keyUser.js*/
/**
 * @require services/collections/index.es6
 */

App.Services.KeyUser = {

  //暂存step2里选择的模式
  mode :1,
  //暂存被点击的关键用户信息的uid
  uuid : '',
  //暂存已被选关键用户的uid数组
  uid : [],

  //暂存已被选关键用户的项目ID数组
  pid : [],

  //暂存已被选关键用户的分区ID数组
  partid : [],

  //暂存已被选关键用户的orgId数组
  orgId : [],

  //暂存被编辑的关键用户的项目ID数组
  editpid : [],

  //暂存被编辑的关键用户的orgId数组
  editorgId : [],

  //暂存已被选关键用户分区的html
  parthtml : [],

  //暂存已被选关键用户step1的html
  html : [],

  //暂存已被选关键用户step2的html
  html2 : [],

  //暂存已被选关键用户step3的html
  html3 : [],

  userList:[],

  //清空暂存的数据
  clearAll: function(){
    this.uid   = [];
    this.pid   = [];
    this.orgId = [];
    this.html  = [];
    this.html2 = [];
    this.html3 = [];
    this.parthtml = [];
    this.partid = [];
  },

  loadData : function(collection,data,fn) {

    data = data || {};
    //collection.reset();
    collection.fetch({
      remove: false,
      data:data,
      success: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      },
      error: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      }
    });
  },

  ajax : function(data,cb){
    //是否调试
    if (App.API.Settings.debug) {
      data.url = App.API.DEBUGURL[data.URLtype];
    } else {
      data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
    }


    return $.ajax(data).done(function(data) {

      if (_.isString(data)) {
        // to json
        if (JSON && JSON.parse) {
          data = JSON.parse(data);
        } else {
          data = $.parseJSON(data);
        }
      }

      //未登录
      if (data.code == 10004) {

        window.location.href = data.data;
      }

      if ($.isFunction(callback)) {
        //回调
        callback(data);
      }

    });
  },

  KeyUserList : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),

    urlType: "fetchServiceKeyUserList"

  })),

  //keyuser infomation

  userinfo : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),

    urlType: "fetchServiceKeyUserList"

  })),

  AddKeyUser : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServiceKeyUserList"

  })),
  Step1 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesMemberInnerList"

  })),

  Step3 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesMemberOuterList"

  })),

  Step2 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchProjects"

  })),

  fam : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesProjectMemberProjectList"

  })),


  standard : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchStandardLibs"

  })),
  init : function(){
    Date.prototype.Format = function (fmt) { //author: meizz
      var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }
  },
  //状态是否正在请求服务器
  applying : false,


  fakedata:{}
};
;/*!/services/collections/auth/member/services.role.fun.js*/
/*
 * @require  services/collections/index.es6
 */
App.Services.roleFun = {
    collection: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesFunList",
        parse: function (response) {
            if (response.code == 0) {
                return response.data;
            }
        }
    })),
    loadData: function (data,fn) {
        data = data || {};
        //数据重置
        App.Services.roleFun.collection.reset();
        // load list
        App.Services.roleFun.collection.fetch({
            data:data,
            success: function (collection, response, options) {
                if (fn && typeof  fn == "function") {
                    fn();
                }
            }
        });
    }
};





;/*!/services/views/auth/role/services.role.window.index.js*/
/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleAddStatus = 0;
App.Services.roleWindowIndex = Backbone.View.extend({

    tagName:"div",
    className:"seWinBody",
    template:_.templateUrl("/services/tpls/auth/windows/services.role.window.index.html"),
    events:{
        "click .windowSubmit":"windowSubmit"
    },
    render:function(){
        this.$el.html(this.template());
        return this;
    },
    //验证
    initialize:function(){
        this.listenTo(App.Services.roleFun.collection,"add",this.addOne);
        this.listenTo(App.Services.roleFun.collection,"reset",this.render);
    },
    addOne:function(item){
        var newView = new App.Services.roleWindowFunDetail({model:item});
        this.$("#funList ul").append(newView.render().el);
        App.Comm.initScroll(App.Services.maskWindow.find(".conc"),"y");
    },

    //提交表单，完毕会触发角色列表的更新change
    windowSubmit:function(){
        if(!App.Services.roleModify){ //新增
            this.newRole();
        }else{
            this.modify();//修改
        }
    },
    //修改
    modify:function(){
        var seleFun = this.filterChecked();
        if(!seleFun.length){alert("请选择功能");return}

        var roleId =App.Services.roleModify.get("roleId");
        var cid = App.Services.roleModify.get("cid");
        var checked = App.Services.roleFun.collection.filter(function(item){
            return item.get("checked");
        });

        var url = App.API.Settings.hostname+"platform/auth/role/"+ roleId +"/function?functionId=";

        for(var i = 0 ; i < seleFun.length ; i++){
            if(i !== seleFun.length -1){
                url = url + seleFun[i].get("id") + ",";
            }else{
                url = url + seleFun[i].get("id");
            }
        }

        $.ajax({
            type:"POST",
            url:url,
            success:function(response){
                var cid = App.Services.roleModify.cid;
                App.Services.role.collection.get(cid).set(response.data);
                //查找collection，更新
                App.Services.maskWindow.close();
            },
            error:function(type){
                alert(type.statusText + "： " +type.status  );
                App.Services.maskWindow.close();
            }
        });

    },

    //新增
    newRole :function(){
        if(App.Services.roleAddStatus){alert("已在提交中，请等待！");App.Services.maskWindow.close();App.Services.roleAddStatus = 1;return}

        //新增角色  fetchServicesNewRole
        var name  = $("#selectedRoleName").val(),seleFun,roleModel;
        if(!name){alert("请填写角色名！");return;}
        var newRole = {
            "name": name,//角色名称
            "functionId":[] //功能ID数组
        };

        //已选功能列表
        seleFun = this.filterChecked();
        if(!seleFun.length){alert("请选择功能");return}

        _.each(seleFun,function(item){
            newRole.functionId.push(item.get("id"));
        });

        //保存数据
        roleModel = Backbone.Model.extend({
            defaults:{},
            urlType: "fetchServicesNewRole"
        });

        var data = {
            type:"create"
        };
        App.Services.newRoleModel =  new roleModel(newRole);
        App.Services.newRoleModel.save(data,{
            success:function(collection, response, options){
                if(response.code == 0){
                    App.Services.role.collection.add(response.data);
                }
                setTimeout(function(){
                    App.Services.roleAddStatus = 0;
                    //其他判断条件
                },200);
                App.Services.maskWindow.close();
            },
            //错误处理
            error:function(){}
        });

    },

    //过滤和辨别功能列表项
    filterChecked:function(){
        return App.Services.roleFun.collection.filter(function(item){
            return item.get("checked");
        });
    }
});

;/*!/services/views/auth/role/services.role.list.js*/
/*
 * @require  services/views/auth/role/services.role.window.index.js
 */
App.Services.roleList=Backbone.View.extend({

    tagName:"div",
    className:"roleCtrl",

    events:{
        "click .newRole": "newRole"
    },
    template:_.templateUrl("/services/tpls/auth/role/services.role.list.html"),

    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Services.role.collection,"add",this.addOne);
       this.listenTo(App.Services.role.collection,"remove",this.addAll);
    },
    //数据加载
    addOne:function(model){
        var newView = new App.Services.roleDetail({model:model});
        this.$("#roleList ul").append(newView.render().el);
        App.Comm.initScroll(this.$el.find(".roleScroll"),"y");
    },

    //添加
    addAll:function(){
        var _this = this;
        this.$("#roleList ul").empty();
        App.Services.role.collection.each(function(item){
            _this.addOne(item);
        });
    },

    //创建新角色
    newRole:function(){
        App.Services.roleModify = false;
        //框架
        var frame = new App.Services.roleWindowIndex().render().el;
        //初始化窗口
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"新建角色",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){},
            message:frame
        });
        $(".mod-dialog").css({"min-height": "545px"});
        $(".mod-dialog .wrapper .content").css({"min-height": "500px"});


        //角色信息
        App.Services.roleFun.loadData({},function(){});
    },
    //排序
    comparator:function(){

    }
});





;/*!/services/collections/auth/member/services.role.js*/
/*
* @require  services/views/auth/role/services.role.list.js
*/
//通用角色列表
App.Services.role ={
    collection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesRolesList",
        parse: function (response) {
            if (response.code == 0) {
                return response.data;
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
                    func(response);
                }
            }
        });
    },
    init :function(func){
        $(".serviceBody").empty().html( new App.Services.roleList().render().el);
        App.Services.role.loadData(func);//加载成员列表
    }
};
//组织角色
App.Services.ozRole ={
    collection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesOzRoleList",
        parse: function (response) {
            if (response.code == 0) {
                return response.data;
            }
        }
    })),

    loadData : function(data,func) {
        App.Services.ozRole.collection.reset();
        App.Services.ozRole.collection.fetch({
            data:data,
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    func();
                }
            }
        });
    }
};
//成员角色
App.Services.roleType ={
    userCollection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesUserRoleList",
        parse: function (response) {
            if (response.code == 0) {
                return response.data;
            }
        }
    })),
    //组织角色
    orgCollection:new(Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    url: ''
                }
            }
        }),
        urlType: "fetchServicesOzRoleList",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    loadData : function(collection,data,func) {
        collection.reset();
        collection.fetch({
            data:data,
            success: function(collection, response, options) {
                if(func && typeof  func == "function"){
                    func(response);
                }
            }
        });
    }
};
;/*!/services/collections/auth/projectMember/services.auth.projectMember.js*/
/**
 * @require services/collections/index.es6
 */

App.Services.projectMember = {

	managerType:3,

	selectData:function(data){
		if(data.type==3){
			return "我管理的项目("+data.projectCount+")";
		}else if(data.type==2){
			return "我管理的族库("+data.familyCount+")";
		}else if(data.type==1){
			return "我管理的标准模型("+data.modelCount+")";
		}
	},
	
	
	//初始化
	init: function() {
		$('.serviceBody').html(new App.Services.projectMember.mainView().render().el);
		
		
	//	$("#dataLoading").show();
		$('#projectList').mmhMask();
		
		/*this.loadData(this.projectMemberProjectCollection,{
			outer:App.Comm.getCookie("isOuter")
		},{
			userId:App.Comm.getCookie("userId"),
			type:3
		});*/
		this.projectMemberProjectCollection.userId=App.Global.User.userId;
		
		this.projectMemberProjectCollection.fetch({
			reset: true,
			data: {
				userId:App.Comm.user("userId"),
				type:3
			}
		});
		/*this.loadData(this.projectMemberMemberCollection,{outer:true},{
			dataPrivilegeId:"1"
		});*/
	},

	method:{
		model2JSON:function(models){
			var data=[];
		  	models.forEach(function(m){
		  		data.push(m.toJSON());
		  	})
		  	return data;
		}
	},

	projectMemberProjectCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchServicesProjectMemberProjectList",
		parse: function(response) {
			$("#dataLoading").hide();
			if (response.code == 0) {
				/*var data=response.data.items,
					result=[];
				    if(data.length>0){
				    	result=[];
				    }
					_.each(data,function(item){
						item.image=item.logoUrl['small']||'/static/dist/images/projects/images/proDefault.png';
						result.push(item)
					})*/
				clearMask();
				return response;
			}else{
				return [];
			}
		}
	})),
	
	projectMemberMemberCollection: new(Backbone.Collection.extend({
		model:  Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchServicesProjectMemberMemberList",
		parse: function(response) {
			if (response.code == 0) {
				var _member=response.data.member||[],
					_org=response.data.org||[],
				_member=_.map(_member,function(item){
					return item={
						name:item.name,
						project:item.org[0].namePath,
						id:item.id, //成员ID
						outer:item.outer
					}
				})
				_org=_.map(_org,function(item){
					return item={
						name:item.name,
						project:item.parent.namePath,
						id:item.id, //成员ID
						outer:item.outer,
						org:true
					}
				})
				return _member.concat(_org);
			}else{
				return []
			}
		}
	})),
	
	projectMemberOrgCollection: new(Backbone.Collection.extend({
		model: App.Services.model,
		urlType: "fetchServicesProjectMemberMemberList",
		parse: function(response) {
			if (response.code == 0) {
				return response.data;
			}
		}
	})),

	loadData: function(collection,data,path) {
		data=data||{};
		//path参数赋值
		if(path && typeof path === "object"){
			for(var p in path){
				if(path.hasOwnProperty(p)){
					collection[p]=path[p];
				}
			}
		}
		
		collection.fetch({
			reset: true,
			data: data
		});
	}

}
;/*!/services/collections/project/index.es6*/
'use strict';

App.Services.ProjectCollection = {

	methods: {
		projectType: function projectType(v) {
			v = v || 4;
			var _m = ['', '综合体', '文化旅游', '境外', '其他'];
			return _m[Number(v)];
		},
		projectMode: function projectMode(v) {
			v = v || 0;
			var _m = ['', '轻资产', '重资产'];
			return _m[Number(v)];
		},
		keyValue: function keyValue(key, name, array) {
			var result = array.filter(function (item) {
				return item.id == key;
			});
			if (result.length) {
				return result[0][name];
			}
			return '';
		},

		zIndex: function () {
			var i = 10;
			return function () {
				return i++;
			};
		}(),

		//直接监听.txtInput  change事件 根据class判断校验类型
		//已知类型：intInput floatInput rateInput
		dataVal: function dataVal(e) {
			var _$dom = $(e.currentTarget),
			    zeroReg = /^0{1,1}$/,
			    intReg = /^[1-9]\d*$/,
			    floatReg = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/,
			    val = _$dom.val(),
			    r = false;
			if (_$dom.hasClass('floatInput')) {
				r = zeroReg.test(val) || intReg.test(val) || floatReg.test(val);
			} else if (_$dom.hasClass('intInput')) {
				r = zeroReg.test(val) || intReg.test(val);
			} else if (_$dom.hasClass('rateInput')) {
				if (Number(val) <= 100 && Number(val) >= 0) {
					r = true;
				} else {
					r = false;
				}
			} else {
				return;
			}
			if (r) {
				_$dom.removeClass('errorInput');
			} else {
				_$dom.addClass('errorInput');
			}
		}
	},

	datas: {

		intensity: ['6度', '7度', '8度', '9度'], //抗震设防烈度
		seiGrade: ['一级', '二级', '三级', '四级'], //抗震等级
		doorFireLevel: ['A', 'B1'], //防火等级
		installType: ['无', '铝板幕墙', '玻璃幕墙', '涂料', 'GRC板', '石材幕墙'],
		orgType: ['剪力墙结构', '钢结构', '框架剪力墙结构', '框架结构', '劲性混凝土结构', '框筒结构'],
		baseholeLv: ['一级', '二级', '三级'],
		bracingType: ['支护桩', '锚索', '土钉墙', '其他'],
		pitData: []

	},

	//分类列表
	ProjectSlideBarCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchManageProjects",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data;
			}
		}
	}))(),

	ProjectBaseInfoCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchProjectBaseInfo",
		parse: function parse(response) {
			if (response.code == 0) {
				var data = response.data;
				data.logo = data.logoUrl ? data.logoUrl['middle'] : "";
				data.logo = data.logo + '?t=' + new Date().getTime();
				return data;
			}
		}
	}))(),

	//映射规则
	ProjectMappingRuleCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchServicesProjectMappingRule",
		parse: function parse(response) {
			if (response.code == 0 && response.data) {
				return response.data;
			}
		}
	}))(),
	//映射规则模板
	ProjectMappingRuleModelCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchArtifactsTemplate",
		parse: function parse(response) {
			if (response.code == 0 && response.data) {
				return response.data;
			}
		}
	}))(),

	ProjecMappingCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "projectCodeMapping",
		parse: function parse(response) {
			if (response.code == 0) {
				var data = response.data;
				data.logo = data.logoUrl ? data.logoUrl['middle'] : "";
				data.logo = data.logo + '?t=' + new Date().getTime();
				return data;
			}
		}
	}))(),

	ProjecDetailBaseHoleCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchProjectDetailBaseholeList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data.pits;
			}
		}
	}))(),

	ProjecDetailFloorCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchProjectDetailFloorList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data.buildings;
			}
		}
	}))(),

	ProjecDetailSectionCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchProjectDetailSectionList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data.profiles;
			}
		}
	}))(),

	ProjecDetailPileCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "fetchProjectDetailPileList",
		parse: function parse(response) {
			if (response.code == 0) {
				this.data = response.data;
				this.data.isCreate = false;
				if (this.data.soilNails.length == 0) {
					this.data.isCreate = true;
					this.data.soilNails = [{
						"id": 829748817994080,
						"projectId": 825572711509152,
						"pileCode": "PILE-0001",
						"pileName": "人工挖孔桩",
						"pileNumber": 0
					}, {
						"id": 829748818280800,
						"projectId": 825572711509152,
						"pileCode": "PILE-0002",
						"pileName": "钻孔灌注桩",
						"pileNumber": 0
					}, {
						"id": 829748818534752,
						"projectId": 825572711509152,
						"pileCode": "PILE-0003",
						"pileName": "钻孔灌注桩(后注浆)",
						"pileNumber": 0
					}, {
						"id": 829748818796896,
						"projectId": 825572711509152,
						"pileCode": "PILE-0004",
						"pileName": "管桩",
						"pileNumber": 0
					}];
				}
				return response.data.soilNails;
			}
		}
	}))()

};
;/*!/services/collections/system/system.category.es6*/
"use strict";

App.Services.SystemCollection = {

	//分类列表
	CategoryCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "servicesCategoryList",
		parse: function parse(response) {
			if (response.code == 0) {
				return response.data.items;
			}
		}
	}))(),

	//流程列表
	FlowCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "servicesFlowList",
		parse: function parse(response) {
			if (response.code == 0) {
				if (response.data.length <= 0) {
					$("#systemContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
				return response.data;
			}
		}
	}))(),

	ExtendAttrCollection: new (Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),
		urlType: "extendAttrList",
		parse: function parse(response) {
			if (response.code == 0) {
				if (response.data.length <= 0) {
					$("#systemContainer .extendAttrListBody").html('<li class="loading">无数据</li>');
				}
				return response.data;
			}
		}
	}))()

};
;/*!/services/js/alert.dialog.es6*/
'use strict';

App.Services.Dialog = {

	alert: function alert(msg, callback, btnText) {

		var text = _.templateUrl('/services/tpls/system/category/system.category.del.html', true),
		    opts = {
			width: 284,
			showTitle: false,
			cssClass: "delConfirm",
			showClose: false,
			isAlert: false,
			limitHeight: false,
			isConfirm: false
		};

		opts.message = text.replace('#title', msg);

		var confirmDialog = new App.Comm.modules.Dialog(opts);

		confirmDialog.element.on("click", ".btnEnter", function () {

			var $this = $(this);

			if ($this.hasClass("disabled")) {
				return;
			}

			$this.addClass("disabled").val(btnText ? btnText : "删除中");

			if ($.isFunction(callback)) {
				callback(confirmDialog);
			} else {
				confirmDialog.close();
			}
		});

		//取消 关闭层
		confirmDialog.element.on("click", ".btnCanel", function () {
			confirmDialog.close();
		});
	}

};
;/*!/services/model/model.js*/
App.Services.model=Backbone.Model.extend({
	   defaults:function(){
	   		return {
	   			title:''
	   		}
	   } 
}); 
;/*!/services/views/application/index.es6*/
"use strict";

//系统管理入口
App.Services.Application = Backbone.View.extend({

	tagName: "div",

	id: "applicationManager",

	template: _.templateUrl('/services/tpls/application/index.html', true),

	events: {
		"click .topBar .create": "appAddDialog"
	},

	initialize: function initialize() {
		this.listenTo(App.Services.AppCollection.AppListCollection, "add", this.addOne);
		this.listenTo(App.Services.AppCollection.AppListCollection, "reset", this.reset);
	},
	render: function render() {
		this.$el.html(this.template);
		//获取数据
		this.fetchData();
		return this;
	},


	//获取数据
	fetchData: function fetchData() {
		App.Services.AppCollection.AppListCollection.reset();
		App.Services.AppCollection.AppListCollection.fetch({
			success: function success(model, response, options) {
				this.$(".appContent .textSum .count").text(response.data.length);
			}
		});
	},


	//新增应用 弹出层
	appAddDialog: function appAddDialog() {
		var _this = this;

		var dialogHtml = _.templateUrl('/services/tpls/application/index.add.html')({});

		var opts = {
			title: "新增应用",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "addNewApp",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.appAdd(dialog);
				return false;
			}
		};

		var dialog = new App.Comm.modules.Dialog(opts);
	},


	//新增应用
	appAdd: function appAdd(dialog) {

		var data = {
			URLtype: "appInsert",
			type: "POST",
			data: {
				name: dialog.element.find(".txtAppTitle").val().trim(),
				desc: dialog.element.find(".txtAppDesc").val().trim()
			}
		};

		if (!data.data.name) {
			alert("请输入应用名称");
			return;
		}

		if (!data.data.desc) {
			alert("请输入应用详情");
			return;
		}

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				App.Services.AppCollection.AppListCollection.push(data.data);
				dialog.close();
			}
		});
	},


	//加载
	reset: function reset() {
		this.$(".appListScroll .listBody").html('<li class="loading">正在加载，请稍候……</li>');
	},


	//新增
	addOne: function addOne(model) {

		var $listBody = this.$(".appListScroll .listBody");
		//移除loading
		$listBody.find(".loading").remove();
		//绑定滚动条
		App.Comm.initScroll(this.$(".appListScroll"), "y");
		//添加数据
		$listBody.append(new App.Services.ApplicationListDetail({
			model: model
		}).render().el);
	}
});
;/*!/services/views/application/index.list.detail.es6*/
"use strict";

//列表详情
App.Services.ApplicationListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	events: {
		"click  .reset": "resetKey",
		"click  .myIcon-update": "updateAppDialog",
		"click  .myIcon-del-blue": "delAppDialog",
		"click .switchStatus": "switchStatus",
		'mouseover .desc': 'showTip',
		'mouseout .desc': 'hideTip'
	},

	initialize: function initialize() {
		//this.listenTo(this, "remove", this.removeModel);
		this.listenTo(this.model, "destroy", this.removeModel);
		this.listenTo(this.model, "change", this.render);
	},


	template: _.templateUrl('/services/tpls/application/app.list.detail.html'),

	render: function render() {
		var data = this.model.toJSON();
		this.$el.html(this.template(data)).data("id", data.id);
		if (data.status != 1) {
			this.$el.addClass("disabled");
		} else {
			this.$el.removeClass("disabled");
		}
		return this;
	},


	//重新生成 appsecret
	resetKey: function resetKey(event) {

		var $item = $(event.target).closest(".item"),
		    name = $item.find(".name").text(),
		    id = $item.data("id"),
		    msg = "确认重新生成“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, function (dialog) {

			var data = {
				URLtype: "appResetSecret",
				type: "PUT",
				data: {
					id: id
				}
			};

			//重新生成
			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {
					$item.find(".appSecret .text").text(data.data.appSecret);
					dialog.close();
				}
			});
		}, "生成中");
	},


	//更新 app、
	updateAppDialog: function updateAppDialog(event) {
		var _this = this;

		var $item = $(event.target).closest(".item"),
		    data = {
			isEdit: true,
			name: $item.find(".name").text().trim(),
			desc: $item.find(".desc").text().trim(),
			appKey: $item.find(".appKey").text().trim(),
			appSecret: $item.find(".appSecret .text").text().trim()
		},
		    dialogHtml = _.templateUrl('/services/tpls/application/index.add.html')(data);

		var opts = {
			title: "编辑应用",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "addNewApp",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.updateApp(dialog);
				return false;
			}

		};

		var dialog = new App.Comm.modules.Dialog(opts);
		dialog.id = $item.data("id");
	},


	//更新app
	updateApp: function updateApp(dialog) {

		var pars = {
			id: dialog.id,
			name: dialog.element.find(".txtAppTitle").val().trim(),
			desc: dialog.element.find(".txtAppDesc").val().trim()
		},
		    that = this;

		if (!pars.name) {
			alert("请输入应用名称");
			return;
		}

		if (!pars.desc) {
			alert("请输入应用详情");
			return;
		}

		var data = {
			URLtype: "appUpdate",
			headers: {
				"Content-Type": "application/json"
			},
			type: "PUT",
			data: JSON.stringify(pars)
		};
		//更新

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				that.model.set(data.data);
				dialog.close();
			}
		});
	},


	//删除 app
	delAppDialog: function delAppDialog(event) {

		var $item = $(event.target).closest(".item"),
		    name = $item.find(".name").text(),
		    id = $item.data("id"),
		    that = this,
		    msg = "确认删除“" + name + "”的appsecret？";

		App.Services.Dialog.alert(msg, function (dialog) {

			var data = {
				URLtype: "appDel",
				type: "DELETE",
				data: {
					id: id
				}
			};

			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {
					that.model.destroy();
					dialog.close();
				}
			});
		});
	},


	//移除
	removeModel: function removeModel() {
		//最后一条
		var $parent = this.$el.parent();
		if ($parent.find("li").length <= 1) {
			$parent.append('<li class="loading">无数据</li>');
		}
		this.remove();
	},


	//修改状态
	switchStatus: function switchStatus(event) {
		var _this2 = this;

		var $item = $(event.target).closest(".item"),
		    data = {
			URLtype: "appSwitchStatus",
			type: "PUT",
			data: {
				id: $item.data("id"),
				status: $item.hasClass("disabled") ? 1 : 2
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				_this2.model.set(data.data);
			}
		});
	},
	showTip: function showTip(e) {
		var $target = $(e.currentTarget),
		    top = e.pageY,
		    left = e.pageX;
		var $div = $('<div/>').css({
			position: 'fixed',
			top: top + 'px',
			left: left + 'px',
			zIndex: 9999,
			border: '1px solid #000',
			background: '#FFF',
			borderRadius: '5px',
			padding: '3px',
			maxWidth: '500px',
			wordBreak: 'break-all',
			wordWrap: 'break-word'

		});
		this.currentTip = $div;

		$div.html($target.html()).appendTo($('body'));
	},
	hideTip: function hideTip(e) {
		this.currentTip.remove();
	}
});
;/*!/services/collections/auth/keyuser/keyuser.js*/
/**
 * @require services/collections/index.es6
 */

App.Services.KeyUser = {

  //暂存step2里选择的模式
  mode :1,
  //暂存被点击的关键用户信息的uid
  uuid : '',
  //暂存已被选关键用户的uid数组
  uid : [],

  //暂存已被选关键用户的项目ID数组
  pid : [],

  //暂存已被选关键用户的分区ID数组
  partid : [],

  //暂存已被选关键用户的orgId数组
  orgId : [],

  //暂存被编辑的关键用户的项目ID数组
  editpid : [],

  //暂存被编辑的关键用户的orgId数组
  editorgId : [],

  //暂存已被选关键用户分区的html
  parthtml : [],

  //暂存已被选关键用户step1的html
  html : [],

  //暂存已被选关键用户step2的html
  html2 : [],

  //暂存已被选关键用户step3的html
  html3 : [],

  userList:[],

  //清空暂存的数据
  clearAll: function(){
    this.uid   = [];
    this.pid   = [];
    this.orgId = [];
    this.html  = [];
    this.html2 = [];
    this.html3 = [];
    this.parthtml = [];
    this.partid = [];
  },

  loadData : function(collection,data,fn) {

    data = data || {};
    //collection.reset();
    collection.fetch({
      remove: false,
      data:data,
      success: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      },
      error: function(collection, response, options) {
        if(fn && typeof fn == "function"){

          fn(response);
        }
      }
    });
  },

  ajax : function(data,cb){
    //是否调试
    if (App.API.Settings.debug) {
      data.url = App.API.DEBUGURL[data.URLtype];
    } else {
      data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
    }


    return $.ajax(data).done(function(data) {

      if (_.isString(data)) {
        // to json
        if (JSON && JSON.parse) {
          data = JSON.parse(data);
        } else {
          data = $.parseJSON(data);
        }
      }

      //未登录
      if (data.code == 10004) {

        window.location.href = data.data;
      }

      if ($.isFunction(callback)) {
        //回调
        callback(data);
      }

    });
  },

  KeyUserList : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),

    urlType: "fetchServiceKeyUserList"

  })),

  //keyuser infomation

  userinfo : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),

    urlType: "fetchServiceKeyUserList"

  })),

  AddKeyUser : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServiceKeyUserList"

  })),
  Step1 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesMemberInnerList"

  })),

  Step3 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesMemberOuterList"

  })),

  Step2 : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchProjects"

  })),

  fam : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchServicesProjectMemberProjectList"

  })),


  standard : new(Backbone.Collection.extend({
    model : Backbone.Model.extend({
      defaults: function() {
        return {
          title: ""
        }
      }
    }),


    urlType: "fetchStandardLibs"

  })),
  init : function(){
    Date.prototype.Format = function (fmt) { //author: meizz
      var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }
  },
  //状态是否正在请求服务器
  applying : false,


  fakedata:{}
};
;/*!/services/views/auth/index.nav.es6*/
"use strict";

/**
 * @require services/collections/auth/keyuser/keyuser.js
 */

App.Services.AuthNav = Backbone.View.extend({

	tagName: "div",
	template: _.templateUrl("/services/tpls/auth/auth.nav.html"),

	events: {
		"click .memCtrl": "memCtrl",
		"click .roleManager": "roleManager",
		"click .keyUser": "keyUser",
		"click .projectMember": "projectMember",
		"click .serviceBody": "hideAllMenu"
	},
	render: function render() {
		var user = JSON.parse(localStorage.user || "{}"),

		//isadmin = user.isAdmin || false,
		auth = App.AuthObj.service && App.AuthObj.service.auth,
		    isKeyUser = user.isKeyUser || false;
		this.$el.html(this.template({ isadmin: auth, iskeyuser: isKeyUser }));
		return this;
	},
	//面包屑
	initialize: function initialize() {
		Backbone.on('loadProjectMemberEvent', this.projectMember, this);
		this.breadCrumb(this.$el.find(".memCtrl"));
	},
	hideAllMenu: function hideAllMenu() {
		Backbone.trigger("hideSearchMenu");
	},
	breadCrumb: function breadCrumb(el) {
		//debugger;
		var $el = $(el);
		$el.addClass("active").siblings("li").removeClass("active");
		App.Services.Member.memLoadingStatus = true;
	},
	memCtrl: function memCtrl() {
		$(".serviceBody").empty();
		$("#blendList").addClass("services_loading");
		this.breadCrumb(this.$el.find(".memCtrl"));
		Backbone.trigger("loadMemberData", "1");
	},
	roleManager: function roleManager() {
		var _this = this;
		this.$(".serviceBody").empty();
		this.$(".serviceBody").addClass("services_loading");
		this.breadCrumb(this.$el.find(".roleManager"));
		App.Services.role.init(function () {
			_this.$(".serviceBody").removeClass("services_loading");
		});
	},
	keyUser: function keyUser() {

		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".keyUser"));
		App.Services.KeyUser.init();
		var keyUserFrame = new App.Services.keyUserFrame();
		$(".serviceBody").html(keyUserFrame.render().el); //框架
		$('.keyUserList .needloading').html("<div class='smallLoading'><img  src='/static/dist/images/comm/images/load.gif'/></div>");
		App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList, '', function (r) {
			if (r && !r.code && r.data) {
				App.Services.KeyUser.KeyUserList.set(r.data);
				keyUserFrame.render();
				App.Services.KeyUser.userList = r.data;
			}
		});
	},
	projectMember: function projectMember() {
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".projectMember"));
		App.Services.projectMember.init({ type: "auth", tab: "projectMember" });
	}
});
;/*!/services/views/auth/index.es6*/
"use strict";

/*
 * @require  services/views/auth/index.nav.es6
 * */

//权限管理入口
App.Services.Auth = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		App.Services.MemberType = "inner"; //默认加载类型
		var _$nav = new App.Services.AuthNav().render();
		this.$el.html(_$nav.el); //菜单
		if (_$nav.$('.serviceNav .active').hasClass('projectMember')) {
			setTimeout(function () {
				_$nav.projectMember();
			}, 1);
		} else {

			this.loadMemberData();
		}
		return this;
	},


	initialize: function initialize() {
		Backbone.on("loadMemberData", this.loadMemberData, this);
	},
	loadMemberData: function loadMemberData() {
		this.$(".serviceBody").addClass("services_loading");
		var _this = this;
		this.$(".serviceBody").html(new App.Services.MemberNav().render().el);
		this.$(".serviceBody .content").html(new App.Services.MemberList().render().el); //有问题

		App.Services.Member.loadData(App.Services.Member.innerCollection, {}, function (response) {
			App.Services.Member.memLoadingStatus = false;
			_this.$("#inner span").addClass("active");
			_this.$("#inner").addClass("active").siblings(".childOz").html(App.Services.tree(response));
			_this.$(".serviceBody").removeClass("services_loading");
		});
	}
});
;/*!/services/views/auth/js/services.tree.js*/
/*
 * @require  services/views/auth/member/services.member.list.js
 * */
App.Services.tree = function(data){

    var ele  = $("<ul></ul>");
    for(var i =0 ; i < data.data.org.length ; i++){
        var model = Backbone.Model.extend({
            defaults:function(){
                return{
                    title:''
                }
            }
        });
        var initModel = new model(data.data.org[i]);
        var li = $("<li></li>");//document.createElement("li")
        li.append(new App.Services.MemberozDetail({model:initModel}).render().el);
        li.append("<div class='childOz' id='childOz"+initModel.cid +"'></div>");
        ele.append(li);
        App.Comm.initScroll($("#ozList"),"y");
    }
    return ele;
};
//获取所属组织列表
App.Services.memOz = '';
App.Services.searchOrg = function (pre){
        var text = App.Services.memOz;
        var father = pre.closest(".childOz").siblings("div").find(".ozName");//最近的顶层节点
        var li = father.closest("ul").closest("li");
        if(!li.length){return}
        var span = father.find("span");
        App.Services.memOz = span.html()  + " > "  + text;
        return App.Services.searchOrg(span);
    };

//队列管理
App.Services.queue = {
    que : [],
    permit : true,
    present : [],
    //许可证发放，400ms后发放一个许可证，避免点击过快
    certificates:function(){
        this.permit = true;
        //setTimeout(function(){
        //    App.Services.queue.permit = true;
        //},400);
    },
    //验证并向队列添加执行函数
    promise:function(fn,_this){
        if(!this.permit){ return;}
        if(!this.que.length){//没有直接添加
            this.que.push(fn);
            this.present.push(_this);
            this.que[0]();
            this.certificates();
            return;
        }
        /*if(this.que.length > 1){
            return
        }*/
        this.present.push(_this);
        this.que.push(fn);
        this.certificates();
    },
    stop:function(){},
    //执行完毕，刷新队列，执行下一个
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};
//成员-角色-提示信息
App.Services.showAll = function(ele){
    $(".servicesShowAll").remove();
    var tip = $("<div class='servicesShowAll'></div>");
    var content = $(ele).html();
    var offset = $(ele).offset();
    tip.html(content);
    $("body").append(tip);
    var height = $(".servicesShowAll").height();
    var leaveHeight = $("body").height() - offset.top;
    if (leaveHeight < height + $(ele).height()){
        offset.top = offset.top - height - 6;
        tip.addClass("up");
    }else{
        offset.top = offset.top + $(ele).height()+3;
        tip.addClass("down");
    }
    offset.left =  offset.left - 5;
    tip.offset(offset);

    $(".servicesShowAll").on("mouseover",function(e){
        $(".servicesShowAll").remove();
    });
};
//添加...内容
App.Services.exetor = function(_this){
    var cwidth,span;
    if(_this.model){
        cwidth = _this.$(".roles").width();
        span = _this.$(".roles span");
    }else{
        cwidth = _this.find(".roles").width();
        span = _this.find(".roles span");
    }
    var arr = [],inherit = "";
    _.each(span,function(item){
        arr.push($(item).width() + parseInt($(item).css("padding-left")) + parseInt($(item).css("margin-left")));
    });
    if(arr.length){
        var allWidth = 0 , n = null;
        for(var i = 0 ; i < arr.length ; i ++){
            allWidth  = allWidth + arr[i];
        }
        if(allWidth > cwidth && !_this.$(".roles i").length){
            if(span.eq(n-1).hasClass("inherit")){
                inherit = "inherit";
            }
            var is = $("<i class='"+ inherit +"' style='width: 15px'>...</i>");
            span.eq(n).before(is);
        }
    }
};
//使用，搜索列表
//App.Services.createNode.init
//App.Services.createNode.trigger(arr,includeUsers);
App.Services.memSearchParentOz = {
    reset:function(){
        this.count = null;
        this.arr = [];
    },
    count : null,
    arr:[],
    id:'',
    trigger :function(arr,includeUsers){
        var _this = this,preOg = null,container; //要写入的元素
        container = _.filter($(".ozName"),function(item){
            return $(item).attr("data-id") == arr[_this.count].id
        });
        if(_this.count == 0){
            $("#ozList").removeClass("services_loading");
            includeUsers = true;
            $(container[0]).click();
            Backbone.trigger("serviceMemberSearchSelect",App.Services.memSearchParentOz.id);
            this.reset();
            return
        }
        $.ajax({
            url:App.API.URL.fetchServicesMemberList+ "outer="+ arr[_this.count].outer + "&parentId=" + arr[_this.count].id  + "&includeUsers=" + includeUsers ,
            type:'GET',
            data : '',
            success:function(res){
                //要判断是外部还是内部，要查找当前的组织id，并插入到相应的位置
                if(res.data.org && res.data.org.length){
                    var tree = App.Services.tree(res);
                    if(_this.count == arr.length - 1){   //是顶层组织，则元素等于inner或outer，如果非顶层则过滤查找id相同的唯一组织
                        if(!arr[_this.count].outer){
                            preOg = $("#inner").siblings(".childOz");
                            $("#outer").siblings(".childOz").hide();
                        }else{
                            preOg = $("#outer").siblings(".childOz");
                            $("#inner").siblings(".childOz").show();
                        }
                    }else{
                        preOg = $(container[0]).closest("li").find(".childOz");
                    }
                    preOg.html(tree);
                    preOg.show();
                }
                _this.count--;
            }
        }).done(function(res){
            //后面还有继续请求
            if( _this.count >= 0 ){
                App.Services.memSearchParentOz.trigger(arr,includeUsers);//继续请求子节点
            }else{
                _this.reset(); //重置
            }
        })
    },
    //倒计数
    init:function(arr){
        this.count = arr.length - 1;
        this.arr = arr;
    }
};

//search result
App.Services.memSearchResult = function(arr) {
    var frag = document.createDocumentFragment();
    if(typeof arr == 'string'){
        arr = JSON.parse(arr)
    }
    if (arr.length) {
        //排序
        for (var i = 0; i < arr.length; i++) {
            if(arr[i]){
                var li = $("<li class='search_result' data-code='"+JSON.stringify(arr[i]) +"'>"+arr[i].name + '（'+ (arr[i].parentname || '无组织')+ '）'+'</li>');
                $(frag).append(li);
            }
        }
        return frag;
    }
};


;/*!/services/views/auth/keyUser/services.addKeyUser.fam.js*/

var App = App || {};
App.Services.fam = Backbone.View.extend({

  tagName:'div',

  className:'fams',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.fam.html"),

  events:{
    "click li":"changeStatus"
  },

  render:function(){

      var datas={
        direction : App.Services.KeyUser.fam.toJSON() || []

      };
      this.$el.html(this.template(datas));

console.log('1')
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.fam,'add',this.render)
  },

  //选定族库
  changeStatus:function(e){

    var $li=$(e.currentTarget);

    $li.toggleClass('selected-proj');

  }
});
;/*!/services/views/auth/keyUser/services.addKeyUser.js*/
App.Services.addKeyUser = Backbone.View.extend({

  tagName: "div",

  className: "serviceWindow",

  template: _.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.html"),

  events: {
    "click .windowClose"             : "close",
    "click #select"                  : "move",
    "click .up"                      : 'toUpStep',
    "click .next"                    : 'toNextStep',
    "click .confirm"                 : 'confirm',
    "click .rightWindow .delete"     : 'remove',
    "click .rightWindow .proj-remove": 'remove2',
    "click .search span"             : 'search',
    "keypress .search input"             : 'keyup',
    "click .search .closeicon"       : 'clear',
    "click .partition a"             : 'partition'

  },

  render: function(step){

    this.$el.html(this.template());
    if(step){
      $('.steps .active').removeClass('active');
      if(step == 'edit'){
        //编辑项目
        setTimeout(function(){
          $('.leftWindow').siblings('p').text("请选择"+(App.Services.KeyUser.mode==2?"分区":""));
          $('.search input').attr('placeholder','请输入要搜索的项目名称');

        },100);
        this.$el.find('.maintitle').text('项目权限');
        this.$el.find('.up').hide();
        this.$el.find('.steps').hide();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);
        this.$el.find('.partition a').eq(App.Services.KeyUser.fakedata.authType-1).trigger('click');

        $.ajax({
          //url: "platform/auth/user/"+App.Services.KeyUser.fakedata.user.userId+"/dataPrivilege/project?type=2"
          url: "platform/auth/project?type=3"
        }).done(function(datas){
          if(datas && !datas.code && datas.data){

            App.Services.KeyUser.Step2.reset(datas.data);
            App.Services.KeyUser.Step2.trigger('add');
          }
        });

        //App.Services.KeyUser.loadData(App.Services.KeyUser.Step2, '', function(r){
        //
        //  if(r && !r.code && r.data){
        //    _.each(r.data.items, function(data, index){
        //      data.shut    = true;
        //      data.canLoad = true;
        //    });
        //    App.Services.KeyUser.Step2.set(r.data.items);
        //  }
        //});
        //遍历本身存在的项目数据添加到右边窗口
        App.Services.KeyUser.mode=App.Services.KeyUser.fakedata.authType;
        var str = '',projs=App.Services.KeyUser.fakedata.project,pid=App.Services.KeyUser.editpid=[];
        if(App.Services.KeyUser.mode==1){
          for(var i=0;i<projs.length;i++){
            var p = projs[i];
            pid.push(p['id']);
            str += "<li class='proj-right' data-id="+p['id']+"><i class='proj-remove'></i>"+
              "<h3 data-id="+p['id']+">"+p['name']+"</h3>"+
              "<p>"+(p['province']||'')+"<span></span></p>"+
              "</li>";
          }
          App.Services.KeyUser.pid=pid;
          this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选择");

        }else if(App.Services.KeyUser.mode==2 && App.Services.KeyUser.fakedata.area){
          projs=App.Services.KeyUser.fakedata.area;
          for(var i=0;i<projs.length;i++){
            var p = projs[i],id=(p=="中区"?9991:(p=="南区"?9992:9993));
            pid.push(id);
            str += "<li class='proj-right list' data-id=" + id + "><i class='proj-remove'></i><h3 data-id="+id+">"+p+"</h3>";

          }
          App.Services.KeyUser.partid=pid;
          this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选择");

        }else if(App.Services.KeyUser.mode==3){
          this.$el.find('.rightWindow').html('<div></div>').siblings('p').text("已选择");
          $('.step2').css({background:"#ccc"});

        }

      }
      else if(step == 'org'){
        //编辑部门
        this.$el.find('.maintitle').text('部门权限');
        setTimeout(function(){
          $('.leftWindow').siblings('p').text("请选择部门");
        },100);
        this.$el.find('.up').hide();
        this.$el.find('.steps').hide();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        //this.$el.find('.leftWindow').html(new App.Services.step3().render().el);


        this.$el.find('.leftWindow').html(new App.Services.step1().render('step3').el);
        this.$el.find('.leftWindow').append(new App.Services.step3().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
        App.Services.KeyUser.loadData(App.Services.KeyUser.Step3, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step3.set(r.data.org);
          }
        });
        //遍历本身存在的部门数据添加到右边窗口
        var str = '',orgs=App.Services.KeyUser.fakedata.org,orgid=App.Services.KeyUser.editorgId=[];
        for(var i=0;i<orgs.length;i++){
          var p = orgs[i];
          orgid.push(p['orgId']);
          str += " <li>"+
            "<span class='delete'></span>" +
            "<p class='shut mulu' data-id="+p['orgId']+" data-canload='true'>" +
          "<i></i><span class='isspan'>"+p['name']+"</span>" +
          "</p>" +
          "<ul class='shut'></ul>" +
          "</li>";

        }
        App.Services.KeyUser.orgId=orgid;

        this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选部门");

      }
      else if(step == 'fam'){
        //编辑族库
        this.$el.find('.maintitle').text('族库权限');
        setTimeout(function(){
          $('.leftWindow').siblings('p').text("请选择族库");
        },100);

        this.$el.find('.confirm').show();

        this.$el.find('.leftWindow').html(new App.Services.fam().render().el);

        $.ajax({
          //url: "platform/auth/user/"+App.Services.KeyUser.fakedata.user.userId+"/dataPrivilege/project?type=2"
          url: "platform/auth/project?type=2"
        }).done(function(datas){
          if(datas && !datas.code && datas.data){

            App.Services.KeyUser.fam.reset(datas.data);
            App.Services.KeyUser.fam.trigger('add');
          }
        });


        //遍历本身存在的部门数据添加到右边窗口
        var str = '',orgs=App.Services.KeyUser.fakedata.family,orgid=App.Services.KeyUser.editorgId=[];
        for(var i=0;i<orgs.length;i++){
          var p = orgs[i];
          orgid.push(p['id']);
          str += "<li class='proj-right' data-id="+p['id']+"><i class='proj-remove'></i>"+
            "<h3 data-id="+p['id']+">"+p['name']+"</h3>"+
            "<p>"+(p['designUnit']||' ')+"<span>"+new Date(p['createTime']).Format("yyyy-MM-dd")+"</span></p>"+
            "</li>";

        }
        App.Services.KeyUser.pid=orgid;

        this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选择");

      }
      else if(step == 'standard'){
        //编辑标准模型
        this.$el.find('.maintitle').text('标准模型权限');
        setTimeout(function(){
          $('.leftWindow').siblings('p').text("请选择标准模型");
        },100);

        this.$el.find('.confirm').show();

        this.$el.find('.leftWindow').html(new App.Services.standard().render().el);

        $.ajax({
          //url: "platform/auth/user/"+App.Services.KeyUser.fakedata.user.userId+"/dataPrivilege/project?type=2"
          url: "platform/auth/project?type=1"
        }).done(function(datas){
          if(datas && !datas.code && datas.data){

            App.Services.KeyUser.standard.reset(datas.data);
            App.Services.KeyUser.standard.trigger('add');
          }
        });


        //遍历本身存在的部门数据添加到右边窗口
        var str = '',orgs=App.Services.KeyUser.fakedata.model,orgid=[];
        for(var i=0;i<orgs.length;i++){
          var p = orgs[i];
          orgid.push(p['id']);
          str += "<li class='proj-right' data-id="+p['id']+"><i class='proj-remove'></i>"+
            "<h3 data-id="+p['id']+">"+p['name']+"</h3>"+
            "<p>"+(p['designUnit']||' ')+"<span>"+new Date(p['createTime']).Format("yyyy-MM-dd")+"</span></p>"+
            "</li>";

        }
        App.Services.KeyUser.pid=orgid;

        this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选择");

      }
      else if(step == 2){
        if(App.Services.KeyUser.mode==1 && App.Services.KeyUser.html2[0]){
          $('.rightWindow').html(App.Services.KeyUser.html2[0]);
          $('.rightWindow').siblings('p').text("已选项目 ( " + App.Services.KeyUser.pid.length + "个 )");

        }else if(App.Services.KeyUser.mode==2 && App.Services.KeyUser.parthtml[0]){
          $('.rightWindow').html(App.Services.KeyUser.parthtml[0]);
          $('.rightWindow').siblings('p').text("已选分区 ( " + App.Services.KeyUser.partid.length + "个 )");

        }else{
          $('.rightWindow div').html('');
          $('.rightWindow').siblings('p').text("已选"+(App.Services.KeyUser.mode==2?"分区 ( ":"项目 ( "+"0个 )"));

        }

        $('.steps div').eq(1).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').hide();
        this.$el.find('.next').show();
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el).siblings('p').text("请选择"+(App.Services.KeyUser.mode==2?"分区":"项目"));

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step2, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.items, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step2.set(r.data.items);
          }
        });
      }
      else{
        //step3
        $('.rightWindow').siblings('p').text("已选部门");
        $('.leftWindow').siblings('p').text("请选择部门");

        if(App.Services.KeyUser.html3[0]){
          $('.rightWindow').html(App.Services.KeyUser.html3[0]);
        }
        else{
          $('.rightWindow div').html('');
        }
        $('.steps div').eq(2).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step1().render('step3').el);
        this.$el.find('.leftWindow').append(new App.Services.step3().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
        App.Services.KeyUser.loadData(App.Services.KeyUser.Step3, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step3.set(r.data.org);
          }
        });
      }
    }
    else{
      //step1
      $('.steps .active').removeClass('active');
      $('.steps div').eq(0).addClass('active');
      $('.leftWindow').siblings('p').text("请选择成员");

      if(App.Services.KeyUser.html[0]){
        $('.rightWindow').html(App.Services.KeyUser.html[0]);
        $('.rightWindow').siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
      }
      else{
        $('.rightWindow div').html('').siblings('p').text("已选项目 ( 0个 )");
      }
      //this.$el.find('.up').hide();
      this.$el.find('.confirm').show();
      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);
      App.Comm.ajax({URLtype: 'fetchServicesMemberInnerList'}, function(r){

        if(r && !r.code && r.data){
          _.each(r.data.org, function(data, index){
            data.shut    = true;
            data.canLoad = true;
          })
          App.Services.KeyUser.Step1.set(r.data.org);
        }
      });

    }
    return this;
  },

  //移除已选中的名单
  remove: function(e){

    var $li                    = $(e.target).parents('li'),
      title = this.$el.find('.maintitle').text();

    if(title == '部门权限'){
      //部门权限移除已选中的名单
      var orgId                  = $li.find('p').attr('data-id');
      App.Services.KeyUser.editorgId = _.without(App.Services.KeyUser.editorgId,parseInt(orgId),orgId.toString());

      App.Services.KeyUser.orgId = App.Services.KeyUser.editorgId;

    }else if(title == "新增关键用户"){
      //step1移除已选中的名单

      var uid                  = $li.find('p').attr('data-uid');
      App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid, parseInt(uid), uid.toString());

      $('.rightWindow').siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");

      ////step3移除已选中的名单
      //
      //var orgId                  = $li.find('p').attr('data-id');
      //App.Services.KeyUser.orgId = _.without(App.Services.KeyUser.orgId,parseInt(orgId),orgId.toString());

    }
    //else{
    //  //step1移除已选中的名单
    //
    //  var uid                  = $li.find('p').attr('data-uid');
    //  App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid, parseInt(uid), uid.toString());
    //
    //  $('.rightWindow').siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
    //}
    $li.remove();

  },

  //step2移除已选中的名单
  remove2: function(e){
    var $li                  = $(e.target).parent(),
        pid                  = $li.attr('data-id'),
        title=this.$el.find('.maintitle').text();
    $('.leftWindow').find('li[data-id=' + pid + ']').removeClass('selected-proj');
    $li.remove();
    if(title=='项目权限'){
      var mode=App.Services.KeyUser.mode;

      if(mode == 1){
        App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, parseInt(pid));
        App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, pid.toString());
      }else{
        App.Services.KeyUser.partid = _.without(App.Services.KeyUser.partid, parseInt(pid));
        App.Services.KeyUser.partid = _.without(App.Services.KeyUser.partid, pid.toString());
      }
    }else{
      App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, parseInt(pid));
      App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, pid.toString());
    }



      $('.rightWindow').siblings('p').text("已选择");
  },

  //选择人到右边窗口
  move: function(){
    var str = '',title=this.$el.find('.maintitle').text();

    //step2或者编辑项目的时候
    if(title == '项目权限'){
      if(App.Services.KeyUser.mode==3){
        return ''
      }else if(App.Services.KeyUser.mode==1){
        this.$el.find('.leftWindow .selected-proj').each(function(el){
          var pid = $(this).attr('data-id');
          if(_.contains(App.Services.KeyUser.pid, pid.toString())||_.contains(App.Services.KeyUser.pid, parseInt(pid))){
            return
          }
          else{
            App.Services.KeyUser.pid.push(pid);
            str += "<li class='proj-right' data-id=" + pid + "><i class='proj-remove'></i>" + $(this).html();

          }

        });
      }else{
        //step2分区模式
        this.$el.find('.leftWindow .selected-proj').each(function(el){
          var pid = $(this).attr('data-id');
          if(_.contains(App.Services.KeyUser.partid, pid.toString())||_.contains(App.Services.KeyUser.partid, parseInt(pid))){
            return
          }
          else{
            App.Services.KeyUser.partid.push(pid);
            str += "<li class='proj-right list' data-id=" + pid + "><i class='proj-remove'></i>" + $(this).html();

          }

        });

      }

      this.$el.find('.rightWindow div').append(str);
      //$('.rightWindow').siblings('p').text("已选"+(App.Services.KeyUser.mode==2?"分区 ( ":"项目 ( ") + $(".rightWindow li").length + "个 )");

    }
    else if(title == '族库权限'){
      this.$el.find('.leftWindow .selected-proj').each(function(el){
        var pid = $(this).attr('data-id');
        if(_.contains(App.Services.KeyUser.pid, pid.toString())||_.contains(App.Services.KeyUser.pid, parseInt(pid))){
          return
        }
        else{
          App.Services.KeyUser.pid.push(pid);
          str += "<li class='proj-right' data-id=" + pid + "><i class='proj-remove'></i>" + $(this).html();

        }
        console.log(str)
      });
      this.$el.find('.rightWindow div').append(str);
    }
    else if(title == '标准模型权限'){
      this.$el.find('.leftWindow .selected-proj').each(function(el){
        var pid = $(this).attr('data-id');
        if(_.contains(App.Services.KeyUser.pid, pid.toString())||_.contains(App.Services.KeyUser.pid, parseInt(pid))){
          return
        }
        else{
          App.Services.KeyUser.pid.push(pid);
          str += "<li class='proj-right' data-id=" + pid + "><i class='proj-remove'></i>" + $(this).html();

        }
        console.log(str)
      });
      this.$el.find('.rightWindow div').append(str);
    }
    else if(title == '部门权限'){
      var $selected = this.$el.find('.toselected');
      if(!$selected.length){
        return ''
      }
      var orgId     = $selected.find('p').attr('data-id');
      if(_.contains(App.Services.KeyUser.orgId, orgId.toString())||_.contains(App.Services.KeyUser.orgId, parseInt(orgId))){
        return '';
      }
      else{
        App.Services.KeyUser.orgId.push(orgId);
        var person = $selected.html();
        $selected.removeClass('toselected');
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>'));
      }

    }
    else{
      var $selected = this.$el.find('.toselected');
      var uid       = $selected.find('p').attr('data-uid');
      if(_.contains(App.Services.KeyUser.uid, uid.toString())||_.contains(App.Services.KeyUser.uid, parseInt(uid))){
        return
      }
      else{
        App.Services.KeyUser.uid.push(uid);
        var person = $selected.html();
        $selected.removeClass('toselected');
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>')).parent().siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
      }
    }

  },



  //刷新userinfo页面
  refresh: function(){
    App.Services.KeyUser.clearAll();
    var datas = {
      uid: App.Services.KeyUser.uuid
    };
    var data  = {
      URLtype: "fetchServiceKeyUserInfo",
      type   : "GET",
      data   : JSON.stringify(datas)
    };
    App.Comm.ajax(data, function(data){
      if(data.code == 0){
        App.Services.KeyUser.fakedata = data.data;
        App.Services.KeyUser.view && App.Services.KeyUser.view.undelegateEvents();
        App.Services.KeyUser.view=new App.Services.userinfo().render();

      }

    });
  },

  //切换步骤页
  confirm: function(){
    var title = $('.maintitle').text();
    //编辑项目提交
    if(title == '项目权限'){
      App.Services.KeyUser.editpid = App.Services.KeyUser.pid;
      var datas = {
        "authType" : parseInt(App.Services.KeyUser.mode),
        //"projectId": App.Services.KeyUser.pid,
        //"orgId": App.Services.KeyUser.editorgId,
        uid              : App.Services.KeyUser.uuid
      };
      if(App.Services.KeyUser.mode==2){
        datas.area = [];
        (_.contains(App.Services.KeyUser.partid,9991)||_.contains(App.Services.KeyUser.partid,'9991'))?datas.area.push('中区'):'';
        (_.contains(App.Services.KeyUser.partid,9992)||_.contains(App.Services.KeyUser.partid,'9992'))?datas.area.push('南区'):'';
        (_.contains(App.Services.KeyUser.partid,9993)||_.contains(App.Services.KeyUser.partid,'9993'))?datas.area.push('北区'):'';
      }else if(App.Services.KeyUser.mode==1){
        datas.projectId=App.Services.KeyUser.pid || [];
      }
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };

      var self = this;
      $('#dataLoading').show();

      App.Comm.ajax(data, function(data){
        $('#dataLoading').hide();

        if(data.code == 0){
          App.Services.KeyUser.fakedata.authType=App.Services.KeyUser.mode;
          datas.area && (App.Services.KeyUser.fakedata.area=datas.area);
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();
        }

      });

    }
    else if(title == '部门权限'){
      //编辑部门提交
      App.Services.KeyUser.editorgId = App.Services.KeyUser.orgId;
      var datas = {
        //"authType" : App.Services.KeyUser.fakedata.authType,
        "orgId": App.Services.KeyUser.orgId,
        //"projectId": App.Services.KeyUser.editpid,
        //"area"     : App.Services.KeyUser.fakedata.area,
        uid    : App.Services.KeyUser.uuid
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };
      var self = this;
      $('.leftWindow').addClass("services_loading");

      App.Comm.ajax(data, function(data){
        $('.leftWindow').removeClass("services_loading");


        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();

        }

      });

    }
    else if(title == '族库权限'){
      //编辑族库提交
      App.Services.KeyUser.editorgId = App.Services.KeyUser.orgId;
      var datas = {

        "familyId": App.Services.KeyUser.pid,
        uid    : App.Services.KeyUser.uuid
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };
      var self = this;
      $('.leftWindow').addClass("services_loading");

      App.Comm.ajax(data, function(data){
        $('.leftWindow').removeClass("services_loading");


        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();

        }

      });

    }
    else if(title == '标准模型权限'){
      //编辑标准模型提交
      App.Services.KeyUser.editorgId = App.Services.KeyUser.orgId;
      var datas = {

        "modelId": App.Services.KeyUser.pid,
        uid    : App.Services.KeyUser.uuid
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };
      var self = this;
      $('.leftWindow').addClass("services_loading");

      App.Comm.ajax(data, function(data){
        $('.leftWindow').removeClass("services_loading");


        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();

        }

      });

    }
    else{
      //新增关键用户的提交
      if(!App.Services.KeyUser.uid.length){
        alert('必须选择关键用户才能提交！');
        return
      }
      var datas = {
        "userId"         : App.Services.KeyUser.uid
      };


      var data  = {
        URLtype    : "fetchServiceKeyUserList",
        type       : "POST",
        contentType: "application/json", //'Content-Type':"application/json",
        data       : JSON.stringify(datas)
      };
      $('#dataLoading').show();

      App.Comm.ajax(data, function(data){
        $('#dataLoading').hide();

        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          //刷新关键用户列表
          App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList, '', function(r){
            if(r && !r.code && r.data){
              App.Services.KeyUser.KeyUserList.set(r.data);
              App.Services.KeyUser.userList = r.data;
            }
          });
          App.Services.KeyUser.clearAll();
        }else{
          alert('不能选择已是关键用户的用户')
        }

      });
    }

  }, //关闭窗口
  close  : function(){

    $('.mod-dialog,.mod-dialog-masklayer').hide();
    App.Services.KeyUser.clearAll();
  },
  //step2 里的选择模式
  partition:function(event){
    var $a = $(event.currentTarget);

    if($a.hasClass('active')){
      return ''
    }else{
      if(App.Services.KeyUser.mode==1){
        App.Services.KeyUser.html2[0]=$('.rightWindow').html();
      }else if(App.Services.KeyUser.mode==2){
        App.Services.KeyUser.parthtml[0]=$('.rightWindow').html();

      }
      var index = $a.attr('data-index');
      $a.addClass('active').siblings().removeClass('active');
      App.Services.KeyUser.mode=index;
      $('.rightWindow div').html('');

      if(index==1){
        //普通模式
        $('.rightWindow').html(App.Services.KeyUser.html2[0]);
        $('.leftWindow').siblings('p').text("请选择项目");
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);
        $('.search').show().siblings('p').hide();

      }else if(index==2){
        //分区模式
        $('.rightWindow').html(App.Services.KeyUser.parthtml[0]);
        $('.leftWindow').siblings('p').text("请选择分区");
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);
        $('.search').hide();
        $('.title').show();

      }else{
        //全选模式
        $('.step2').css({background:"#ccc"});
        $('.rightWindow div').html('已选择所有项目');
        $('.selected-proj').removeClass('selected-proj');

      }


    }
  },
  search:function(){
    var value=$('.search input').val().trim();
    if(value){
      if($('.maintitle').text()=="项目权限"){
        this.$el.find('.leftWindow').html(new App.Services.step2().render(value).el);
      }else{
        this.$el.find('.leftWindow').html(new App.Services.step1().render(value).el);

      }
    }
  },
  clear:function(){
    $('.search input').val('');
    if($('.maintitle').text()=="项目权限"){
      this.$el.find('.leftWindow').html(new App.Services.step2().render().el);
    }else{
      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

    }
  },
  keyup:function(e){
    if(e.keyCode==13){
      this.search();
    }
  },
  initialize: function(){
    App.Services.KeyUser.mode=1;
  }

});


;/*!/services/views/auth/keyUser/services.addKeyUser.standard.js*/

var App = App || {};
App.Services.standard = Backbone.View.extend({

  tagName:'div',

  className:'standards',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.standard.html"),

  events:{
    "click li":"changeStatus"
  },

  render:function(){

      var datas={
        direction : App.Services.KeyUser.standard.toJSON() || []

      };
    console.log(datas)
      this.$el.html(this.template(datas));


    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.standard,'add',this.render)
  },

  //选定标准模型
  changeStatus:function(e){

    var $li=$(e.currentTarget);

    $li.toggleClass('selected-proj');

  }
});
;/*!/services/views/auth/keyUser/services.addKeyUser.step1.js*/


var App = App || {};
App.Services.step1 = Backbone.View.extend({

  tagName:'div',

  className:'step1',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step1.html"),

  events:{
    "click  p":"changeStatus"
  },

  render:function(name){
    var self = this;
    if(name && name=='step3'){
      this.$el.addClass('step1in3');
    }else if(typeof name=='string'){
      $.ajax({
        url: "platform//auth/user?name="+name
      }).done(function(data){
        console.log(data);
        if(data.code == 0){
          var items = data.data, str = "";

          $.each(items, function(i, item){
            if(item.name){
              str+="<li>"+
                "<p class='person "+"' data-uid='"+item['userId']+ "'  ><i ></i><span class='isspan'>"+ item['name']+"</span><span class='namepath' title='"+item['orgNamePath']+"'> (..."+(item['orgNamePath']).split(">").pop()+")</span></p>"+
                "</li>";
            }

          });
          self.$el.html(str);

        }
      });
    }else{
      //准备Collection的MODELS
      var datas={
        direction : App.Services.KeyUser.Step1.toJSON() || []

      };
      this.$el.html(this.template(datas));
    }

    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step1,'add',this.render)
  },

  //打开或关闭目录
  changeStatus:function(e){

    var $p,instep3,target,el=this.$el;
    if($(e.target).hasClass('person') || $(e.target).hasClass('mulu') ){
      $p = $(e.target);
      target = 'p';
    }else{
      $p = $(e.target).parent();
      if($(e.target).hasClass('isspan')){
        target = 'span';
      }else{
        target = 'i';
      }
    }
    var $ul=$p.siblings('ul');
    //判断是否是step3里加载的step1
    instep3 = this.$el.hasClass('step1in3');
    var func = function(isstep3){
      //是否需要加载子目录
      var canLoad = $p.attr('data-canLoad');
      var orgId = $p.attr('data-id');
      if (orgId) {
        if ($ul.hasClass('shut')) {
          $p.removeClass('shut').addClass('open');
          if (canLoad == 'true') {
            $ul.removeClass('shut').addClass('open');
            $('.leftWindow').addClass("services_loading");
            App.Comm.ajax({URLtype:'fetchServicesMemberInnerList', data:{parentId:orgId, includeUsers:true}}, function(r){
              $('.leftWindow').removeClass("services_loading");
              if (r && !r.code && r.data){
                var str = '';
                if (isstep3 != "isstep3") {
                  _.each(r.data.user,function(data){
                    data.canLoad = false;
                    //<%= data[i]['child'] && data[i]['child'][0]=='string'?'lastLayer':''%>
                    str+="<li>"+
                      "<p class='person "+"' data-uid='"+data['userId']+ "' data-canLoad='true' ><i ></i><span class='isspan'>"+ data['name']+"</span></p>"+
                      "</li>";
                  });
                }

                _.each(r.data.org,function(data){
                  data.shut = true;
                  data.canLoad = true;
                  //<%= data[i]['child'] && data[i]['child'][0]=='string'?'lastLayer':''%>
                  str+="<li>"+
                    "<p class='shut mulu"+"' data-id='"+data['orgId']+ "' data-canLoad='"+(data['hasChildren']||data['hasUser']?true:false)+ "'><i ></i><span class='isspan'>"+ data['name']+"</span></p>"+
                    "<ul class='shut'></ul>"+
                    "</li>";
                });
                //$ul[0].innerHTML = str;
                $p.siblings('ul').html(str);


              }
            });
            $p.attr('data-canLoad','false')
          }else{
            $ul.removeClass('shut').addClass('open');
            $p.removeClass('shut').addClass('open');

          }

        }else{
          $ul.removeClass('open').addClass('shut');
          $p.removeClass('open').addClass('shut');

        }
      }else{
        //选定人员
        el.find('.toselected').removeClass('toselected');
        $p.parent().addClass('toselected');

      }
    };
    if(instep3){
      //点击的是文件夹ICON
      if(target == 'i'){
        func('isstep3')
      }else{
        $('.leftWindow').find('.toselected').removeClass('toselected');
        $p.parent().addClass('toselected');
      }
    }else{
      func()
    }



  }
});
;/*!/services/views/auth/keyUser/services.addKeyUser.step2.js*/


var App = App || {};
App.Services.step2 = Backbone.View.extend({

  tagName:'div',

  className:'step2',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step2.html"),

  events:{
    "click li":"changeStatus"
    //"click .keyUserList li":'toggleClass'
  },

  render:function(searchvalue){
    var index=$('.partition .active').attr('data-index');
    //准备Collection的MODELS
    if(index==2){
      var str='<li class="project list"  data-id=9991><h3  data-id=9991  >中区</h3></li>'+
        '<li class="project list"  data-id=9992><h3  data-id=9992  >南区</h3></li>'+
        '<li class="project list"  data-id=9993><h3  data-id=9993  >北区</h3></li>';
      this.$el.html(str);

    }else{
      if(typeof searchvalue == 'string'){

        var data =_.filter(App.Services.KeyUser.Step2.toJSON(),function(item){
          return item.name.indexOf(searchvalue)>-1;
        });
        var datas={
          direction : data || []

        };
      }else{
        var datas={
          direction : App.Services.KeyUser.Step2.toJSON() || []

        };
      }

      this.$el.html(this.template(datas));
    }
    $('.partition').show();
    if(App.Services.KeyUser.mode==3){
      $('.step2').css({background:"#ccc"});

    }
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step2,'add',this.render)
  },

  //选定项目
  changeStatus:function(e){
    if(App.Services.KeyUser.mode==3){
      return ''
    }
      var $li=$(e.currentTarget);

      $li.toggleClass('selected-proj');

  }
});
;/*!/services/views/auth/keyUser/services.addKeyUser.step3.js*/


var App = App || {};
App.Services.step3 = Backbone.View.extend({

  tagName:'div',

  className:'step3',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step3.html"),

  events:{
    "click  p":"changeStatus"
  },

  render:function(){
    //准备Collection的MODELS
    var datas={
      direction : App.Services.KeyUser.Step3.toJSON() || [],

    };
    this.$el.html(this.template(datas));
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step3,'add',this.render)
  },

  //打开或关闭目录
  changeStatus:function(e){

    var $p,target,el=this.$el;
    if($(e.target).hasClass('person') || $(e.target).hasClass('mulu') ){
      $p = $(e.target);
      target = 'p';

    }else{
      $p = $(e.target).parent();

      if($(e.target).hasClass('isspan')){
        target = 'span';
      }else{
        target = 'i';
      }
    }
    var $ul=$p.siblings('ul');

    var func = function(isstep3){
      //是否需要加载子目录
      var canLoad=$p.attr('data-canLoad');

      var orgId=$p.attr('data-id');
      if(orgId){
        if($ul.hasClass('shut')){

          $p.removeClass('shut').addClass('open');

          if(canLoad=='true'){
            $ul.removeClass('shut').addClass('open');
            App.Comm.ajax({URLtype:'fetchServicesMemberOuterList',data:{parentId:orgId,includeUsers:false}},function(r){

              if(r && !r.code && r.data){
                var str = '';

                _.each(r.data.org,function(data){
                  data.shut = true;
                  data.canLoad = true;
                  str+="<li>"+
                    "<p class='shut mulu"+"' data-id='"+data['orgId']+ "' data-canLoad='"+(data['hasChildren']||data['hasUser']?true:false)+ "'><i ></i><span class='isspan'>"+ data['name']+"</span></p>"+
                    "<ul class='shut'></ul>"+
                    "</li>";
                });
                $p.siblings('ul').html(str);


              }
            });
            $p.attr('data-canLoad','false')
          }else{
            $ul.removeClass('shut').addClass('open');
            $p.removeClass('shut').addClass('open');

          }

        }else{
          $ul.removeClass('open').addClass('shut');
          $p.removeClass('open').addClass('shut');

        }
      }else{
        //选定人员
        el.find('.toselected').removeClass('toselected');
        $p.parent().addClass('toselected');

      }
    };

      //点击的是文件夹ICON
      if(target == 'i'){
        func()
      }else{
        $('.leftWindow').find('.toselected').removeClass('toselected');
        $p.parent().addClass('toselected');
      }



  }
});
;/*!/services/views/auth/keyUser/services.keyUserFrame.js*/
/**
 * @require services/collections/auth/keyuser/keyuser.js
 */

var App = App || {};
App.Services.keyUserFrame = Backbone.View.extend({

    tagName:"div",

    className:"keyUserBody",

    template:_.templateUrl("/services/tpls/auth/keyUser/services.keyUser.html"),

    events:{
        "click .newKeyUsers":"newKeyUser",
        "click .keyUserList li":'toggleClass',
        "click .keyUserList .delete":'delete'


    },

    render:function(){

        //准备多个Collection的MODELS
        var datas={
            keyUser : App.Services.KeyUser.KeyUserList.toJSON() || []

        };
        this.$el.html(this.template(datas));
        return this;
    },

    //切换active状态并且初始化右边的userinfo VIEW
    toggleClass:function(e){

        if($(e.target).hasClass('delete')){
            return
        }
        var uuid = App.Services.KeyUser.uuid = $(e.target).attr('data-uid');

        $(e.target).toggleClass('active').siblings().removeClass('active');
        var datas = {
            uid : uuid
        };
        var data={
            URLtype :"fetchServiceKeyUserInfo",
            type:"GET",
            //contentType:"application/json",
            data:JSON.stringify(datas)
        };
        App.Comm.ajax(data,function(data){
            if (data.code==0) {
                App.Services.KeyUser.fakedata=data.data;
                App.Services.KeyUser.editpid=_.pluck(data.data.project,'id');
                App.Services.KeyUser.editorgId=_.pluck(data.data.org,'orgId');
                App.Services.KeyUser.view && App.Services.KeyUser.view.undelegateEvents();
                App.Services.KeyUser.view=new App.Services.userinfo().render();

            }

        });

    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    newKeyUser:function(){
        App.Services.KeyUser.clearAll();
        App.Services.maskWindow=new App.Comm.modules.Dialog({title:'新增关键用户',width:600,height:500,isConfirm:false});
        $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render().el);

    },

    //delete
    delete : function(e){
        var uid = $(e.target).attr('data-uid');
        var $li = $(e.target).parent();
        var username = $(e.target).attr('data-name');
        var $usernum = this.$el.find('.usernum');



        var frame = new App.Services.windowAlert().render(function(){
              var data={
                              URLtype :"fetchServiceKeyUserDelete",
                              type:"DELETE",
                              data:JSON.stringify({uid : uid})

                          };
            if(App.Services.KeyUser.applying){
                return ""
            }else{
                App.Services.KeyUser.applying=true;
            }
                          App.Comm.ajax(data,function(data){
                              App.Services.KeyUser.applying=false;

                              if (data.code==0) {
                                  if($li.is('.active')){
                                      $('.keyBody').html('');
                                  }
                                  $li.remove();
                                  $('.mod-dialog,.mod-dialog-masklayer').hide();
                                  $usernum.text($usernum.text()-1);
                              }

                          });
        }).el;
        var alertInfo = '确认要删除关键用户“'+username+'”？ <br> <span style="color:#999;">删除该关键用户后，该用户将不能继续管理项目</span>';

        App.Services.alertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 180,
            isConfirm: false,
            isAlert: false,
            message: frame
        });
        $(".mod-dialog .wrapper .header").hide();//隐藏头部
        $(".alertInfo").html(alertInfo);
        $(".mod-dialog,.mod-dialog .wrapper .content").css({"min-height":"auto"});

    },



    //userinfo
    userinfo:function(){

    },

    initialize:function(){


        this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.render);
        this.listenTo(App.Services.KeyUser.userinfo,'add',this.userinfo);
    }
});


;/*!/services/views/auth/keyUser/services.userinfo.js*/


var App = App || {};
App.Services.userinfo = Backbone.View.extend({

  el:'.keyBody',


  template:_.templateUrl("/services/tpls/auth/keyUser/services.userinfo.html"),

  events:{
    "click .proe .link,.proe .edit":'projedit',//项目权限编辑
    "click .oz .edit,.oz .link":'orgedit',//部门权限编辑
    "click .fam .edit,.fam .link":'famedit',//族库权限编辑
    "click .standard .edit,.standard .link":'standardedit'//部门权限编辑


    //"click .keyUserList li":'toggleClass'
  },

  render:function(){

    //准备Collection的MODELS
    var datas={
      info : App.Services.KeyUser.fakedata || []

    };
    this.$el.html(this.template(datas));
    return this;
  },
  //修改项目
  projedit : function(){
    App.Services.KeyUser.clearAll();
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('edit').el);
    App.Services.KeyUser.html2=[];
  },
  //修改部门授权
  orgedit : function(){
    App.Services.KeyUser.orgId = [];
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('org').el);
    $('.keyU .title').show();
    $('.keyU .search').hide();

  },
  //修改族库
  famedit : function(){
    App.Services.KeyUser.pid = [];
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('fam').el);
    $('.keyU .title').show();
    $('.keyU .search').hide();

  },
  //修改标准模型
  standardedit : function(){
    App.Services.KeyUser.pid = [];
    App.Services.maskWindow=new App.Comm.modules.Dialog({title:'',width:600,height:500,isConfirm:false});
    $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render('standard').el);
    $('.keyU .title').show();
    $('.keyU .search').hide();

  },
  initialize:function(){
    this.listenTo(App.Services.KeyUser.userinfo,'add',this.render);

  }

});
;/*!/services/views/auth/member/services.member.nav.js*/
/*
 * @require  /services/views/auth/member/services.member.ozList.js
 */

App.Services.MemberNav=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.nav.html"),
    events:{
        "click #outer":'outer',
        "click #inner":'inner',
        "keyup .searchContent":"search",
        "focus .searchContent":"searchStart",
        "blur .searchContent":"searchEnd",
        "click .search_result":"chooseOrg"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理.
        Backbone.on("serviceMemberTopSelectStatus",this.serviceMemberTopSelectStatus,this);
        Backbone.on("serviceMemberResetSearchContent",this.serviceMemberResetSearchContent,this);
        Backbone.on("hideSearchMenu",this.hideSearchMenu,this)

    },
    //清除搜索内容
    serviceMemberResetSearchContent:function(){

    },
    hideSearchMenu:function(){
        this.$(".memberSearch ul").hide();
    },
    //
    serviceMemberTopSelectStatus:function(){
        this.$(".inner span").removeClass("active");
        this.$(".outer span").removeClass("active");
    },
    //外部用户
    outer:function(){
        App.Services.MemberType = "outer";
        this.nav();
    },
    //内部用户
    inner:function(){
        App.Services.MemberType = "inner";
        this.nav();
    },
    //菜单切换
    nav:function(){
        if(App.Services.queue.que > 2 ){ return}
        var _this =this,$tab = $("#" + App.Services.MemberType),already = $tab.siblings(".childOz").html();
        $("#ozList div").removeClass("active");
        $("#ozList span").removeClass("active");
        if(already){
            if($tab.hasClass("active")){
                $tab.removeClass("active").find("span").removeClass("active").end().siblings(".childOz").hide();
            }else if(!$tab.hasClass("active")){
                $(".childOz").hide();
                $tab.siblings(".childOz").show();
            }
        }
        $tab.addClass("active").find("span").addClass("active");
        $(".serviceBody .content").addClass("services_loading");
        App.Services.queue.promise(_this.pull,_this);
    },
    //加载子组织，刷新右侧组织和员工列表
    pull:function(){
        var _thisType = App.Services.MemberType,
            cdata,
            _this = App.Services.queue.present[0],
            collection = App.Services.Member[_thisType + "Collection"];
        $(".childOz").hide();

        $("#blendList").empty();

        cdata = {
            URLtype: "fetchServicesMemberList",
            type:"GET",
            data:{
                outer:  !(_thisType == "inner"),
                includeUsers:true
            }
        };

        App.Comm.ajax(cdata,function(response){
            var already = $("#" + App.Services.MemberType).siblings(".childOz").html();

            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                Backbone.trigger("servicesMemberControlCancelSelectAll");
                return
            }
            App.Services.Member.memLoadingStatus = true;
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                //外部和内部单选
                $("#" + _thisType +"+ .childOz").show();
                if(already){return}
                //菜单渲染
                $("#" + _thisType +"+ .childOz").html(App.Services.tree(response));
            }
            App.Services.Member.memLoadingStatus = false;
        }).done(function(){
            App.Services.queue.next();
        });
    },
    //搜索模块
    search:function(e){
        var ele = e.target || e.srcElement;

        //为回车键加以条件判断是否是选择
        var pre = this.$(".memberSearch li");
        var active  =_.filter(pre,function(item){
            return $(item).hasClass("active");
        });

        if( (e.keyCode > 47 && e.keyCode  < 58) || e.keyCode == 8 || e.keyCode == 32 || e.keyCode == 13 || (e.keyCode  < 112 && e.keyCode >95)){ //退格 空格 回车 小键盘  (e.keyCode > 57&& e.keyCode  < 91) || 字母
            var content = $(ele).val();
            if(!content){
                return
            }
            //
            if(active.length && e.keyCode == 13){
                $(active[0]).click();
            }

            $.ajax({
                url:App.API.URL.searchServicesMember  + content,   //App.API.URL.searchServicesMember + content
                type:'GET',
                data:'',
                success:function(res){
                    $(ele).siblings("ul").show();
                    if(res.data && res.data.length){
                        $(ele).siblings("ul").html(App.Services.memSearchResult(res.data));
                    }else{
                        //显示无搜索结果
                        $(ele).siblings("ul").html('<li class="search_result" data-code="">无结果</li>');
                    }
                }
            });
        }else if(e.keyCode == 38 || e.keyCode == 40){  //38向上  40向下
            //查询当前是否有选中，未选中，设置为0，选中  38设置为减一，40设置为加一，注意头尾的处理
            //光标上下选择
            var index = $(active[0]).index();

            if(e.keyCode == 38){
                if(active.length){
                    if(index == 0){
                        pre.each(function(item){$(this).removeClass("active")});
                    }else{
                        pre.eq(index).removeClass("active").prev().addClass("active");
                    }
                }else{
                    pre.eq(pre.length - 1).addClass("active");
                }
            }else if(e.keyCode == 40){
                if(!active.length){
                    pre.eq(0).addClass("active");
                }else {
                    if(index == pre.length - 1){
                        pre.each(function(item){$(this).removeClass("active")});
                    }else{
                        pre.eq(index).removeClass("active").next().addClass("active");
                    }
                }
            }

        }else{
            //额外的按键处理
        }
    },
    //选择搜索
    chooseOrg:function(e){
        var _this = this;
        var ele = e.target || e.srcElement;
        $(ele).closest("ul").hide();

        //添加状态
        var chosenOz = $(ele).attr("data-code");
        $("#ozList").addClass("services_loading");
        if(chosenOz){
            var pre = JSON.parse(chosenOz);
            App.Services.memSearchParentOz.id = pre.id;
            var type = pre.type;
            App.Services.MemberType = !pre.outer ? "inner" : "outer";//切换外部/内部状态
            var parentCode = {
                outer:pre.outer
            };
            $.ajax({
                url: App.API.URL.searchServicesMemberResult+"id="+pre.id+"&type=" + type,  //  App.API.URL.searchServicesMemberResult
                type:'GET',
                data : parentCode,
                success:function(res){
                    if(res.data && res.data.length){
                        //获取直接父项列表，用于右侧展示 //先获取再点击左侧
                        //获取其他层级
                        if(res.data.length != 1){ //当存在父项组织时
                            App.Services.memSearchParentOz.init(res.data);
                            App.Services.memSearchParentOz.trigger(res.data,false);
                        }
                    }else{
                        //无结果
                        alert("没有所属组织，无法定位到相关信息！");
                        $("#ozList").removeClass("services_loading");
                    }
                },
                error:function(e){
                }
            })
        }
    }
});

;/*!/services/views/auth/member/services.member.ozdetail.js*/
/*
 * @require  services/views/auth/member/services.member.list.js
 * */
App.Services.MemberozDetail=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.orgdetail.html"),
    events:{
        "click .ozName":"unfold"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change:active",this.sele);
        Backbone.on("serviceMemberOrgLoad",this.unfold,this);
        Backbone.on("serviceMemberSelectStatus",this.serviceMemberSelectStatus,this);

    },

    sele:function(){
        if(this.model.get("active")){
            this.$(".ozName").addClass("active");
            this.$(".ozName span").addClass("active");
        }
    },



    serviceMemberSelectStatus:function(){
        this.$(".ozName span").removeClass("active");//清除内部所有的激活的元素
        if(!this.model.get("hasChildren")){
            this.$(".ozName").removeClass("active");
        }
    },

    unfold:function(pram){
        if(pram == parseInt(this.$(".ozName").attr("data-id")) || typeof pram == "object"){//为右侧触发，参数为父级id
            var _this =  this,
                container = this.$el.siblings(".childOz");

            if(typeof pram == "object") {
                //如果是快速点击，属于误操作，跳过
                //if (!App.Services.queue.permit) {
                //    return;
                //}
                //if (App.Services.queue.que > 2) {
                //    return
                //}
            }
            //选择和加载状态
            if (this.$(".ozName span").hasClass("active")) {  //已选（必然已加载），收起
                if(container.html()){
                    this.$(".ozName").removeClass("active").find("span").removeClass("active");
                    App.Services.queue.certificates();
                    //清空右侧列表
                    Backbone.trigger("servicesMemberControlNoSelect");
                    container.hide();
                    return;
                }
            }else if (container.html()) {   //未选但已加载，选择，显示已加载项
                if (!container.is(":hidden")) {
                    container.find(".childOz").hide();
                    var preOrg = _.filter($(".ozName span"), function (item) {
                        return _this.model.get("orgId") == $(item).attr("data-id")
                    });
                    $(preOrg[0]).closest(".ozName").removeClass("active");
                    this.$(".ozName").removeClass("active");
                    container.find(".ozName").removeClass("active");
                    container.find(".ozName span").removeClass("active");
                    container.hide();
                    //return;
                }
                Backbone.trigger("serviceMemberTopSelectStatus");
                Backbone.trigger("serviceMemberSelectStatus");//清除内部所有的激活的元素
                this.$(".ozName").addClass("active").find("span").addClass("active");
                container.find(".childOz").hide();
                container.show();
            } else { //未加载 ，移除所有加载项再选择和显示
                Backbone.trigger("serviceMemberTopSelectStatus");
                Backbone.trigger("serviceMemberSelectStatus");
                this.$(".ozName").addClass("active").find("span").addClass("active");
                container.show();
            }
            //App.Services.queue.promise(_this.pull, _this);
            this.pull();
        }
    },

    //队列请求
    pull:function(){
        var _this = this;//this
        var _thisType = App.Services.MemberType;
        var _thisId = App.Services.memFatherId =  _this.$(".ozName").data("id") ;
        var collection = App.Services.Member[_thisType + "Collection"];
        //样式操作
        $("#blendList").empty();
        $(".serviceBody .content").addClass("services_loading");
        var cdata = {
            URLtype: "fetchServicesMemberList",
            type:"GET",
            data:{
                parentId:_thisId,
                outer:  !(_thisType == "inner"),
                includeUsers:true
            }
        };
        //此处为延迟
        App.Comm.ajax(cdata,function(response){
            var alreadyMenu = _this.$el.siblings(".childOz");//已加载菜单将不再加载
            $(".serviceBody .content").removeClass("services_loading");
            if(!response.data.org.length && !response.data.user.length ){
                Backbone.trigger("servicesMemberControlCancelSelectAll");
                return
            }
            //搜索状态，如果是搜索项则不刷新右侧列表（搜索的父项除外）
            App.Services.Member.memLoadingStatus = true;
            collection.reset();
            if(response.data.user && response.data.user.length){
                collection.add(response.data.user);
            }
            if (response.data.org && response.data.org.length) {
                collection.add(response.data.org);
                if(alreadyMenu.html()){return}//判断不再刷新菜单
                alreadyMenu.html(App.Services.tree(response));
            }

            if(App.Services.memSearchParentOz.id){
                Backbone.trigger("serviceMemberSearchSelect",App.Services.memSearchParentOz.id);
            }
            App.Services.Member.memLoadingStatus = false;
        }).done(function(){
            //删除执行完毕的 ，添加执行新的
            //App.Services.queue.next();
            //搜索队列
            //if(searchQueue.count && searchQueue.count != 1){
            //    if(_this.$(".ozName").attr("data-id") == searchQueue.arr[searchQueue.count].id){
            //        _this.$(".ozName").click();
            //    }
            //    searchQueue.count--;
            //}else{
            //    App.Services.memSearchParentOz.reset();
            //}
        });
    }
});
;/*!/services/views/auth/member/services.member.window.detail.js*/
/*
 * @require  services/views/auth/member/services.member.detail.js
 */
App.Services.MemberWindowDetail = Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/windows/services.member.window.detail.html"),
    events:{

    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model, 'change', this.render);
    }
});
;/*!/services/views/auth/member/services.member.window.index.js*/
/*
 * @require  services/views/auth/index.nav.es6
 * */
App.Services.MemberWindowIndex = Backbone.View.extend({

    tagName:"div",

    className:"seWinBody",

    template:_.templateUrl("/services/tpls/auth/windows/services.member.window.index.html"),

    events:{
        "click .windowSubmit":"windowSubmit",
        "mouseout .memRoleList":"removeRoleInfo"
    },


    render:function(){
        this.$el.html(this.template);
        return this;
    },

    removeRoleInfo:function(){
        $(".servicesShowAll").remove();
    },

    //提交表单，完毕会触发列表更新，列表为memBlend所属列表
    windowSubmit:function(){
        var data,
            selectRole,
            _this = this;//实际的提交信息
        $(App.Services.maskWindow.element[0]).addClass("services_loading");
        _this.removeRoleInfo();
        var submitData  = App.Services.memberWindowData;//获取要提交的成员/组织相关信息
        if(submitData){
            //获取已选角色,并添加角色ID
            selectRole = App.Services.Member.SubRoleCollection.filter(function(item){
                return item.get("checked");
            });

           // if(!selectRole.length){alert("请至少选择一个角色");return;}
            _.each(selectRole,function(item){
                submitData.roleId.push(item.get("roleId"));
            });
        }

        App.Services.Member.saveMemData(submitData);

        data = {
            URLtype:"saveServicesRole",
            data : JSON.stringify(submitData),
            type:"POST",
            contentType: "application/json"
        };

        App.Comm.ajax(data,function(response){
            var type = App.Services.MemberType || "inner";
            var collection = App.Services.Member[type + "Collection"],proto = [];
            if(response.code == 0){
                _.each(selectRole,function(item){
                    item.set("functions",null);
                    item.set("checked",false);
                    proto.push(item.toJSON());//因为不返回继承角色，因此需要存储继承角色再定
                });

                var inherit = collection.models[0].get("role");
                inherit = _.filter(inherit,function(item){return item["inherit"]});
                _.each(inherit,function(item){proto.push(item);});
                collection.each(function(item){
                    var l1 = submitData[type]["orgId"],
                        l2 = submitData[type]["userId"],
                        orgId = item.get("orgId"),
                        userId = item.get("userId");
                    if(l1.length && orgId){
                        for(var i  = 0 ;  i< l1.length ; i ++){
                            if(orgId == l1[i]){
                                item.set({"role":proto});
                                return
                            }
                        }
                    }
                    if(l2.length && userId){
                        for(var j = 0 ; j < l2.length ;j++){
                            if(userId == l2[j] ){
                                item.set({"role":proto});
                                return
                            }
                        }
                    }
                });
            }
            App.Services.Member.resetMemData();
            _this.removeRoleInfo();
            $(App.Services.maskWindow.element[0]).removeClass("services_loading");
            App.Services.maskWindow.close();
            App.Services.memOz = '';
        });
        App.Services.Member.resetMemData();
        _this.removeRoleInfo();
        App.Services.memOz = '';
    },
    initialize:function(){}
});

;/*!/services/views/auth/member/services.member.window.roledetail.js*/
/*
 * @require  services/views/auth/index.es6
 */
App.Services.windowRoleDetail=Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/windows/services.member.window.detail.html"),
    events:{
        "click .name":"memCheck",
        "mouseenter .fun":"showAll",
        "mouseleave .fun":"hideAll",
        "mouseleave .showAll":"hideInfo"
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change:checked",this.checked);
        this.listenTo(this.model,"change:inherit",this.inherit);
    },
    //加载判断
    checked:function(){
        if(this.model.get("checked")){
            this.$el.addClass("active");
        }
    },
    showAll:function(e){
        e.stopPropagation();
        this.hoverStauts = true;
        var ele = e.target;
        if(ele.nodeName == "SPAN"){
            ele = $(ele).closest(".fun")
        }else{
            ele = $(ele)
        }
        App.Services.showAll(ele);
    },
    hideAll:function(e){
        e.stopPropagation();
        if(e.target.nodeName == "SPAN"){
            $(".showAll").remove();
        }
    },
    hideInfo:function(e){
        e.stopPropagation();
        $(".showAll").remove();
    },

    //继承属性不可修改
    inherit:function() {
        this.$el.addClass("inherit");
    },
    //点选
    memCheck:function(){
        var window= App.Services.maskWindow.find(".memRoleList h2 i"),
        count = parseInt(window.html());
        if(this.model.get("inherit")){return;}
        var checkEle = this.model.get("checked");
        if(!checkEle){
            this.$el.addClass("active");
            window.html(count + 1);
        }else{
            this.$el.removeClass("active");
            window.html(count - 1);
        }
        this.model.set("checked",!checkEle);
    }
});





;/*!/services/views/auth/member/services.member.window.rolelist.js*/
/*
 * @require  services/views/auth/member/services.member.detail.js
 */
App.Services.windowRoleList=Backbone.View.extend({

    tagName:"div",
    events:{},

    template:_.templateUrl("/services/tpls/auth/member/services.member.orglist.html"),
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
       this.listenTo(App.Services.Member.SubRoleCollection,"add",this.addOne);
       this.listenTo(App.Services.Member.SubRoleCollection,"reset",this.render);
    },
    addOne:function(model){
        var newView = new App.Services.windowRoleDetail({model:model});
        this.$("ul").append(newView.render().el);
        App.Comm.initScroll(this.$el.find(".setter"),"y");
    },
    //排序
    comparator:function(){}
});





;/*!/services/views/auth/projectMember/auth.projectMember.js*/
/**
 * @require services/collections/auth/projectMember/services.auth.projectMember.js
 */
//主容器
App.Services.projectMember.mainView = Backbone.View.extend({
	
	tagName:"div",
	
	id:"projectMember",
	
	events:{
		'click #addMemberBtn':'openMemberManagerModal'
	},
	
	template: _.templateUrl('/services/tpls/auth/projectMember/tplProjectMember.html'),
	
	render: function() {
		this.$el.html(this.template());
		new App.Services.projectMember.projects();
		new App.Services.projectMember.members();
		return this;
	},
	
	//打开成员部门管理视图窗口
	openMemberManagerModal:function(){
		var memberManager=new ViewComp.MemberManager().render({title:""});
		App.Services.maskWindow=new App.Comm.modules.Dialog({title:'添加成员/部门',width:640,isConfirm:false,message:memberManager.el});
		memberManager.initView();
	}
});


;/*!/services/views/auth/projectMember/auth.projectMember.members.js*/
//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({
	
  template: _.templateUrl('/services/tpls/auth/projectMember/members.html'),
  
  events:{
  },

  // 重写初始化
  initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberMemberCollection,'reset',this.render);
  },
  /**
   * 项目成员列表删除事件
   * @param {Object} event
   */
  del:function(event){
  		var _userId=event.currentTarget.getAttribute("data-user");
  		var _userName=event.currentTarget.getAttribute("data-userName");
  		var _opType=event.currentTarget.getAttribute("data-type");//对象类型：org,user
  		var _outer=event.currentTarget.getAttribute("data-outer");//是否是外网用户

  		App.Services.Dialog.alert("<span class='delTip'>确认要将'"+_userName+"'从"+unescape(unescape(App.Comm.getCookie("currentProjectName")))+"删除？</span>",function(_this){
  			App.Comm.ajax({
  				URLtype:'deleteServicesProjectMembers',
  				data:{
  					memberType:_opType,
  					userId:_userId,
  					outer:_outer,
  					privilegeId:App.Comm.getCookie('currentPid')
  				},
  				type:'delete'
  			},function(res){
  				_this.close();
  				$.tip({message:'删除成功',type:'success'});
    			if(res.message=="success"){
    				//$('#dataLoading').show();
    				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,{outer:App.Comm.user("outer")},{
						dataPrivilegeId:App.Comm.getCookie("currentPid")
					});
    			}
  			}).fail(function(){
  				
  			})
  		});
      $('.mod-dialog,.mod-dialog .wrapper .content').css('minHeight','auto');
  },

  render: function(items) {
  	var _this=this;
  	var data=App.Services.projectMember.method.model2JSON(items.models);
  	data={data:data};
    $("#memberlistWrap").html(this.$el.html(this.template(data)));
    this.$('.remove').on('click',function(e){
    	_this.checkAuth(e);
    })
    $('#dataLoading').hide();
    clearMask();
    return this;
  },

  checkAuth:function(event){
    var _this=this,
        data={},
        _userId=event.currentTarget.getAttribute("data-user"),
        _opType=event.currentTarget.getAttribute("data-type");

    if(_opType=='org'){
      data.orgId=_userId;
    }else{
      data.userId=_userId;
    }
    App.Comm.ajax({
      URLtype:'checkDelAuth',
      data:data
    },function(res){
      if(res.code==0){
        if(res.data.checkResult){
          _this.del(event);
        }else{
          $.tip({message:'没有权限',type:'alarm'})
        }
      }
    })
  }
});
;/*!/services/views/auth/projectMember/auth.projectMember.projects.js*/
//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({

	template: _.templateUrl('/services/tpls/auth/projectMember/projects.html'),

	events: {
		'click .project': 'selectProject'
	},

	currentSelect:3,
	// 重写初始化
	initialize: function() {
		this.listenTo(App.Services.projectMember.projectMemberProjectCollection, 'reset', this.render);
	},

	render: function(items) {
		var _this = this;
		var data = items.toJSON()[0];
		data.data.type=_this.currentSelect;
		$("#projectList").html(this.$el.html(this.template(data)));
		if (data.data.length > 0) {
			var id = data.data[0].id;
			App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection, {
				outer: App.Comm.user("outer")
			}, {
				dataPrivilegeId: id
			});
			App.Comm.setCookie("currentPid", id);
		}
		$('#projectList .projectDropDown').myDropDown({
			click:function($item){
				_this.currentSelect=$item.data('type');
				App.Services.projectMember.managerType=$item.data('type');
				$("#memberlistWrap").html('<div class="noDataText">暂无信息,请点击选择左侧的项目列表</div>');
				items.fetch({
					reset:true,
					data: {
						userId:App.Comm.user("userId"),
						type:$item.data('type')
					}
				})

			}
		});
		this.delegateEvents();
		return this;
	},

	selectProject: function(event) {
		$("#memberlistWrap").mmhMask();
		var $li = $(event.currentTarget),
			pid = $li.attr("data-pid"),
			name = $li.find('h4').text(); //权限ID
		$("#projectList .project").removeClass("active");
		$li.addClass("active");
		App.Comm.setCookie("currentPid", pid);
		App.Comm.setCookie("currentProjectName", escape(escape(name)));
		App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection, {
			outer: App.Comm.user("outer")
		}, {
			dataPrivilegeId: pid
		});
	}

});
;/*!/services/views/auth/projectMember/view.comp.member.manager.js*/
/**
 * 业务视图组件
 * 
 * 1 项目成员/部门管理视图 
 * 基于ztree树插件
 * 
 * 纯粹的View、没有modal、没有collection
 * 
 * @author 汪冰
 * @time 2016年5月1日18:22:42
 */

var ViewComp=ViewComp||{};
ViewComp.MemberManager = Backbone.View.extend({
	template: _.templateUrl('/services/tpls/auth/projectMember/projectMemberManager.html'),
	selectTree: null,
	selectedTree: null,
	events: {
		"click a[name='selectBtn']": "addOption",
		"mouseover .ztree li a": "showDelete",
		"mouseout .ztree li a": "hideDelete",
		'click #grandBtn':'grand',
		"click .searchBtn":"search",
		"click .closeicon":"clearSearch",
		"keyup #searchContent":"searchCli"
	},
	initialize:function(){
		
	//	this.listenTo(App.Services.projectMember.projectMemberOrgCollection,'reset',this.initView)
		
	},
	render: function(data) {
		this.$el.append(this.template());
		return this;
	},
	
	//初始化部门成员数据、基于ztree树插件
	initView: function(data) {
		//缓存当前View实例对象
		var _view = this;
		//树插件初始化配置
			_view.loadChildren(_view,false,null);
		
		this.selectedTree = $.fn.zTree.init($("#selectedTree"), {
			view: {
				showLine: false,
				nameIsHTML:true
			}
		}, []);
		
	//	App.Comm.initScroll(this.$('.userSelecter .scrollWrap>ul'),"y");
	},

	//选择节点
	addOption: function() {
		var _this=this;
		var nodes= _this.selectTree.getSelectedNodes();
			
		_.each(nodes,function(n){
			n.children=[];
		})
		
		var newNodes=_this.selectedTree.addNodes(null,nodes);
		
		//自定义渲染树节点
		newNodes.forEach(function(i){
			var $del=$("<span  class='showDelete'><i></i></span>");
			//绑定删除事件
			$del.on("click",function(){
				_this.deleteOption(i);
			});
			$("#selectedTree #"+i.tId+"_a").append($del);
		})
	},
	
	//删除节点
	deleteOption:function(i){
		this.selectedTree.removeNode(i);
	},

	//显示删除按钮
	showDelete: function(e) {
		$(e.currentTarget).find(".showDelete").show();
	},
	
	//隐藏删除按钮
	hideDelete: function(e) {
		$(e.currentTarget).find(".showDelete").hide();
	},
	
	loadChildren:function(_this,outer,parentId,treeNode){
		_this.$(".scrollWrap").mmhMask();
		var url="fetchServiceKeyUserInfo",
			_getData={
				uid:App.Comm.user('userId')
			},
			setting = {
				callback: {
					beforeClick:function(){
					},
					onClick: function(event, treeId, treeNode) {
						if(event.target.className.indexOf("button business_ico")!=-1){
							if(!treeNode.userId && !treeNode.isParent){
								_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
							}
							_this.selectTree.cancelSelectedNode(treeNode);
						}
					}
				},
				view: {
					selectedMulti: true,
					nameIsHTML:true,
					showLine: false,
					showTitle:false
				}
			};
		if(parentId){
			_getData={
				outer:outer,
				includeUsers:true,
				parentId:parentId
			}
			url='fetchServiceMemberList';
		}
		
		App.Comm.ajax({
			URLtype:url,
			type:"get",
			data:_getData
		},function(res){
			if(res.message==="success"){
				var zNodes=[],
					 _org=res.data.org||[],
					_user=res.data.user||[],
					_newOrg=[];
				if(url=='fetchServiceKeyUserInfo'){
					_org.forEach(function(i){
						i.iconSkin='business';
						i.name=i.name+'<i style="color:#999999;">（'+i.namePath+'）</i>';
					});
					zNodes=_org.concat(_user);
				}else{
					_org.forEach(function(i){
						i.iconSkin='business';
						_newOrg.push(i);
					});
					zNodes=_newOrg.concat(_user);
				}

				if(!treeNode){
					_this.selectTree = $.fn.zTree.init($("#selectTree"), setting, zNodes);
				}else{
					_this.selectTree.addNodes(treeNode,zNodes);
				}
			}
			clearMask();
		}).fail(function(){
			//失败回调
			clearMask();
		})
	},
	
	/**
	 * 添加项目成员
	 */
	grand:function(){
		$("#dataLoading").show();
		var pid=App.Comm.getCookie('currentPid');
		var url=App.API.URL.putServicesProjectMembers;
		var data={
			"type":App.Services.projectMember.managerType,
		    "projectId":[pid],
		    "outer":{
		        "orgId":[],
		        "userId":[]
		    },
		    "inner":{
		        "orgId":[],
		        "userId":[]
		    }
		};
		
		var nodes=this.selectedTree.getNodes();
		_.each(nodes,function(n){
			if(n.outer){
				if(n.orgId){
					data.outer.orgId.push(n.orgId)
				}else{
					data.outer.userId.push(n.userId)
				}
			}else{
				if(n.orgId){
					data.inner.orgId.push(n.orgId)
				}else{
					data.inner.userId.push(n.userId)
				}
			}
			
		});
		
		App.Comm.ajax({
			URLtype:'putServicesProjectMembers',
			type:"post",
			data:JSON.stringify(data),
			contentType:"application/json"
		},function(res){
			$("#dataLoading").show();
			if(res.message=="success"){
				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,
					{outer:App.Comm.user("outer")},{
					dataPrivilegeId:App.Comm.getCookie("currentPid")
				});
				App.Services.maskWindow.close();
			}else{
				alert("添加失败");
				$("#dataLoading").hide();
			}
		}).fail(function(){
			$("#dataLoading").hide();
		})

	},
	//搜索模块
	search:function(e){
		var _this = this, url,content = $("#searchContent").val();
		if(!content){return}
		var uid=App.Comm.user('userId');

		var treeNode = null,
			setting = {
				callback: {
					beforeClick:function(){
					},
					onClick: function(event, treeId, treeNode) {
						if(event.target.className.indexOf("button business_ico")!=-1){
							if(!treeNode.userId && !treeNode.isParent){
								_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
							}
							_this.selectTree.cancelSelectedNode(treeNode);
						}
					}
				},
				view: {
					selectedMulti: true,
					nameIsHTML:true,
					showLine: false,
					showTitle:false
				}
			};

		url=App.API.URL.searchServicesAuthDataSearch + uid + "/search?key=" + content;  // 头像不对
		$.ajax({
			url:url,
			type:"GET",
			data:{},
			success:function(res){
				if(res.message==="success"){
					var zNodes= res.data || [];
					zNodes.forEach(function(i){
						i.iconSkin='business';
						i.name=i.name+'<i style="color:#999999;">（'+i.parentname+'）</i>';
						if(i.type == 1){
							i.userId = i.id
						}else{
							i.orgId  = i.id
						}
					});
					if(!treeNode){
						_this.selectTree = $.fn.zTree.init($("#selectTree"), setting, zNodes);
					}else{
						_this.selectTree.addNodes(treeNode,zNodes);
					}
				}
				clearMask();
			}
		});
	},
	//重置
	clearSearch:function(e){
		var ele = $(e.target);
		ele.siblings("input").val("");
		this.initView();
	},
	searchCli:function(e){
		if(e.keyCode == 13){
			this.search();
		}
	}
});
;/*!/services/views/auth/projectMember/view.comp.modal.js*/
/**
 * 视图组件对象、用于存储Backbone视图对象插件
 * 视图插件：
 * 
 * ViewComp.Modal 模块窗口视图插件 
 * 也是提示框插件、可以通过配置来自定义渲染
 * 
 * 模块窗口 :eg (new ViewComp.Modal).render({title:'自定义标题信息'}).append();
 * 提示会话框窗口  :eg (new ViewComp.Modal).render({title:'自定义标题信息',dialog:true}).append();
 * 相信配置查看render方法注释
 * 
 * @author 汪冰
 * @time 2016年5月1日18:16:10
 * 
 */
var ViewComp=ViewComp||{};

ViewComp.Modal= Backbone.View.extend({
	
	el: "#modalWrapper",
	
	
	confirmCallback:null,
	
	//modal 视图模块
	template: _.templateUrl('/services/tpls/auth/projectMember/modal.html'),
	
	events: {
		'click .closeIcon': 'closeView',
		'click .submit':'confirm'
	},
	
	/**
	 * 手动渲染视图
	 * 为了动态初始化配置数据、开放data参数
	 * 配置：
	 * title:模块化窗口标题
	 * width:视图宽度
	 * height:视图高度
	 * dialog:是否转成dialog样式
	 * @param {Object} data 
	 */
	render: function(data) {
		
		var _data=$.extend({},{title:'标题',dialog:false,width:0,height:0,confirm:function(){}},data)
		this.confirmCallback=_data.confirm;
		this.$el.append(this.template(_data))
		return this;
	},
	
	html:function(data){
		this.$el.find(".mwin-body").html(data);
	},
	//向Modal视图嵌套视图
	append: function(view) {
		if (view instanceof Backbone.View) {
			var _view = view.render();
			this.$el.find(".mwin-body").append(_view.el);
			_view.initView();
		}else{
			this.$el.find(".mwin-body").append(view);
		}
		return this;
	},
	//关闭Modal视图
	closeView: function() {
		this.$el.html("");
	},
	
	confirm: function(){
		this.confirmCallback();
		this.$el.find(".mwin-foot").hide();
	}
})
;/*!/services/views/auth/role/services.role.alert.js*/
/*
 * @require  services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.windowAlert = Backbone.View.extend({

    tagName :'div',
    className:"servicesAlert",

    template:_.templateUrl("/services/tpls/auth/windows/services.window.alert.html"),

    events:{
        "click #servicesSure":"sure",
        "click #servicesCancel":"cancel",
        "click #servicesClose":"close"
    },

    render:function(sure){
        this.$el.html(this.template());
        sure && (this.flag = sure);
        return this;
    },

    initialize:function(models){

    },

    //确定
    sure : function(){
        if(this.flag){
            return this.flag();
        }
        $(".serviceBody .roleCtrl").addClass("services_loading");
        var _thisModel = App.Services.deleteRoleInfo,roleId = _thisModel.get("roleId")+'';

        $.ajax({
            url:  App.API.Settings.hostname + "platform/auth/role?roleId=" + roleId,
            type:"DELETE",
            success:function(response){
                 if(response.code==0){
                    if(response.data.success[0] == roleId){  //删除成功
                        App.Services.role.collection.remove(_thisModel);
                        App.Services.alertWindow.close();
                        $(".serviceBody .roleCtrl").removeClass("services_loading");
                        return
                    }
                     if(response.data.failure[0] ==roleId){ //删除失败
                         $(".servicesAlert .confirm").hide();
                         $(".servicesAlert .alertRole").show();
                         $(".alertInfo").html("该角色正在使用中，无法删除！");
                     }
                }
                $(".serviceBody .roleCtrl").removeClass("services_loading");
                App.Services.deleteRoleInfo ="";//清理
            },
            error:function(error){
                $(".serviceBody .roleCtrl").removeClass("services_loading");
                alert("错误类型"+ error.status +"，无法成功删除!");
                App.Services.alertWindow.close();
            }
        });
    },
        //取消
    cancel:function(){
        App.Services.alertWindow.close();
    },
    //关闭
    close:function(){
        App.Services.alertWindow.close();
    }
});


;/*!/services/views/auth/role/services.role.detail.js*/
/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/role/services.role.detail.html"),
    events:{
        "click .modify":"modify",
        "click .delete":"delete",
        "click .explorer":"explorer"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        if(this.model.get("roleId") == 999999){this.$el.addClass("serviceRoleAdm");}
        this.listenTo(this.model, 'change', this.render);
        this.$el.hover(function(){$(this).addClass("active");},function(){$(this).removeClass("active")});
    },

    modify:function(){
        App.Services.roleModify = this.model;
        this.window("角色修改");
        this.recognize();
    },

    //区分修改与浏览
    recognize:function( fn){
        var _this = this;
        var data = {};
        App.Services.roleFun.loadData(data,function(){
            $("#selectedRoleName").val(_this.model.get("name")); //暂时写入
            var func = _this.model.get("functions") || [];
            App.Services.maskWindow.find(".seWinBody .func h2 i").text(func.length);
            //为当前角色在父项功能列表中功能设置选择状态
            App.Services.roleFun.collection.each(function(item){
                if(func && func.length){
                    for(var i = 0 ; i < func.length ; i ++){
                        if(item.get("id") == func[i]["id"]){
                            item.set({"checked":true});
                            return
                        }
                    }
                }
            });
            $(".mod-dialog-masklayer").show();
            if(fn && typeof  fn == "function"){
                fn()
            }
            $(App.Services.maskWindow.element[0]).removeClass("services_loading")
        });
    },

    //查看
    explorer:function(){
        var _this = this;
        this.window("查看角色");
        this.recognize(function(){
            //隐藏可选项
            $(".memCheck").hide();
            $(".windowSubmit").hide();
            $("#selectedRoleName").attr("disabled","disabled");
            $(".seWinBody .func li .name span.rohead ").hide();
        });
    },

    //弹窗
    window:function(title){
        var frame = new App.Services.roleWindowIndex().render().el;
        //初始化窗口
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:title,
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            message:frame
        });
        $(".mod-dialog").css({"min-height": "545px"});
        $(".mod-dialog .wrapper .content").css({"min-height": "500px"});
        $(App.Services.maskWindow.element[0]).addClass("services_loading")
    },

    //删除角色
    delete:function() {
        var frame = new App.Services.windowAlert().render().el,alertInfo = '确认要删除角色 "' + (this.model.get("name") ||  "未知")+ '"？';
        App.Services.deleteRoleInfo = this.model;//将model携带至弹窗view
        App.Services.alertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 150,
            isConfirm: false,
            isAlert: false,
            message: frame
        });
        $(".mod-dialog .wrapper .header").hide();//隐藏头部
        $(".alertInfo").html(alertInfo);
    }
});





;/*!/services/views/auth/role/services.role.window.fundetail.js*/
/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleWindowFunDetail = Backbone.View.extend({

    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/windows/services.role.window.detail.html"),
    events:{
        "click .memCheck":"choose"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change:checked",this.checked);
    },
    checked:function(){
        if(this.model.get("checked")){
            this.$el.addClass("active");
        }
    },

    choose:function() {
        var window= App.Services.maskWindow.find(".seWinBody .func h2 i");
        count = parseInt(window.html());
        var preV = this.model.get("checked");
        if (!preV) {
            this.$el.addClass("active");
            this.$(".memCheck").addClass("checked");
            window.html(count + 1);
        } else {
            this.$el.removeClass("active");
            this.$(".memCheck").removeClass("checked");
            window.html(count - 1);
        }
        this.model.set("checked",!preV);
    }
});





;/*!/services/views/issue/index.es6*/
"use strict";

//日志管理入口
App.Services.Issue = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('Issue manager');
		return this;
	}
});
;/*!/services/views/log/index.es6*/
"use strict";

//日志管理入口
App.Services.Log = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('log manager');
		return this;
	}
});
;/*!/services/views/project/detail.view.basehole.es6*/
'use strict';

App.Services.DetailView = App.Services.DetailView || {};

App.Services.DetailView.BaseHole = Backbone.View.extend({

	events: {
		'click .accordionDatail': 'toggleProFrom',
		'click .save': 'saveBasehole',
		'click .update': 'updateBasehole',
		'click .delete': 'deleteBasehole',
		'click .cancel': 'cancelBasehole',
		'change .txtInput': 'formatValue'
	},

	formData: {
		"id": '',
		"projectId": '',
		"pitName": '',
		"pitDepth": 0,
		"pitLevel": '',
		"pitLevelRemark": '',
		"soldierPilePercentage": 0,
		"anchorCablePercentage": 0,
		"soilnailwallPercentage": 0,
		"isHaveBracingType": '',
		"isAnchorrodSoilnail": ''
	},

	template: _.templateUrl('/services/tpls/project/view.basehole.html'),

	initialize: function initialize(data) {
		var _this = this;
		//设置projectId 默认传递
		this.formData.projectId = data.projectId;
		this._parentView = data._parentView;
		this.model.on('change', function () {
			_this.render();
		});
	},
	formatValue: function formatValue(e) {
		App.Services.ProjectCollection.methods.dataVal(e);
	},
	render: function render() {
		var _this = this,
		    data = this.model.toJSON();
		this.formData = data;
		_this.$el.html(_this.template(data));
		_this.$(".isAnchor").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				_this.formData.isAnchorrodSoilnail = $item.text();
			}
		});
		_this.$(".isSupport").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				_this.formData.isHaveBracingType = $item.text();
			}
		});
		_this.$(".baseholeLevel").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				_this.formData.pitLevel = $item.text();
			}
		});
		return _this;
	},
	toggleProFrom: function toggleProFrom(e) {
		var $this = typeof e === 'string' ? this.$(e) : this.$(e.target),
		    $accord = $this.parent().next();
		if ($this.hasClass('accordOpen')) {
			$accord.slideDown();

			var $all = $('.projectBaseHole .accordionDatail');
			$all.each(function () {
				if (!$(this).hasClass('accordOpen')) {
					$(this).addClass('accordOpen');
					$(this).parent().next().slideUp();
				}
			});
		} else {
			$accord.slideUp();
		}
		$this.toggleClass('accordOpen');
	},
	saveBasehole: function saveBasehole(args, type) {
		if (this.$('.errorInput').length > 0) {
			return;
		}
		var _this = this,
		    _objName = '';
		_this.$('input').each(function () {
			var _ = $(this);
			_this.formData[_.attr('name')] = _.val();
		});

		_objName = _this.formData['pitName'];
		_objName = _objName.replace(/\s/g, '');
		if (_objName.length < 1) {
			_this.$('input[name=pitName]').css('border', '1px solid #FF0000');
			return;
		}
		_this.$('input[name=pitName]').css('border', '1px solid #CCC');

		args = typeof args === 'string' ? args : 'fetchProjectCreateBaseHole';
		_this.formData.soldierPilePercentage = (_this.formData.soldierPilePercentage || 0) / 100;
		_this.formData.anchorCablePercentage = (_this.formData.anchorCablePercentage || 0) / 100;
		_this.formData.soilNailWallPercentage = (_this.formData.soilNailWallPercentage || 0) / 100;

		App.Comm.ajax({
			URLtype: args,
			type: type || 'post',
			data: JSON.stringify(_this.formData),
			contentType: 'application/json'
		}, function (res) {
			$.tip({ message: type ? '修改成功' : '新增成功' });
			Backbone.trigger('baseholeUserStatus', 'read');
			if (type != 'put') {
				//修改
				_this.formData.id = res.data.pitId;
			}
			_this.model.set(_this.formData);
			_this.$('.accordionDatail').trigger('click');
			_this.reloadView();
		}).fail(function () {
			clearMask();
		});
	},
	updateBasehole: function updateBasehole() {
		this.saveBasehole('fetchProjectUpdateBaseHole', 'put');
	},
	deleteBasehole: function deleteBasehole() {
		var _this = this;
		App.Comm.ajax({
			URLtype: 'removeProjectDetailBasehole',
			type: 'delete',
			data: {
				pitId: _this.formData.id
			}
		}, function (data) {
			if (data.code == 0) {
				_this.reloadView();
			} else {
				App.Services.Dialog.alert(data.message);
			}
		}).fail(function () {});
	},
	cancelBasehole: function cancelBasehole() {
		this.$el.remove();
		App.Services.ProjectCollection.ProjecDetailBaseHoleCollection.pop();
		Backbone.trigger('baseholeUserStatus', 'read');
	},


	//刷新基坑页面、同时刷新楼层、剖面视图，保证数据一致性
	reloadView: function reloadView() {
		var _this = this,
		    _proId = _this.formData.projectId,
		    AppCollection = App.Services.ProjectCollection,
		    collectionBasehole = AppCollection.ProjecDetailBaseHoleCollection,
		    collectionFloor = AppCollection.ProjecDetailFloorCollection,
		    collectionSection = AppCollection.ProjecDetailSectionCollection;

		collectionBasehole.projectId = _proId;
		collectionFloor.projectId = _proId;
		collectionSection.projectId = _proId;

		collectionBasehole.reset();
		collectionBasehole.fetch({
			success: function success(child, data) {
				AppCollection.datas.pitData = data.data.pits;
				collectionFloor.reset();
				collectionFloor.fetch();
				collectionSection.reset();
				collectionSection.fetch();

				Backbone.trigger('baseholeUserStatus', 'read');
				Backbone.trigger('floorUserStatus', 'read');
				Backbone.trigger('sectionUserStatus', 'read');
			}
		});
	}
});
;/*!/services/views/project/detail.view.floor.es6*/
'use strict';

App.Services.DetailView = App.Services.DetailView || {};

App.Services.DetailView.Floor = Backbone.View.extend({

	events: {
		'click dt': 'headerToggle',
		'click .accordionDatail': 'toggleProFrom',
		'click .save': 'saveFloor',
		'click .update': 'updateFloor',
		'click .delete': 'deleteFloor',
		'click .cancel': 'cancelFloor',
		'change .txtInput': 'formatValue'
	},

	template: _.templateUrl('/services/tpls/project/view.floor.html'),

	formData: {
		"id": "", //栋号编码
		"pitId": "", //    基坑编码
		"projectId": "", //    项目编码
		"buildingName": "", //  栋号名称
		"height": 0, //   高度
		"area": 0, // 面积
		"groundLayers": 0, //   地上层数
		"undergroundLayers": 0, //  地下层数
		"layerHeight": 0, //    层高
		"seismicIntensityId": "", //    抗震设防烈度
		"seismicLevelId": "", //    抗震等级
		"roofStayWarm": "", //  屋面保温
		"roofStayWarmLev": "", //    屋面保温防火等级
		"outWallStayWarm": "", //   外墙保温
		"outWallStayWarmLev": "", // 外墙保温防火等级
		"lowStrainPercentage": 0, //  低应变检测百分比
		"highStrainPercentage": 0, // 高应变检测百分比
		"ultrasonicPercentage": 0, //   超声波检测百分比
		"corebitPercentage": 0, //  钻芯检测百分比
		"outSidedecorationType": "0", //   外装方式
		"structureType": ""
	},

	initialize: function initialize(data) {
		var _this = this;
		this.model.on('change', function () {
			_this.render();
		});
	},
	formatValue: function formatValue(e) {
		App.Services.ProjectCollection.methods.dataVal(e);
	},
	render: function render() {
		var _this = this,
		    data = this.model.toJSON();
		this.formData = data;
		this.$el.html(this.template(data));
		this.$(".pit").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.attr('data-pitId');
			}
		});
		this.$(".structure").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		this.$(".outerInstall").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		this.$(".outDoorFireLevel").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		this.$(".inDoorFireLevel").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		this.$(".seiGrade").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		this.$(".intensity").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});
		return this;
	},
	toggleProFrom: function toggleProFrom(e) {

		var $this = this.$(e.target),
		    $accord = $this.parent().next();

		if ($this.hasClass('accordOpen')) {
			$accord.slideDown();
			var $all = $('.projectFloor .accordionDatail');
			$all.each(function () {
				if (!$(this).hasClass('accordOpen')) {
					$(this).addClass('accordOpen');
					$(this).parent().next().slideUp();
				}
			});
		} else {
			$accord.slideUp();
		}
		$this.toggleClass('accordOpen');
	},
	saveFloor: function saveFloor(args, type) {

		if (this.$('.errorInput').length > 0) {
			return;
		}
		var _this = this,
		    _objName = null;
		_this.$('input').each(function () {
			var _ = $(this);
			_this.formData[_.attr('name')] = _.val();
		});
		_objName = _this.formData['buildingName'];
		_objName = _objName.replace(/\s/g, '');
		if (_objName.length < 1) {
			_this.$('input[name=buildingName]').css('border', '1px solid #FF0000');
			return;
		}
		_this.$('input[name=buildingName]').css('border', '1px solid #CCC');

		args = typeof args === 'string' ? args : 'fetchProjectCreateFloor';
		//百分比数值转换
		_this.formData.lowStrainPercentage = (_this.formData.lowStrainPercentage || 0) / 100;
		_this.formData.highStrainPercentage = (_this.formData.highStrainPercentage || 0) / 100;
		_this.formData.ultrasonicPercentage = (_this.formData.ultrasonicPercentage || 0) / 100;
		_this.formData.corebitPercentage = (_this.formData.corebitPercentage || 0) / 100;

		App.Comm.ajax({
			URLtype: args,
			type: type || 'post',
			data: JSON.stringify(_this.formData),
			contentType: 'application/json'
		}, function (res) {
			$.tip({ message: type ? '修改成功' : '新增成功' });
			Backbone.trigger('floorUserStatus', 'read');
			if (type != 'put') {
				_this.formData.id = res.data.buildingId;
			}
			_this.model.set(_this.formData);
			_this.$('.accordionDatail').trigger('click');
			clearMask();
		}).fail(function () {
			clearMask();
		});
	},
	updateFloor: function updateFloor() {
		this.saveFloor('fetchProjectUpdateFloor', 'put');
	},
	deleteFloor: function deleteFloor() {
		var _this = this;
		App.Comm.ajax({
			URLtype: 'removeProjectDetailFloor',
			type: 'delete',
			data: {
				floorId: _this.formData.id
			}
		}, function () {
			_this.reloadView();
		}).fail(function () {});
	},
	cancelFloor: function cancelFloor() {
		this.$el.remove();
		App.Services.ProjectCollection.ProjecDetailFloorCollection.pop();
		Backbone.trigger('floorUserStatus', 'read');
	},
	reloadView: function reloadView() {
		var _this = this;
		var _collection = App.Services.ProjectCollection.ProjecDetailFloorCollection;
		_collection.projectId = _this.formData.projectId;
		_collection.reset();
		_collection.fetch({
			success: function success(child, data) {
				clearMask();
			}
		});
	}
});
;/*!/services/views/project/detail.view.mappingrule.es6*/
"use strict";

//项目映射
App.Services.viewMappingRule = Backbone.View.extend({

	tagName: "div",

	className: "MappingRule",

	events: {
		'click .changeTpl': 'changeTpl',
		'click .editSelf': 'editSelf'
	},

	template: _.templateUrl('/services/tpls/project/index.mappingrule.html'),

	initialize: function initialize(model) {
		//this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleCollection,"add",this.addData);
		this.model = model;
		Backbone.on("modelChange", this.modelChange, this);
	},


	modelChange: function modelChange() {
		this.$(".nameBox").text(); //写入名字
	},

	render: function render() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


	//修改模板
	changeTpl: function changeTpl() {
		var frame = new App.Services.MappingRuleWindow().render().el;
		this.ruleWindow(frame);

		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.reset();
		App.Services.ProjectCollection.ProjectMappingRuleModelCollection.fetch({}, function (response) {});
	},
	//编辑模板
	editSelf: function editSelf() {
		if (App.Services.ProjectMappingRuleId) {
			window.location.href = "#services/project/" + App.Services.ProjectMappingRuleId;
		}
	},
	//获取数量自定义规则数量
	getSelfRule: function getSelfRule() {
		var data = {
			URLtype: "fetchServicesProjectMappingRuleCount",
			data: {
				projectId: App.Services.ProjectMappingRuleId
			}
		};
		App.Comm.ajax(data, function (response) {
			console.log(response);
		});
	},
	//弹窗
	ruleWindow: function ruleWindow(frame) {
		//初始化窗口
		App.Services.maskWindow = new App.Comm.modules.Dialog({
			title: "请选择映射规则标准模板",
			width: 600,
			height: 500,
			isConfirm: false,
			isAlert: false,
			message: frame
		});
		$(".mod-dialog").css({ "min-height": "545px" });
	}

});
;/*!/services/views/project/detail.view.section.es6*/
'use strict';

App.Services.DetailView = App.Services.DetailView || {};

App.Services.DetailView.Section = Backbone.View.extend({

	events: {
		'click .accordionDatail': 'toggleProFrom',
		'click .save': 'saveSection',
		'click .update': 'updateSection',
		'click .delete': 'deleteSection',
		'click .cancel': 'cancelSection'
	},

	template: _.templateUrl('/services/tpls/project/view.section.html'),

	formData: {
		"id": "", //剖面ID
		"pitId": "", //    基坑编码
		"projectId": "", //    项目编码
		"profileName": "", //  剖面
		"bracingType": '' //支护类型
	},

	initialize: function initialize(data) {
		var _this = this;
		this.model.on('change', function () {
			_this.render();
		});
	},
	render: function render() {
		var _this = this,
		    data = this.model.toJSON();
		this.formData = data;
		this.$el.html(this.template(data));
		this.$(".pit").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData.pitId = $item.attr('data-pitId');
			}
		});
		this.$(".supportType").myDropDown({
			zIndex: App.Services.ProjectCollection.methods.zIndex(),
			click: function click($item) {
				var _ = $(this);
				_this.formData[_.attr('name')] = $item.text();
			}
		});

		return this;
	},
	toggleProFrom: function toggleProFrom(e) {

		var $this = this.$(e.target),
		    $accord = $this.parent().next();

		if ($this.hasClass('accordOpen')) {
			$accord.slideDown();
			//互斥操作
			var $all = $('.projectSection .accordionDatail');
			$all.each(function () {
				if (!$(this).hasClass('accordOpen')) {
					$(this).addClass('accordOpen');
					$(this).parent().next().slideUp();
				}
			});
		} else {
			$accord.slideUp();
		}

		$this.toggleClass('accordOpen');
	},
	saveSection: function saveSection(args, type) {
		var _this = this,
		    _objName = '';
		_this.$('input').each(function () {
			var _ = $(this);
			_this.formData[_.attr('name')] = _.val();
		});
		_objName = _this.formData['profileName'];
		_objName = _objName.replace(/\s/g, '');
		if (_objName.length < 1) {
			_this.$('input[name=profileName]').css('border', '1px solid #FF0000');
			return;
		}
		_this.$('input[name=profileName]').css('border', '1px solid #CCC');
		args = typeof args === 'string' ? args : 'fetchProjectCreateSection';

		App.Comm.ajax({
			URLtype: args,
			type: type || 'post',
			data: JSON.stringify(_this.formData),
			contentType: 'application/json'
		}, function (res) {
			$.tip({ message: type ? '修改成功' : '新增成功' });
			Backbone.trigger('sectionUserStatus', 'read');
			if (type != 'put') {
				_this.formData.id = res.data.profileId;
			}
			_this.model.set(_this.formData);
			_this.$('.accordionDatail').trigger('click');
		}).fail(function () {
			clearMask();
		});
	},
	updateSection: function updateSection() {
		this.saveSection('fetchProjectUpdateSection', 'put');
	},
	deleteSection: function deleteSection() {
		var _this = this;
		App.Comm.ajax({
			URLtype: 'removeProjectDetailSection',
			type: 'delete',
			data: {
				sectionId: _this.formData.id
			}
		}, function () {
			_this.reloadView();
		}).fail(function () {});
	},
	cancelSection: function cancelSection() {
		this.$el.remove();
		App.Services.ProjectCollection.ProjecDetailSectionCollection.pop();
		Backbone.trigger('sectionUserStatus', 'read');
	},
	reloadView: function reloadView() {
		var _this = this;
		var _collection = App.Services.ProjectCollection.ProjecDetailSectionCollection;
		_collection.projectId = _this.formData.projectId;
		_collection.reset();
		_collection.fetch();
	}
});
;/*!/services/views/project/image.jcrop.es6*/
'use strict';

//项目基本设置
App.Services.ImageJcrop = Backbone.View.extend({
	tagName: "div",

	template: _.templateUrl('/services/tpls/project/imageJcrop.html', true),

	_projectId: '',

	events: {
		'change #inputFile': 'initDom'
	},

	initialize: function initialize() {},
	selectPic: function selectPic() {
		var _this = this,
		    boundx,
		    boundy,
		    px,
		    py,
		    x,
		    y,
		    w,
		    h,
		    currentSize;
		var _timg = null,
		    _jcrop = null;

		$("#uploadIframe").on("load", function () {
			_timg && _timg.remove();
			if ($('.jcrop-holder').length > 0) {
				$('.jcrop-holder').remove();
			}
			var data = JSON.parse(this.contentDocument.body.innerText);
			var tempUrl = data.code == 0 ? data.data.logoUrl : '';

			var _timestamp = tempUrl + "?t=" + new Date().getTime();

			_$timg = $("<img id='tempImage' src='" + _timestamp + "' style='width:100%;height:100%;'/>");

			_$preImg = $("<img id='preImage' src='" + _timestamp + "' class='jcrop-preview'/>");

			//	$("body").append('<img id="preImageSource"  style="display:none;" src="'+_timestamp+'" />');
			$('<img/>').attr('src', _timestamp).load(function () {
				var sourceWidth = this.width,
				    sourceHeight = this.height;
				$('.previewImage').prepend(_$timg);
				$('.previewImage input').css({
					top: '304px',
					left: '381px',
					height: '40px',
					width: '80px'
				});
				$('.previewImage p').hide();
				$('.cutImage').html(_$preImg);

				_$timg.Jcrop({
					aspectRatio: 1.33,
					onChange: function onChange(c) {

						currentSize = c;
						if (parseInt(c.w) > 0) {
							var rx = 200 / c.w;
							var ry = 150 / c.h;
							$("#preImage").css({
								width: Math.round(rx * boundx) + 'px',
								height: Math.round(ry * boundy) + 'px',
								marginLeft: '-' + Math.round(rx * c.x) + 'px',
								marginTop: '-' + Math.round(ry * c.y) + 'px'
							});
						}
					},
					onSelect: function onSelect(c) {
						var px = sourceWidth / boundx,
						    py = sourceHeight / boundy;
						w = Math.round(c.w * px);
						h = Math.round(c.h * py);
						x = Math.round(c.x * px);
						y = Math.round(c.y * py);
					}
				}, function () {

					var bounds = this.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
					_jcrop = this;
					_jcrop.setSelect([60, 40, 260, 190]);
				});
			});
		});

		$("#cutImageBtn").on('click', function () {
			var j = _$timg.data().Jcrop.tellSelect();
			$("#pageLoading").show();

			App.Comm.ajax({
				URLtype: 'fetchProjectManagerProjectLogo',
				type: 'post',
				data: {
					x: x,
					y: y,
					w: w,
					h: h,
					projectId: _this._projectId
				}
			}, function (data) {
				$("#preImageSource").remove();
				$("#pageLoading").hide();
				if (data.message == 'success') {
					App.Services.maskWindow.close();
					var _collection = App.Services.ProjectCollection.ProjectBaseInfoCollection;
					_collection.projectId = _this._projectId;
					_collection.fetch({
						reset: true,
						success: function success(child, data) {}
					});
				}
			}).fail(function () {
				$("#pageLoading").hide();
			});
		});
	},
	render: function render(imagePath, projectId) {
		var _this = this;
		var data = {
			oldImage: imagePath,
			projectId: projectId
		};
		this._projectId = projectId;
		this.$el.html(_.template(this.template)(data));

		setTimeout(function () {
			_this.selectPic();
		}, 1000);

		return this;
	},
	initDom: function initDom() {
		$("#uploadImageForm").submit();
	}
});
;/*!/services/views/project/index.base.es6*/
'use strict';

//项目基本设置
App.Services.ProjectBase = Backbone.View.extend({

	tagName: "div",

	template: _.templateUrl('/services/tpls/project/index.base.html', true),

	initialize: function initialize() {
		this.listenTo(App.Services.ProjectCollection.ProjectBaseInfoCollection, 'reset', this.render);
	},
	render: function render(data) {
		var _html = _.template(this.template);
		var _data = data.toJSON()[0];
		this.$el.html(_html(_data));
		$(".projectContainer .projectBase .baseItem").html(this.$el);

		$(".projectLogo").hover(function () {
			var _$label = $(this).find("label");
			_$label.stop(true);
			_$label.animate({
				bottom: '0'
			}, 500);
		}, function () {
			var _$label = $(this).find("label");
			_$label.stop(true);
			_$label.animate({
				bottom: '-26px'
			}, 500);
		});

		this.$el.find("label").on("click", function (e) {
			var imageUrl = $(this).attr("data-image");
			var view = new App.Services.ImageJcrop();
			App.Services.maskWindow = new App.Comm.modules.Dialog({ title: '修改图片', width: 600, height: 500, isConfirm: false, message: view.render(imageUrl, _data.id).el });
		});

		return this;
	}
});
;/*!/services/views/project/index.detail.es6*/
"use strict";

//项目详情
App.Services.ProjectDetail = Backbone.View.extend({

	tagName: "div",

	className: "projectDetail",

	template: _.templateUrl('/services/tpls/project/index.detail.html', true),

	render: function render() {

		this.$el.html(this.template);
		return this;
	}
});
;/*!/services/views/project/index.es6*/
"use strict";

//项目管理入口
App.Services.Project = Backbone.View.extend({

  tagName: "div",

  id: "projectManger",

  events: {
    "click .serviceNav .item": "switchTab",
    "click .flowSliderUl .item": "slideBarClick"
  },

  //初始化事件
  initialize: function initialize() {
    this.listenTo(App.Services.ProjectCollection.ProjectSlideBarCollection, "add", this.slideBarAdd);
    this.listenTo(App.Services.ProjectCollection.ProjectSlideBarCollection, "reset", this.resetLoading);
  },


  template: _.templateUrl('/services/tpls/project/index.html', true),

  render: function render() {

    this.$el.html(this.template);

    var $container = this.$el.find('.serviceNav'),
        tabs = App.Comm.AuthConfig.Service.project,
        Auth = App.AuthObj.service.project;

    if (Auth.baseInfo) {
      $container.append(tabs.baseInfo.tab);
      new App.Services.ProjectBase();
      this.viewProjectMapping = new App.Services.ProjectMapping();
      this.$(".projectContainer .projectBase .mapItem").html(this.viewProjectMapping.render().el);
    }

    //映射规则
    if (Auth.mappingRule) {
      $container.append(tabs.mappingRule.tab);
    }

    if (Auth.designInfo) {
      $container.append(tabs.designInfo.tab);

      this.viewProjectBaseHole = new App.Services.ProjectDetail.BaseHole();
      this.viewProjectFloor = new App.Services.ProjectDetail.Floor();
      this.viewProjectSection = new App.Services.ProjectDetail.Section();
      this.viewProjectPile = new App.Services.ProjectDetail.Pile();

      this.$(".projectContainer .projectFloor").html(this.viewProjectFloor.render().el);

      this.$(".projectContainer .projectBaseHole").html(this.viewProjectBaseHole.render().el);

      this.$(".projectContainer .projectSection").html(this.viewProjectSection.render().el);

      this.$(".projectContainer .projectPile").html(this.viewProjectPile.render().el);
    }

    this.fetchData();

    return this;
  },


  //获取数据	
  fetchData: function fetchData() {

    $('#pageLoading').show();
    var that = this;
    this.$(".serviceNav .item:first").click();

    //重置，拉取数据
    App.Services.ProjectCollection.ProjectSlideBarCollection.reset();

    App.Services.ProjectCollection.ProjectSlideBarCollection.fetch({
      data: {
        pageIndex: 1,
        pageItemCount: 30
      },
      success: function success(child, data) {
        that.$(".folwSlideBar .header .count").text(data.data.length);
        this.$(".flowSliderUl .item:first").click();
      }
    });
  },


  //左侧点击
  slideBarClick: function slideBarClick(event) {
    var _this = this,
        $item = $(event.target).closest(".item"),
        _collection = App.Services.ProjectCollection.ProjectBaseInfoCollection;
    var _projectId = App.Services.ProjectMappingRuleId = App.Comm.publicData.services.project.projectId = $item.attr('data-projectId');
    App.Comm.publicData.services.project.projectName = $item.find(".name").text();
    $item.addClass("selected").siblings().removeClass("selected");
    //加载项目基本信息数据
    _collection.projectId = _projectId;
    _collection.fetch({
      reset: true,
      success: function success(child, data) {}
    });

    if (this.viewProjectMapping) {
      //参数传递
      this.viewProjectMapping.setUserData({
        projectId: _projectId
      });
    }

    //加载项目映射数据
    var collectionMap = App.Services.ProjectCollection.ProjecMappingCollection;
    collectionMap.projectId = _projectId;
    collectionMap.fetch({
      reset: true,
      success: function success(child, data) {}
    });

    //映射规则
    var collectionMapRule = App.Services.ProjectCollection.ProjectMappingRuleCollection;
    collectionMapRule.reset();
    collectionMapRule.projectId = _projectId;
    collectionMapRule.fetch({
      data: { projectId: _projectId },
      success: function success(child, data) {
        this.viewMappingRule = new App.Services.viewMappingRule(collectionMapRule.models[0]);
        this.$(".projectContainer .projectMappingRule").html(this.viewMappingRule.render().el);
      }
    });

    //加载基坑数据
    this.viewProjectBaseHole.setUserData({
      projectId: _projectId
    });
    var collectionBasehole = App.Services.ProjectCollection.ProjecDetailBaseHoleCollection;
    collectionBasehole.projectId = _projectId;
    collectionBasehole.reset();
    collectionBasehole.fetch({
      success: function success(child, data) {

        App.Services.ProjectCollection.datas.pitData = data.data.pits;
        //加载楼层信息数据
        _this.viewProjectFloor.setUserData({
          projectId: _projectId
        });
        var collectionFloor = App.Services.ProjectCollection.ProjecDetailFloorCollection;
        collectionFloor.projectId = _projectId;
        collectionFloor.reset();
        collectionFloor.fetch();

        //加载剖面信息
        _this.viewProjectSection.setUserData({
          projectId: _projectId
        });
        var collectionSection = App.Services.ProjectCollection.ProjecDetailSectionCollection;
        collectionSection.projectId = _projectId;
        collectionSection.reset();
        collectionSection.fetch();

        //加载桩信息
        _this.viewProjectPile.setUserData({
          projectId: _projectId
        });
        var collectionPile = App.Services.ProjectCollection.ProjecDetailPileCollection;
        collectionPile.projectId = _projectId;
        collectionPile.fetch({
          reset: true
        });
      }
    });

    $('#pageLoading').hide();
  },


  templateDetail: _.templateUrl('/services/tpls/project/slidebar/list.detail.html'),

  //侧边栏数据
  slideBarAdd: function slideBarAdd(model) {

    var $flowSliderUl = this.$(".flowSliderUl"),
        data = model.toJSON();

    //移除加载
    $flowSliderUl.find(".loading").remove();

    $flowSliderUl.append(this.templateDetail(data));
    //绑定滚动条
    App.Comm.initScroll(this.$(".slideBarScroll"), "y");
  },


  //加载前 重置
  resetLoading: function resetLoading() {
    this.$(".flowSliderUl").empty().append('<li class="loading">正在加载，请稍候……</li>');
  },


  //切换tab
  switchTab: function switchTab(event) {

    var $target = $(event.target),
        type = $target.data("type");

    $target.addClass("selected").siblings().removeClass("selected");
    if (type == "base") {
      this.$(".projectContainer .projectBase").show().siblings().hide();
    } else if (type == "mapping") {
      this.$(".projectContainer .projectMapping").show().siblings().hide();
    } else if (type == "floor") {
      //楼
      this.$(".projectContainer .projectFloor").show().siblings().hide();
    } else if (type == "basehole") {
      //基坑
      this.$(".projectContainer .projectBaseHole").show().siblings().hide();
    } else if (type == "section") {
      //剖面
      this.$(".projectContainer .projectSection").show().siblings().hide();
    } else if (type == "pile") {
      //桩
      this.$(".projectContainer .projectPile").show().siblings().hide();
    } else if (type == "mappingRule") {
      //映射规则
      this.$(".projectContainer .projectMappingRule").show().siblings().hide();
    }
  }
});
;/*!/services/views/project/index.mapping.es6*/
"use strict";

//项目映射
App.Services.ProjectMapping = Backbone.View.extend({

	tagName: "div",

	className: "projectMapping",

	events: {
		'click .alink': 'linkList',
		'click .aedit': 'linkList'
	},

	template: _.templateUrl('/services/tpls/project/index.mapping.html', true),

	initialize: function initialize() {
		this.listenTo(App.Services.ProjectCollection.ProjecMappingCollection, 'reset', this.render);
	},
	render: function render(data) {
		if (!data) {
			return this;
		}
		data = data.toJSON()[0];
		var _array = [];
		if (data) {
			_array = [{
				module: '模块化',
				projectName: data.modularizeProjectName,
				code: data.modularizeProjectCode,
				op: ''
			}, {
				module: '成本',
				projectName: data.costProjectName,
				code: data.costProjectCode,
				op: "<a class='aedit' href='javascript:;'>" + (data.costProjectCode ? '修改' : '关联') + "</a>"
			}, {
				module: '质监',
				projectName: data.qualityProjectName,
				code: data.qualityProjectCode,
				op: "<a class='alink' href='javascript:;'>" + (data.qualityProjectCode ? '修改' : '关联') + "</a>"
			}];
		}

		var _html = _.template(this.template);
		this.$el.html(_html({ items: _array }));
		//	$(".projectContainer .projectMapping").html(this.$el);		
		return this;
	},
	setUserData: function setUserData(data) {
		this.userData = data;
	},
	linkList: function linkList(event) {
		var type = $(event.currentTarget).attr('class') == 'alink' ? 'qualityProjectCode' : 'costProjectCode';
		var title = $(event.currentTarget).attr('class') == 'alink' ? '质监项目映射' : '成本项目映射';
		var _userData = this.userData;
		var el = new App.Services.ProjectLink({
			userData: {
				projectId: _userData.projectId,
				type: type
			}
		}).render().el;
		App.Global.module = new App.Comm.modules.Dialog({ title: title, width: 600, height: 500, isConfirm: true, okCallback: function okCallback() {
				$("#linkBtn").trigger('click');
			}, message: el });
	}
});
;/*!/services/views/project/index.project.link.es6*/
'use strict';

//项目基本设置
App.Services.ProjectLink = Backbone.View.extend({

	tagName: "div",

	className: 'projectLinkList',

	events: {
		'click tr': 'selectProject',
		'click #linkBtn': 'linkProject',
		'keydown #inputProjectSerach': 'updateList'
	},

	template: _.templateUrl('/services/tpls/project/project.list.html', true),

	initialize: function initialize(data) {
		this.userData = data.userData;
	},
	render: function render() {
		var _this = this;
		_this.loadData(function (data) {

			_this.projectData = data;

			var _tpl = _.template(_this.template);
			_this.$el.html(_tpl(data));
		});
		return this;
	},


	loadData: function loadData(callback) {
		var _this = this;
		App.Comm.ajax({
			URLtype: 'fetchProjectManagerProjectList',
			type: 'get',
			data: {
				type: _this.userData.type == 'qualityProjectCode' ? 3 : 2
			}
		}, function (data) {
			callback(data);
		});
	},

	selectProject: function selectProject(e) {
		$(e.currentTarget).toggleClass('selected');
		$(e.currentTarget).find('.checkClass').toggleClass('unCheckClass');
	},

	linkProject: function linkProject() {
		$("#dataLoading").show();
		var $li = $('tr.selected');

		var _this = this;
		var projectId = _this.userData.projectId,
		    type = _this.userData.type;
		var _result = {
			'projectId': projectId
		};
		if ($li.length > 0) {
			_result[type] = $li.first().attr('data-code');
			App.Comm.ajax({
				URLtype: 'putProjectLink',
				type: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(_result)
			}, function (data) {
				$("#dataLoading").hide();
				App.Global.module.close();
				var collectionMap = App.Services.ProjectCollection.ProjecMappingCollection;
				collectionMap.projectId = projectId;
				collectionMap.fetch({
					reset: true,
					success: function success(child, data) {}
				});
			}).fail(function () {
				$("#dataLoading").hide();
			});
		} else {
			$("#dataLoading").hide();
			App.Global.module.close();
		}
	},

	updateList: function updateList(e) {
		if (e.keyCode != '13') {
			return;
		}

		var t = $(e.currentTarget).val();
		var d = this.projectData.data || [];
		var r = d.filter(function (i) {
			return i.projectName.indexOf(t) !== -1;
		});
		var _tpl = _.template(this.template);
		this.$el.html(_tpl({ data: r }));
	}
});
;/*!/services/views/project/project.detail.basehole.es6*/
'use strict';

App.Services.ProjectDetail = App.Services.ProjectDetail || {};

App.Services.ProjectDetail.BaseHole = Backbone.View.extend({

	tagName: 'div',

	className: 'projectDetail',

	events: {
		'click .createBaseHole': 'createBaseHole'
	},

	status: 'read',

	template: _.templateUrl('/services/tpls/project/project.detail.basehole.html', true),

	setUserData: function setUserData(data) {
		this.userData = data;
	},
	initialize: function initialize() {

		var _this = this;
		this.listenTo(App.Services.ProjectCollection.ProjecDetailBaseHoleCollection, 'add', this.addOne);
		this.listenTo(App.Services.ProjectCollection.ProjecDetailBaseHoleCollection, 'reset', this.resetView);

		Backbone.on('baseholeUserStatus', function (status) {
			_this.status = status;
		}, this);
	},
	render: function render() {
		this.$el.html(this.template);
		this.$(".outerInstall").myDropDown();
		this.$(".structure").myDropDown();
		return this;
	},
	resetView: function resetView() {
		this.$('.detailContainer .scrollWrapContent').html("");
	},
	addOne: function addOne(model) {
		var $container = this.$('.detailContainer .scrollWrapContent');
		var view = new App.Services.DetailView.BaseHole({
			model: model
		});
		$container.append(view.render().el);
	},
	createBaseHole: function createBaseHole() {
		var _this = this;
		if (_this.status !== 'create') {
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');

			var model = {
				"id": '',
				"projectId": _this.userData.projectId,
				"pitName": '',
				"pitDepth": 0,
				"pitLevel": '一级',
				"pitLevelRemark": '',
				"soldierPilePercentage": 0,
				"anchorCablePercentage": 0,
				"soilnailwallPercentage": 0,
				"isHaveBracingType": '否',
				"isAnchorrodSoilnail": '否'
			};

			App.Services.ProjectCollection.ProjecDetailBaseHoleCollection.push(model);

			_this.status = 'create';
		} else {
			var $tar = $('.projectBaseHole .accordionDatail').last();
			if ($tar.hasClass('accordOpen')) {
				$tar.click();
			}
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
	}
});
;/*!/services/views/project/project.detail.floor.es6*/
'use strict';

App.Services.ProjectDetail = App.Services.ProjectDetail || {};

App.Services.ProjectDetail.Floor = Backbone.View.extend({

	tagName: 'div',

	className: 'projectDetail',

	status: 'read',

	events: {
		'click .createFloor': 'createFloor'
	},

	template: _.templateUrl('/services/tpls/project/project.detail.floor.html', true),

	initialize: function initialize() {

		var _this = this;
		this.listenTo(App.Services.ProjectCollection.ProjecDetailFloorCollection, 'add', this.addOne);
		this.listenTo(App.Services.ProjectCollection.ProjecDetailFloorCollection, 'reset', this.resetView);

		Backbone.on('floorUserStatus', function (status) {
			_this.status = status;
		}, this);
	},
	setUserData: function setUserData(data) {
		this.userData = data;
	},
	render: function render() {
		this.$el.html(this.template);
		return this;
	},
	addView: function addView(items) {
		var _this = this;
		var view = new App.Services.DetailView.Floor({
			projectId: _this.userData.projectId
		});
		_this.$('.detailContainer .scrollWrapContent').append(view.render(items.toJSON()).el);
		view.toggleProFrom('.accordionDatail');
	},
	addOne: function addOne(model) {
		var $container = this.$('.detailContainer .scrollWrapContent');
		var view = new App.Services.DetailView.Floor({
			model: model
		});
		$container.append(view.render().el);
	},
	resetView: function resetView() {
		this.$('.detailContainer .scrollWrapContent').html("");
	},
	createFloor: function createFloor() {
		var _this = this;
		if (this.status !== 'create') {
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');
			var model = {
				"id": "", //栋号编码
				"pitId": "", //    基坑编码
				"projectId": _this.userData.projectId, //    项目编码
				"buildingName": "", //  栋号名称
				"height": 0, //   高度
				"area": 0, // 面积
				"groundLayers": 0, //   地上层数
				"undergroundLayers": 0, //  地下层数
				"layerHeight": 0, //    层高
				"seismicIntensityId": "6度", //    抗震设防烈度
				"seismicLevelId": "一级", //    抗震等级
				"roofStayWarm": "", //  屋面保温
				"roofStayWarmLev": "A", //    屋面保温防火等级
				"outWallStayWarm": "", //   外墙保温
				"outWallStayWarmLev": "A", // 外墙保温防火等级
				"lowStrainPercentage": 0, //  低应变检测百分比
				"highStrainPercentage": 0, // 高应变检测百分比
				"ultrasonicPercentage": 0, //   超声波检测百分比
				"corebitPercentage": 0, //  钻芯检测百分比
				"outSidedecorationType": "", //   外装方式
				"structureType": "剪力墙结构"
			};

			if (App.Services.ProjectCollection.datas.pitData[0]) {
				model.pitId = App.Services.ProjectCollection.datas.pitData[0].id;
			}
			App.Services.ProjectCollection.ProjecDetailFloorCollection.push(model);

			this.status = 'create';
		} else {
			var $tar = $('.projectFloor .accordionDatail').last();
			if ($tar.hasClass('accordOpen')) {
				$tar.click();
			}
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
	}
});
;/*!/services/views/project/project.detail.pile.es6*/
'use strict';

App.Services.ProjectDetail = App.Services.ProjectDetail || {};

App.Services.ProjectDetail.Pile = Backbone.View.extend({

	tagName: 'div',

	className: 'projectDetail',

	events: {

		'click .save': 'savePile',
		'click .update': 'updatePile',
		'change .txtInput': 'formatValue'

	},

	template: _.templateUrl('/services/tpls/project/project.detail.pile.html'),

	setUserData: function setUserData(data) {
		this.userData = data;
	},
	initialize: function initialize() {
		this.listenTo(App.Services.ProjectCollection.ProjecDetailPileCollection, 'reset', this.resetView);
	},
	render: function render() {
		this.$el.html(this.template({
			isCreate: false,
			soilNails: []
		}));
		return this;
	},
	resetView: function resetView(items) {
		var data = items.data,
		    $container = this.$('.detailContainer .scrollWrapContent');
		this.$el.html(this.template(data));
		$container.html('').append(this.$el);
	},
	formatValue: function formatValue(e) {
		App.Services.ProjectCollection.methods.dataVal(e);
	},
	savePile: function savePile(args, type) {
		if (this.$('.errorInput').length > 0) {
			return;
		}
		var _this = this,
		    _data = [];
		this.$('.txtInput').each(function () {
			var __ = $(this);
			if (type) {
				_data.push({
					id: __.attr('data-id'),
					pileNumber: __.val()
				});
			} else {
				_data.push({
					projectId: _this.userData.projectId,
					pileCode: __.attr('data-code'),
					pileNumber: __.val()
				});
			}
		});
		args = typeof args === 'string' ? args : 'fetchProjectCreatePile';
		App.Comm.ajax({
			URLtype: args,
			type: type || 'post',
			data: JSON.stringify(_data),
			contentType: 'application/json'
		}, function () {
			_this.reloadView();
			$.tip({ message: '新增成功' });
		}).fail(function () {
			//失败提示
		});
	},
	updatePile: function updatePile() {
		this.savePile('fetchProjectUpdatePile', 'put');
	},
	reloadView: function reloadView() {
		var _this = this;
		var collectionPile = App.Services.ProjectCollection.ProjecDetailPileCollection;
		collectionPile.projectId = _this.userData.projectId;
		collectionPile.fetch({
			reset: true,
			success: function success(child, data) {}
		});
	}
});
;/*!/services/views/project/project.detail.section.es6*/
'use strict';

App.Services.ProjectDetail = App.Services.ProjectDetail || {};

App.Services.ProjectDetail.Section = Backbone.View.extend({

	tagName: 'div',

	className: 'projectDetail',

	status: 'read',

	events: {
		'click .createSection': 'createSection'
	},

	template: _.templateUrl('/services/tpls/project/project.detail.section.html', true),

	initialize: function initialize() {
		var _this = this;
		this.listenTo(App.Services.ProjectCollection.ProjecDetailSectionCollection, 'add', this.addOne);
		this.listenTo(App.Services.ProjectCollection.ProjecDetailSectionCollection, 'reset', this.resetView);

		Backbone.on('sectionUserStatus', function (status) {
			_this.status = status;
		}, this);
	},
	setUserData: function setUserData(data) {
		this.userData = data;
	},
	render: function render() {
		this.$el.html(this.template);
		return this;
	},
	addOne: function addOne(model) {
		var $container = this.$('.detailContainer .scrollWrapContent');
		var view = new App.Services.DetailView.Section({
			model: model
		});
		$container.append(view.render().el);
	},
	resetView: function resetView() {
		this.$('.detailContainer .scrollWrapContent').html("");
	},
	createSection: function createSection() {
		var _this = this;
		if (this.status !== 'create') {
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');
			var data = {
				"id": "", //剖面ID
				"pitId": "", //    基坑编码
				"projectId": _this.userData.projectId, //    项目编码
				"profileName": "", //  剖面
				"bracingType": '', //支护类型
				"isAdd": true
			};
			if (App.Services.ProjectCollection.datas.pitData[0]) {
				data.pitId = App.Services.ProjectCollection.datas.pitData[0].id;
			}
			App.Services.ProjectCollection.ProjecDetailSectionCollection.push(data);
			this.status = 'create';
		} else {
			var $tar = $('.projectSection .accordionDatail').last();
			if ($tar.hasClass('accordOpen')) {
				$tar.click();
			}
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
	}
});
;/*!/services/views/project/projects.mappingrule.window.model.js*/
/*
 * @require  services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.MappingRuleWindow = Backbone.View.extend({

    tagName :'div',
    className:"projectMappingRuleWindow",

    template:_.templateUrl("/services/tpls/project/projects.mappingrule.window.model.html"),

    events:{
        "click .windowSubmit":"sure"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.Services.ProjectCollection.ProjectMappingRuleModelCollection,"add",this.addOne);
    },

    //数据加载
    addOne:function(model){
        var newView = new App.Services.MappingRuleWindowDetail({model:model});
        this.$(".projectMappingModelList ul").append(newView.render().el);
        App.Comm.initScroll(this.$el.find(".projectMappingRuleWindow"),"y");
    },


    //确定
    sure : function(){
        var _this = this,
            data,
            templateId  = $(".projectMappingModelList li.active .item").data("id"),
            name = $(".projectMappingModelList li.active .item").text();

        data = {
            URLtype:"modifyProjectMappingRule",
            data:{
                projectId:App.Services.ProjectMappingRuleId,
                templateId:templateId
            },
            type:"PUT"
        };

        App.Comm.ajax(data,function(response){
            console.log(response);
            if(response.code == 0){
                $(".mappingHeader .nameBox").text(name);
            }else{
            }
            App.Services.maskWindow.close();
        });

    },
        //取消
    cancel:function(){
        App.Services.maskWindow.close();
    },
    //关闭
    close:function(){
        App.Services.maskWindow.close();
    }
});


;/*!/services/views/project/projects.mappingrule.window.modeldetail.js*/
/*
 * @require  services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.MappingRuleWindowDetail = Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/services/tpls/project/projects.mappingrule.window.modeldetail.html"),

    events:{
        "click .item":"select"
    },

    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(models){
    },

    //数据加载
    select:function(e){
       var ele = $(e.target).closest("li");
        if(ele.hasClass("active")){
            return
        }
        $(".projectMappingModelList li").removeClass("active");
        ele.addClass("active");
    }
});


;/*!/services/views/system/index.es6*/
"use strict";

//系统 管理入口
App.Services.System = Backbone.View.extend({

	tagName: "div",

	className: "systemContainerBox",

	events: {
		"click .serviceNav .item": "itemClick"
	},

	render: function render() {

		this.$el.html(new App.Services.System.topBar().render().el);

		var $container = this.$el.find('.serviceNav'),
		    tabs = App.Comm.AuthConfig.Service.system,
		    Auth = App.AuthObj.service.sys;

		if (Auth.bizCategary) {
			$container.append(tabs.bizCategary.tab);
		}
		if (Auth.workflow) {
			$container.append(tabs.workflow.tab);
		}
		if (Auth.extendedAttribute) {
			$container.append(tabs.extendedAttribute.tab);
		}

		this.$(".serviceNav .item").eq(0).trigger("click");

		return this;
	},


	//tab 切换
	itemClick: function itemClick(event) {
		var $target = $(event.target),
		    type = $target.data("type"),
		    viewer;
		$target.addClass("selected").siblings().removeClass("selected");

		if (type == "category") {
			//业务类别
			viewer = new App.Services.System.CategoryManager();
		} else if (type == "flow") {
			//流程
			viewer = new App.Services.System.FolwManager();
		} else if (type == "extend") {
			//扩展
			viewer = new App.Services.System.ExtendAttrManager();
		}

		this.$("#systemContainer").html(viewer.render().el);
	}
});
;/*!/services/views/system/category/system.category.index.es6*/
"use strict";

/**
 * @require services/views/system/index.es6
 */

//列别管理
App.Services.System.CategoryManager = Backbone.View.extend({

	tagName: "div",

	className: "categoryManager",

	events: {
		"click .topBar .create": "addNewCategoryDialog"
	},

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.resetList);
	},


	template: _.templateUrl('/services/tpls/system/category/system.category.index.html'),

	render: function render() {

		this.$el.html(this.template);
		this.getList();
		return this;
	},


	//获取数据
	getList: function getList() {
		//重置
		App.Services.SystemCollection.CategoryCollection.reset();
		//获取数据
		App.Services.SystemCollection.CategoryCollection.fetch({ success: function success(models, data) {
				this.$(".textSum .count").text(data.data.items.length);
			} });
	},


	//新增分类 弹出层
	addNewCategoryDialog: function addNewCategoryDialog() {
		var _this = this;

		var dialogHtml = _.templateUrl('/services/tpls/system/category/system.add.category.html')({});

		var opts = {
			title: "新增业务类别",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "addNewCategoryDialog",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.addNewCategory(dialog);
				return false;
			}

		};

		var dialog = new App.Comm.modules.Dialog(opts);
	},


	//新增分类
	addNewCategory: function addNewCategory(dialog) {
		var $addNewCategoryDialog = $(".addNewCategoryDialog"),
		    that = this,
		    title = $addNewCategoryDialog.find(".txtCategoryTitle").val().trim(),
		    desc = $addNewCategoryDialog.find(".txtCategoryDesc").val().trim();

		if (dialog.isSub) {
			return;
		}

		if (!title) {
			alert("请输入分类名称");
			return false;
		}

		if (!desc) {
			alert("请输入分类描述");
			return false;
		}

		var data = {
			URLtype: "servicesAddCategory",
			type: "POST",
			data: {
				busName: title,
				busDesc: desc
			}
		};

		dialog.isSub = true;

		//新增
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				data.data.isAdd = true;
				App.Services.SystemCollection.CategoryCollection.push(data.data);
				dialog.close();
				var $count = that.$(".textSum .count");
				$count.text(+$count.text() + 1);
			}
		});
	},


	//新增后处理
	addOne: function addOne(model) {

		if (this.$el.closest("body").length <= 0) {
			this.remove();
			return;
		}

		//
		var viewr = new App.Services.System.CategoryListDetail({
			model: model
		});

		this.$(".categoryListBody").find(".loading").remove();

		if (model.toJSON().isAdd) {
			this.$(".categoryListBody").prepend(viewr.render().el);
		} else {
			this.$(".categoryListBody").append(viewr.render().el);
		}

		//绑定滚动条		
		App.Comm.initScroll(this.$(".categoryListBodScroll"), "y");
	},


	//重置加载
	resetList: function resetList() {
		this.$(".categoryListBody").html('<li class="loading">正在加载，请稍候……</li>');
	}
});
;/*!/services/views/system/category/system.category.list.detail.es6*/
"use strict";

//列表详情
App.Services.System.CategoryListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	events: {
		"click .btnDel": "delCategory",
		"click .btnUpdate": "updateCategory"
	},

	initialize: function initialize() {
		//this.listenTo(this, "remove", this.removeModel);
		this.listenTo(this.model, "destroy", this.removeModel);
		this.listenTo(this.model, "change", this.render);
	},


	template: _.templateUrl('/services/tpls/system/category/system.category.list.detail.html'),

	render: function render() {
		var data = this.model.toJSON();
		this.$el.html(this.template(data));
		return this;
	},


	//删除
	delCategory: function delCategory(event) {

		var text = _.templateUrl('/services/tpls/system/category/system.category.del.html', true),
		    $target = $(event.target),
		    that = this,
		    opts = {
			width: 284,
			height: 180,
			showTitle: false,
			cssClass: "delConfirm",
			showClose: false,
			isAlert: false,
			isConfirm: false
		},
		    name = $target.closest(".item").find(".name").text().trim();
		msg = "确认要删除" + (name.length > 17 ? name.slice(0, 16) + "..." : name) + "业务类别吗？";

		opts.message = text.replace('#title', msg);
		var confirmDialog = new App.Comm.modules.Dialog(opts);
		this.delCategoryEvent(confirmDialog, $target);
	},

	//删除事件绑定
	delCategoryEvent: function delCategoryEvent(confirmDialog, $target) {
		var that = this;
		//确认删除
		confirmDialog.element.on("click", ".btnEnter", function () {

			var $this = $(this);

			if ($this.hasClass("disabled")) {
				return;
			}

			$this.addClass("disabled").val("删除中");

			var id = $target.data("id"),
			    data = {
				URLtype: "servicesCategoryDel",
				data: {
					id: id
				}
			};

			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {
					that.model.destroy();
					confirmDialog.close();
				}
			});
		});

		//取消 关闭层
		confirmDialog.element.on("click", ".btnCanel", function () {
			confirmDialog.close();
		});
	},


	//更新 category
	updateCategory: function updateCategory(event) {

		var $target = $(event.target),
		    $item = $target.closest(".item"),
		    that = this,
		    data = {
			isEdit: true,
			code: $item.find(".code").text().trim(),
			name: $item.find(".name").text().trim(),
			desc: $item.find(".desc").text().trim()
		};

		var dialogHtml = _.templateUrl('/services/tpls/system/category/system.add.category.html')(data);

		var opts = {
			title: "更新业务类别",
			width: 601,
			height: 380,
			limitHeight: false,
			cssClass: "addNewCategoryDialog",
			message: dialogHtml,
			okCallback: function okCallback() {

				if (dialog.isSubmit) {
					return;
				}

				var data = {
					URLtype: "servicesCategoryUpdate",
					type: "POST",
					data: {
						id: $target.data("id"),
						busCode: dialog.element.find(".txtCategoryCode").val().trim(),
						busName: dialog.element.find(".txtCategoryTitle").val().trim(),
						busDesc: dialog.element.find(".txtCategoryDesc").val().trim()
					}
				};
				dialog.isSubmit = true;
				App.Comm.ajax(data, function (data) {

					if (data.code == 0) {
						that.model.set(data.data);
						dialog.close();
					}
				});

				return false;
			}
		};

		var dialog = new App.Comm.modules.Dialog(opts);
	},


	//移除
	removeModel: function removeModel() {
		//最后一条
		var $parent = this.$el.parent();
		if ($parent.find("li").length <= 1) {
			$parent.append('<li class="loading">无数据</li>');
		}
		this.remove();
	}
});
;/*!/services/views/system/extendAttr/extendatrr.container.es6*/
"use strict";

App.Services.System.ExtendAttrContainer = Backbone.View.extend({

	tagName: "div",

	className: "extendAttrContainer folwContainer",

	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.ExtendAttrCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.ExtendAttrCollection, "reset", this.reset);
	},


	events: {
		"click .topBar .create": "extendAttrAddDialog"
	},

	render: function render() {

		var template = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.container.html');
		this.$el.html(template);
		return this;
	},


	//新增
	addOne: function addOne(model) {

		var view = new App.Services.System.ExtendAttrContainerListDetail({
			model: model
		}),
		    $extendAttrListBody = this.$(".extendAttrListBody");

		$extendAttrListBody.find(".loading").remove();
		//数据
		$extendAttrListBody.append(view.render().el);
		//滚动条
		App.Comm.initScroll(this.$(".extendAttrListBodScroll"), "y");
	},


	//重置
	reset: function reset() {
		this.$(".extendAttrListBody").html('<li class="loading">正在加载，请稍候……</li>');
	},


	//新增流程
	extendAttrAddDialog: function extendAttrAddDialog() {
		var _this = this;

		var dialogHtml = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.add.html')({});

		var opts = {
			title: "新增属性",
			width: 601,
			height: 400,
			isConfirm: false,
			isAlert: true,
			cssClass: "extendAttrAddDialog",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.extendAttrAdd(dialog);
				return false;
			}

		};

		var dialog = new App.Comm.modules.Dialog(opts);

		dialog.element.find(".linkAttrOption").myDropDown({
			zIndex: 10
		});

		dialog.element.find(".attrTypeOption").myDropDown({

			click: function click($item) {
				dialog.element.find(".attrTypeOption").data("type", $item.data("type"));
			}
		});

		dialog.element.find(".linkAttr").myRadioCk({
			click: function click(selected) {
				if (!selected) {
					dialog.element.find(".linkAttrOption .myDropText").addClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").removeClass("disabled");
				} else {
					dialog.element.find(".linkAttrOption .myDropText").removeClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").addClass("disabled");
				}
			}
		});

		var data = {
			URLtype: "extendAttrGetReferene"
		};

		//扩展属性
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				var template = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.add.droplist.html');
				dialog.element.find(".linkAttrOption .myDropList").html(template(data));
			}
		});
	},
	extendAttrAdd: function extendAttrAdd(dialog) {

		var data = {
			URLtype: "extendAttrInsert",
			type: "POST",
			headers: {
				"Content-Type": "application/json"
			}

		},
		    pars = {
			propertyName: dialog.element.find(".txtAttrTitle").val().trim(),
			classKey: $(".extendAttrSliderUl  .item.selected").data("id")
		};

		if (!pars.propertyName) {
			alert("请输入属性名称");
			return;
		}

		if (dialog.element.find(".btnCk").hasClass("selected")) {
			pars.pushType = 0;
			pars.reference = dialog.element.find(".linkAttrOption .myDropText .text").text();
		} else {
			//pars.reference = "";
			pars.pushType = dialog.element.find(".attrTypeOption").data("type");
		}

		data.data = JSON.stringify(pars);

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				App.Services.SystemCollection.ExtendAttrCollection.push(data.data);
				dialog.close();
				var $count = $(".systemContainer .folwContainer .textSum .count");
				$count.text(+$count.text() + 1);
			}
		});
	}
});
;/*!/services/views/system/extendAttr/extendattr.container.detail.es6*/
"use strict";

//列表详情
App.Services.System.ExtendAttrContainerListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	//初始化
	initialize: function initialize() {
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.removeModel);
	},


	events: {
		"click .myIcon-update": "attrUpdate",
		"click .myIcon-del-blue": "attrDel"
	},

	template: _.templateUrl("/services/tpls/system/extendAttr/extend.list.detail.html"),

	render: function render() {

		var data = this.model.toJSON(),
		    html = this.template(data);

		this.$el.html(html).data("classKey", data.classKey).data("property", data.property);

		return this;
	},


	//更新
	attrUpdate: function attrUpdate(event) {
		var _this = this;

		var $item = $(event.target).closest(".item"),
		    data = {
			isEdit: true,
			property: $item.find(".key").text().trim(),
			reference: $item.find(".linkAttr").text().replace("--", "").trim(),
			type: $item.find(".type").text().trim(),
			propertyName: $item.find(".attr").text().trim()
		};

		var dialogHtml = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.add.html')(data);
		var opts = {
			title: "编辑属性",
			width: 601,
			height: 400,
			isConfirm: false,
			isAlert: true,
			cssClass: "extendAttrAddDialog",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.extendAttrUpdate(dialog);
				return false;
			}

		};

		var dialog = new App.Comm.modules.Dialog(opts);

		dialog.classKey = $item.data("classKey");
		dialog.property = $item.data("property");

		dialog.element.find(".linkAttrOption").myDropDown({
			zIndex: 10
		});

		dialog.element.find(".attrTypeOption").myDropDown({

			click: function click($item) {
				dialog.element.find(".attrTypeOption").data("type", $item.data("type"));
			}
		});

		dialog.element.find(".linkAttr").myRadioCk({
			click: function click(selected) {
				if (!selected) {
					dialog.element.find(".linkAttrOption .myDropText").addClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").removeClass("disabled");
				} else {
					dialog.element.find(".linkAttrOption .myDropText").removeClass("disabled");
					dialog.element.find(".attrTypeOption .myDropText").addClass("disabled");
				}
			}
		});
		var data = {
			URLtype: "extendAttrGetReferene"
		};
		//扩展属性
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				var template = _.templateUrl('/services/tpls/system/extendAttr/extend.attr.add.droplist.html');
				dialog.element.find(".linkAttrOption .myDropList").html(template(data));
			}
		});
	},


	//修改
	extendAttrUpdate: function extendAttrUpdate(dialog) {
		var _this2 = this;

		var data = {
			URLtype: "extendAttrUpdate",
			type: "PUT",
			headers: {
				"Content-Type": "application/json"
			}

		},
		    pars = {
			propertyName: dialog.element.find(".txtAttrTitle").val().trim(),
			classKey: dialog.classKey,
			property: dialog.property

		};

		if (!pars.propertyName) {
			alert("请输入属性名称");
			return;
		}

		if (dialog.element.find(".btnCk").hasClass("selected")) {
			pars.pushType = 0;
			pars.reference = dialog.element.find(".linkAttrOption .myDropText .text").text();
		} else {
			//pars.reference = "";
			pars.pushType = dialog.element.find(".attrTypeOption").data("type");
		}

		data.data = JSON.stringify(pars);

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				_this2.model.set(data.data);
				dialog.close();
			}
		});
	},


	//删除
	attrDel: function attrDel(event) {

		var $item = $(event.target).closest(".item"),
		    name = $item.find(".attr").text(),
		    key = $item.find(".key").text(),
		    classKey = $item.data("classKey"),
		    property = $item.data("property"),
		    that = this,
		    msg = "确认删除“" + name + "(" + key + ")" + "”？";

		App.Services.Dialog.alert(msg, function (dialog) {

			var data = {

				URLtype: "extendAttrDel",
				type: "DELETE",
				data: {
					classKey: classKey,
					property: property
				}
			};

			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {
					that.model.destroy();
					dialog.close();
				}
			});
		});
	},


	//销毁
	removeModel: function removeModel() {
		//最后一条
		var $parent = this.$el.parent();
		if ($parent.find("li").length <= 1) {
			$parent.append('<li class="loading">无数据</li>');
		}
		this.remove();
	}
});
;/*!/services/views/system/extendAttr/extendattr.slidebar.detail.es6*/
"use strict";

//slideBar 详情
App.Services.System.extendAttrSlideBarDetail = Backbone.View.extend({

  tagName: "li",

  className: "item",

  events: {
    "click": "clickItem"
  },

  //渲染
  render: function render() {

    var data = this.model.toJSON(),
        html = _.template('<i class="border"></i><%=busName%>(<%=busCode%>)')(data);

    this.$el.html(html).data("id", data.id);

    return this;
  },


  //点击单个
  clickItem: function clickItem(event) {

    var $target = $(event.target).closest(".item"),
        id = $target.data("id");

    $target.addClass("selected").siblings().removeClass("selected");

    App.Services.SystemCollection.ExtendAttrCollection.reset();

    App.Services.SystemCollection.ExtendAttrCollection.classKey = id;

    App.Services.SystemCollection.ExtendAttrCollection.fetch({
      success: function success(models, data) {
        $(".systemContainer .folwContainer .textSum .count").text(data.data.length);
      }
    });
  }
});
;/*!/services/views/system/extendAttr/extendattr.slidebar.es6*/
"use strict";

//流程导航
App.Services.System.ExtendAttrSlideBar = Backbone.View.extend({

	tagName: "div",

	className: "extendAttrSlideBar folwSlideBar",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.reset);
	},
	render: function render() {

		this.$el.html('<ul class="extendAttrSliderUl flowSliderUl"></ul>');

		var that = this;
		//获取数据
		App.Services.SystemCollection.CategoryCollection.reset();
		App.Services.SystemCollection.CategoryCollection.fetch({
			success: function success() {
				var $first = that.$(".flowSliderUl .item:first");

				if ($first.length > 0) {
					$first.click();
				} else {
					$(".folwContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
			}
		});

		return this;
	},


	//新增
	addOne: function addOne(model) {

		var view = new App.Services.System.extendAttrSlideBarDetail({
			model: model
		});

		this.$(".flowSliderUl .loading").remove();

		this.$(".flowSliderUl").append(view.render().el);
	},


	//清空重新加载
	reset: function reset() {
		this.$(".flowSliderUl").html('<li class="loading">正在加载，请稍候……</li>');
	}
});
;/*!/services/views/system/extendAttr/index.es6*/
"use strict";

//流程管理
App.Services.System.ExtendAttrManager = Backbone.View.extend({

	tagName: "div",

	className: "extendAttrManager folwManager",

	//渲染
	render: function render() {
		//渲染
		this.$el.append(new App.Services.System.ExtendAttrSlideBar().render().el);
		this.$el.append(new App.Services.System.ExtendAttrContainer().render().el);
		return this;
	}
});
;/*!/services/views/system/flow/flow.container.es6*/
"use strict";

App.Services.System.FolwContainer = Backbone.View.extend({

	tagName: "div",

	className: "folwContainer",

	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.FlowCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.FlowCollection, "reset", this.reset);
	},


	events: {
		"click .topBar .create": "flowAddDialog"
	},

	render: function render() {

		var template = _.templateUrl('/services/tpls/system/flow/flow.container.html');
		this.$el.html(template);
		return this;
	},


	//新增
	addOne: function addOne(model) {

		var view = new App.Services.System.FolwContainerListDetail({
			model: model
		});

		this.$(".flowListBody .loading").remove();

		this.$(".flowListBody").append(view.render().el);

		App.Comm.initScroll(this.$(".flowListBodScroll"), "y");
	},


	//重置
	reset: function reset() {
		this.$(".flowListBody").html('<li class="loading">正在加载，请稍候……</li>');
	},


	//新增流程
	flowAddDialog: function flowAddDialog() {
		var _this = this;

		var dialogHtml = _.templateUrl('/services/tpls/system/flow/system.add.flow.html')({});

		var opts = {
			title: "新增流程",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "flowAddDialog",
			message: dialogHtml,
			okCallback: function okCallback() {
				_this.folwAdd(dialog);
				return false;
			}

		};

		var dialog = new App.Comm.modules.Dialog(opts);

		dialog.element.find(".ckUrl").myRadioCk({
			click: function click(isCk) {
				if (isCk) {
					$(this).next().removeAttr("readonly").removeClass("disabled");
				} else {
					$(this).next().attr("readonly", true).addClass("disabled");
				}
			}
		});

		dialog.element.find(".starUrl").myRadioCk({
			click: function click(isCk) {
				if (isCk) {
					$(this).next().removeAttr("readonly").removeClass("disabled");
				} else {
					$(this).next().attr("readonly", true).addClass("disabled");
				}
			}
		});
	},
	folwAdd: function folwAdd(dialog) {

		if (dialog.isSubmit) {
			return;
		}

		var data = {
			URLtype: "servicesFlowAdd",
			type: "POST",
			data: {
				busName: dialog.element.find(".txtFlowTitle").val().trim(),
				busViewUrl: dialog.element.find(".txtFlowCkUrl").val().trim(),
				busSendUrl: dialog.element.find(".txtFlowStarUrl").val().trim(),
				categoryId: $("#systemContainer .flowSliderUl .selected").data("id")
			}
		};

		if (!data.data.busName) {
			alert("请输入流程名称");
			return;
		}

		if (dialog.element.find(".ckUrl .selected").length > 0) {

			if (!data.data.busViewUrl) {
				alert("未填查看url");
				return;
			}
		} else {
			data.data.busViewUrl = "";
		}

		if (dialog.element.find(".starUrl .selected").length > 0) {
			if (!data.data.busSendUrl) {
				alert("未填发起url");
				return;
			}
		} else {
			data.data.busSendUrl = "";
		}

		dialog.isSubmit = true;

		//新增
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				$(".folwContainer .flowListBody li:last").find(".myIcon-down-disable").toggleClass("myIcon-down-disable myIcon-down");
				App.Services.SystemCollection.FlowCollection.push(data.data);
				$(".folwContainer .flowListBody li:last").find(".myIcon-down").toggleClass("myIcon-down-disable myIcon-down");
				dialog.close();
				var $count = $(".systemContainer .folwContainer .textSum .count");
				$count.text(+$count.text() + 1);
			}
		});
	}
});
;/*!/services/views/system/flow/flow.container.list.detail.es6*/
"use strict";

//列表详情
App.Services.System.FolwContainerListDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	//初始化
	initialize: function initialize() {
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.removeModel);
	},


	events: {
		"click .myIcon-up": "listMoveUp",
		"click .myIcon-down": "listMoveDown",
		"click .myIcon-update": "updateFolw",
		"click .myIcon-del-blue": "delFolw"

	},

	template: _.templateUrl("/services/tpls/system/flow/flow.container.list.detail.html"),

	render: function render() {

		var data = this.model.toJSON();

		data.index = $("#systemContainer .flowListBody li").length + 1;

		var html = this.template(data);

		this.$el.html(html).data("id", data.id);

		return this;
	},


	//上移
	listMoveUp: function listMoveUp(event) {
		var $target = $(event.target).closest(".item");
		this.listMove($target, "up");
	},


	//上移
	listMoveDown: function listMoveDown(event) {
		var $target = $(event.target).closest(".item");
		this.listMove($target, "down");
	},


	//移动
	listMove: function listMove($target, dirc) {

		var nextId;
		if (dirc == "up") {
			nextId = $target.prev().data("id");
		} else {
			nextId = $target.next().data("id");
		}

		var id = $target.data("id"),
		    that = this,
		    data = {
			URLtype: "servicesFolwMove",
			data: {
				ids: id + "," + nextId,
				type: dirc == 'up' ? 0 : 1
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {

				if (dirc == 'up') {

					$target.addClass("relative").animate({
						top: "-58px"
					}, 500, function () {
						$(this).removeClass("relative").css("top", 0);
					});

					$target.prev().addClass("relative").animate({
						top: "58px"
					}, 500, function () {
						$(this).removeClass("relative").css("top", 0);
						$(this).before($target);
						//移动之后
						that.afterMove();
					});
				} else {
					$target.addClass("relative").animate({
						top: "58px"
					}, 500, function () {
						$(this).removeClass("relative").css("top", 0);
					});

					$target.next().addClass("relative").animate({
						top: "-58px"
					}, 500, function () {
						$(this).removeClass("relative").css("top", 0);
						$(this).after($target);
						//移动之后
						that.afterMove();
					});
				}
			}
		});
	},


	//移动完成之后
	afterMove: function afterMove() {

		var $flowListBodyLi = $("#systemContainer .flowListBody li");
		$flowListBodyLi.find(".myIcon-up-disable").toggleClass("myIcon-up myIcon-up-disable").end().find(".myIcon-down-disable").toggleClass("myIcon-down myIcon-down-disable").end().first().find(".myIcon-up").toggleClass("myIcon-up myIcon-up-disable").end().end().last().find(".myIcon-down").toggleClass("myIcon-down myIcon-down-disable");
		//重新生成 索引
		$flowListBodyLi.each(function (i, item) {
			$(this).find(".code").text(i + 1);
		});
	},


	//更新流程
	updateFolw: function updateFolw(event) {

		var $item = $(event.target).closest(".item"),
		    id = $item.data("id"),
		    that = this,
		    data = {
			id: id,
			busName: $item.find(".name").text().trim(),
			busSendUrl: $item.find(".aStar").text().trim(),
			busViewUrl: $item.find(".aCk").text().trim()
		},
		    dialogHtml = _.templateUrl('/services/tpls/system/flow/system.add.flow.html')(data),
		    opts = {
			title: "编辑流程",
			width: 601,
			isConfirm: false,
			isAlert: true,
			cssClass: "flowAddDialog",
			message: dialogHtml,
			okCallback: function okCallback() {
				that.folwUpdate(dialog, id);
				return false;
			}
		},
		    dialog = new App.Comm.modules.Dialog(opts);

		dialog.element.find(".ckUrl").myRadioCk({
			click: function click(isCk) {
				if (isCk) {
					$(this).next().removeAttr("readonly").removeClass("disabled");
				} else {
					$(this).next().attr("readonly", true).addClass("disabled");
				}
			}
		});

		dialog.element.find(".starUrl").myRadioCk({
			click: function click(isCk) {
				if (isCk) {
					$(this).next().removeAttr("readonly").removeClass("disabled");
				} else {
					$(this).next().attr("readonly", true).addClass("disabled");
				}
			}
		});
	},


	//更新
	folwUpdate: function folwUpdate(dialog, id) {

		if (dialog.isSubmit) {
			return;
		}

		var data = {
			URLtype: "servicesFlowUpdate",
			type: "POST",
			data: {
				id: id,
				busName: dialog.element.find(".txtFlowTitle").val().trim(),
				busViewUrl: dialog.element.find(".txtFlowCkUrl").val().trim(),
				busSendUrl: dialog.element.find(".txtFlowStarUrl").val().trim(),
				categoryId: $("#systemContainer .flowSliderUl .selected").data("id")
			}
		},
		    that = this;

		if (!data.data.busName) {
			alert("请输入流程名称");
			return;
		}

		if (dialog.element.find(".ckUrl .selected").length > 0) {

			if (!data.data.busViewUrl) {
				alert("未填查看url");
				return;
			}
		} else {
			data.data.busViewUrl = "";
		}

		if (dialog.element.find(".starUrl .selected").length > 0) {
			if (!data.data.busSendUrl) {
				alert("未填发起url");
				return;
			}
		} else {
			data.data.busSendUrl = "";
		}

		dialog.isSubmit = true;

		//新增
		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {

				that.model.set(data.data);
				dialog.close();
				that.afterMove();
			}
		});
	},


	//删除
	delFolw: function delFolw() {

		var text = _.templateUrl('/services/tpls/system/category/system.category.del.html', true),
		    $target = $(event.target),
		    that = this,
		    id = $target.closest(".item").data("id"),
		    msg = "确认要删除" + $target.closest(".item").find(".name").text().trim() + "流程吗？";

		//opts.message = text.replace('#title', msg);

		//var confirmDialog = new App.Comm.modules.Dialog(opts);

		App.Services.Dialog.alert(msg, function (dialog) {

			var data = {
				URLtype: "servicesFlowDel",
				data: {
					id: id
				}
			};

			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {

					that.model.destroy();

					dialog.close();
				}
			});
		});

		//this.delFlowEvent(confirmDialog, $target.closest(".item").data("id"));
	},

	//删除时间
	delFlowEvent: function delFlowEvent(confirmDialog, id) {
		var that = this;
		//确认删除
		confirmDialog.element.on("click", ".btnEnter", function () {

			var $this = $(this);

			if ($this.hasClass("disabled")) {
				return;
			}

			$this.addClass("disabled").val("删除中");

			var data = {
				URLtype: "servicesFlowDel",
				data: {
					id: id
				}
			};

			App.Comm.ajax(data, function (data) {
				if (data.code == 0) {

					that.model.destroy();

					confirmDialog.close();
				}
			});
		});

		//取消 关闭层
		confirmDialog.element.on("click", ".btnCanel", function () {
			confirmDialog.close();
		});
	},


	//销毁
	removeModel: function removeModel() {

		var $parent = this.$el.parent();
		if ($parent.find("li").length <= 1) {
			$parent.append('<li class="loading">无数据</li>');
		}

		$parent.find("li").each(function (i, item) {
			$(this).find(".code").text(i + 1);
		});

		//删除
		this.remove();

		//移动过后
		this.afterMove();
	}
});
;/*!/services/views/system/flow/flow.index.es6*/
"use strict";

//流程管理
App.Services.System.FolwManager = Backbone.View.extend({

	tagName: "div",

	className: "folwManager",

	//渲染
	render: function render() {
		//渲染
		this.$el.append(new App.Services.System.FolwSlideBar().render().el);
		this.$el.append(new App.Services.System.FolwContainer().render().el);
		return this;
	}
});
;/*!/services/views/system/flow/flow.slidebar.detail.es6*/
"use strict";

//slideBar 详情
App.Services.System.FolwSlideBarDetail = Backbone.View.extend({

  tagName: "li",

  className: "item",

  events: {
    "click": "clickItem"
  },

  //渲染
  render: function render() {

    var data = this.model.toJSON(),
        html = _.template('<i class="border"></i><%=busName%>(<%=busCode%>)')(data);

    this.$el.html(html).data("id", data.id);

    return this;
  },


  //点击单个
  clickItem: function clickItem(event) {

    var $target = $(event.target).closest(".item"),
        id = $target.data("id");

    $target.addClass("selected").siblings().removeClass("selected");

    App.Services.SystemCollection.FlowCollection.reset();

    App.Services.SystemCollection.FlowCollection.fetch({
      data: { categoryId: id },
      success: function success(models, data) {

        $(".systemContainer .folwContainer .textSum .count").text(data.data.length);
        $(".folwContainer .flowListBody li:last").find(".myIcon-down").toggleClass("myIcon-down-disable myIcon-down");
      }
    });
  }
});
;/*!/services/views/system/flow/flow.slidebar.es6*/
"use strict";

//流程导航
App.Services.System.FolwSlideBar = Backbone.View.extend({

	tagName: "div",

	className: "folwSlideBar",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.reset);
	},
	render: function render() {

		this.$el.html('<ul class="flowSliderUl"></ul>');

		var that = this;
		//获取数据
		App.Services.SystemCollection.CategoryCollection.reset();
		App.Services.SystemCollection.CategoryCollection.fetch({
			success: function success() {
				var $first = that.$(".flowSliderUl .item:first");

				if ($first.length > 0) {
					$first.click();
				} else {
					$(".folwContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
			}
		});

		return this;
	},


	//新增
	addOne: function addOne(model) {

		var view = new App.Services.System.FolwSlideBarDetail({
			model: model
		});

		this.$(".flowSliderUl .loading").remove();

		this.$(".flowSliderUl").append(view.render().el);
	},


	//清空重新加载
	reset: function reset() {
		this.$(".flowSliderUl").html('<li class="loading">正在加载，请稍候……</li>');
	}
});
;/*!/services/views/system/system.topbar.es6*/
"use strict";

/**
 * @require services/views/system/index.es6
 */

//头部
App.Services.System.topBar = Backbone.View.extend({

	tagName: "div",

	className: "systemContainer",

	template: _.templateUrl('/services/tpls/system/system.topbars.html', true),

	render: function render() {

		this.$el.html(this.template);

		return this;
	}
});
;/*!/services/views/workbook/index.es6*/
"use strict";

//WorkBook管理入口
App.Services.WorkBook = Backbone.View.extend({

	tagName: "div",

	render: function render() {
		this.$el.html('WorkBook manager');
		return this;
	}
});