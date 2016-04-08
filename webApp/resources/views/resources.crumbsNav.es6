App.ResourceCrumbsNav = Backbone.View.extend({

	tagName: "div",

	className: "resourceCrumbsNav",

	events: {
		"click .resourcesList": "itemClick",
		"click .fileModelNav": "toggleSwitchFileModel",
		"click .fileModelList li": "switchFileMoldel"
	},

	template: _.templateUrl('/resources/tpls/resources.crumbsNav.html'),

	render: function() {

		this.$el.html(this.template);

		return this;
	},

	//点击
	itemClick(event) {

		var $projectVersionList = $(event.target).closest('.resourcesList').find(".projectVersionList"),
		type=App.ResourceModel.Settings.type;
		//标准模型
		if (type == "standardLibs") {

			App.Comm.ajax({
				URLtype: "fetchStandardLibs"
			}, function(data) {

				var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.navDetail.html");
				$projectVersionList.find(".listResource").html(detail(data));
				$projectVersionList.show();
			});
		}else if (type=="famLibs") {
			
			App.Comm.ajax({
				URLtype: "fetchFamLibs"
			}, function(data) {

				var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.navDetail.html");
				$projectVersionList.find(".listResource").html(detail(data));
				$projectVersionList.show();
			});


		}
	},


	//切换 file model 
	toggleSwitchFileModel(event) {

		$(event.target).closest('.fileModelNav').find(".fileModelList").show();
	},

	//切换 文件 模型 浏览器
	switchFileMoldel(event) {

		var $target = $(event.target).closest("li"),
			type = $target.data("type");

		App.ResourceModel.Settings.leftType = type;

		if (type == "file") {

			Backbone.trigger('navClickCB', type);

		} else {

			if (!typeof(Worker)) {
				alert("请使用现代浏览器查看模型");
				return;
			} 

			if (App.ResourceModel.Settings.DataModel && App.ResourceModel.Settings.DataModel.sourceId) {
				Backbone.trigger('navClickCB', App.ResourceModel.Settings.leftType);
			} else {
				//获取模型id
				this.fetchModelIdByResource();
			}

		}
		
		$(".breadcrumbNav .fileModelList").hide();
		event.stopPropagation();

	}, 

	//获取模型id
	fetchModelIdByResource: function(errCb) {

		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		}

		// App.ResourceModel.Settings.modelId = "e0c63f125d3b5418530c78df2ba5aef1";
		// this.renderModel();
		// return;

		//获取模型
		App.Comm.ajax(data, (data) => {

			if (data.message == "success") { 

				if (data.data) {

					App.ResourceModel.Settings.DataModel = data.data;
					//成功渲染 在 resources.model.listNav.es6 中
					Backbone.trigger('navClickCB', App.ResourceModel.Settings.leftType);
				} else {
					alert("模型转换中"); 
				}
			} else { 
				alert(data.message);
			}

		});
	},


});