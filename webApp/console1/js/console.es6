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
    var tpl        = _.templateUrl('/console1/tpls/fam/fam.html', true);
    $("#contains").html(tpl);
    $.ajax({
      url: "platform/project?type=2&versionStatus=9"
    }).done(function(data) {

      var items = data.data.items;

      $.each(items, function(i, item) {
        if (item.version) {
          $(".referenceResources").append('<option versionid="' + item.version.id + '" value="' + item.id + '">' + item.name + '</option>');
        }

      });
    });
    $("#submit1").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"MODULARIZE-1002",
          "timestamp":1461142526786,
          "code":0,
          "data":{
            "auditFinishTime": 1461140501424,
            "createTime": 1461140501424,
            "description": "描述",
            "designer": "设计单位",
            "developFinishDate": 1461140501452,
            "familyCode": $("#p13").val().trim(),
            "familyName": $("#p12").val().trim(),
            "refFalimyCode": $("#p11").val().trim(),
            "status": 8,
            "workflowId": "96fcdc6f4c6141a7971e34e2fe3d9e8b",
            "title": "族库研发指令表单"
          }
        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "MODULARIZE-1002",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      App.Console.post(stringData);

    });


    $("#submit2").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"MODULARIZE-1003",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":{
            "createTime": 1461140797286,
            "description": "描述",
            "familyDevelopWorkflowId": "3b617942-0c1e-458e-922a-9b1c85294f0e",
            "status": 8,
            "workflowId": "a57b543d-81da-4721-8a34-6e5dbecef4b7",
            "title": "族库报审表单"
          }
        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "MODULARIZE-1003",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      App.Console.post(stringData);

    });

    $("#submit3").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"MODULARIZE-1004",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":{
            "auditFinishTime": 1461140797765,
            "description": "描述",
            "status": 16,
            "workflowId": "32f221e0-be3e-4ce1-ba5b-7cbed4f6e1f1",
            "title": "族库报审表单"
          }
        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "MODULARIZE-1004",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      App.Console.post(stringData);

    });

    $("#submit4").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"MODULARIZE-1005",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":{
            "createTime": 1461140797779,
            "description": "描述",
            "familyAprovalWorkflowId": "7730d3f4-2efe-4e6f-9b13-b5caed740cdc",
            "status": 8,
            "workflowId": "89de41ec-c988-4aa1-82ed-aeb8b047d3bc",
            "title": "族库发布表单"
          }
        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "MODULARIZE-1005",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      App.Console.post(stringData);

    });
  },
  standardModel(){
    var tpl        = _.templateUrl('/console1/tpls/standardModel/standardmodel.html', true);
    $("#contains").html(tpl);
  },
  project(){
    var tpl        = _.templateUrl('/console1/tpls/project/project.html', true);
    $("#contains").html(tpl);
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
      url: "/platform/project/1/version"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data)
        str += "<option value=" + data.id + ">" + data.name + "</option>";
      });

      $('#versionList').append(str)

    });

    $("#submit").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"QUALIFY-1001",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data').val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "QUALIFY-1001",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "sixD/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        console.log(data);
        $("#result").val(JSON.stringify(data))

        if(data.message == "success"){
          alert("成功");
        }

      });
      //$.ajax({
      //  url : "sixD/1/" + data.projectVersionId + "/device" + App.Console.param(param), //data: stringData,
      //  //headers: {
      //  //	"Content-Type": "application/json"
      //  //},
      //  type: "GET"
      //}).done(function(data){
      //  console.log(data);
      //  if(data.message == "success"){
      //    alert("成功");
      //    window.location.reload();
      //  }
      //
      //});
    });
  },

  //获取项目质量验收列表

  qm2(){
    //2.2	过程验收
    $("#submit").click(function(){
        var data       = {
          "msgContent":JSON.stringify({
            "messageId":"411a109141d6473c83a86aa0480d6610",
            "messageType":"QUALIFY-1002",
            "timestamp":(new Date).getTime(),
            "code":0,
            "data":JSON.parse($('#data').val())

          }),
          "msgCreateTime": 1461727280227,
          "msgId": "b2e5b467ef214f6196ac3f826017806e",
          "msgSendTime": 0,
          "srcMsgType": "QUALIFY-1002",
          "retryTimes": 0,
          "status": 0,
          "sysCode": "1"
        };
        var stringData = JSON.stringify(data);
        $.ajax({
          url    : "sixD/internal/message",
          data   : stringData,
          headers: {
            "Content-Type": "application/json"
          },
          type   : "POST"
        }).done(function(data){
          $("#result").val(JSON.stringify(data))
          console.log(data)
          if(data.message == "success"){
            alert("成功");
          }

        });
  });

    //2.3	开业验收
    $("#submit1").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"QUALIFY-1003",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data1').val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "QUALIFY-1003",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "sixD/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        console.log(data)
        $("#result1").val(JSON.stringify(data))
        if(data.message == "success"){
          alert("成功");
        }

      });
    })
  },
  //获取项目质量隐患列表

  qm3(){
    //2.2	过程验收
    $("#submit").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"QUALIFY-1004",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data').val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "QUALIFY-1004",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "sixD/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        $("#result").val(JSON.stringify(data))
        console.log(data)
        if(data.message == "success"){
          alert("成功");
        }

      });
    })

  },
  //获取验收、隐患对应的构件

  qm4(){
    //2.5	验收合格数据
    $("#submit").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"QUALIFY-1005",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data').val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "QUALIFY-1005",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "sixD/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        $("#result").val(JSON.stringify(data))
        console.log(data)
        if(data.message == "success"){
          alert("成功");
        }

      });
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
    $("#submit").click(function(){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"QUALIFY-1006",
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data').val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "QUALIFY-1006",
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "sixD/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        $("#result").val(JSON.stringify(data))
        console.log(data)
        if(data.message == "success"){
          alert("成功");
        }

      });
    })
  },


  cost(){
    var tpl = _.templateUrl('/console1/tpls/cost/cost.html', true);
    $("#contains").html(tpl);

    $.ajax({
      url: "/platform/project/1/version"
    }).done(function(data){
      var str = '', datas = data.data;

      $.each(datas, function(index, data){
        console.log(data)
        str += "<option value=" + data.id + ">" + data.name + "</option>";
      });

      $('.versionList').append(str)

    });

    $("#submit1").click(function(){
      var data  = {
        projectId       : 1,
        projectVersionId: $('#p11').val().trim()

      };
      var param = {
        noElement: $("#p12").val().trim()

      };

      $.ajax({
        url : "sixD/1/" + data.projectVersionId + "/cost/summary" + App.Console.param(param),
        type: "GET"
      }).done(function(data){
        console.log(data);
        if(data.message == "success"){
          alert("成功");
        }

      });
    });

    $("#submit2").click(function(){
      var data  = {
        projectId       : 1,
        projectVersionId: $('#p21').val().trim()

      };
      var param = {
        costCode: $("#p22").val().trim()

      };

      $.ajax({
        url : "sixD/1/" + data.projectVersionId + "/cost/element" + App.Console.param(param),
        type: "GET"
      }).done(function(data){
        console.log(data);
        if(data.message == "success"){
          alert("成功");
        }

      });
    });

    $("#submit3").click(function(){
      var data  = {
        projectId       : 1,
        projectVersionId: $('#p31').val().trim()

      };
      //var param = {
      //  costCode: $("#p32").val().trim()
      //
      //};

      $.ajax({
        url : "sixD/1/" + data.projectVersionId + "/cost/nocost/cate" ,
        type: "GET"
      }).done(function(data){
        console.log(data);
        if(data.message == "success"){
          alert("成功");
        }

      });
    });
  },
  //项目变更
  projectChange() {
    var tpl        = _.templateUrl('/console1/tpls/projectChange/projectchange.html', true);
    $("#contains").html(tpl);
    App.Console.auditSheet(9,function(datas){
      var str = '';
      console.log(datas)

      $.each(datas.data, function(index, data){
        console.log(data)
        str += "<option value=" + data.no + ">" + data.title + "</option>";
      });

      $('#p21').append(str)
    },0);
    function apply(index,num){
      var data       = {
        "msgContent":JSON.stringify({
          "messageId":"411a109141d6473c83a86aa0480d6610",
          "messageType":"MODULARIZE-"+num,
          "timestamp":(new Date).getTime(),
          "code":0,
          "data":JSON.parse($('#data'+index).val())

        }),
        "msgCreateTime": 1461727280227,
        "msgId": "b2e5b467ef214f6196ac3f826017806e",
        "msgSendTime": 0,
        "srcMsgType": "MODULARIZE-"+num,
        "retryTimes": 0,
        "status": 0,
        "sysCode": "1"
      };
      var stringData = JSON.stringify(data);
      $.ajax({
        url    : "platform/internal/message",
        data   : stringData,
        headers: {
          "Content-Type": "application/json"
        },
        type   : "POST"
      }).done(function(data){
        $("#result"+index).val(JSON.stringify(data))
        console.log(data)
        if(data.message == "success"){
          alert("成功");
        }

      });
    }
    $("#submit4").click(function(){
     apply(1,1019);
    });
    $("#submit5").click(function(){
      apply(2,1020);
    });
    $("#submit6").click(function(){
      apply(3,1021);
    });
    $("#submit7").click(function(){
      apply(4,1022);
    });
    $("#submit8").click(function(){
      apply(5,1023);
    });
    $("#submit9").click(function(){
      apply(6,1024);
    });
  },
  //2016-1-1转成时间戳
  getTime(str){
    var dd = str.split('-');
    var d  = new Date();
    d.setFullYear(dd[0]);
    d.setMonth(dd[1]);
    d.setDate(dd[2]);
    return d.getTime();
  },
  //url加参数
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

  },
  //模块化公用POST请求
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
      }

    });
  },

  auditSheet(type,cb,result,id){
    $.ajax({
      url    : "platform/auditSheet?type="+type+"&auditResult="+(result||'')+(id?("&projectId="+id):"")
      //headers: {
      //  "Content-Type": "application/json"
      //},
    }).done(function(data){
      console.log(data)
      if(data.message == "success"){
        cb && cb(data);
      }
    });
  }
};