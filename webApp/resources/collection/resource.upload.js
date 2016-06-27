/**
 * @author baoym@grandsoft.com.cn
 */
(function($) {

	'use strict'

	var docUpload = {

		__container: null,

		init: function(container, options) {
			var self = this;
			self.__options = options;
			self.__container = container;

			//添加元素
			var upload = $('<div>', {
				'class': 'mod-plupload'
			}).appendTo(container)

			//初始化
			App.Comm.upload.init(upload, {

				getParentId: function() {

					return App.ResourceModel.Settings.fileVersionId;
				},

				getQuotaInfo: function() {
					return self.getQuotaInfo()
				},

				//是否可以上传
				canUploadFile: function() {
					if (App.ResourceModel.Settings.fileVersionId) {
						return true;
					} else {
						return false;
					}


					//return App.Comm.modules.util.canUploadFile()
				},

				// getUploadedBytesUrl: function(parentId) {
				//     // return App.Comm.modules.util.getUrl(parentId, {
				//     //     bytes: false
				//     // })
				// },

				//获取上传url
				getUploadUrl: function(file) {


					var data = {
						data: {
							projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
							projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
						},
						URLtype: "uploadFile"
					};

					return App.Comm.getUrlByType(data).url;


					//return "http://172.16.233.210:8080/bim/api/1232321/file/data?fileId=444444444444";
					// return App.Comm.modules.util.getUrl(App.Comm.modules.util.getParentId(), {
					//     upload: false,
					//     returnFirst: false
					// })
				},

				//上传成功
				fileUploaded: function(response, file) {


					var data = JSON.parse(response.response),
						type = App.ResourceModel.Settings.type,
						models = App.ResourceModel.FileCollection.models,
						$leftSel=$("#resourceFamlibsLeftNav .treeViewMarUl .selected"),
						parentId="",
						has = false;
					if (type == "famLibs") {
						models = App.ResourceModel.FileThumCollection.models;
					}


					$.each(models, function(index, model) {
						if (model.toJSON().id == data.data.id) {
							has = true;
							model.set(data.data);
							return false;
						}
					});
					//新增
					if (!has) {
						data.data.isAdd = true;
						if (type == "famLibs") {
							App.ResourceModel.FileThumCollection.add(data.data);
						} else if (type == "standardLibs") {
							App.ResourceModel.FileCollection.add(data.data);
						}

					}

					if ($leftSel.length > 0) {
						parentId = $leftSel.data("file").fileVersionId;
					}

					if(data.data.folder){
						this.afterCreateNewFolder(data.data);
						//App.ResourceModel.afterCreateNewFolder(data.data, parentId);
					}
					
					//$.jps.publish('add-upload-file', response, file)
				},

				  //上传文件后操作
                afterCreateNewFolder(data) {

                    App.ResourceModel.afterCreateNewFolder(data, data.parentId);

                    if (data.children) {

                        var count=data.children.length;

                        for(var i=0;i<count;i++){
                            this.afterCreateNewFolder(data.children[i]);
                        }
                    }
                },

				//上传失败
				uploadError: function(file) {
					//App.Comm.modules.util.actionTip('上传失败:' + file.message + '。文件：' + file.file.name)
				}
			})
			self.updateQuotaInfo()
		},

		//获取上传容量
		getQuotaInfo: function() {
			//var quota = this.quota;
			//return "共 20GB，已用 564.2MB"; //App.Comm.modules.util.format('共 $0，已用 $1', [App.common.modules.util.formatSize(quota.total), App.common.modules.util.formatSize(quota.used)])
		},

		//更新上传容量
		updateQuotaInfo: function() {
			App.Comm.upload.setQuotaInfo(this.getQuotaInfo())
		}
	}

	App.ResourceUpload = docUpload

})(jQuery)