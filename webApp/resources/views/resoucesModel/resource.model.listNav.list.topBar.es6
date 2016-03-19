 App.ResourceModel.TopBar = Backbone.View.extend({

 	tagName: "div",

 	className: "topBar",

 	events: {
 		"click .btnNewFolder": "createNewFolder", //创建文件夹
 		"click .btnFileDownLoad": "fileDownLoad", //文件下载  
 		"click .btnFileDel": "deleteFile", //删除文件
 	},

 	template: _.templateUrl('/resources/tpls/resourceModel/resource.model.listNav.list.topBar.html', true),

 	render: function() {
 		this.$el.html(this.template);
 		return this;
 	},

 	//创建新文件家
 	createNewFolder: function() {
 		App.ResourceModel.createNewFolder();
 	},

 	//下载
 	fileDownLoad: function() {

 		var $resourceListContent = $("#resourceListContent"),
 			$selFile = $resourceListContent.find(".fileContent :checkbox:checked");

 		if (App.ResourceModel.Settings.type == "famLibs") {
 			$resourceListContent = $("#resourceThumContent");
 			$selFile = $resourceListContent.find(".thumContent :checkbox:checked");
 		} 

 		if ($selFile.length > 1) {
 			alert("目前只支持单文件下载");
 			return;
 		}

 		if ($selFile.length < 1) {
 			alert("请选择需要下载的文件");
 			return;
 		}
 		var fileVersionId = $selFile.parent().data("fileversionid");

 		// //请求数据
 		var data = {
 			URLtype: "downLoad",
 			data: {
 				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
 				projectVersionId:App.ResourceModel.Settings.CurrentVersion.id
 			}
 		};

 		var data = App.Comm.getUrlByType(data);
 		var url = data.url + "?fileVersionId=" + fileVersionId;
 		window.location.href = url;
 	},

 	//删除文件
 	deleteFile: function() {
 		var $resourceListContent = $("#resourceListContent"),
 			$selFile = $resourceListContent.find(".fileContent :checkbox:checked");

 		if (App.ResourceModel.Settings.type == "famLibs") {
 			$resourceListContent = $("#resourceThumContent");
 			$selFile = $resourceListContent.find(".thumContent :checkbox:checked");
 		} 

 		if ($selFile.length > 1) {
 			alert("目前只支持单文件删除");
 			return;
 		}

 		if ($selFile.length < 1) {
 			alert("请选择需要删除的文件");
 			return;
 		}

 		var $item = $selFile.closest(".item");
 		//删除
 		App.ResourceModel.delFileDialog($item);
 	}


 });