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
//��ȡ������֯�б�
App.Services.memOz = '';
App.Services.searchOrg = function (pre){
        var text = App.Services.memOz;
        var father = pre.closest(".childOz").siblings("div").find(".ozName");//����Ķ���ڵ�
        var li = father.closest("ul").closest("li");
        if(!li.length){return}
        var span = father.find("span");
        App.Services.memOz = span.html()  + " > "  + text;
        return App.Services.searchOrg(span);
    };

//���й���
App.Services.queue = {
    que : [],
    permit : true,
    present : [],
    //���֤���ţ�400ms�󷢷�һ�����֤������������
    certificates:function(){
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },400);
    },
    //��֤����������ִ�к���
    promise:function(fn,_this){
        if(!this.permit){ return;}
        if(!this.que.length){//û��ֱ�����
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
    //ִ����ϣ�ˢ�¶��У�ִ����һ��
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};
//��Ա-��ɫ-��ʾ��Ϣ
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
//���...����
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

//ʹ��
//App.Services.createNode.init
//App.Services.createNode.trigger(arr,includeUsers);
App.Services.memSearchParentOz = {
    count : null,
    trigger :function(arr,includeUsers){
        var _this = this,preOg = null; //Ҫд���Ԫ��

        if(!this.count){//����㼶����û�кľ������һ������includeUsers?�Ҳ൥������
            includeUsers = true;
        }
        $.ajax({
            url:App.API.URL.fetchServicesMemberOuterList + "&parentId=" + arr[_this.count].id  + "&includeUsers=" + includeUsers ,
            type:'GET',
            data : '',
            success:function(res){
                //Ҫ�ж����ⲿ�����ڲ���Ҫ���ҵ�ǰ����֯id�������뵽��Ӧ��λ��
                if(res.data && res.data.length){
                    var tree = App.Services.tree(res.data);
                    if(_this.count == 0){   //�Ƕ�����֯����Ԫ�ص���inner��outer������Ƕ�������˲���id��ͬ��Ψһ��֯
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
                //���滹�м�������
                if(_this.count < arr.length){
                    App.Services.memSearchParentOz.trigger(arr,includeUsers);//���������ӽڵ�
                    _this.count++;
                }else{
                    //������������¼�������
                    if(_this.count == 1){
                        var father = _.filter($(".ozName"),function(item){
                            return parseInt($(item).attr("data-id")) == arr[1].id
                        });
                        father[0].click();
                    }
                    _this.count = 0; //����
                }
            }
        })
    },
    //������
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
        //����
        for (var i = 0; i < arr.length; i++) {
            if(arr[i]){
                var li = $("<li class='search_result' data-code='"+JSON.stringify(arr[i]) +"'>"+arr[i].name + '��'+ (arr[i].parentname || '����֯')+ '��'+'</li>');
                $(frag).append(li);
            }
        }
        return frag;
    }
};

