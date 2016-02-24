/**
 * author: baoym@grandsoft.com.cn
 * description: general upload module
 * dependency:
 */
(function ($) {

    var isUploading = false

    var userAgent = navigator.userAgent.toLowerCase()

    var isSafari = /webkit/.test(userAgent) && !/chrome/.test(userAgent)

    var supportDirectory = function () {
        var input = document.createElement('input')
        // todo: now is chrome only
        return ('webkitdirectory' in input)
    }

    var supportDragdrop = function () {
        var div = document.createElement('div')
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
    }

    var defaultOptions = {
        // plupload options
        url: '/document/id/file/?upload&returnFirst',
        runtimes: 'html5, flash',
        unique_names: true,
        flash_swf_url: '/libs/plupload/plupload.flash.swf',
        multipart: true,
        dragdrop: false,
        browse_button: 'file-upload-btn',
        // custom options
        directory: true,
        draggable: true,
        dragAndDropUpload: true,
        skipCheckSize: 7864320 // files below 7.5M not check size(get uploaded bytes) while upload
    }

    var upload = {
        init: function (container, options) {
            debugger;
            if (!container) return
            upload.container = container
            upload.options = options || {}
            upload.__initPlUpload($.extend({}, defaultOptions, upload.options))
        },

        setMaxSize: function (size) {
            if(!upload.container) return false
            upload.container.pluploadQueue().settings.max_file_size = size
        },

        __initPlUpload: function (options) {

            var self = upload
            options.init = {
                FilesAdded: function (up, files) {
                    // quota info in the right bottom corner
                    if (options.getQuotaInfo) {
                        self.container.find('.quota-tip-info').text(options.getQuotaInfo())
                    }
                    self.__showUploadModal()
                    self.container.removeClass('uploaded-completed')
                    var parentId = options.getParentId() || ''
                    if (isSafari) {
                        //safari 5.1.7's File API not support slice method, so can not upload part of the file - 2012.11.28
                        $.each(files, function (idx, file) {
                            file.uploadedBytes = 0
                            file.parentId = parentId
                        })
                    } else {
                        $.each(files, function (idx, file) {
                            file.parentId = parentId
                        })
                    }
                    up.start()
                },
                BeforeUpload: function (up, file) {
                    if (options.getUploadedBytesUrl && (file.size > options.skipCheckSize && typeof file.uploadedBytes === 'undefined')) {
                        up.stop()
                        $.getJSON(options.getUploadedBytesUrl(file.parentId), {
                            name: file.name,
                            size: file.size
                        }, function (data) {
                            file.uploadedBytes = 0
                            up.start()
                        })
                    } else {
                        var fn = file.fullPath || file.name
                        up.settings.multipart_params = {
                            fileId: file.parentId,
                            fileName: fn,
                            size: file.size,
                            position: file.uploadedBytes || 0
                        }
                        up.settings.uploaded_bytes = file.uploadedBytes || 0
                        if (options.getUploadUrl) {
                            up.settings.url = options.getUploadUrl()
                        }
                    }
                },
                UploadFile: function (up, file) {
                    isUploading = true
                },
                FileUploaded: function (up, file, response) {
                    try {
                        options.fileUploaded(response, file)
                    } catch (e) {
                        //todo
                    }
                },
                UploadComplete: function (up, file) {
                    isUploading = false
                    self.container.addClass('uploaded-completed')
                    if (options.fileUploadCompleted) {
                        options.fileUploadCompleted(up)
                    }
                },
                FilesRemoved: function (up, files) {
                    if (up.files.length === 0) {
                        isUploading = false
                        self.container.addClass('uploaded-completed')
                    }
                },
                Error: function (up, file) {
                    if (file.code === -500) {
                        //upload initialize error, todo
                        return
                    }
                    if (file.code === 4 || file.code === -200) {
                        options.uploadError && options.uploadError(file)
                    }
                },
                Init: function (up) {
                    if (options.draggable && !isSafari && up.features.dragdrop) {
                        //add dragdrop tip
                        var tip = '可以把文件直接拖到浏览器中进行上传'
                        self.container.append($('<div>', {
                            'class': 'plupload dragdrop-tip',
                            title: tip,
                            text: tip
                        }))
                    }
                    if (up.runtime === 'flash') {
                        up.settings.url += '&result=String'
                    }
                }
            }
            if (supportDirectory() && options.directory && options.runtimes !== 'flash') {
                var buttonsIds = self.__initDirectoryUpload(options)
                options.directoryUpload = true
                options.browse_button = buttonsIds.browseButtonId
                options.browse_dir_button = buttonsIds.browseDirButtonId
            }
            //self.container.pluploadQueue(options)
            self.container.append($('<div>', {
                'class': 'plupload plupload-icon-remove',
                title: '关闭',
                click: function (e) {
                    e.stopPropagation()
                    self.__hideUploadModal()
                    if (options.onHideUploadModal) {
                        options.onHideUploadModal()
                    }
                    return false
                }
            }))
            self.container.append($('<div>', {
                'class': 'plupload plupload-icon-minus',
                title: '最小化窗口',
                click: function (e) {
                    self.__toggleUploadModal()
                    return false
                }
            }))
            if (options.getQuotaInfo) {
                self.container.append($('<div>', {
                    'class': 'plupload quota-tip-info'
                }))
            }
            if (options.draggable && self.container.draggable) {
                self.container.draggable({
                    axis: 'x',
                    containment: 'window',
                    handle: '.plupload_header'
                })
            }
            self.container.find('.plupload_header').dblclick(function () {
                self.__toggleUploadModal()
            })
            // drag and drop upload
            if (options.dragAndDropUpload && supportDragdrop) {
                $(document.body).append(drapAndDropPH)
                var dragArea = $(document.body)
                dragArea.bind('drop', function (e) {
                    dragArea.removeClass('dragupload-drag-over')
                    if (!options.canUploadFile()) return
                    if (!e.originalEvent.dataTransfer) return
                    var files = e.originalEvent.dataTransfer.files,
                        items = e.originalEvent.dataTransfer.items
                    if (items) {
                        var allFiles = []
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].kind !== 'file') continue
                            self.__showUploadModal()
                            var entry = items[i].webkitGetAsEntry()
                            if (entry.isFile) {
                                self.__readFile(entry, function (file) {
                                    allFiles.push(file)
                                })
                            } else if (entry.isDirectory) {
                                self.__showUploadModal()
                                var a = 1
                                self.__traverseDirectory(entry, function (file) {
                                    allFiles.push(file)
                                })
                            }
                        }
                        var time = 500
                        var fileNum = 0
                        var fileTimer = setTimeout(function () {
                            if (allFiles.length > fileNum) {
                                fileNum = allFiles.length
                                fileTimer = setTimeout(arguments.callee, time)
                            } else {
                                clearTimeout(fileTimer)
                                self.__addFiles(allFiles)
                            }
                        }, time)
                    } else {
                        if (files.length > 0) {
                            self.__showUploadModal()
                            self.__addFiles(files)
                        }
                    }
                    return false
                })
                dragArea.bind('dragenter dragover', function (e) {
                    if (dragArea.find(e.target).length === 1 && options.canUploadFile()) {
                        dragArea.addClass('dragupload-drag-over')
                        return false
                    }
                })
                dragArea.bind('dragleave', function (e) {
                    dragArea.removeClass('dragupload-drag-over')
                })
                $(window).on('beforeunload', function () {
                    if (isUploading) {
                        return '有文件还未上传完成，确定要离开吗？'
                    }
                })
            }
        },

        __showUploadModal: function () {
            upload.container.css({
                bottom: 0
            }).show()
            $(".plupload-icon-minus").css({
                    "background-position-x": -14
                }).attr({
                    "title": "最小化窗口"
                })
        },

        __hideUploadModal: function () {
            upload.container.animate({
                bottom: -382
            }, function () {
                $(this).hide()
                upload.container.pluploadQueue().reset()
            })
        },

        __toggleUploadModal: function () {
            if (upload.container.css('bottom') === '-382px') {
                upload.container.animate({
                    bottom: 0
                })
                $(".plupload-icon-minus").css({
                    "background-position-x": -14
                }).attr({
                    "title": "最小化窗口"
                })
            } else {
                upload.container.animate({
                    bottom: -382
                })
                $(".plupload-icon-minus").css({
                    "background-position": 0
                }).attr({
                    "title": "最大化窗口"
                })
            }
        },

        __traverseDirectory: function (entry, callback) {
            if (entry.isFile) {
                upload.__readFile(entry, callback)
            } else if (entry.isDirectory) {
                var dirReader = entry.createReader()
                dirReader.readEntries(function (entries) {
                    var el = entries.length
                    while (el--) {
                        upload.__traverseDirectory(entries[el], callback)
                    }
                })
            }
        },

        __readFile: function (fileEntry, callback) {
            fileEntry.file(function (file) {
                file.fullPath = fileEntry.fullPath
                callback && callback(file)
            })
        },

        __addFiles: function (files) {
            upload.container.pluploadQueue().addFiles(files)
        },

        __initDirectoryUpload: function (options) {
            var uploadButton = $('#' + options.browse_button)
            var uploadButtons = $('<div class="upload-dropdown-buttons">' +
                '<ul>' +
                '   <li class="upload-file-btn" id="html5-uploadfile-btn"><em class="sicon-file"></em>&nbsp;&nbsp;文件</li>' +
                '   <li class="upload-dir-btn" id="html5-uploaddir-btn"><em class="sicon-sfolder"></em>&nbsp;&nbsp;文件夹</li>' +
                '</ul></div>')
            options.browse_button = 'html5-uploadfile-btn'
            options.browse_dir_button = 'html5-uploaddir-btn'
            $(uploadButtons).appendTo(document.body)
            uploadButton.click(function (e) {
                var p = $(this).offset()
                uploadButtons.css({
                    top: p.top + $(this).height() + 2,
                    left: p.left
                }).show()
                $(document).one('click.hideuploaddropdown', function () {
                    uploadButtons.hide()
                })
                return false
            })
            return {
                browseButtonId: 'html5-uploadfile-btn',
                browseDirButtonId: 'html5-uploaddir-btn'
            }
        }
    }

    var drapAndDropPH = '' +
        '<div class="drag-helper-view-top"></div>' +
        '<div class="drag-helper-view-right"></div>' +
        '<div class="drag-helper-view-bottom"></div>' +
        '<div class="drag-helper-view-left"></div>'

    // export public method
    App.Comm.upload = {
        init: upload.init,
        setMaxSize: upload.setMaxSize,
        getUploadInstance: function () {
            if(!upload.container) return {}
            return upload.container.pluploadQueue()
        },
        setQuotaInfo: function (text) {
            if(!upload.container) return null
            upload.container.find('.quota-tip-info').text(text)
        },
        destroy: function () {
            if(!upload.container) return null
            upload.container.pluploadQueue().trigger('Destroy')
        }
    }

})(jQuery)
