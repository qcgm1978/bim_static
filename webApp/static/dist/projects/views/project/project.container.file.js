"use strict";

App.Project.FileContainer = Backbone.View.extend({

	tagName: "div",

	className: "fileContainer",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.Project.FileCollection, "reset", this.reset);
		this.listenTo(App.Project.FileCollection, "add", this.addOneFile);
		this.listenTo(App.Project.FileCollection, "searchNull", this.searchNull);
	},

	events: {
		"click .header .ckAll": "ckAll",
		"click .btnFileSearch": "fileSearch",
		"click .clearSearch": "clearSearch",
		"keyup #txtFileSearch": "enterSearch"

	},

	template: _.templateUrl("/projects/tpls/project/project.container.file.html"),

	//渲染
	render: function render() {
		this.$el.html(this.template());
		var $container = this.$el.find('.serviceNav'),
		    Auth = App.AuthObj && App.AuthObj.project && App.AuthObj.project.prjfile,
		    projectId = App.Project.Settings.CurrentVersion.projectId;

		/*if (!Auth) {
  	Auth = {};
  }
   
  if (!Auth.edit) {
  	this.$('.btnFileUpload').addClass('disable');
  	if (!Auth.downLoad) {
  		this.$('.btnFileDownLoad').addClass('disable');
  	}
  }
  if (App.Project.Settings.CurrentVersion.status == 9 ||
  	App.Projects.fromCache(projectId,'subType') == 1) {
  	this.$('.btnNewFolder').addClass('disable');
  	this.$('.btnFileDel').addClass('disable');
  }
  
  if(App.Projects.fromCache(projectId,'subType') == 1){
  	this.$('.btnNewFolder').addClass('disable');
  	this.$('.btnFileDel').addClass('disable');
  }
  if (!Auth.create) {
  	this.$('.btnNewFolder').addClass('disable');
  }
  if (!Auth.delete) {
  	this.$('.btnFileDel').addClass('disable');
  }*/

		if (!App.Comm.isAuth('create')) {
			this.$('.btnNewFolder').addClass('disable');
		}
		//删除、上传、重命名权限判断方式一样
		if (!App.Comm.isAuth('upload')) {
			this.$('.btnFileUpload ').addClass('disable');
		}
		if (!App.Comm.isAuth('delete')) {
			this.$('.btnFileDel').addClass('disable');
		}
		return this;
	},

	ckAll: function ckAll(event) {
		this.$el.find(".fileContent .ckAll").prop("checked", event.target.checked);
	},


	//回车搜索
	enterSearch: function enterSearch(event) {
		if (event.keyCode == 13) {
			this.fileSearch();
		}
	},


	//搜索
	fileSearch: function fileSearch() {
		var _this = this;

		var txtSearch = $("#txtFileSearch").val().trim();

		//没有搜索内容
		if (!txtSearch) {
			return;
		}
		//搜索赋值
		App.Project.Settings.searchText = txtSearch;
		var data = {
			URLtype: "fileSearch",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId,
				key: txtSearch
			}
		};

		App.Comm.ajax(data, function (data) {

			if (data.code == 0) {
				var count = data.data.length;
				_this.$(".clearSearch").show();
				_this.$(".opBox").hide();
				_this.$(".searchCount").show().find(".count").text(count);
				App.Project.FileCollection.reset();

				if (count > 0) {
					var _temp = data.data || [];
					_.each(_temp, function (item) {
						item.isSearch = 'search';
					});
					App.Project.FileCollection.push(_temp);
				} else {
					App.Project.FileCollection.trigger("searchNull");
				}
			}
		});
	},


	//搜索为空
	searchNull: function searchNull() {
		this.$el.find(".fileContent").html('<li class="loading"><i class="iconTip"></i>未搜索到相关文件/文件夹</li>');
	},


	//清除搜索
	clearSearch: function clearSearch() {

		this.$(".clearSearch").hide();
		this.$(".opBox").show();
		this.$(".searchCount").hide();
		$("#txtFileSearch").val("");
		App.Project.Settings.searchText = "";
		App.Project.FileCollection.reset();

		var $selectFile = $(".projectNavFileContainer .selected");

		if ($selectFile.length > 0) {
			App.Project.FileCollection.fetch({
				data: {
					parentId: $selectFile.data("file").fileVersionId
				}
			});
		} else {
			App.Project.FileCollection.fetch();
		}
	},


	//添加单个li
	addOneFile: function addOneFile(model) {

		var view = new App.Project.FileContainerDetail({
			model: model
		});

		this.$el.find(".fileContent .loading").remove();

		this.$el.find(".fileContent").append(view.render().el);

		//绑定滚动条
		App.Comm.initScroll(this.$el.find(".fileContainerScrollContent"), "y");
	},

	//重置加载
	reset: function reset() {

		this.$el.find(".fileContent").html('<li class="loading">正在加载，请稍候……</li>');
	}
});