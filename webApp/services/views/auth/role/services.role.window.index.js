/*
 * @require  /services/collections/auth/member/role.list.js
 */
App.Services.roleWindowIndex = Backbone.View.extend({

    tagName:"div",
    className:"seWinBody",
    template:_.templateUrl("/services/tpls/auth/windows/services.role.window.index.html"),
    events:{
        "click .windowSubmit":"windowSubmit"
    },
    render:function(){
        this.$el.html(this.template());
        return this;
    },
    //验证
    initialize:function(){
        this.listenTo(App.Services.roleFun.collection,"add",this.addOne);
        this.listenTo(App.Services.roleFun.collection,"reset",this.render);
    },
    addOne:function(item){
        var newView = new App.Services.roleWindowFunDetail({model:item});
        this.$("#funList").append(newView.render().el);
    },

    //提交表单，完毕会触发角色列表的更新change
    windowSubmit:function(){

        if(!App.Services.roleModify){ //新增
            this.newRole();
        }else{
            this.modify();//修改
        }
    },
    //修改
    modify:function(){
        var seleFun = this.filterChecked();
        if(!seleFun.length){alert("请选择功能");return}

        var roleId =App.Services.roleModify.get("roleId");
        var cid = App.Services.roleModify.get("cid");
        var checked = App.Services.roleFun.collection.filter(function(item){
            return item.get("checked");
        });

        var url = "http://bim.wanda-dev.cn/platform/auth/role/"+ roleId +"/function?functionId=";

        for(var i = 0 ; i < seleFun.length ; i++){
            if(i !== seleFun.length -1){
                url = url + seleFun[i].get("id") + ",";
            }else{
                url = url + seleFun[i].get("id");
            }
        }

        $.ajax({
            type:"POST",
            url:url,
            success:function(response){
                var cid = App.Services.roleModify.cid;
                App.Services.role.collection.get(cid).set(response.data);
                //查找collection，更新

                App.Services.maskWindow.close();
            },
            error:function(type){
                alert(type.statusText + "： " +type.status  );
                App.Services.maskWindow.close();
            }
        });

    },

    //新增
    newRole :function(){
        //新增角色  fetchServicesNewRole
        var name  = $("#selectedRoleName").val();
        if(!name){alert("请填写角色名！");return;}
        var newRole = {"name":name, "functionId":[]};

        //已选功能列表
        var seleFun = this.filterChecked();
        if(!seleFun.length){alert("请选择功能");return}

        _.each(seleFun,function(item){
            newRole.functionId.push(item.get("id"));
        });

        //保存数据
        var roleModel = Backbone.Model.extend({
            default:{},
            urlType: "fetchServicesNewRole"
        });
        App.Services.newRoleModel =  new roleModel(newRole);

        App.Services.newRoleModel.save("create",{
            success:function(collection, response, options){
                //成功创建的的角色添加的collection中
                App.Services.role.collection.add(response.data);
                //关闭窗口
                App.Services.maskWindow.close();
            },
            //错误处理
            error:function(){

            }
        });
    },
    //过滤和辨别功能列表项
    filterChecked:function(){
        return App.Services.roleFun.collection.filter(function(item){
            return item.get("checked");
        });
    }
});
