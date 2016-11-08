/*
 *@require /components/device/libs/jquery-1.12.0.min.js
 *@require /components/device/libs/underscore.1.8.2.js
 *@require /components/device/libs/backbone.1.1.2.js
 */

(function (win) {

    var ourl = "";
    var scripts = document.getElementsByTagName('script');
    for (var i = 0, size = scripts.length; i < size; i++) {
        if (scripts[i].src.indexOf('/static/dist/components/device/js/device.js') != -1) {
            var a = scripts[i].src.replace('/static/dist/components/device/js/device.js', '');
            ourl = a;
        }
    }
    var Project = {
        Settings: null
    };

    function DeviceSelection(options) {
        var _this = this;
        if (!(this instanceof DeviceSelection)) {
            return new DeviceSelection(options);
        }
        var defaults = {
            appKey: "18fbec1ae3da477fb47d842a53164b14",
            token: "abc3f4a2981217088aed5ecf8ede5b6397eed0795978449bda40a6987f9d6f7b0d061e9c8ad279d740ef797377b4995eb55766ccf753691161e73c592cf2416f9744adce39e1c37623a794a245027e79cd3573e7938aff5b4913fe3ed4dbea6d5be4693d85fe52f972e47e6da4617a508e5948f65135c63f"
        }

        //合并参数
        this.Settings = $.extend(defaults, options);

        //设置cookie
        if (this.Settings.appKey && this.Settings.token && !this.initCookie(this.Settings.host || ourl, this.Settings.appKey, this.Settings.token)) {
            return;
        }

        if (this.Settings.appKey && this.Settings.token) {
            this.Settings.token_cookie = "token=" + this.Settings.token + "&appKey=" + this.Settings.appKey + "&t=" + new Date().getTime();
        } else {
            this.Settings.token_cookie = "";
        }
        if (this.Settings.etag) {
            ourl = options.host || ourl;
            Project.Settings = _this.Settings;
            _this.init();
        } else {
            var strVar = "";
            strVar += "<div id=\"deviceSelector\" class=\"deviceSelector\">";
            strVar += "<\/div>";
            var $dom = $(strVar);
            $dom.css({
                height: this.Settings.height,
                width: this.Settings.width
            })
            $('body').append($dom);

            $.ajax({
                url: ourl + "/platform/api/project/" + this.Settings.projectCode + "/meta?" + _this.Settings.token_cookie
            }).done(function (data) {
                if (data.code == 0) {
                    $.ajax({
                        url: ourl + "/view/" + data.data.projectId + "/" + data.data.versionId + "/init?" + _this.Settings.token_cookie
                    }).done(function (data) {
                        if (data.code == 0) {
                            _this.Settings = $.extend({}, _this.Settings, data.data);
                            Project.Settings = _this.Settings;
                            _this.Project = Project;
                            _this.init();
                        } else if (data.code == 10004) {
                            //	document.location.href=ourl+"/login.html";
                        }
                    })
                }
            })
        }
    }

    DeviceSelection.prototype = {

        initCookie: function (ourl, appKey, token) {
            var that = this,
                isVerification = false,
                url = ourl + "/platform/token";
            $.ajax({
                url: url,
                data: {
                    appKey: appKey,
                    token: token
                },
                async: false
            }).done(function (data) {
                if (data.code == 0) {
                    that.setCookie("token_cookie", data.data);
                    isVerification = true;
                } else {
                    alert("验证失败");
                    isVerification = false;
                }
            }).fail(function (data) {
                if (data.status == 400) {
                    alert("token过期");
                }
            });
            return isVerification;
        },

        setCookie: function (name, value) {
            var Days = 30,
                host = this.Settings.host || ourl,
                exp = new Date(),
                doMain = host.substring(host.indexOf("."));
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + value + ";domain=" + doMain + ";expires=" + exp.toGMTString() + ";path=/";
        },
        //删除cookie
        delCookie: function (name) {
            var exp = new Date(),
                host = this.Settings.host || ourl,
                doMain = host.substring(host.indexOf("."));

            exp.setTime(exp.getTime() - 31 * 24 * 60 * 60 * 1000);
            var cval = App.Comm.getCookie(name);
            if (cval != null)
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";domain=" + doMain + ";path=/";
        },

        init: function () {
            if (this.isIE()) {
                this.activeXObject();
            } else {
                this.loadLib();
            }
        },

        isIE: function () {
            if (!!window.ActiveXObject || "ActiveXObject" in window)
                return true;
            else
                return false;
        },
        //activeXObject 渲染模型
        activeXObject: function () {
            WebView = document.createElement("object");
            WebView.classid = "CLSID:15A5F85D-A81B-45D1-A03A-6DBC69C891D1";

            var viewport = document.getElementById('deviceSelector');
            viewport.appendChild(WebView);

            function resizeWebView() {
                //重置
                if (window.devicePixelRatio) {
                    WebView.zoomFactor = window.devicePixelRatio;
                } else {
                    WebView.zoomFactor = screen.deviceXDPI / screen.logicalXDPI;
                }
            }

            WebView.url = ourl + "/static/dist/components/device/modal.html?sourceId=" + this.Settings.sourceId + "&etag=" +
                this.Settings.etag + "&projectId=" + this.Settings.projectId + "&projectVersionId=" + this.Settings.projectVersionId + "&ruleType=" + this.Settings.ruleType + "&appKey=" +
                this.Settings.appKey + "&token=" + this.Settings.token + "&height=" + this.Settings.height + "&width=" + this.Settings.width;
            WebView.height = this.Settings.height || "510px";
            WebView.width = this.Settings.width || "960px";

            //窗体变化
            window.onresize = resizeWebView;
            resizeWebView();
        },

        loadLib: function () {
            var self = this,
                srciptUrl = ourl + '/static/dist/libs/libsH5_20160313.js',
                commjs = ourl + '/static/dist/comm/comm_20160313.js',
                libStyle = ourl + '/static/dist/libs/libsH5_20160313.css',
                libStyle2 = ourl + '/static/dist/comm/comm_20160313.css',
                $css = '<link rel="stylesheet" href="' + libStyle + '" />',
                $css2 = '<link rel="stylesheet" href="' + libStyle2 + '" />';
            $('head').append($css, $css2);
            $.getScript(srciptUrl, function () {
                $.getScript(commjs, function () {
                })
                bimView.API.baseUrl = ourl + '/';
                //兼容Chrome浏览器
                if ($('#modelView').length <= 0) {
                    var strVar = "";
                    strVar += "<div id=\"modelView\" class=\"model\"><\/div>";
                    strVar += "    <div class=\"rightSilderBar\">";
                    strVar += "        <div class=\"before closeBtn\">关闭<\/div>";
                    strVar += "        <div class=\"headerBar\"><\/div>";
                    strVar += "        <div class=\"contentbar\"><\/div>";
                    strVar += "        <div class=\"footBar\"><\/div>";
                    strVar += "    <\/div>";
                    $('#deviceSelector').append(strVar);
                }

                self.initEvent();
                self.loadModal();
            })
        },

        initEvent: function () {
            $('.deviceSelector .before').click(function () {
                if ($(this).hasClass('closeBtn')) {
                    $('.deviceSelector .rightSilderBar').animate({
                        "right": '-300px'
                    }, 500)
                    $(this).removeClass('closeBtn');
                    $(this).html("展开");
                } else {
                    $('.deviceSelector .rightSilderBar').animate({
                        "right": '0'
                    }, 500)
                    $(this).addClass('closeBtn');
                    $(this).html("关闭");
                }
            })
        },

        loadModal: function () {
            var viewer = new bimView({
                type: 'model',
                element: $('#modelView'),
                sourceId: this.Settings.sourceId,
                etag: this.Settings.etag,
                projectId: this.Settings.projectId,
                projectVersionId: this.Settings.projectVersionId
            })
            viewer.on("loaded", function () {
            });
        }
    }
    win.DeviceSelection = DeviceSelection;
}(window))