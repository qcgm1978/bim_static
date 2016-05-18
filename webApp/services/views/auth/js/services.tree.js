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
    }
    return ele;
};

//队列管理
App.Services.queue = {
    que : [],
    permit : true,
    present : [],
    //许可证发放，300ms后发放一个许可证，避免点击过快
    certificates:function(){
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },100);
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

        if(this.que.length > 1){
            this.que.pop();
            this.present.pop();
        }
        this.present.push(_this);
        this.que.push(fn);
        this.certificates();
    },
    //执行完毕，刷新队列，执行下一个
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};


//同级队列，注意不能响应非同级，会造成页面混乱
/*
App.Services.queue = {
    queue:[],

    running: false,

    present:0,

    promise: 200,

    //添加运行
    join:function(ev){
        if(this.queue.length == 1){
            this.run(this.end);
            return
        }
        if(this.queue.length == 2){
            this.queue.pop(1);
        }
        this.queue.push(ev);
    },

    run:function(callback){
        this.queue[0](callback);
        this.present = this.present + 1;
    },

    //运行结束
    end:function(){
        App.Services.queue.queue.shift(0);
},
    //运行停止
    stop:function(){

    },
    //运行取消，点击第三个，第二个将不再执行
    cancel:function(){
        this.queue.pop(-1);
    }
};*/
