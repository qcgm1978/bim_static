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
    var is = $("<i style='width: 15px'>...</i>");
    var arr = [];
    _.each(span,function(item){
        arr.push($(item).width() + parseInt($(item).css("padding-left")) + parseInt($(item).css("margin-left")));
    });
    if(arr.length){
        var allWidth = 0 , n = null;
        for(var i = 0 ; i < arr.length ; i ++){
            allWidth  = allWidth + arr[i];
        }
        if(allWidth > cwidth && !_this.$(".roles i").length){
            span.eq(n).before(is);
        }
    }
};
