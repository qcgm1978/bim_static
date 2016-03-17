App.ResourceModel.ListNavDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.list.nav.detail.html"),

	initialize: function() {
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model,"destroy",this.destroy);
	},

	//事件绑定
	events: {
		"click .fileName  .text": "fileClick",
		"click .btnEnter": "enterEditName",
		"click .btnCalcel": "calcelEditName"

	},

	render: function() {

		var data = this.model.toJSON();
		this.$el.html(this.template(data)).data("status", data.status);
		if (data.isAdd) {
			this.$el.addClass('createNew')
		}
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
				$("#reNameModel").removeClass('disable');
				//预览
				if ($item.find(".folder").length > 0) {
					$("#previewModel").addClass("disable");
					$("#previewModel").find("a").removeAttr("href");
				} else {
					 
					$("#previewModel").removeClass("disable");
					var href = $item.find(".fileName .text").prop("href");
					$("#previewModel").find("a").prop("href", href);

					//重命名 未上传
					if ($item.data("status") == 1) {
						$("#reNameModel").addClass('disable');
					}

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

					var data = App.Comm.getUrlByType(data),
						url = data.url + "?fileVersionId=" + fileVersionId;
					window.location.href = url;

				},
				'delModel': function(item) {

					//删除提示
					App.ResourceModel.delFileDialog($(item));

				},
				'reNameModel': function(item) {
					//重命名
					let $reNameModel = $("#reNameModel");
					//不可重命名状态
					if ($reNameModel.hasClass('desable')) {
						return;
					}

					var $prevEdit = $("#resourceModelListNav .fileContent .txtEdit");
					if ($prevEdit.length > 0) {
						that.cancelEdit($prevEdit); 
					}

					var $item = $(item),
						$fileName = $item.find(".fileName"),
						text = $fileName.find(".text").hide().text();

					$fileName.append('<input type="text" value="' + text + '" class="txtEdit txtInput" /> <span class="btnEnter myIcon-enter"></span><span class="btnCalcel pointer myIcon-cancel"></span>');

				}
			}
		}); 
	},

	//取消修改名称
	calcelEditName: function(event) {

		var $prevEdit = $("#resourceModelListNav .fileContent .txtEdit");

		if ($prevEdit.length > 0) {
			this.cancelEdit($prevEdit); 
		}
	},
	//修改名称
	enterEditName: function(event) {

		debugger;
		var $item = $(event.target).closest(".item"),
			fileVersionId = $item.find(".filecKAll").data("fileversionid"),
			name = $item.find(".txtEdit").val().trim();

		// //请求数据
		var data = {
			URLtype: "putFileReName",
			type: "PUT",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				fileVersionId: fileVersionId,
				name: name
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.message == "success") {

				var models=App.ResourceModel.FileCollection.models,id=data.data.id;
				
				//修改数据
				$.each(models,function(i,model){
					if (model.toJSON().id==id) {
						model.set(data.data);
					} 
				});

			//tree name
			$("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);


			} else {

				alert("修改失败");
				//取消
				var $prevEdit = $item.find(".txtEdit");
				if ($prevEdit.length > 0) {
					$prevEdit.prev().show().end().nextAll().remove().end().remove();
				}

			}
		}); 
	},

	//取消修改
	cancelEdit:function($prevEdit){
		var $item=$prevEdit.closest(".item");
		if ($item.hasClass('createNew')) {
			//取消监听 促发销毁
		 	var model=App.ResourceModel.FileCollection.last();
		 	 model.stopListening();
		 	 model.trigger('destroy', model, model.collection);
			App.ResourceModel.FileCollection.models.pop();
			//删除页面元素
			$item.remove();
		}else{
			$prevEdit.prev().show().end().nextAll().remove().end().remove();
		}
		
	},

	//销毁
	destroy:function(model){
		 debugger;
		//新建的  不用处理
		if (model.toJSON().id!="createNew") { 
			this.$el.remove();
		}
		 
	}



});