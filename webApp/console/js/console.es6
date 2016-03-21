App.Console = {

	Settings: {
		type: 0,
		step: 0
	},

	init() {

		var Settings = App.Console.Settings;

		if (Settings.type && Settings.step) {
			//族库
			if (Settings.type == 1) {
				App.Console.fam();
			} else if (Settings.type == 2) {
				//标准模型库
				App.Console.standardModel();
			} else if (Settings.type == 3) {
				//创建项目
				App.Console.project();
			} else if (Settings.type == 4) {
				//项目变更
				App.Console.projectChange();
			}



		} else {
			//主页面
			var tpl = _.templateUrl('/console/tpls/console.html', true);
			$("#contains").html(tpl);
		}

	},

	ajaxPost(data, callback) {

		var stringData = JSON.stringify(data.data);

		$.ajax({
			url: data.url,
			data: stringData,
			headers: {
				"Content-Type": "application/json"
			},
			type: "POST"
		}).done(function(data) {

			if ($.isFunction(callabck)) {
				callback(data);
			}
		});
	},


	//发起发版
	versionComm(statusList, confirmStatus, refuseStatus, successText, refuseText) {

		$.ajax({
			url: "platform/project?type=2&versionStatus=" + statusList
		}).done(function(data) {

			var items = data.data.items;

			$.each(items, function(i, item) {

				$("#famVettedList").append('<option versionid="' + item.version.id + '" value="' + item.version.projectId + '">' + item.name + '</option>');
			});

		});

		$("#submit").click(function() {


			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val(),
				versionId = $opt.attr("versionid");

			if (projectId == 0) {
				alert("未选择")
				return;
			}

			if (versionId == "null") {
				alert("没有 verisonId");
				return;
			}

			$.ajax({
				url: "platform/project/" + projectId + "/version/" + versionId + "?status=" + confirmStatus,
				type: "POST"
			}).done(function(data) {
				if (data.message == "success") {
					alert(successText)
					window.location.reload();
				}
			});

		});


		$("#refuse").click(function() {
			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val(),
				versionId = $opt.attr("versionid");
			if (projectId == 0) {
				alert("未选择")
				return;
			}

			if (versionId == "null") {
				alert("没有 verisonId");
				return;
			}

			$.ajax({
				url: "platform/project/" + projectId + "/version/" + versionId + "?status=" + refuseStatus,
				type: "POST"
			}).done(function(data) {
				if (data.message == "success") {
					alert(refuseText ? refuseText : "回退成功")
					window.location.reload();
				}
			});
		});

	},

	//下拉绑定
	bindSelect(type) {
		$.ajax({
			url: "platform/project?type=" + type + "&versionStatus=9"
		}).done(function(data) {

			var items = data.data.items;

			$.each(items, function(i, item) {
				if (item.version) {
					$("#referenceResources").append('<option versionid="' + item.version.id + '" value="' + item.id + '">' + item.name + '</option>');
				}

			});

		});
	},

	fam() {

		var Settings = App.Console.Settings;
		//发起
		if (Settings.step == 1) {
			var tpl = _.templateUrl('/console/tpls/fam/create.html', true);
			$("#contains").html(tpl);

			//绑定族库第一步
			App.Console.bindFamCreateInit();

		} else if (Settings.step == 2) {
			//初始化
			var tpl = _.templateUrl('/console/tpls/fam/init.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindFamInit();
		} else if (Settings.step == 3) {
			//发起审核
			var tpl = _.templateUrl('/console/tpls/fam/vetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindFamVettedInit();
		} else if (Settings.step == 4) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/fam/approved.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindFamAppordInit();
		} else if (Settings.step == 5) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/fam/sendVersion.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindFamSendVersionInit();
		} else if (Settings.step == 6) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/fam/sendVersionVetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindFamSendVersionVettedInit();
		}

	},

	//创建族库
	bindFamCreateInit() {

		App.Console.bindSelect(2);

		$("#submit").click(function() {
			var data = {
				type: 2,
				projectNo: $("#number").val().trim(),
				name: $("#famTitle").val().trim(),
				projectType: 2,
				estateType: 1,
				province: "上海市",
				region: "管理分区", //管理分区，最大长度32。非空 
				openTime: $("#devDate").val().trim(), //开业时间  
				//versionName: “2016 版”, //版本名称，适用于标准模型。非空字段
				designUnit: $("#launchDepartment").val().trim(),
			}

			var refer = $("#referenceResources option:selected").val();
			if (refer != 0) {
				data.referenceId = refer;
			}

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
				}

			});

		});

	},

	//族库初始化
	bindFamInit() {



		$.ajax({
			url: "platform/project?type=2&versionStatus=1"
		}).done(function(data) {

			var items = data.data.items;

			$.each(items, function(i, item) {
				$("#famVettedList").append('<option referenceid="' + item.version.referenceId + '" value="' + item.version.projectId + '">' + item.name + '</option>');
			});


		});


		$("#submit").click(function() {


			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val();

			if (projectId == 0) {
				alert("请选择要初始化的族库")
				return;
			}

		 
			var pars="projectId="+projectId+"reject=false";

			var referenceid = $opt.attr("referenceid");

			if (referenceid != "null") { 

				pars+="referenceid="+referenceid;
			}


			var dataObj = {
				data: {}
			};
			dataObj.url = "platform/project/" + projectId + "/init?"+pars;

			App.Console.ajaxPost(dataObj, function(data) {
				if (data.message == "success") {
					alert("初始化成功")
					window.location.reload();
				}
			}); 

		});



		$("#refuse").click(function() {

			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val();

			if (projectId == 0) {
				alert("请选择要初始化的族库")
				return;
			} 
		 
			var pars="projectId="+projectId+"reject=true";

			var referenceid = $opt.attr("referenceid");

			if (referenceid != "null") { 

				pars+="referenceid="+referenceid;
			} 

			var dataObj = {
				data: {}
			};
			dataObj.url = "platform/project/" + projectId + "/init?"+pars;

			App.Console.ajaxPost(dataObj, function(data) {
				if (data.message == "success") {
					alert("初始化成功")
					window.location.reload();
				}
			}); 

		});

	},

	//族库审核
	bindFamVettedInit() {

		App.Console.versionComm(4, 2, 4, "提交审核成功");

	},
	//审核批准
	bindFamAppordInit() {

		App.Console.versionComm(2, 5, 2, "审核成功");

	},

	//发起发版
	bindFamSendVersionInit() {

		App.Console.versionComm(5, 7, 5, "发版提交成功");

	},
	//族库发版批准
	bindFamSendVersionVettedInit() {

		App.Console.versionComm(7, 9, 7, "发版成功");
	},



	//标准模型库
	standardModel() {

		var Settings = App.Console.Settings;
		//发起
		if (Settings.step == 1) {
			var tpl = _.templateUrl('/console/tpls/standardModel/create.html', true);
			$("#contains").html(tpl);

			//绑定族库第一步
			App.Console.bindstandardModelCreateInit();

		} else if (Settings.step == 2) {
			//初始化
			var tpl = _.templateUrl('/console/tpls/standardModel/init.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindstandardModelInit();
		} else if (Settings.step == 3) {
			//发起审核
			var tpl = _.templateUrl('/console/tpls/standardModel/vetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindstandardModelVettedInit();
		} else if (Settings.step == 4) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/standardModel/approved.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindstandardModelAppordInit();
		} else if (Settings.step == 5) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/standardModel/sendVersion.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindstandardModelSendVersionInit();
		} else if (Settings.step == 6) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/standardModel/sendVersionVetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindstandardModelSendVersionVettedInit();
		}
	},

	//创建族库
	bindstandardModelCreateInit() {

		App.Console.bindSelect(1);

		$("#submit").click(function() {


			var data = {
				type: 1,
				projectNo: +new Date(),
				name: $("#famTitle").val().trim(),
				projectType: 2,
				estateType: 1,
				province: "上海市",
				region: "管理分区", //管理分区，最大长度32。非空 
				openTime: $("#devDate").val().trim(), //开业时间  
				versionName: $("#versionName").val().trim(),
				designUnit: $("#launchDepartment").val().trim(),
			}

			var $opt = $("#referenceResources option:selected"),
				refer = $opt.val();
			if (refer != 0) {
				data.referenceId = refer;
				data.referenceVersionId = $opt.attr("versionid");
			}


			$.ajax({
				url: "platform/project",
				data: data,
				type: "POST"
			}).done(function(data) {
				console.log(data);
			});

		});

	},

	//族库初始化
	bindstandardModelInit() {
		
		$.ajax({
			url: "platform/project?type=1&versionStatus=1"
		}).done(function(data) {

			var items = data.data.items;

			$.each(items, function(i, item) {
				$("#famVettedList").append('<option referenceid="' + item.version.referenceId + '" value="' + item.version.projectId + '">' + item.name + '</option>');
			});


		});
		

		$("#submit").click(function() {


			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val();

			if (projectId == 0) {
				alert("请选择要初始化的族库")
				return;
			}

		 
			var pars="projectId="+projectId+"reject=false";

			var referenceid = $opt.attr("referenceid");

			if (referenceid != "null") { 

				pars+="referenceid="+referenceid;
			}


			var dataObj = {
				data: {}
			};
			dataObj.url = "platform/project/" + projectId + "/init?"+pars;

			App.Console.ajaxPost(dataObj, function(data) {
				if (data.message == "success") {
					alert("初始化成功")
					window.location.reload();
				}
			}); 

		});



		$("#refuse").click(function() {

			var $opt = $("#famVettedList option:selected"),
				projectId = $opt.val();

			if (projectId == 0) {
				alert("请选择要初始化的族库")
				return;
			} 
		 
			var pars="projectId="+projectId+"reject=true";

			var referenceid = $opt.attr("referenceid");

			if (referenceid != "null") { 

				pars+="referenceid="+referenceid;
			} 

			var dataObj = {
				data: {}
			};
			dataObj.url = "platform/project/" + projectId + "/init?"+pars;

			App.Console.ajaxPost(dataObj, function(data) {
				if (data.message == "success") {
					alert("初始化成功")
					window.location.reload();
				}
			}); 

		});
	},

	//族库审核
	bindstandardModelVettedInit() {

		$("#submit").click(function() {

		});
	},
	//审核批准
	bindstandardModelAppordInit() {

	},

	//发起发版
	bindstandardModelSendVersionInit() {

	},
	//族库发版批准
	bindstandardModelSendVersionVettedInit() {

	},


	//创建项目
	project() {
		var Settings = App.Console.Settings;
		//发起
		if (Settings.step == 1) {
			var tpl = _.templateUrl('/console/tpls/project/create.html', true);
			$("#contains").html(tpl);

			//绑定族库第一步
			App.Console.bindprojectCreateInit();

		} else if (Settings.step == 2) {
			//初始化
			var tpl = _.templateUrl('/console/tpls/project/init.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectInit();
		} else if (Settings.step == 3) {
			//发起审核
			var tpl = _.templateUrl('/console/tpls/project/vetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectVettedInit();
		} else if (Settings.step == 4) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/project/approved.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectAppordInit();
		} else if (Settings.step == 5) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/project/sendVersion.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectSendVersionInit();
		} else if (Settings.step == 6) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/project/sendVersionVetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectSendVersionVettedInit();
		}
	},

	//创建项目
	bindprojectCreateInit() {

		$("#submit").click(function() {


			var data = {
				type: 2,
				projectNo: +new Date(),
				name: $("#famTitle").text().trim(),
				projectType: 2,
				estateType: 1,
				province: "上海市",
				region: "管理分区", //管理分区，最大长度32。非空 
				openTime: $("#devDate").text().trim(), //开业时间  
				//versionName: “2016 版”, //版本名称，适用于标准模型。非空字段
				designUnit: $("#launchDepartment").text().trim(),
			}

			var refer = $("#referenceResources option:selected").val();
			if (refer != 0) {
				data.referenceId = refer;
			}


			$.ajax({
				url: "platform/project",
				data: data,
				type: "POST"
			}).done(function(data) {
				console.log(data);
			});

		});


		$.ajax({
			url: "platform/project?type=2"
		}).done(function(data) {

		});
	},

	//创建项目初始化
	bindprojectInit() {
		$("#submit").click(function() {

		});
	},

	//创建项目审核
	bindprojectVettedInit() {

		$("#submit").click(function() {

		});
	},
	//审核批准
	bindprojectAppordInit() {

	},

	//发起发版
	bindprojectSendVersionInit() {

	},
	//族库发版批准
	bindprojectSendVersionVettedInit() {

	},



	//项目变更
	projectChange() {
		var Settings = App.Console.Settings;
		//发起
		if (Settings.step == 1) {
			var tpl = _.templateUrl('/console/tpls/projectChange/create.html', true);
			$("#contains").html(tpl);

			//绑定族库第一步
			App.Console.bindprojectChangeCreateInit();

		} else if (Settings.step == 2) {
			//初始化
			var tpl = _.templateUrl('/console/tpls/projectChange/init.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectChangeInit();
		} else if (Settings.step == 3) {
			//发起审核
			var tpl = _.templateUrl('/console/tpls/projectChange/vetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectChangeVettedInit();
		} else if (Settings.step == 4) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/projectChange/approved.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectChangeAppordInit();
		} else if (Settings.step == 5) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/projectChange/sendVersion.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectChangeSendVersionInit();
		} else if (Settings.step == 6) {
			//审核批准
			var tpl = _.templateUrl('/console/tpls/projectChange/sendVersionVetted.html', true);
			$("#contains").html(tpl);
			//绑定族库审核
			App.Console.bindprojectChangeSendVersionVettedInit();
		}
	},

	//项目变更
	bindprojectChangeCreateInit() {

		$("#submit").click(function() {


			var data = {
				type: 2,
				projectNo: +new Date(),
				name: $("#famTitle").text().trim(),
				projectType: 2,
				estateType: 1,
				province: "上海市",
				region: "管理分区", //管理分区，最大长度32。非空 
				openTime: $("#devDate").text().trim(), //开业时间  
				//versionName: “2016 版”, //版本名称，适用于标准模型。非空字段
				designUnit: $("#launchDepartment").text().trim(),
			}

			var refer = $("#referenceResources option:selected").val();
			if (refer != 0) {
				data.referenceId = refer;
			}


			$.ajax({
				url: "platform/project",
				data: data,
				type: "POST"
			}).done(function(data) {
				console.log(data);
			});

		});


		$.ajax({
			url: "platform/project?type=2"
		}).done(function(data) {

		});
	},

	//项目变更初始化
	bindprojectChangeInit() {
		$("#submit").click(function() {

		});
	},

	//项目变更审核
	bindprojectChangeVettedInit() {

		$("#submit").click(function() {

		});
	},
	//审核批准
	bindprojectChangeAppordInit() {

	},

	//发起发版
	bindprojectChangeSendVersionInit() {

	},
	//族库发版批准
	bindprojectChangeSendVersionVettedInit() {

	},


}