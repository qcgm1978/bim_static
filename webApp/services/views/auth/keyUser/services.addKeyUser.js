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
    "click .rightWindow .delete":'remove',
    "click .rightWindow .proj-remove":'remove2',

  },

  render:function(step){

    console.log(step);
    this.$el.html(this.template());
    if(step){
      $('.steps .active').removeClass('active');
      if (step == 2){
        if(App.Services.KeyUser.html2[0]){
          $('.rightWindow').html(App.Services.KeyUser.html2[0]);
          $('.rightWindow').siblings('p').text("已选项目 ( "+App.Services.KeyUser.pid.length+"个 )");
        }else{
          $('.rightWindow').siblings('p').text("已选项目 ( 0个 )");

        }
        $('.steps div').eq(1).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').hide();
        this.$el.find('.next').show();
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step2,'',function(r){
          console.log(r)

          if(r && !r.code && r.data){
            _.each(r.data.items,function(data,index){
              data.shut = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step2.set(r.data.items);
          }
        });
      }else{
        //step3
        $('.rightWindow').siblings('p').text("已选部门");
        if(App.Services.KeyUser.html3[0]){
          $('.rightWindow').html(App.Services.KeyUser.html3[0]);
        }
        $('.steps div').eq(2).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step1().render('step3').el);
        this.$el.find('.leftWindow').append(new App.Services.step3().render().el);

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
        App.Services.KeyUser.loadData(App.Services.KeyUser.Step3,'',function(r){
          console.log(r)

          if(r && !r.code && r.data){
            _.each(r.data.org,function(data,index){
              data.shut = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step3.set(r.data.org);
          }
        });
      }
    }else{
      $('.steps .active').removeClass('active');
      $('.steps div').eq(0).addClass('active');
      if(App.Services.KeyUser.html[0]){
        $('.rightWindow').html(App.Services.KeyUser.html[0]);
        $('.rightWindow').siblings('p').text("已选成员 ( "+App.Services.KeyUser.uid.length+"个 )");
      }else{
        $('.rightWindow').siblings('p').text("已选项目 ( 0个 )");

      }
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

    var stepNum = $('.steps .active').find('span').text();

    if(stepNum==3){
      //step3移除已选中的名单

      var $li = $(e.target).parents('li');
      var orgId = $li.find('p').attr('data-id');
      App.Services.KeyUser.orgId = _.without(App.Services.KeyUser.orgId,orgId);
      $li.remove();

    }else{
      //step1移除已选中的名单

      var $li = $(e.target).parents('li');
      var uid = $li.find('p').attr('data-uid');
      App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid,uid);
      $li.remove();
      $('.rightWindow').siblings('p').text("已选成员 ( "+App.Services.KeyUser.uid.length+"个 )");
    }

  },

  //step2移除已选中的名单
  remove2 : function(e){
    var $li = $(e.target).parent();
    var pid = $li.attr('data-id');
    $('.leftWindow').find('li[data-id='+pid+']').removeClass('selected-proj');
    App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid,pid);
    $li.remove();
    $('.rightWindow').siblings('p').text("已选项目 ( "+$(".rightWindow li").length+"个 )");
  },

  //选择人到右边窗口
  move  : function(){
    var str = '',stepNum = $('.steps .active').find('span').text();

    if(stepNum==2){
      this.$el.find('.leftWindow .selected-proj').each(function(el){
        var pid = $(this).attr('data-id');
        if(_.contains(App.Services.KeyUser.pid,pid)){
          return
        }else{
          App.Services.KeyUser.pid.push(pid);

          str+="<li class='proj-right' data-id="+pid+"><i class='proj-remove'></i>"+$(this).html();

        }
      })
      this.$el.find('.rightWindow div').append(str);
      $('.rightWindow').siblings('p').text("已选成员 ( "+$(".rightWindow li").length+"个 )");

    }else if(stepNum==3){
      var $selected = this.$el.find('.toselected');
      var orgId = $selected.find('p').attr('data-id');
      if(_.contains(App.Services.KeyUser.orgId,orgId)){
        return
      }else{
        App.Services.KeyUser.orgId.push(orgId);
        var person = $selected.html();
        $selected.removeClass('toselected');
        console.log(person)
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>'+person+'</li>'));
      }

    }else{
      var $selected = this.$el.find('.toselected');
      var uid = $selected.find('p').attr('data-uid');
      if(_.contains(App.Services.KeyUser.uid,uid)){
        return
      }else{
        App.Services.KeyUser.uid.push(uid);
        var person = $selected.html();
        $selected.removeClass('toselected');
        console.log(person)
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>'+person+'</li>')).parent().siblings('p').text("已选成员 ( "+App.Services.KeyUser.uid.length+"个 )");
      }
    }



  },

  //切换步骤页
  toNextStep  : function(){

    var stepNum = $('.steps .active').find('span').text();
    if(stepNum == 1){
      App.Services.KeyUser.html[0] = $('.rightWindow').html();
    }else{
      App.Services.KeyUser.html2[0] = $('.rightWindow').html();

    }
    this.render(++stepNum);
  },

  //切换步骤页
  toUpStep  : function(){

    var stepNum = $('.steps .active').find('span').text();

    if(--stepNum == 1){
      App.Services.KeyUser.html2[0] = $('.rightWindow').html();
      this.render();

    }else{
      App.Services.KeyUser.html3[0] = $('.rightWindow').html();
      this.render(stepNum);

    }
  },

  //切换步骤页
  confirm  : function(){
    var data = {
      "userId": App.Services.KeyUser.uid,
      "dataPrivilegeId": App.Services.KeyUser.pid,
      "orgId": App.Services.KeyUser.orgId,
    };
    App.Comm.ajax({URLtype:'fetchServiceKeyUserList',data:data},function(r){
      console.log(r)
    });
    $.ajax({
      type: "POST",
      url: "http://bim.wanda-dev.cn:81/platform/auth/keyUser",
      data: JSON.stringify(data),
      dataType:'json',
      contentType:"text/javascript",
      success: function(data){
        console.log(data)
      }
     })
  },
  //关闭窗口
  close : function(){

    $('.mod-dialog,.mod-dialog-masklayer').hide();

  },


  initialize:function(){
    //this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
  }

});