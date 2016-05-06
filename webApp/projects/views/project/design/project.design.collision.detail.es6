
//设计属性 碰撞
App.Project.DesignCollisionDetail=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

  events:{
    "click tr":"setCollisionPoint",
    "click .prePage":"prePage",
    "click .nextPage":"nextPage",
    "click .viewSetting":"showSetting",
    "click .export":"download"
  },

	template:_.templateUrl("/projects/tpls/project/design/project.design.collision.detail.html"),

  initialize:function(){
    this.listenTo(App.Project.DesignAttr.CollisionTaskDetail,"add",this.addCollisionDetail);
  },

  render:function(){
    this.$el.html("");
    return this;
  },

  addCollisionDetail:function(model){
    // 加载碰撞点列表
    var data=model.toJSON();
    if(data.message=="success"){
      var pageIndex = data.data.pageIndex,
          pageCount = data.data.pageCount;
      this.list = data.data.items;
      this.prePage = pageIndex - 1
      this.nextPage = pageIndex + 1;
    }
    this.$el.html(this.template(data))
    return this;
  },

  setCollisionPoint:function(event){
    var that = $(event.target).closest("tr"),
        name = that.find(".ckName").text();
    $.each(this.list,function(index,item){
      if(item.name == name){
        var ids = {
              type:"userId",
              ids:[item.leftId,item.rightId]
            },
            box=[item.leftElementBoxMin,item.leftElementBoxMax,item.rightElementBoxMin,item.rightElementBoxMax];
        App.Project.Settings.Viewer.selectIds(ids);
        App.Project.Settings.Viewer.setGlobalTransparent(true);
        $(".bar-opacity").addClass('selected');
        App.Project.Settings.Viewer.zoomBox(box);
      }
    });
    that.toggleClass("selected").siblings().removeClass("selected");
  },

  prePage:function(event){
    var that = $(event.target);
    if(that.is('.disabled')){
      return false;
    }else{
      App.Project.DesignAttr.CollisionTaskDetail.pageNo = this.prePage;
      App.Project.DesignAttr.CollisionTaskDetail.fetch();
    }
  },

  nextPage:function(event){
    var that = $(event.target);
    if(that.is('.disabled')){
      return false;
    }else{
      App.Project.DesignAttr.CollisionTaskDetail.pageNo = this.nextPage;
      App.Project.DesignAttr.CollisionTaskDetail.fetch();
    }
  },

  showSetting:function(){
    var that = this;
    var dialog = new App.Comm.modules.Dialog({
      width: 580,
      height:360,
      limitHeight: false,
      title: '碰撞检查设置',
      cssClass: 'task-create-dialog',
      message: "",
      okText: '确&nbsp;&nbsp;认',
      readyFn:function(){
        this.element.find(".content").html(new App.Project.ProjectViewSetting().render().el);
        App.Project.DesignAttr.CollisionSetting.projectId = App.Project.Settings.projectId;
        App.Project.DesignAttr.CollisionSetting.projectVersionId = App.Project.Settings.CurrentVersion.id;
        App.Project.DesignAttr.CollisionSetting.collision = App.Project.Settings.collisionId;
        App.Project.DesignAttr.CollisionSetting.fetch();
      }
    })
  },
  download:function(){
    window.open("/model/"+App.Project.Settings.collisionId+"/"+App.Project.Settings.collisionId+"_ClashReport.xls","下载")
  }
});


