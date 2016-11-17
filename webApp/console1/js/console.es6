App.Console = {

  Settings: {
    type: 0,
    step: 0
  },

  init() {

    var Settings = App.Console.Settings;

    if(Settings.type && Settings.step){
      //族库
      if(Settings.type == 1){
        App.Console.fam();
      }
      else if(Settings.type == 2){
        //标准模型库
        App.Console.standardModel();
      }
      else if(Settings.type == 3){
        //创建项目
        App.Console.project();
      }
      else if(Settings.type == 4){
        //项目变更
        App.Console.projectChange();
      }
      else if(Settings.type == 5){
        App.Console.CostAccounting();
      }
      else if(Settings.type == 6){
        App.Console.qualityMonitoring();
      }
      else if(Settings.type == 7){
        App.Console.design();
      }
      else if(Settings.type == 8){
        App.Console.cost();
      }

    }
    else{
      //主页面
      var tpl = _.templateUrl('/console1/tpls/console.html', true);
      $("#contains").html(tpl);
    }

  },
  fn : {},
  search(){
    var tpl = _.templateUrl('/console1/tpls/search.html', true);
    $("#contains").append(tpl);
    //remove
    $('#search_person').on('click','i',function(e){
      $(e.target).parent().remove();
    });
    $('#search_person .btn').click(function(e){
      var account = $('.wrap input').val();
      $.ajax({
        url    : "platform/loginUser/"+account
      }).done(function(data){
        if(data.code == 0){
          $('#results').html('').append('<li name='+data.data.name+' loginId='+data.data.loginName+' uId='+data.data.userId+' ondragstart="drag(event)" draggable="true">'+data.data.name+'</li>')
        }

      });
    });
    window.drop=function(e){
      var loginId=e.dataTransfer.getData('loginId'),
          uId=e.dataTransfer.getData('uId'),
          name=e.dataTransfer.getData('name');
      $(e.currentTarget).append('<div draggable="true" ondragstart="drag(event)" class="name" name='+name+' uId='+uId+' loginId='+loginId+'>'+name+'<i>X</i></div>')

    }
    $('.boxs').on('dragover',function(e){
      e.preventDefault();
    })
    window.drag=function(ev){
      console.log(ev)
      ev.dataTransfer.setData("loginId", ev.target.getAttribute('loginId'));
      ev.dataTransfer.setData("uId", ev.target.getAttribute('uId'));
      ev.dataTransfer.setData("name", ev.target.getAttribute('name'));
    }
  },
  getPerson(index){
    var obj = {},
        arr = [],
        boxs = $('.boxs');
    if (index==0){
      var ele = boxs.eq(0).find('.name').eq(0);
      return {
        userId : ele.attr('uid'),
        loginId: ele.attr('loginid')
      };
    }else{

        var ele = boxs.eq(index).find('.name');
      console.log(ele)
        ele.each(function(index,ele){
          arr.push({userId:$(ele).attr('uid'),loginId:$(ele).attr('loginid')})
        });
        return arr;
    }
  },
  ajaxPost(data, callback) {

    var stringData = JSON.stringify(data.data);

    $.ajax({
      url    : data.url,
      data   : stringData,
      headers: {
        "Content-Type": "application/json"
      },
      type   : "POST"
    }).done(function(data){

      if($.isFunction(callback)){
        callback(data);
      }
    });
  }, //族库
  fam(){
    var tpl = _.templateUrl('/console1/tpls/fam/fam.html', true);
    $("#contains").html(tpl);
    this.search();
    $('textarea').hide();
    $.ajax({
      url: "platform/project?type=2&versionStatus=9&pageItemCount=100000"
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.version){
          str += '<option versionid="' + item.version.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });
      $("#p11").html('<option value="">请选择</option>'+str);
    });
    this.fn['4.3']=function(){
      //获取族库审核审批单
      App.Console.auditSheet1(2, "#s31", 8);
    }

    //App.Console.auditSheet1(2, "#s41", 16);
    this.fn['4.5']=function(){
      //获取族库发版审批单
      App.Console.auditSheet1(3, "#s51", 8);
    }

    //4.2
    this.fn['4.2']=function(){
      $.ajax({
        url: "platform/api/family?status=3,6"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.code){
            str += '<option id="' + item.code  + '">' + item.name + '</option>';
          }

        });
        $("#s21").html("<option value=''>请选择</option>"+str);
      });
    }

    //4.4
    this.fn['4.4']=function(){
      $.ajax({
        url: "platform/api/family?status=5,8"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.code){
            str += '<option id="' + item.code  + '">' + item.name + '</option>';
          }

        });
        $("#s41").html("<option value=''>请选择</option>"+str);
      });
    }


    $("#submit1").click(function(){
      var data       = {
        "msgContent"   : JSON.stringify({
          "messageId"  : "411a109141d6473c83a86aa0480d6610",
          "messageType": "PLAN-1002",
          "timestamp"  : 1461142526786,
          "code"       : 0,
          "data"       : {
            "auditFinishTime"  : 1461140501424,
            "createTime"       : 1461140501424,
            "description"      : "描述",
            "designer"         : "设计单位",
            "developFinishDate": 1461140501452,
            "familyCode"       : $("#p13").val().trim(),
            "familyName"       : $("#p12").val().trim(),
            "refFamilyCode"    : $("#p11").val().trim(),
            "status"           : 16,
            "workflowId"       : parseInt(9999999 * Math.random()),
            "title"            : $("#p12").val().trim(),
            "initiator"        : App.Console.getPerson(0),
            "auditor"          : App.Console.getPerson(1),
            "confirmor"        : App.Console.getPerson(2),
            "receiver"         : App.Console.getPerson(3)
          }
        }),
        "msgCreateTime": 1461727280227,
        "msgId"        : "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime"  : 0,
        "srcMsgType"   : "PLAN-1002",
        "retryTimes"   : 0,
        "status"       : 0,
        "sysCode"      : "1"
      };
      var stringData = JSON.stringify(data);
      App.Console.post(stringData);

    });

    $("#submit2").click(function(){
      var data = {
        workflowId             : parseInt(9999999 * Math.random()),
        //familyDevelopWorkflowId: $('#s21').val().trim(),
        familyCode: $('#s21').val().trim(),
        title                  : $("#p21").val().trim(),
        description            : $("#p22").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(1, 1003, data);
    });

    $("#submit3").click(function(){
      var data = {
        workflowId: $('#s31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()

      };
      App.Console.quest(2, 1004, data);

    });
    $("#submit33").click(function(){
      var data = {
        workflowId: $('#s31').val().trim(),
        status    : 4,
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()

      };
      App.Console.quest(2, 1004, data);

    });
    $("#submit4").click(function(){
      var data = {
        workflowId             : parseInt(9999999 * Math.random()),
        //familyAprovalWorkflowId: $('#s41').val().trim(),
        familyCode: $('#s41').val().trim(),
        title                  : $("#p41").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(3, 1005, data);

    });
    $("#submit5").click(function(){
      var data = {
        workflowId: $('#s51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(4, 1006, data);

    });
    $("#submit55").click(function(){
      var data = {
        workflowId: $('#s51').val().trim(),
        status    : 4,
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(4, 1006, data);

    });
  },
  standardModel(){
    var tpl = _.templateUrl('/console1/tpls/standardModel/standardmodel.html', true);
    $("#contains").html(tpl);
    this.search();
    $('textarea').hide();
    this.twoApply(1,'s11','p14');
    $.ajax({
      url: "platform/project?type=2&versionStatus=9&pageItemCount=100000"
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.version){
          str += '<option versionid="' + item.version.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });
      $("#s12").html('<option value="">请选择</option>'+str);
    });
    //5.2
    this.fn['5.2']=function(){
      $.ajax({
        //url: "platform/api/model"
        url: "platform/api/workflow/model?status=3,6"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.code){
            str += '<option id="' + item.code  + '">' + item.name + '</option>';
          }

        });
        $("#s21").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            //url: "platform/api/model/"+$(this).find('option:selected').attr('id')+"/version?status=3"
            url: "platform/api/model/"+$(this).find('option:selected').attr('id')+"/version?status=3,6"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s211").html(str);

          });
        });
      });
    }
    //5.4
    this.fn['5.4']=function(){
      //5.4
      $.ajax({
        //url: "platform/api/model"
        url: "platform/api/workflow/model?status=5,8"

      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.code){
            str += '<option id="' + item.code  + '">' + item.name + '</option>';
          }

        });
        $("#s41").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            url: "platform/api/model/"+$(this).find('option:selected').attr('id')+"/version?status=5,8"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s411").html(str);

          });
        });
      });
    }

    //获取研发标准模型指令审批单
    //App.Console.auditSheet1(4, "#s21", 16);

    //5.3
    this.fn['5.3']=function(){
      //获取标准模型报审表单
      App.Console.auditSheet1(5, "#s31", 8);
    }

    //App.Console.auditSheet1(5, "#s41", 16);

    //5.5
    this.fn['5.5']=function(){
      //获取标准模型发布表单
      App.Console.auditSheet1(6, "#s51", 8);
    }


    $("#submit1").click(function(){
      var data = {
        workflowId       : parseInt(9999999 * Math.random()),
        refModelCode     : $('#s11').val(),
        refModelVersionId: $('#p14').val(),
        refModelName     : $('#s11 option:selected').text(),
        modelCode        : $('#p11').val().trim(),
        modelName        : $('#p12').val().trim(),
        modelVersionName : $('#p13').val().trim(),
        familyCode       : $('#s12').val().trim(),
        familyName       : $('#s12 option:selected').text().trim(),
        title            : $("#p10").val().trim(),
        designer         : $("#p15").val().trim(),
        description      : $("#p16").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(1, 1007, data);

    });

    $("#submit2").click(function(){
      var data = {
        workflowId                    : parseInt(9999999 * Math.random()),
        //standardModelDevelopWorkflowId: $('#s21').val().trim(),
        modelCode: $('#s21').val().trim(),
        versionId: $('#s211').val().trim(),
        title                         : $("#p21").val().trim(),
        description        : $("#p22").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(2, 1008, data);
    });

    $("#submit3").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()

      };
      App.Console.quest(3, 1009, data);

    });
    $("#submit33").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()

      };
      App.Console.quest(3, 1009, data);

    });

    $("#submit4").click(function(){
      var data = {
        workflowId                    : parseInt(9999999 * Math.random()),
        //standardModelAprovalWorkflowId: $('#s41').val().trim(),
        modelCode: $('#s41').val().trim(),
        versionId: $('#s411').val().trim(),
        title                         : $("#p41").val().trim(),
        description        : $("#p42").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(4, 1010, data);

    });
    $("#submit5").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(5, 1011, data);

    });
    $("#submit55").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(5, 1011, data);

    });
  },
  project(){
    var tpl = _.templateUrl('/console1/tpls/project/project.html', true);
    $("#contains").html(tpl);
    this.search();
    $('textarea').hide();
    $.ajax({
      url: "platform/project?type=1"
    }).done(function(data){

      var items = data.data.items,str='';

      $.each(items, function(i, item){
        if(item.version){
          str+='<option versionid="' + item.version.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });
      $('#s11').html("<option value=''>请选择</option>"+str).change(function(){
        $("#p13").val($(this).children('option:selected').attr("versionid"));
      });

    });
    //6.1
    this.fn['6.1']=function(){
      //$.ajax({
      //  url: "platform/api/project?uninit=1"
      //}).done(function(data){
      //
      //  var items = data.data, str = '';
      //
      //  $.each(items, function(i, item){
      //    if(item.projectCode){
      //      str += '<option  value="' + item.projectNo + '" id="' + item.projectCode  + '">' + item.name + '</option>';
      //    }
      //
      //  });
      //  $("#s1").html("<option value=''>请选择</option>"+str);
      //});
    }


    //6.2
    this.fn['6.2']=function(){
      $.ajax({
        //url: "platform/api/project"
        url: "platform/api/workflow/project?status=3,6"
      }).done(function(data){

        var items = data.data, str = '';
        $.each(items, function(i, item){
          if(item.projectCode){
            str += '<option value="' + item.projectCode +  '" id="' + item.projectCode  + '">' + item.name + '</option>';
          }

        });
        $("#s21").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            url: "platform/api/workflow/project/"+$(this).find('option:selected').attr('id')+"/version?status=3,6"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s211").html(str);

          });
        });
      });
    }

    //6.4
    this.fn['6.4']=function(){
      $.ajax({
        url: "platform/api/workflow/project?status=5,8"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.projectCode){
            str += '<option value="' + item.projectCode + '" id="' + item.projectCode  + '">' + item.name + '</option>';
          }

        });
        $("#s41").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            url: "platform/api/workflow/project/"+$(this).find('option:selected').attr('id')+"/version?status=5,8"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s411").html(str);

          });
        });
      });
    }
    //6.3
    this.fn['6.3']=function(){
      //8获取
      App.Console.auditSheet1(7, "#s31", 8);
    }

    //20获取
    //App.Console.auditSheet1(20, "#s21", 16);

    //App.Console.auditSheet1(7, "#s41", 16);
    //6.5
    this.fn['6.5']=function(){

      App.Console.auditSheet1(8, "#s51", 8);
    }

    $("#submit0").click(function() {
      var data = {
        type: 3,
        projectNo: $("#number").val().trim(),
        name: $("#famTitle").val().trim(),
        projectType: 2,
        estateType: 1,
        province: "上海市",
        region: "管理分区", //管理分区，最大长度32。非空
        openTime: $("#devDate").val().trim(), //开业时间
        //versionName: “2016 版”, //版本名称，适用于标准模型。非空字段
        designUnit: $("#launchDepartment").val().trim(),
        subType: $("#s01").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };



      var stringData = JSON.stringify(data);

      $.ajax({
        url: "platform/project",
        data: stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type: "POST"
      }).done(function(data) {

        if (data.message == "success") {
          alert("成功");
          window.location.reload();
        }

      });
    });
    $("#submit1").click(function(){
      var data = {
        workflowId : parseInt(9999999 * Math.random()),
        projectCode: $('#p11').val().trim(),
        projectName: $('#p12').val().trim(),
        title      : $("#p13").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //modelCode:$('#p11').val().trim(),
        //modelName:$('#s11').val().trim(),
        //modelVersionName:$('#p13').val().trim()
      };
      App.Console.quest(1, 1012, data);

    });

    $("#submit2").click(function(){
      var data = {
        workflowId                        : parseInt(9999999 * Math.random()),
        //projectModelInstructionsWorkflowId: $('#s21').val().trim(),
        projectCode: $('#s21').val().trim(),
        versionId  : $('#s211').val().trim(),
        title                             : $("#p21").val().trim(),
        description        : $("#p22").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(2, 1013, data);
    });

    $("#submit3").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()
      };
      App.Console.quest(3, 1014, data);

    });
    $("#submit33").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
        //title: $("#p31").val().trim()

      };
      App.Console.quest(3, 1014, data);

    });
    $("#submit4").click(function(){
      var data = {
        workflowId                   : parseInt(9999999 * Math.random()),
        //projectModelAprovalWorkflowId: $('#s41').val().trim(),
        projectCode: $('#s41').val().trim(),
        versionId  : $('#s411').val().trim(),
        title                        : $("#p41").val().trim(),
        description        : $("#p42").val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(4, 1015, data);

    });
    $("#submit5").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(5, 1016, data);

    });
    $("#submit55").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)

      };
      App.Console.quest(5, 1016, data);

    });
  },
  //项目变更
  projectChange() {
    var tpl = _.templateUrl('/console1/tpls/projectChange/projectchange.html', true);
    $("#contains").html(tpl);
    this.search();
    $('textarea').hide();
    setTimeout(function(){
      $('body').append('<script type="text/javascript" src="/static/dist/components/fileSelection/js/fileSelection.js"></'+'script>')
    },1000)

    $.ajax({
      url: "platform/project?type=3&pageItemCount=100000"
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.id){

          str += '<option id="' + item.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });
      $("#s11").html("<option value=''>请选择</option>"+str).change(function(){
        $.ajax({
          url: "platform/project/" + $(this).find('option:selected').attr('id') + "/version"
        }).done(function(data){

          var items = data.data, str = '';

          $.each(items, function(i, item){
            if(item.id){

              str += '<option  value="' + item.id + '">' + item.name + '</option>';
            }

          });
          $("#s12").html(str);

        });
      });
    });
    //7.2
    this.fn['7.2']=function(){
      App.Console.auditSheet1(9, '#s21', 8);

    }
    //7.3
    this.fn['7.3']=function(){
      //7.3
      $.ajax({
        //url: "platform/api/workflow/project?status=10"
        url: "platform/api/workflow/project?status=10,12"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.projectCode){
            str += '<option  value="' + item.projectCode + '" id="' + item.projectCode  + '">' + item.name + '</option>';
          }

        });
        $("#s31").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            url: "platform/api/workflow/project/"+$(this).find('option:selected').attr('id')+"/version?status=10"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s311").html(str);

          });
        });
      });

    }
    //7.4
    this.fn['7.4']=function(){
      App.Console.auditSheet1(10, '#s41', 8);


    }
    //7.5
    this.fn['7.5']=function(){
      //7.5
      $.ajax({
        //url: "platform/api/workflow/project?status=11"
        //url: "api/workflow/project?status=11,12"
        url: "platform/api/workflow/project?status=11,12"
      }).done(function(data){

        var items = data.data, str = '';

        $.each(items, function(i, item){
          if(item.projectCode){
            str += '<option  value="' + item.projectCode + '" id="' + item.projectCode  + '">' + item.name + '</option>';
          }

        });
        $("#s51").html("<option value=''>请选择</option>"+str).change(function(){
          $.ajax({
            url: "platform/api/workflow/project/"+$(this).find('option:selected').attr('id')+"/version?status=11"
          }).done(function(data){

            var items = data.data, str = '';

            $.each(items, function(i, item){
              if(item.id){

                str += '<option  value="' + item.id + '">' + item.name + '</option>';
              }

            });
            $("#s511").html(str);

          });
        });
      });

    }
    //7.6
    this.fn['7.6']=function(){
      App.Console.auditSheet1(11, '#s61', 8);


    }
    //App.Console.auditSheet1(9, '#s31', 16);
    //App.Console.auditSheet1(10, '#s51', 16);


    var data;
    $("#p16").click(function(){
      if($('#p15').val().trim().length>10){
        var arr = JSON.parse($('#p15').val().trim()),
            ids = '';
        _.each(arr,function(item,index){
          index==0?ids+=item.fileId : ids+=(','+item.fileId);
        })

      }
      var Files=FileSelection({
        appKey:"99a3d82442594d3e8446108e21f6fb61",
        token:"123",
        isDrag:true,
        //isEnable:false,
        projectId:$('#s11 option:selected').attr('id'),
        projectVersionId:$('#s12').val().trim(),
        closeCallback:function(){
          console.log(1)
        },
        fileIds:ids||"", //逗号隔开
        callback:function(a){
            var files = Files.getFileId();
          $('#p15').val(JSON.stringify(files))
        }

      });
    });
    $("#submit4").click(function(){
      //var files = [],i,
      //  ids = $('#p14').val().trim().split(',');
      //for(i = 0; i<ids.length;i++){
      //  files.push({"fileId":ids[i]})
      //}
      //console.log(files)
      data = {
        title                   : $('#p11').val().trim(),
        workflowId              : parseInt(9999999 * Math.random()),
        projectVersionName      : $('#p12').val().trim(),
        refProjectModelCode       : $('#s11').val(),
        refProjectModelName     : $('#s11 option:selected').text().trim(),
        projectModelCode             : $('#s11').val(),
        refProjectModelVersionId: $('#s12').val().trim(),
        description             : $('#p13').val().trim(),
        createTime             : $('#p14').val().trim(),
        changedFiles            : JSON.parse($('#p15').val().trim()),
        status                  : 8,
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(1, 1017, data);
    });
    $("#submit5").click(function(){
      data = {
        workflowId: $('#s21').val().trim(),
        status    : 16,
        title     : $('#p21').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(2, 1018, data);
    });
    $("#submit55").click(function(){
      data = {
        workflowId: $('#s21').val().trim(),
        status    : 4,
        title     : $('#p21').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(2, 1018, data);
    });
    $("#submit6").click(function(){
      data = {
        workflowId                       : parseInt(9999999 * Math.random()),
        //projectModelChangeApplyWorkflowId: $('#s31').val().trim(),
        projectModelCode: $('#s31').val().trim(),
        versionId: $('#s311').val().trim(),
        status                           : 8,
        title                            : $('#p31').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(3, 1019, data);
    });
    $("#submit7").click(function(){
      data = {
        workflowId: $('#s41').val().trim(),
        status    : 16,
        title     : $('#p41').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(4, 1020, data);
    });
    $("#submit77").click(function(){
      data = {
        workflowId: $('#s41').val().trim(),
        status    : 4,
        title     : $('#p41').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(4, 1020, data);
    });
    $("#submit8").click(function(){
      data = {
        workflowId                         : parseInt(9999999 * Math.random()),
        //projectModelChangeAprovalWorkflowId: $('#s51').val().trim(),
        projectModelCode: $('#s51').val().trim(),
        versionId: $('#s511').val().trim(),
        status                             : 8,
        title                              : $('#p51').val().trim(),
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(5, 1021, data);
    });
    $("#submit9").click(function(){
      data = {
        workflowId: $('#s61').val().trim(),
        status    : 16,
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(6, 1022, data);
    });
    $("#submit99").click(function(){
      data = {
        workflowId: $('#s61').val().trim(),
        status    : 4,
        "initiator"        : App.Console.getPerson(0),
        "auditor"          : App.Console.getPerson(1),
        "confirmor"        : App.Console.getPerson(2),
        "receiver"         : App.Console.getPerson(3)
      };
      App.Console.quest(6, 1022, data);
    });
  },
  //质量监测
  qualityMonitoring(){
    var Settings = App.Console.Settings;
    //发起
    if(Settings.step == 1){
      var tpl = _.templateUrl('/console1/tpls/qualityMonitoring/materiallist.html', true);
      $("#contains").html(tpl);

      App.Console.qm1();

    }
    else if(Settings.step == 2){
      var tpl = _.templateUrl('/console1/tpls/qualityMonitoring/acceptance.html', true);
      $("#contains").html(tpl);

      App.Console.qm2();

    }
    else if(Settings.step == 3){
      var tpl = _.templateUrl('/console1/tpls/qualityMonitoring/danger.html', true);
      $("#contains").html(tpl);

      App.Console.qm3();

    }
    else if(Settings.step == 4){
      var tpl = _.templateUrl('/console1/tpls/qualityMonitoring/component.html', true);
      $("#contains").html(tpl);

      App.Console.qm4();

    }
  },
  //获取项目列表
  getProjects(Type, cb){
    $.ajax({
      url: "/platform/project?type=" + Type
    }).done(function(data){

      cb(data)
    });
  },
  //获取项目质量材料设备列表
  qm1(){
    $.ajax({
      url: "/platform/mapping/project?type=3"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11').append(str)

    });

    $("#submit").click(function(){
      var data = {
        "id"           : $('#p11').val().trim(),
        //"projectCode"  : $('#s11').val().trim(),
        "specialtyName": $('#s12 option:selected').text().trim(),
        "specialtyId"  : $('#s12').val().trim(),
        "categoryId"   : $('#s13').val().trim(),
        "categoryName" : $('#s13 option:selected').text().trim(),
        "name"         : $('#p12').val().trim()

      };
      App.Console.apply(1, 1001, data, 1);
    });

  },

  //获取项目质量验收列表

  qm2(){
    //2.2	过程验收
    $.ajax({
      url: "/platform/mapping/project?type=3"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11,#s21').append(str)

    });
    $("#submit").click(function(){
      var data = {
        "id"          : $('#p11').val().trim(),
        //"projectCode" : $('#s11').val().trim(),
        "categoryId"  : $('#s12').val().trim(),
        "categoryName": $('#s12 option:selected').text().trim()
      };
      App.Console.apply('', 1002, data, 1);

    });

    //2.3	开业验收
    $("#submit1").click(function(){
      var data = {
        "id"           : $('#p21').val().trim(),
        //"projectCode"  : $('#s21').val().trim(),
        "specialtyName": $('#s22 option:selected').text().trim(),
        "specialtyId"  : $('#s22').val().trim(),
        "categoryId"   : $('#s23').val().trim(),
        "categoryName" : $('#s23 option:selected').text().trim()
      };
      App.Console.apply(1, 1003, data, 1);

    })
  }, //获取项目质量隐患列表

  qm3(){
    $.ajax({
      url: "/platform/mapping/project?type=3"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11').append(str)

    });
    $("#submit").click(function(){
      var data = {
        "id"                : $('#p11').val().trim(),
        //"projectCode"       : $('#s11').val().trim(),
        "acceptanceId"      : $('#p12').val().trim(),
        "name"              : $('#p13').val().trim(),
        "status"            : $('#s12').val().trim(),
        "levelId"           : $('#s13').val().trim(),
        "organizationTypeId": $('#s14').val().trim(),
        "ratingCategoryId"  : $('#s15').val().trim()
      };
      App.Console.apply('', 1004, data, 1);
    });

  }, //获取验收、隐患对应的构件

  qm4(){
    $.ajax({
      url: "/platform/mapping/project?type=3"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11').append(str)

    });
    //2.5	验收合格数据
    $("#submit").click(function(){
      var data = {
        "id"            : $('#p11').val().trim(),
        //"projectCode"   : $('#s11').val().trim(),
        "acceptanceId"  : $('#p12').val().trim(),
        "acceptanceType": $('#s12').val().trim()
      };
      App.Console.apply('', 1005, data, 1);

    })
  },

  //设计
  design(){
    var Settings = App.Console.Settings;
    //发起
    if(Settings.step == 1){
      var tpl = _.templateUrl('/console1/tpls/design/designlist.html', true);
      $("#contains").html(tpl);

      App.Console.ds1();

    }
  }, //获取设计检查列表
  ds1(){
    //3.1	设计检查

    $.ajax({
      url: "/platform/mapping/project?type=3"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11').append(str)

    });
    $("#submit").click(function(){
      var data = {
        "id"                : $('#p11').val().trim(),
        //"projectCode"       : $('#s11').val().trim(),
        "name"              : $('#p12').val().trim(),
        "status"            : $('#s13').val().trim(),
        "specialtyName"     : $('#s12 option:selected').text().trim(),
        "specialtyId"       : $('#s12').val().trim(),
        "organizationTypeId": $('#s14').val().trim(),
        "ratingCategoryId"  : $('#s15').val().trim()
      };
      App.Console.apply('', 1006, data, 1);

    })
  },

  cost(){
    var tpl = _.templateUrl('/console1/tpls/cost/cost.html', true);
    $("#contains").html(tpl);
    $.ajax({
      url: "/platform/mapping/project?type=2"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data);
        str += "<option value=" + data.projectCode + ">" + data.projectName + "</option>";
      });

      $('#s11').append(str)

    });

    //$.ajax({
    //  url: "/platform/project/1/version"
    //}).done(function(data){
    //  var str = '', datas = data.data;
    //
    //  $.each(datas, function(index, data){
    //    console.log(data)
    //    str += "<option value=" + data.id + ">" + data.name + "</option>";
    //  });
    //
    //  $('.versionList').append(str)
    //
    //});

    $("#submit1").click(function(){
      var data  = {
        //projectCode       : $('#s11').val().trim(),
        workflowCode: parseInt(9999999 * Math.random()),
        title:$('#p11').val().trim()
        //type:$('#s12').val().trim(),

      };
      App.Console.apply(1,1001, data,2);


    });

    $("#submit2").click(function(){
      var data  = {
        //projectCode       : $('#s11').val().trim(),
        workflowCode: parseInt(9999999 * Math.random()),
        title:$('#p21').val().trim(),
        designFlowCode:parseInt(9999999 * Math.random())
        //type:$('#s22').val().trim()

      };
      App.Console.apply(2,1003, data,2);

    });

  },
  quest(index, num, obj, type){
    var datainit = JSON.parse($('#data' + index).val());
    if(typeof obj != 'undefined'){
      console.log(datainit)
      for(var g in obj){
        datainit[g] = obj[g];

      }


      var data = {
        "msgContent"   : JSON.stringify({
          "messageId"  : "411a109141d6473c83a86aa0480d6610",
          "messageType": (type == '1' ? "QUALITY-" :(type=='2'?"COST-": "PLAN-")) + num,
          "message"    : "是",
          "timestamp"  : (new Date).getTime(),
          "code"       : 0,
          "data"       : type == 1 ? new Array(datainit) : datainit

        }),
        "msgCreateTime": 1461727280227,
        "msgId"        : "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime"  : 0,
        "srcMsgType"   : (type == '1' ? "QUALITY-" :(type=='2'?"COST-": "PLAN-")) + "BIM",
        "retryTimes"   : 0,
        "status"       : 0,
        "sysCode"      : "1"
      };
    }

    $.ajax({
      url    : type == 1 ? "sixD/internal/message" : "platform/internal/message",
      data   : JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      },
      type   : "POST"
    }).done(function(data){
      $("#result" + index).val(JSON.stringify(data))
      console.log(data);
      alert(data.message || data.code)

    });
  },
  apply(index, num, obj, type){
    var datainit = JSON.parse($('#data' + index).val());
    if(typeof obj != 'undefined'){
      console.log(datainit)
      for(var g in obj){
        datainit[g] = obj[g];

      }
      if(datainit['initiator']&&datainit['initiator']['userId']==123){
        var userId = JSON.parse(localStorage.user)['userId'];
        datainit['initiator']['userId'] = datainit['auditor'][0]['userId'] = datainit['confirmor'][0]['userId'] = datainit['receiver'][0]['userId'] = userId;
      }

      var data = {
        "msgContent"   : JSON.stringify({
          "messageId"  : "411a109141d6473c83a86aa0480d6610",
          "messageType": (type == '1' ? "QUALITY-" :(type=='2'?"COST-": "PLAN-")) + num,
          "message"    : "是",
          "timestamp"  : (new Date).getTime(),
          "code"       : 0,
          "data"       : type == 1 ? new Array(datainit) : datainit

        }),
        "msgCreateTime": 1461727280227,
        "msgId"        : "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime"  : 0,
        "srcMsgType"   : (type == '1' ? "QUALITY-" :(type=='2'?"COST-": "PLAN-")) + "BIM",
        "retryTimes"   : 0,
        "status"       : 0,
        "sysCode"      : "1"
      };
    }

    $.ajax({
      url    : type == 1 ? "sixD/internal/message" : "platform/internal/message",
      data   : JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      },
      type   : "POST"
    }).done(function(data){
      $("#result" + index).val(JSON.stringify(data))
      console.log(data);
      if(location.port!=81){
        setTimeout(function(){
          window.location.reload();
        }, 2500);
      }

    });
  }, //2016-1-1转成时间戳
  getTime(str){
    var dd = str.split('-');
    var d  = new Date();
    d.setFullYear(dd[0]);
    d.setMonth(dd[1]);
    d.setDate(dd[2]);
    return d.getTime();
  }, //url加参数
  param(obj){
    var str = '';
    for(var i in obj){
      str += "&" + i + "=" + obj[i];
    }
    return "?" + str.substr(1);
  },
  fileUpload: function(){

    $("#submit").click(function(){

      var projectId = $("#projectId").val().trim(), projectVersionId = $("#projectVersionId").val().trim(), filesId = $("#filesId").val().trim();

      if(!projectId){
        alert("请输入项目id");
        return;
      }
      if(!projectVersionId){
        alert("请输入项目版本id");
        return;
      }
      if(!filesId){
        alert("请输入文件id");
        return;
      }

      var url = "doc/" + projectId + "/" + projectVersionId + "/cost?files=" + filesId;

      $.ajax({
        url : url,
        type: "POST"
      }).done(function(data){
        if(data.message == "success"){
          alert("success");
        }
      });

    });

  }, //模块化公用POST请求
  post(datas){
    $.ajax({
      url    : "platform/internal/message",
      data   : datas,
      headers: {
        "Content-Type": "application/json"
      },
      type   : "POST"
    }).done(function(data){
      console.log(data)
      if(data.code == 0){
        alert("成功");
        //window.location.reload();
      }

    });
  },

  auditSheet1(type, selector, result){
    $.ajax({
      url: "platform/auditSheet?type=" + type + "&auditResult=" + result
    }).done(function(data){
      console.log(data)
      if(data.message == "success"){
        var items = data.data, str = "";

        $.each(items, function(i, item){
          if(item.title){
            str += '<option  value="' + item.no + '">' + item.title + '</option>';
          }

        });
        $(selector).html(str);
      }
    });
  },

  twoApply(type,tagid,versionid){
    $.ajax({
      url: "platform/project?type="+type+"&pageItemCount=100000"
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.id){
          str += '<option id="' + item.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });

      $("#"+tagid).html("<option value=''>请选择</option>"+str).change(function(){
        $.ajax({
          url: "platform/project/" + $(this).find('option:selected').attr('id') + "/version"
        }).done(function(data){

          var items = data.data, str = '';

          $.each(items, function(i, item){
            if(item.id){

              str += '<option  value="' + item.id + '">' + item.name + '</option>';
            }

          });
          $("#"+versionid).html(str);

        });
      });
    });
  },

  urlfor(url1,url2,tagid,versionid){
    $.ajax({
      url: url1
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.id){
          str += '<option id="' + item.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });

      $("#"+tagid).html("<option value=''>请选择</option>"+str).change(function(){
        $.ajax({
          url: "platform/project/" + $(this).find('option:selected').attr('id') + "/version"
        }).done(function(data){

          var items = data.data, str = '';

          $.each(items, function(i, item){
            if(item.id){

              str += '<option  value="' + item.id + '">' + item.name + '</option>';
            }

          });
          $("#"+versionid).html(str);

        });
      });
    });
  }
};