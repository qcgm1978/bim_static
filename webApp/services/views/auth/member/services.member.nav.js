/*
 * @require  /services/views/auth/member/services.member.ozList.js
 */

App.Services.MemberNav=Backbone.View.extend({

    tagName :'div',

    template:_.templateUrl("/services/tpls/auth/member/services.member.nav.html"),
    events:{
        "click #outer":'outer',
        "click #inner":'inner',
        " .searchContent":"search",
        "click .search_result":"chooseOrg"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
        //默认根据角色权限加载  adm用户加载全部，keyMem用户只显示项目管理.
        Backbone.on("serviceMemberTopSelectStatus",this.serviceMemberTopSelectStatus,this);
        Backbone.on("serviceMemberResetSearchContent",this.serviceMemberResetSearchContent,this)
    },
    //清除搜索内容
    serviceMemberResetSearchContent:function(){

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
    search:function(url,fn){

    },
    //选择搜索
    chooseOrg:function(e){
        var _this = this;
        var ele = e.target || e.srcElement;
        var chosenOz = $(ele).attr("data-code");
        //查看外部还是内部，递归查找上级，保证ajax完成后再执行查找
        $.ajax({
            url:'',
            type:'',
            data:'',
            success:function(res){

            }
        });
    }
});
