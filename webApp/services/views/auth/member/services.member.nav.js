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

    searchEnd:function(e){
        var ele = e.target || e.srcElement;
        this.texter = false;
    },

    searchStart:function(e){
        var ele = e.target || e.srcElement;
        this.texter = true;
    },
    //搜索模块
    search:function(e){
        var ele = e.target || e.srcElement;
        if(!this.texter){return}
        console.log(e.keyCode);

        if((e.keyCode > 47 && e.keyCode  < 91) || e.keyCode == 8 || e.keyCode == 32 || e.keyCode == 13 || (e.keyCode  < 112 && e.keyCode >95)){ //字母 退格 空格 回车 小键盘
            var content = $(ele).val();
            $.ajax({
                url:App.API.URL.searchServicesMember + content ,   //App.API.URL.searchServicesMember
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
        if(chosenOz){
            var pre = JSON.parse(chosenOz);
            App.Services.MemberType = !pre.outer ? "inner" : "outer";//切换外部/内部状态
            var parentCode = {
                id : pre.id,
                outer:pre.outer,
                type:chosenOz.type
            };

            $.ajax({
                url: App.API.URL.searchServicesMemberResult,
                type:'GET',
                data : parentCode,
                success:function(res){
                    if(res.data && res.data.length){


                        //获取直接父项列表，用于右侧展示 //先获取再点击左侧
                        _this.getFurtherData(parentCode.id);  //父项id错误！


                        //获取其他层级
                        if(res.data.length != 1){ //当存在父项组织时
                            App.Services.memSearchParentOz.init(res.data);
                            App.Services.memSearchParentOz.trigger(res.data,false);
                        }
                    }else{
                        //无结果
                    }
                },
                error:function(e){
                }
            })
        }
    },
    //取得搜索结果直接父项列表
    getFurtherData:function(furtherId){
        $(".servicesMemScrollContent").addClass("services_loading");
        //区分内部还是外部用户
        var collection = App.Services.MemberType == "inner" ? App.Services.Member.innerCollection : App.Services.Member.outerCollection,  //内部还是外部需要传入参数
            data = {
                parentId : furtherId,
                outer : App.Services.MemberType != "inner",
                includeUsers : true
            };

        App.Services.Member.loadData(collection,data,function(res){
            console.log(collection);
            //重新排序结果，设置为用户在前
            //设置内容为已选，此处需要传入搜索结果当前用户id
            $(".servicesMemScrollContent").removeClass("services_loading");
        });
    }
});
