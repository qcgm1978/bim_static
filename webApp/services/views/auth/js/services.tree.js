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

//���й���
App.Services.queue = {
    que : [],
    permit : true,
    present : [],
    //���֤���ţ�300ms�󷢷�һ�����֤������������
    certificates:function(){
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },100);
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

        if(this.que.length > 1){
            this.que.pop();
            this.present.pop();
        }
        this.present.push(_this);
        this.que.push(fn);
        this.certificates();
    },
    //ִ����ϣ�ˢ�¶��У�ִ����һ��
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};


//ͬ�����У�ע�ⲻ����Ӧ��ͬ���������ҳ�����
/*
App.Services.queue = {
    queue:[],

    running: false,

    present:0,

    promise: 200,

    //�������
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

    //���н���
    end:function(){
        App.Services.queue.queue.shift(0);
},
    //����ֹͣ
    stop:function(){

    },
    //����ȡ����������������ڶ���������ִ��
    cancel:function(){
        this.queue.pop(-1);
    }
};*/
