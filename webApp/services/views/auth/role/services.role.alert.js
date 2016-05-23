/*
 * @require  /services/views/auth/member/services.member.ozDetail.js
 * */
App.Services.windowAlert = Backbone.View.extend({

    tagName :'div',
    className:"servicesAlert",

    template:_.templateUrl("/services/tpls/auth/windows/services.window.alert.html"),

    events:{
        "click #servicesSure":"sure",
        "click #servicesCancel":"cancel",
        "click #servicesClose":"close"
    },

    render:function(sure){
        this.$el.html(this.template());
        sure && (this.flag = sure);
        return this;
    },

    initialize:function(models){

    },

    //确定
    sure : function(){
        if(this.flag){
            return this.flag();
        }
        $(".serviceBody .roleCtrl").addClass("services_loading");
        var _thisModel = App.Services.deleteRoleInfo,roleId = _thisModel.get("roleId")+'';

        $.ajax({
            url:"http://bim.wanda-dev.cn/platform/auth/role?roleId=" +roleId,
            type:"DELETE",
            success:function(response){
                 if(response.code==0){
                    if(response.data.success[0] == roleId){  //删除成功
                        App.Services.role.collection.remove(_thisModel);
                        App.Services.alertWindow.close();
                        return
                    }
                     if(response.data.failure[0] ==roleId){ //删除失败
                         $(".servicesAlert .confirm").hide();
                         $(".servicesAlert .alertRole").show();
                         if(response.data.failure[0] == 999999){
                             $(".alertInfo").html("您无权删除管理员！");
                         }else if(response.data.failure[0] == 999998){
                             $(".alertInfo").html("该角色为关键用户，无法删除！");
                         }else{
                             $(".alertInfo").html("该角色已被使用，无法删除！");
                         }

                     }
                }

                $(".serviceBody .roleCtrl").removeClass("services_loading");
                App.Services.deleteRoleInfo ="";//清理
            },
            error:function(error){
                $(".serviceBody .roleCtrl").removeClass("services_loading");
                alert("错误类型"+ error.status +"，无法成功删除!");
                App.Services.alertWindow.close();
            }
        });


        /*App.Comm.ajax(dataObj,function(response){
            if(response.code==18005){
                $(".servicesAlert .confirm").hide();
                $(".servicesAlert .alert").show();
                $(".alertInfo").html("该角色已被使用，无法删除");
                //该角色已被使用，无法删除
            }else if(response.code==18006){
                $(".alertInfo").html("权限无法删除");
                //权限无法删除，如管理员、关键用户(隐藏角色)
            }else if(response.code==0 && response.data.success[0] == id){
                //删除成功不提示,，但有删除状态
                App.Services.role.collection.remove(_this.model);
                App.Services.alertWindow.close();
            }
            App.Services.deleteRoleInfo ="";//清理
        });
        _thisModel.destroy(data,
            function(model,response,option){
                if(response.code==18005){
                    $(".servicesAlert .confirm").hide();
                    $(".servicesAlert .alert").show();
                    $(".alertInfo").html("该角色已被使用，无法删除");
                    //该角色已被使用，无法删除
                }else if(response.code==18006){
                    $(".alertInfo").html("权限无法删除");
                    //权限无法删除，如管理员、关键用户(隐藏角色)
                }else if(response.code==0 && response.data.success[0] == id){
                    //删除成功不提示,，但有删除状态
                    App.Services.role.collection.remove(_this.model);
                    App.Services.alertWindow.close();
                }
                App.Services.deleteRoleInfo ="";//清理
            }
        );*/
    },
        //取消
    cancel:function(){
        App.Services.alertWindow.close();
    },
    //关闭
    close:function(){
        App.Services.alertWindow.close();
    }
});

