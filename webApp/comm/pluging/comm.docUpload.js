/**
 * @author baoym@grandsoft.com.cn
 */
(function ($) {

    'use strict'

    var docUpload = {

        __container: null,

        init: function (container, options) {
            var self = this
            self.__options = options
            self.__container = container

            var upload = $('<div>', {
                'class': 'mod-plupload'
            }).appendTo(container)

            App.Comm.upload.init(upload, {

                getParentId: function () {
                    return App.Comm.modules.util.getParentId()
                },

                getQuotaInfo: function () {
                    return self.getQuotaInfo()
                },

                canUploadFile: function () {
                    return App.Comm.modules.util.canUploadFile()
                },

                getUploadedBytesUrl: function (parentId) {
                    return App.Comm.modules.util.getUrl(parentId, {
                        bytes: false
                    })
                },

                getUploadUrl: function () {
                    return App.Comm.modules.util.getUrl(App.Comm.modules.util.getParentId(), {
                        upload: false,
                        returnFirst: false
                    })
                },

                fileUploaded: function (response, file) {
                    $.jps.publish('add-upload-file', response, file)
                },

                uploadError: function (file) {
                    App.Comm.modules.util.actionTip('上传失败:' + file.message + '。文件：' + file.file.name)
                }
            })
            self.updateQuotaInfo()
        },

        getQuotaInfo: function () {
            var quota = App.Comm.modules.util.getQuota()
            return App.Comm.modules.util.format('共 $0，已用 $1', [App.common.modules.util.formatSize(quota.total), App.common.modules.util.formatSize(quota.used)])
        },

        updateQuotaInfo: function () {
           App.Comm.upload.setQuotaInfo(this.getQuotaInfo())
        }
    }

    App.modules.docUpload = docUpload

})(jQuery)
