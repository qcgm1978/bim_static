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
	  if (!App.AuthObj.lib) {

	  } else{
		  debugger
		  var type = App.ResourcesNav.Settings.type;
		  if (type == "standardLibs") {
			  var Auth = App.AuthObj.lib.model;

			  if(!Auth.edit){
				  this.$('.btnNewFolder,.btnFileDel,.btnFileUpload').addClass('disable');
				  if(!Auth.download || !App.ResourceModel.Settings.CurrentVersion.byProjectRef){
					  this.$('.btnFileDownLoad').addClass('disable');
				  }
			  }
		  } else if (type == "famLibs") {
			  var Auth = App.AuthObj.lib.family;

			  if(!Auth.edit){
				  this.$('.btnNewFolder,.btnFileDel,.btnFileUpload').addClass('disable');
				  if(!Auth.download || !App.ResourceModel.Settings.CurrentVersion.byProjectRef){
					  this.$('.btnFileDownLoad').addClass('disable');
				  }
			  }
		  }


	  }
		  return this;
 	},

 	//创建新文件家
 	createNewFolder: function(e) {
	  if($(e.currentTarget).is('.disable')){
		  return
	  }
 		App.ResourceModel.createNewFolder();
 	},

 	//下载
 	fileDownLoad: function(e) {
	  if($(e.currentTarget).is('.disable')){
		  return
	  }
 		var $resourceListContent = $("#resourceListContent"),
 			$selFile = $resourceListContent.find(".fileContent :checkbox:checked").parent();

 		if (App.ResourceModel.Settings.type == "famLibs") {
 			$resourceListContent = $("#resourceThumContent");
 			$selFile = $resourceListContent.find(".thumContent :checkbox:checked").parent();
 		}


 		if ($selFile.length < 1) {
 			alert("请选择需要下载的文件");
 			return;
 		}


 		var FileIdArr = [];
 		$selFile.each(function(i, item) {
 			FileIdArr.push($(this).data("fileversionid"));
 		});

 		var fileVersionId = FileIdArr.join(","); 


 		//下载
		App.Comm.checkDownLoad(App.ResourceModel.Settings.CurrentVersion.projectId,App.ResourceModel.Settings.CurrentVersion.id,fileVersionId);

 	 
 	},

 	//删除文件
 	deleteFile: function(e) {
	  if($(e.currentTarget).is('.disable')){
		  return
	  }
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