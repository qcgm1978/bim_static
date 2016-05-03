/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleDetail=Backbone.View.extend({
    tagName:'li',

    template:_.templateUrl("/services/tpls/auth/role/services.role.detail.html"),
    events:{
        "click .modify":"modify",
        "click .delete":"delete"
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
        //框架
        var frame = new App.Services.roleWindowIndex().render().el;
        $(".mod-dialog-masklayer").hide();

        //初始化窗口
        App.Services.batchAwardWindow = new App.Comm.modules.Dialog({
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


        //加载功能，给已角色有的功能选择状态
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


        });
    },

    delete:function(){
        //删除需判断状态，由什么来判断？
        App.Services.role.collection.remove(this.model);
        App.Services.role.collection.save();
    }
});




