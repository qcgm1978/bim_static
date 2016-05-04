App.Services.addKeyUser = Backbone.View.extend({

  tagName:"div",

  className:"serviceWindow",

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.html"),

  events:{
    "click .windowClose":"close",
    "click #select":"move",
    "click .up":'toUpStep',
    "click .next":'toNextStep',
    "click .confirm":'confirm',
    "click .rightWindow .delete":'remove'
  },

  render:function(step){

    console.log(step);
    this.$el.html(this.template());
    if(step){
      $('.steps .active').removeClass('active');
      if (step == 2){
        $('.steps div').eq(1).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').hide();
        this.$el.find('.next').show();
        this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1,'',function(r){
          console.log(r)

          if(r && !r.code && r.data){
            _.each(r.data.org,function(data,index){
              data.shut = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
      }else{

        $('.steps div').eq(2).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1,'',function(r){
          console.log(r)

          if(r && !r.code && r.data){
            _.each(r.data.org,function(data,index){
              data.shut = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
      }
    }else{
      $('.steps .active').removeClass('active');
      $('.steps div').eq(0).addClass('active');

      this.$el.find('.up').hide();
      this.$el.find('.confirm').hide();
      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);

      App.Services.KeyUser.loadData(App.Services.KeyUser.Step1,'',function(r){
        console.log(r)

        if(r && !r.code && r.data){
          _.each(r.data.org,function(data,index){
            data.shut = true;
            data.canLoad = true;
          });
          App.Services.KeyUser.Step1.set(r.data.org);
        }
      });
    }
    return this;
  },

  //移除已选中的名单
  remove : function(e){
    var $li = $(e.target).parents('li');
    var uid = $li.find('p').attr('data-uid');
    App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid,uid);
    $li.remove();
  },

  //选择人到右边窗口
  move  : function(){
    var $selected = this.$el.find('.toselected');
    var uid = $selected.find('p').attr('data-uid');
    if(_.contains(App.Services.KeyUser.uid,uid)){
      return
    }else{
      App.Services.KeyUser.uid.push(uid);
      var person = $selected.html();
      $selected.removeClass('toselected');
      console.log(person)
      this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>'+person+'</li>')).siblings('p').text("已选成员 ( "+App.Services.KeyUser.uid.length+"个 )");
    }


  },

  //切换步骤页
  toNextStep  : function(){

    var stepNum = $('.steps .active').find('span').text();

    this.render(++stepNum);
  },

  //切换步骤页
  toUpStep  : function(){

    var stepNum = $('.steps .active').find('span').text();

    if(--stepNum == 1){
      this.render();

    }else{
      this.render(stepNum);

    }
  },

  //切换步骤页
  confirm  : function(){

    var stepNum = $('.steps .active').find('span').text();

    this.render(stepNum++);
  },
  //关闭窗口
  close : function(){

    $('.mod-dialog,.mod-dialog-masklayer').hide();

  },


  initialize:function(){
    //this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
  }

});