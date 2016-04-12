
//设计属性 碰撞
App.Project.DesignCollisionDetail=Backbone.View.extend({

	tagName:"div",

	className:"designCollision",

  events:{
    "click tr":"setCollisionPoint",
    "click .prePage":"prePage",
    "click .nextPage":"nextPage"
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
    if(data.data){
      this.list = data.data.list;
    }
    if(data.message=="success"){
      this.prePage = data.data.page.prePage;
      this.nextPage = data.data.page.nextPage;
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
        App.Project.Settings.Viewer.highlight(ids);
        App.Project.Settings.Viewer.zoomBox(box);
      }
    })
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
  }
});


