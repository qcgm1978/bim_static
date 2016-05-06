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
        "click .proe .edit":'projedit'

    },

    render:function(){

        //准备多个Collection的MODELS
        var datas={
            keyUser : App.Services.KeyUser.KeyUserList.toJSON() || [],

        };
        this.$el.html(this.template(datas));
        return this;
    },

    //切换active状态
    toggleClass:function(e){
        $(e.target).toggleClass('active').siblings().removeClass('active');
        new App.Services.userinfo().render();
        //App.Services.KeyUser.userinfo.set(App.Services.KeyUser.fakedata);
    },

    //提交表单，完毕会触发重新获取列表，列表为memBlend所属列表
    newKeyUser:function(){
        App.Services.maskWindow=new App.Comm.modules.Dialog({title:'新增关键用户',width:600,height:500,isConfirm:false});
        $('.mod-dialog .wrapper').html(new App.Services.addKeyUser().render().el);
        console.log($('.mod-dialog .content'))
    },

    //编辑项目权限
    projedit:function(){
        alert('gg')
    },

    add:function(){
       this.render()
    },

    //userinfo
    userinfo:function(){

    },

    initialize:function(){
        App.Comm.ajax({URLtype:'fetchProjects'},function(r){
            console.log(r)

            if(r && !r.code && r.data){
                _.each(r.data.items,function(data,index){

                });
                App.Services.KeyUser.projects=r.data.items;
            }
        });

        this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add);
        this.listenTo(App.Services.KeyUser.userinfo,'add',this.userinfo);
    }
});

