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
    $.ajax({
      url: "platform/project?type=2&versionStatus=9&pageItemCount=100000"
    }).done(function(data){

      var items = data.data.items, str = '';

      $.each(items, function(i, item){
        if(item.version){
          str += '<option versionid="' + item.version.id + '" value="' + item.projectNo + '">' + item.name + '</option>';
        }

      });
      $("#p11").html(str);
    });
    //获取族库研发指令表单
    App.Console.auditSheet1(1, "#s21", 16);

    //获取族库审核审批单
    App.Console.auditSheet1(2, "#s31", 8);
    App.Console.auditSheet1(2, "#s41", 16);

    //获取族库发版审批单
    App.Console.auditSheet1(3, "#s51", 8);

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
            "refFalimyCode"    : $("#p11").val().trim(),
            "status"           : 16,
            "workflowId"       : parseInt(9999999 * Math.random()),
            "title"            : $("#p12").val().trim()
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
        familyDevelopWorkflowId: $('#s21').val().trim(),
        title                  : $("#p21").val().trim()
      };
      App.Console.apply(1, 1003, data);
    });

    $("#submit3").click(function(){
      var data = {
        workflowId: $('#s31').val().trim()
        //title: $("#p31").val().trim()

      };
      App.Console.apply(2, 1004, data);

    });
    $("#submit33").click(function(){
      var data = {
        workflowId: $('#s31').val().trim(),
        status    : 4
        //title: $("#p31").val().trim()

      };
      App.Console.apply(2, 1004, data);

    });
    $("#submit4").click(function(){
      var data = {
        workflowId             : parseInt(9999999 * Math.random()),
        familyAprovalWorkflowId: $('#s41').val().trim(),
        title                  : $("#p41").val().trim()

      };
      App.Console.apply(3, 1005, data);

    });
    $("#submit5").click(function(){
      var data = {
        workflowId: $('#s51').val().trim()
      };
      App.Console.apply(4, 1006, data);

    });
    $("#submit55").click(function(){
      var data = {
        workflowId: $('#s51').val().trim(),
        status    : 4

      };
      App.Console.apply(4, 1006, data);

    });
  },
  standardModel(){
    var tpl = _.templateUrl('/console1/tpls/standardModel/standardmodel.html', true);
    $("#contains").html(tpl);
    $.ajax({
      url: "platform/project?type=1&pageItemCount=100000"
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
          $("#p14").html(str);

        });
      });
    });
    //获取研发标准模型指令审批单
    App.Console.auditSheet1(4, "#s21", 16);
    //获取标准模型报审表单
    App.Console.auditSheet1(5, "#s31", 8);
    App.Console.auditSheet1(5, "#s41", 16);
    //获取标准模型发布表单
    App.Console.auditSheet1(6, "#s51", 8);



    $("#submit1").click(function(){
      var data = {
        workflowId       : parseInt(9999999 * Math.random()),
        refModelCode     : $('#s11').val(),
        refModelVersionId: $('#p14').val(),
        refModelName     : $('#s11 option:selected').text(),
        modelCode        : $('#p11').val().trim(),
        modelName        : $('#p12').val().trim(),
        modelVersionName : $('#p13').val().trim(),
        title            : $("#p10").val().trim()

      };
      App.Console.apply(1, 1007, data);

    });

    $("#submit2").click(function(){
      var data = {
        workflowId                    : parseInt(9999999 * Math.random()),
        standardModelDevelopWorkflowId: $('#s21').val().trim(),
        title                         : $("#p21").val().trim()

      };
      App.Console.apply(2, 1008, data);
    });

    $("#submit3").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s31').val().trim()
        //title: $("#p31").val().trim()

      };
      App.Console.apply(3, 1009, data);

    });
    $("#submit33").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s31').val().trim()
        //title: $("#p31").val().trim()

      };
      App.Console.apply(3, 1009, data);

    });

    $("#submit4").click(function(){
      var data = {
        workflowId                    : parseInt(9999999 * Math.random()),
        standardModelAprovalWorkflowId: $('#s41').val().trim(),
        title                         : $("#p41").val().trim()
      };
      App.Console.apply(4, 1010, data);

    });
    $("#submit5").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s51').val().trim()
      };
      App.Console.apply(5, 1011, data);

    });
    $("#submit55").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s51').val().trim()
      };
      App.Console.apply(5, 1011, data);

    });
  },
  project(){
    var tpl = _.templateUrl('/console1/tpls/project/project.html', true);
    $("#contains").html(tpl);
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

    //20获取
    App.Console.auditSheet1(20, "#s21", 16);
    //8获取
    App.Console.auditSheet1(7, "#s31", 8);
    App.Console.auditSheet1(7, "#s41", 16);
    //9获取
    App.Console.auditSheet1(8, "#s51", 8);

    $("#submit1").click(function(){
      var data = {
        workflowId : parseInt(9999999 * Math.random()),
        projectCode: $('#p11').val().trim(),
        projectName: $('#p12').val().trim(),
        title      : $("#p13").val().trim()
        //modelCode:$('#p11').val().trim(),
        //modelName:$('#s11').val().trim(),
        //modelVersionName:$('#p13').val().trim()
      };
      App.Console.apply(1, 1012, data);

    });

    $("#submit2").click(function(){
      var data = {
        workflowId                        : parseInt(9999999 * Math.random()),
        projectModelInstructionsWorkflowId: $('#s21').val().trim(),
        title                             : $("#p21").val().trim()

      };
      App.Console.apply(2, 1013, data);
    });

    $("#submit3").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s31').val().trim()
        //title: $("#p31").val().trim()
      };
      App.Console.apply(3, 1014, data);

    });
    $("#submit33").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s31').val().trim()
        //title: $("#p31").val().trim()

      };
      App.Console.apply(3, 1014, data);

    });
    $("#submit4").click(function(){
      var data = {
        workflowId                   : parseInt(9999999 * Math.random()),
        projectModelAprovalWorkflowId: $('#s41').val().trim(),
        title                        : $("#p41").val().trim()

      };
      App.Console.apply(4, 1015, data);

    });
    $("#submit5").click(function(){
      var data = {
        //workflowId:parseInt(9999999*Math.random()),
        workflowId: $('#s51').val().trim()

      };
      App.Console.apply(5, 1016, data);

    });
    $("#submit55").click(function(){
      var data = {
        status    : 4,
        workflowId: $('#s51').val().trim()

      };
      App.Console.apply(5, 1016, data);

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
  }, //获取项目列表
  getProjects(Type, cb){
    $.ajax({
      url: "/platform/project?type=" + Type
    }).done(function(data){

      cb(data)
    });
  }, //获取项目质量材料设备列表
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

  }, //项目变更
  projectChange() {
    var tpl = _.templateUrl('/console1/tpls/projectChange/projectchange.html', true);
    $("#contains").html(tpl);
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
    App.Console.auditSheet1(9, '#s21', 8);
    App.Console.auditSheet1(9, '#s31', 16);
    App.Console.auditSheet1(10, '#s41', 8);
    App.Console.auditSheet1(10, '#s51', 16);
    App.Console.auditSheet1(11, '#s51', 8);
    var data;
    $("#submit4").click(function(){
      data = {
        title                   : $('#p11').val().trim(),
        workflowId              : parseInt(9999999 * Math.random()),
        projectVersionName      : $('#p12').val().trim(),
        refProjectModelCode       : $('#s11').val(),
        refProjectModelName     : $('#s11 option:selected').text().trim(),
        refProjectModelVersionId: $('#s12').val().trim(),
        description             : $('#p13').val().trim(),
        changedFiles            : $('#p14').val().trim().split(','),
        status                  : 8
      };
      App.Console.apply(1, 1017, data);
    });
    $("#submit5").click(function(){
      data = {
        workflowId: $('#s21').val().trim(),
        status    : 16,
        title     : $('#p21').val().trim()
      };
      App.Console.apply(2, 1018, data);
    });
    $("#submit55").click(function(){
      data = {
        workflowId: $('#s21').val().trim(),
        status    : 4,
        title     : $('#p21').val().trim()
      };
      App.Console.apply(2, 1018, data);
    });
    $("#submit6").click(function(){
      data = {
        workflowId                       : parseInt(9999999 * Math.random()),
        projectModelChangeApplyWorkflowId: $('#s31').val().trim(),
        status                           : 8,
        title                            : $('#p31').val().trim()
      };
      App.Console.apply(3, 1019, data);
    });
    $("#submit7").click(function(){
      data = {
        workflowId: $('#s41').val().trim(),
        status    : 16,
        title     : $('#p41').val().trim()
      };
      App.Console.apply(4, 1020, data);
    });
    $("#submit77").click(function(){
      data = {
        workflowId: $('#s41').val().trim(),
        status    : 4,
        title     : $('#p41').val().trim()
      };
      App.Console.apply(4, 1020, data);
    });
    $("#submit8").click(function(){
      data = {
        workflowId                         : parseInt(9999999 * Math.random()),
        projectModelChangeAprovalWorkflowId: $('#s51').val().trim(),
        status                             : 8,
        title                              : $('#p51').val().trim()
      };
      App.Console.apply(5, 1021, data);
    });
    $("#submit9").click(function(){
      data = {
        workflowId: $('#s61').val().trim(),
        status    : 16
      };
      App.Console.apply(6, 1022, data);
    });
    $("#submit99").click(function(){
      data = {
        workflowId: $('#s61').val().trim(),
        status    : 4
      };
      App.Console.apply(6, 1022, data);
    });
  },
  apply(index, num, obj, type){
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
      if(data.message == "success"){
        alert("成功");
        window.location.reload();
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
        $(selector).append(str);
      }
    });
  }
};