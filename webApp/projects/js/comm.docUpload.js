/**
 * @author baoym@grandsoft.com.cn
 */
(function($) {

    'use strict'

    var docUpload = {

        __container: null,

        init: function(container, options) {
            var self = this
            self.__options = options
            self.__container = container

            //添加元素
            var upload = $('<div>', {
                'class': 'mod-plupload'
            }).appendTo(container)

            //初始化
            App.Comm.upload.init(upload, {

                getParentId: function() {
                    // return App.Comm.modules.util.getParentId()
                },

                getQuotaInfo: function() {
                    return self.getQuotaInfo()
                },

                //是否可以上传
                canUploadFile: function() {
                    return true;
                    //return App.Comm.modules.util.canUploadFile()
                },

                getUploadedBytesUrl: function(parentId) {
                    // return App.Comm.modules.util.getUrl(parentId, {
                    //     bytes: false
                    // })
                },

                //获取上传url
                getUploadUrl: function() {

                    return "https://yun.glodon.com/document/id/file/6082094159886999668?upload&returnFirst";
                    // return App.Comm.modules.util.getUrl(App.Comm.modules.util.getParentId(), {
                    //     upload: false,
                    //     returnFirst: false
                    // })
                },

                //上传成功
                fileUploaded: function(response, file) {

                    App.Project.FileCollection.push({
                        "fileBg": "/projects/images/proDefault.png",
                        "fileName": file.name,
                        "fileStatus": "待上传",
                        "fileOp": "赵子良",
                        "fileSize": "302M",
                        "fileDate": "2016-6-3 20:20:54"
                    });
                    console.log(file);
                    //$.jps.publish('add-upload-file', response, file)
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
            var quota = this.quota;
            return "共 20GB，已用 564.2MB"; //App.Comm.modules.util.format('共 $0，已用 $1', [App.common.modules.util.formatSize(quota.total), App.common.modules.util.formatSize(quota.used)])
        },

        //更新上传容量
        updateQuotaInfo: function() {
            App.Comm.upload.setQuotaInfo(this.getQuotaInfo())
        }
    }

    App.modules.docUpload = docUpload

})(jQuery)