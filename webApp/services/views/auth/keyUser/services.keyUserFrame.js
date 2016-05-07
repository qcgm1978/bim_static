/**
 * @require /services/collections/auth/keyuser/keyuser.js
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
            keyUser : App.Services.KeyUser.KeyUserList.toJSON() || [],

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
                console.log(data)
                App.Services.KeyUser.fakedata=data.data;
                App.Services.KeyUser.editpid=_.pluck(data.data.project,'id');
                App.Services.KeyUser.editorgId=_.pluck(data.data.org,'orgId');
                new App.Services.userinfo().render();

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

        App.Services.maskWindow=new App.Comm.modules.Dialog({
            title:'确认要删除关键用户“'+username+'”？',
            width:280,
            message:'删除该关键用户后，该用户将不能继续管理项目',
            height:180,
            isConfirm:true,
            okCallback:function(){
                var data={
                    URLtype :"fetchServiceKeyUserDelete",
                    type:"DELETE",
                    data:JSON.stringify({uid : uid})

                    //contentType:"application/json"
                };
                App.Comm.ajax(data,function(data){
                    if (data.code==0) {
                        $li.remove();
                        $('.mod-dialog,.mod-dialog-masklayer').hide();
                        $usernum.text($usernum.text()-1);
                    }

                });
            },
            cancelCallback:function(){
                $('.mod-dialog,.mod-dialog-masklayer').hide();
            }

        });


    },



    //userinfo
    userinfo:function(){

    },

    initialize:function(){


        this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.render);
        this.listenTo(App.Services.KeyUser.userinfo,'add',this.userinfo);
    }
});

