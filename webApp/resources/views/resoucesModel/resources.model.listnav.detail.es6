App.ResourceModel.ListNavDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.list.nav.detail.html"),

	initialize: function() {
		this.listenTo(this.model, "change", this.render);
	},

	//事件绑定
	events: {
		"click .fileName  .text": "fileClick"

	},

	render: function() {

		this.$el.html(this.template(this.model.toJSON()));
		this.bindContext();
		return this;
	},

	//文件或者文件夹点击
	fileClick: function(event) {

		var $target = $(event.target),
			id = $target.data("id"),
			isFolder = $target.data("isfolder");
		//文件夹
		if (isFolder) {

			var $leftItem = $("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']");

			if ($leftItem.length > 0) {

				$nodeSwitch = $leftItem.parent().find(".nodeSwitch");

				if ($nodeSwitch.length > 0 && !$nodeSwitch.hasClass('on')) {
					$nodeSwitch.click();
				}
				$leftItem.click();
			}

		} else {

			//文件直接跳转 不做处理

		}


	},

	//绑定右键菜单
	bindContext: function(event) {


		var that = this;
		this.$el.contextMenu('listContext', {
			//菜单样式
			// menuStyle: {
			// 	border: '1px solid #000'
			// },
			// //菜单项样式
			// itemStyle: { 
			// 	backgroundColor: 'green',
			// 	color: 'white',
			// 	border: 'none',
			// 	padding: '1px'
			// },
			// //菜单项鼠标放在上面样式
			// itemHoverStyle: {
			// 	color: 'blue',
			// 	backgroundColor: 'red',
			// 	border: 'none'
			// }, 
			//事件    

			//显示 回调
			onShowMenuCallback: function(event) {

				var $item = $(event.target).closest(".item");
				//预览
				if ($item.find(".folder").length > 0) {
					$("#previewModel").addClass("disable");
				} else {
					$("#previewModel").removeClass("disable"); 
					var href=$item.find(".fileName .text").prop("href");
					$("#previewModel").find("a").prop("href",href);

				} 
				$item.addClass("selected").siblings().removeClass("selected");




			},
			shadow: false,
			bindings: {
				'previewModel': function($target) {
					//预览

				},
				'downLoadModel': function(item) { 
					//下载
					var $item = $(item);

					if ($item.find(".folder").length > 0) {
						alert("暂不支持文件夹下载");
						return;
					}
					//下载链接 
					var fileVersionId = $item.find(".filecKAll").data("fileversionid");

					// //请求数据
					var data = {
						URLtype: "downLoad",
						data: {
							projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
							projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
						}
					};

					var data = App.Comm.getUrlByType(data);
					var url = data.url + "?fileVersionId=" + fileVersionId;
					window.location.href = url;

				},
				'delModel': function(event) {
					//删除

				},
				'reNameModel': function($target) {
					//重命名

				}
			}
		});


	},

	selected: function($target) {
		$($target).addClass("selected").siblings().removeClass("selected");
	}



});