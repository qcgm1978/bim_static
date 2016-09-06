/*
 * @require  /services/views/auth/member/services.member.list.js
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
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },400);
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

//使用
//App.Services.createNode.init
//App.Services.createNode.trigger(arr,includeUsers);
App.Services.memSearchParentOz = {
    count : null,
    trigger :function(arr,includeUsers){
        var _this = this,preOg = null; //要写入的元素

        if(!this.count){//如果层级数组没有耗尽，最后一个包含includeUsers?右侧单独处理
            includeUsers = true;
        }
        $.ajax({
            url:App.API.URL.fetchServicesMemberOuterList + "&parentId=" + arr[_this.count].id  + "&includeUsers=" + includeUsers ,
            type:'GET',
            data : '',
            success:function(res){
                //要判断是外部还是内部，要查找当前的组织id，并插入到相应的位置
                if(res.data && res.data.length){
                    var tree = App.Services.tree(res.data);
                    if(_this.count == 0){   //是顶层组织，则元素等于inner或outer，如果非顶层则过滤查找id相同的唯一组织
                        if(!arr[_this.count].outer){
                            preOg = $("#inner").siblings(".childOz");
                        }else{
                            preOg = $("#outer").siblings(".childOz");
                        }
                    }else{
                        var container = _.filter($(".ozName"),function(item){
                            return parseInt($(item).attr("data-id")) == arr[_this.count].id
                        });
                        preOg = container[0].siblings(".childOz");
                    }
                    preOg.html(tree)
                }
                //后面还有继续请求
                if(_this.count < arr.length){
                    App.Services.memSearchParentOz.trigger(arr,includeUsers);//继续请求子节点
                    _this.count++;
                }else{
                    //触发点击父项事件，查找
                    if(_this.count == 1){
                        var father = _.filter($(".ozName"),function(item){
                            return parseInt($(item).attr("data-id")) == arr[1].id
                        });
                        father[0].click();
                    }
                    _this.count = 0; //重置
                }
            }
        })
    },
    //倒计数
    init:function(arr){
        this.count = 0;
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

