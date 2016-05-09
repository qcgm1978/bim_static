App.Services.addKeyUser = Backbone.View.extend({

  tagName: "div",

  className: "serviceWindow",

  template: _.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.html"),

  events: {
    "click .windowClose"             : "close",
    "click #select"                  : "move",
    "click .up"                      : 'toUpStep',
    "click .next"                    : 'toNextStep',
    "click .confirm"                 : 'confirm',
    "click .rightWindow .delete"     : 'remove',
    "click .rightWindow .proj-remove": 'remove2',

  },

  render: function(step){

    this.$el.html(this.template());
    if(step){
      $('.steps .active').removeClass('active');
      if(step == 'edit'){
        //编辑项目
        this.$el.find('.maintitle').text('项目授权');
        this.$el.find('.up').hide();
        this.$el.find('.steps').hide();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step2, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.items, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step2.set(r.data.items);
          }
        });

        //遍历本身存在的项目数据添加到右边窗口
        var str = '',projs=App.Services.KeyUser.fakedata.project,pid=App.Services.KeyUser.editpid=[];
        for(var i=0;i<projs.length;i++){
          var p = projs[i];
          pid.push(p['id']);
          str += "<li class='proj-right' data-id="+p['id']+"><i class='proj-remove'></i>"+
            "<h3 data-id="+p['id']+">"+p['name']+"</h3>"+
            "<p>"+(p['province']||'')+"<span></span></p>"+
          "</li>";
        }
        App.Services.KeyUser.pid=pid;
        this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选项目（"+pid.length+"个）");

      }
      else if(step == 'org'){
        //编辑部门
        this.$el.find('.maintitle').text('部门授权');
        this.$el.find('.up').hide();
        this.$el.find('.steps').hide();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step3().render().el);


        this.$el.find('.leftWindow').html(new App.Services.step1().render('step3').el);
        this.$el.find('.leftWindow').append(new App.Services.step3().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
        App.Services.KeyUser.loadData(App.Services.KeyUser.Step3, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step3.set(r.data.org);
          }
        });
        //遍历本身存在的部门数据添加到右边窗口
        var str = '',orgs=App.Services.KeyUser.fakedata.org,orgid=App.Services.KeyUser.editorgId=[];
        for(var i=0;i<orgs.length;i++){
          var p = orgs[i];
          orgid.push(p['orgId']);
          str += " <li>"+
            "<span class='delete'></span>" +
            "<p class='shut mulu' data-id="+p['orgId']+" data-canload='true'>" +
          "<i></i><span class='isspan'>"+p['name']+"</span>" +
          "</p>" +
          "<ul class='shut'></ul>" +
          "</li>";

        }
        App.Services.KeyUser.orgId=orgid;

        this.$el.find('.rightWindow').html('<div>'+str+'</div>').siblings('p').text("已选部门");

      }
      else if(step == 2){
        if(App.Services.KeyUser.html2[0]){
          $('.rightWindow').html(App.Services.KeyUser.html2[0]);
          $('.rightWindow').siblings('p').text("已选项目 ( " + App.Services.KeyUser.pid.length + "个 )");
        }
        else{
          $('.rightWindow div').html('').siblings('p').text("已选项目 ( 0个 )");

        }
        $('.steps div').eq(1).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').hide();
        this.$el.find('.next').show();
        this.$el.find('.leftWindow').html(new App.Services.step2().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step2, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.items, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step2.set(r.data.items);
          }
        });
      }
      else{
        //step3
        $('.rightWindow').siblings('p').text("已选部门");
        if(App.Services.KeyUser.html3[0]){
          $('.rightWindow').html(App.Services.KeyUser.html3[0]);
        }
        else{
          $('.rightWindow div').html('');
        }
        $('.steps div').eq(2).addClass('active');
        this.$el.find('.up').show();
        this.$el.find('.confirm').show();
        this.$el.find('.next').hide();
        this.$el.find('.leftWindow').html(new App.Services.step1().render('step3').el);
        this.$el.find('.leftWindow').append(new App.Services.step3().render().el);

        App.Services.KeyUser.loadData(App.Services.KeyUser.Step1, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step1.set(r.data.org);
          }
        });
        App.Services.KeyUser.loadData(App.Services.KeyUser.Step3, '', function(r){

          if(r && !r.code && r.data){
            _.each(r.data.org, function(data, index){
              data.shut    = true;
              data.canLoad = true;
            });
            App.Services.KeyUser.Step3.set(r.data.org);
          }
        });
      }
    }
    else{
      //step1
      $('.steps .active').removeClass('active');
      $('.steps div').eq(0).addClass('active');
      if(App.Services.KeyUser.html[0]){
        $('.rightWindow').html(App.Services.KeyUser.html[0]);
        $('.rightWindow').siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
      }
      else{
        $('.rightWindow div').html('').siblings('p').text("已选项目 ( 0个 )");
      }
      this.$el.find('.up').hide();
      this.$el.find('.confirm').hide();
      this.$el.find('.leftWindow').html(new App.Services.step1().render().el);
      App.Comm.ajax({URLtype: 'fetchServicesMemberInnerList'}, function(r){

        if(r && !r.code && r.data){
          _.each(r.data.org, function(data, index){
            data.shut    = true;
            data.canLoad = true;
          })
          App.Services.KeyUser.Step1.set(r.data.org);
        }
      });

    }
    return this;
  },

  //移除已选中的名单
  remove: function(e){

    var $li                    = $(e.target).parents('li');

    var stepNum = $('.steps .active').find('span').text();
    if(this.$el.find('.maintitle').text() == '部门授权'){
      //部门授权移除已选中的名单
      var orgId                  = $li.find('p').attr('data-id');
      App.Services.KeyUser.editorgId = _.without(App.Services.KeyUser.editorgId,parseInt(orgId));
      App.Services.KeyUser.editorgId = _.without(App.Services.KeyUser.editorgId, orgId.toString());

      App.Services.KeyUser.orgId = App.Services.KeyUser.editorgId;

    }else if(stepNum == 3){
      //step3移除已选中的名单

      var orgId                  = $li.find('p').attr('data-id');
      App.Services.KeyUser.orgId = _.without(App.Services.KeyUser.orgId, parseInt(orgId));
      App.Services.KeyUser.orgId = _.without(App.Services.KeyUser.orgId, orgId.toString());

    }
    else{
      //step1移除已选中的名单

      var uid                  = $li.find('p').attr('data-uid');
      App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid, parseInt(uid));
      App.Services.KeyUser.uid = _.without(App.Services.KeyUser.uid, uid.toString());

      $('.rightWindow').siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
    }
    $li.remove();

  },

  //step2移除已选中的名单
  remove2: function(e){
    var $li                  = $(e.target).parent();
    var pid                  = $li.attr('data-id');
    $('.leftWindow').find('li[data-id=' + pid + ']').removeClass('selected-proj');
    $li.remove();
    //if(this.$el.find('.maintitle').text() == '项目授权'){
    //  //项目授权移除已选中的名单
    //  App.Services.KeyUser.editpid = _.without(App.Services.KeyUser.editpid, pid-1+1);
    //
    //}else{

    App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, parseInt(pid));
    App.Services.KeyUser.pid = _.without(App.Services.KeyUser.pid, pid.toString());
    //}
      $('.rightWindow').siblings('p').text("已选项目 ( " + $(".rightWindow li").length + "个 )");
  },

  //选择人到右边窗口
  move: function(){
    var str = '', stepNum = $('.steps .active').find('span').text();

    //step2或者编辑项目的时候
    if(stepNum == 2 || this.$el.find('.maintitle').text() == '项目授权'){
      this.$el.find('.leftWindow .selected-proj').each(function(el){
        var pid = $(this).attr('data-id');
        if(_.contains(App.Services.KeyUser.pid, pid)){
          return
        }
        else{
          App.Services.KeyUser.pid.push(pid);

          str += "<li class='proj-right' data-id=" + pid + "><i class='proj-remove'></i>" + $(this).html();

        }
      })
      this.$el.find('.rightWindow div').append(str);
      $('.rightWindow').siblings('p').text("已选项目 ( " + $(".rightWindow li").length + "个 )");

    }
    else if(stepNum == 3 || this.$el.find('.maintitle').text() == '部门授权'){
      var $selected = this.$el.find('.toselected');
      var orgId     = $selected.find('p').attr('data-id');
      if(_.contains(App.Services.KeyUser.orgId, orgId)){
        return '';
      }
      else{
        App.Services.KeyUser.orgId.push(orgId);
        var person = $selected.html();
        $selected.removeClass('toselected');
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>'));
      }

    }
    else{
      var $selected = this.$el.find('.toselected');
      var uid       = $selected.find('p').attr('data-uid');
      if(_.contains(App.Services.KeyUser.uid, uid)){
        return
      }
      else{
        App.Services.KeyUser.uid.push(uid);
        var person = $selected.html();
        $selected.removeClass('toselected');
        this.$el.find('.rightWindow div').append($('<li><span class="delete"></span>' + person + '</li>')).parent().siblings('p').text("已选成员 ( " + App.Services.KeyUser.uid.length + "个 )");
      }
    }

  },

  //切换步骤页
  toNextStep: function(){

    var stepNum = $('.steps .active').find('span').text();
    if(stepNum == 1){
      App.Services.KeyUser.html[0] = $('.rightWindow').html();
    }
    else{
      App.Services.KeyUser.html2[0] = $('.rightWindow').html();

    }
    this.render(++stepNum);
  },

  //切换步骤页
  toUpStep: function(){

    var stepNum = $('.steps .active').find('span').text();

    if(--stepNum == 1){
      App.Services.KeyUser.html2[0] = $('.rightWindow').html();
      this.render();

    }
    else{
      App.Services.KeyUser.html3[0] = $('.rightWindow').html();
      this.render(stepNum);

    }
  },

  //刷新userinfo页面
  refresh: function(){
    var datas = {
      uid: App.Services.KeyUser.uuid
    };
    var data  = {
      URLtype: "fetchServiceKeyUserInfo",
      type   : "GET",
      data   : JSON.stringify(datas)
    };
    App.Comm.ajax(data, function(data){
      if(data.code == 0){
        App.Services.KeyUser.fakedata = data.data;
        new App.Services.userinfo().render();

      }

    });
  },

  //切换步骤页
  confirm: function(){

    //编辑项目提交
    if($('.maintitle').text() == '项目授权'){
      App.Services.KeyUser.editpid = App.Services.KeyUser.pid;
      var datas = {
        "projectId": App.Services.KeyUser.pid,
        "orgId": App.Services.KeyUser.editorgId,
        uid              : App.Services.KeyUser.uuid
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };

      var self = this;
      App.Comm.ajax(data, function(data){
        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();
        }

      });

    }
    else if($('.maintitle').text() == '部门授权'){
      //编辑部门提交
      App.Services.KeyUser.editorgId = App.Services.KeyUser.orgId;
      var datas = {
        "orgId": App.Services.KeyUser.orgId,
        "projectId": App.Services.KeyUser.editpid,
        uid    : App.Services.KeyUser.uuid
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserEdit",
        type       : "PUT",
        contentType: "application/json",
        data       : JSON.stringify(datas)
      };
      var self = this;
      App.Comm.ajax(data, function(data){
        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          self.refresh();

        }

      });

    }
    else{
      //新增关键用户的提交
      if(!App.Services.KeyUser.uid.length){
        alert('必须选择关键用户才能提交！');
        return
      }
      var datas = {
        "userId"         : App.Services.KeyUser.uid,
        "projectId": App.Services.KeyUser.pid || [],
        "orgId"          : App.Services.KeyUser.orgId || [],
      };
      var data  = {
        URLtype    : "fetchServiceKeyUserList",
        type       : "POST",
        contentType: "application/json", //'Content-Type':"application/json",
        data       : JSON.stringify(datas)
      };
      App.Comm.ajax(data, function(data){
        if(data.code == 0){
          $('.mod-dialog,.mod-dialog-masklayer').hide();
          //刷新关键用户列表
          App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList, '', function(r){
            if(r && !r.code && r.data){
              App.Services.KeyUser.KeyUserList.set(r.data);
              App.Services.KeyUser.userList = r.data;
            }
          });
          App.Services.KeyUser.clearAll();
        }

      });
      $(this).html('提交中...');
    }

  }, //关闭窗口
  close  : function(){

    $('.mod-dialog,.mod-dialog-masklayer').hide();
    App.Services.KeyUser.clearAll();
  },

  initialize: function(){
    //this.listenTo(App.Services.KeyUser.KeyUserList,'add',this.add)
  }

});