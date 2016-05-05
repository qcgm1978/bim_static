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
        this.listenTo(this.model, 'change', this.render);
        this.$el.hover(function(){$(this).addClass("active");},function(){$(this).removeClass("active")});
    },

    modify:function(){

        App.Services.roleModify = this.model;

        this.window();
        this.recognize();
        //加载功能，给已角色有的功能选择状态

    },

    //区分修改与浏览
    recognize:function( fn){
        var _this = this;
        var data = {};
        App.Services.roleFun.loadData(data,function(){
            $("#selectedRoleName").val(_this.model.get("name")).attr("disabled","disabled"); //暂时写入
            var func = _this.model.get("functions");
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
        });
    },


    explorer:function(){
        this.window();
        this.recognize(function(){
            //隐藏可选项
            $(".memCheck").hide();
            $(".seWinBody .func li .name span.rohead ").hide();
        });

    },


    //弹窗
    window:function(){
        var frame = new App.Services.roleWindowIndex().render().el;
        //初始化窗口
        App.Services.maskWindow = new App.Comm.modules.Dialog({
            title:"新建角色",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            okCallback:function(){},
            cancelCallback:function(){},
            closeCallback:function(){},
            message:frame
        });
    },

    delete:function(){



        var frame = new App.Services.windowAlert().render().el;

        App.Services.deleteRoleInfo = this.model;//将model携带至弹窗view

        App.Services.alertWindow = new App.Comm.modules.Dialog({
            title:"",
            width:280,
            height:180,
            isConfirm:false,
            isAlert:false,
            message:frame
        });
        $(".mod-dialog .wrapper .header").hide();


    },

    alertWindow:function(){



    }
});




