/*
 *@require /components/device/libs/jquery-1.12.0.min.js
 *@require /components/device/libs/underscore.1.8.2.js
 *@require /components/device/libs/backbone.1.1.2.js
 *@require /components/device/libs/mock-min.js
 *@require /components/device/libs/jquery.pagination.js
 *@require /components/device/libs/jquery.nicescroll.min.js
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
    window.App={};
    var Project = {
        pageSize:20,
        pageNum:1,
        Settings: null,
        data:null,
        dataCore:{
          list:[]
        },
        dispatchIE:function(url) {
            if (navigator.userAgent.indexOf("QtWebEngine/5.7.0") > -1) {
                window.open(url);
            }
        },
    };

    var Tools={
        //获取当前检查点所在位置(页码),和当前页码所在的数据队列
        //pageNum pageSize id
        catchPageData:function(param){
            var start=0,end=0,result={},list=[],counter=0,
                opts=$.extend({},{
                    id:"",
                    pageSize:Project.pageSize,
                    pageNum:1
                },param),
                data=Project.data,
                _len=data.length;

            if(opts.id){
                for(var i=0,size=_len;i<size;i++){
                    if(data[i].id==opts.id){
                        counter=i+1;
                        break
                    }
                }
                opts.pageNum=Math.ceil(counter/opts.pageSize)||1;
            }
            start=(opts.pageNum-1)*opts.pageSize;
            end=opts.pageNum*opts.pageSize;
            end=end<_len?end:_len;
            for(;start<end;start++){
                list.push(data[start]);
            }
            result={
                items:list,
                pageCount:Math.ceil(_len/opts.pageSize),
                pageItemCount:opts.pageSize,
                pageIndex:opts.pageNum,
                totalItemCount:_len

            }
            return result;
        },

        //格式化已选数据
        formatSelectedData:function(){
            Project.dataCore.list=[];
            if(Project.Settings.selectedData){
                _.each(Project.Settings.selectedData,function(item){
                    var d=_.find(Project.Settings.data,function(c){
                        return (c.fileName==item.fileName && c.uniqueId==item.uniqueId);
                    })
                    if(d){
                        Project.dataCore.list.push(d);
                    }
                })
            }
            return Project.dataCore.list;
        }
    }
    function DeviceSelection(options) {
        var _this = this;
        if (!(this instanceof DeviceSelection)) {
            return new DeviceSelection(options);
        }
        var defaults = {
            appKey: "18fbec1ae3da477fb47d842a53164b14",
            token: "abc3f4a2981217088aed5ecf8ede5b6397eed0795978449bda40a6987f9d6f7b0d061e9c8ad279d740ef797377b4995eb55766ccf753691161e73c592cf2416f9744adce39e1c37623a794a245027e79cd3573e7938aff5b4913fe3ed4dbea6d5be4693d85fe52f972e47e6da4617a508e5948f65135c63f",
            isShowConfirm:true

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
            Project.data=Project.Settings.data;
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
                            Project.data=_this.Settings.data;
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
        setData:function(data){
            Project.data=data;
        },
        getData:function(){
            return Project.dataCore;
        },
        isIE: function () {
            if (!!window.ActiveXObject || "ActiveXObject" in window)
                return true;
            else
                return false;
        },
        //activeXObject 渲染模型
        activeXObject: function () {
            var _this=this;
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
            var data=JSON.stringify({
                data:this.Settings.data,
                selectedData:this.Settings.selectedData,
                setting:this.Settings
            });
            WebView.registerEvent('newWindow', function(url){
                if(/onData$/.test(url)){
                    WebView.runScript('getData()',function(data){
                        Project.Settings.callback.call(this,JSON.parse(data));
                    })
                }
                if(/onSelect$/.test(url)){
                    Project.Settings.callback.call(this,{});
                }
                if(/onLoad$/.test(url)){

                    WebView.runScript("init('"+data+"')", function() {
                    });
                }
            });
          /* setTimeout(function(){
               WebView.runScript("init('"+data+"')", function() {
               });
           },1000)*/
        },
        loadLib: function () {
            var self = this,
                srciptUrl = ourl + '/static/dist/libs/libsH5.js',
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
                    strVar += "        <div class=\"before\">展开<\/div>";
                    strVar += "        <div class=\"headerBar\"><\/div>";
                    strVar += "        <div class=\"contentbar\">";
                    strVar += "            <table  cellspacing=\"0\" >";
                    strVar += "                <thead>";
                    strVar += "                <tr>";
                    strVar += "                    <th class=\"checkbox\"><\/th>";
                    strVar += "                    <th>构件编码<\/th>";
                    strVar += "                <\/tr>";
                    strVar += "                <\/thead>";
                    strVar += "                <tbody class=\"contentList\">";
                    strVar += "                <\/tbody>";
                    strVar += "            <\/table>";
                    strVar += "    <\/div>";
                    strVar += "        <div class=\"footBar\"><div class=\"footPage\"><div class=\"sumDesc\"></div><div class=\"listPagination\">正在加载...<\/div><\/div><div class=\"footTool\"><a class=\"mmh-btn confirm\">确认<\/a><\/div><\/div>";
                    strVar += "    <\/div>";
                    $('#deviceSelector').append(strVar);
                }
                 self.initStyle();
              //  self.initEvent();
               // return
                var data=[];
                _.each(Project.data,function(item){
                    item.fileName&&data.push(item.fileName);
                })
                data= _.uniq(data);
                $.ajax({
                    url:'/doc/api/fileNames',
                    type:'post',
                    contentType:'application/json',
                    data:JSON.stringify({
                        "projectId":Project.Settings.projectId,//项目id
                        "projectVersionId":Project.Settings.projectVersionId,//项目版本Id
                        "fileNames":data
                    }),
                    success:function(res){
                        if(res.code==0){
                            var count=1;
                            _.each(Project.data,function(item){
                                item.id='rid_uuid_'+count;
                                var _temp=_.find(res.data, function(i){
                                    return i.fileName.toUpperCase()==item.fileName.toUpperCase();
                                });
                                if(_temp){
                                    item.componentId= _temp.modelId+"."+item.uniqueId;
                                   // item.componentId= 'a2e03fbc9984306fd90b9b939ae3b37d.5b7e29a9-6026-41d3-ad72-1b10d59c4b02-002aa916';
                                }else{
                                    item.componentId= "";
                                }
                                count++;
                            })
                            Tools.formatSelectedData();
                            self.loadModal();
                        }
                    }
                })

            })
        },
        initStyle:function(){
            if(!this.Settings.isShowConfirm){
                $('.deviceSelector .rightSilderBar .contentbar ').css('bottom','40px')
                $('.deviceSelector .rightSilderBar .footBar ').css('bottom','-40px')
                $('.footTool').hide();
            }
        },
        initEvent: function () {
            var _self=this;
            $('.deviceSelector .before').click(function () {
                if ($(this).hasClass('closeBtn')) {
                    $('.deviceSelector .rightSilderBar').animate({
                        "right": '-400px'
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

            $('.contentList').on('click',function(event){
                if(event.target.className=='checkBoxInput'){
                    var $target=$(event.target),
                        flag=$target.is(':checked');
                    var val=$target.closest('tr').data('item');
                    var list=Project.data;
                    var obj = _.find(list, function(item){ return item.id==val; });
                    if(flag){
                      //  $target.closest('tr').removeClass('preview').addClass('selected');
                        Project.dataCore.list.push(obj);
                    }else{
                     //   $target.closest('tr').removeClass('preview').removeClass('selected');
                        Project.dataCore.list=_.reject(Project.dataCore.list, function(item){
                            return val == item.id;
                        });
                    }
                   // _self.showInModel();
                }

                if(event.target.className=='colItem'){
                    var $target=$(event.target);
                    $target=$target.closest('tr');
                    if($target.hasClass('preview')){
                        $target.removeClass('preview');
                    }else{
                        $('.contentList tr.preview').removeClass('preview');
                        $target.addClass('preview');
                        var list=Project.data;
                        var val=$target.data('item');
                        var item = _.find(list, function(item){ return item.id==val; });
                        var box=item.boundingbox||item.boundingBox;
                        Project.Viewer.zoomToBox( _self.formatBBox(box));
                    }
                }

            })

            $('.confirm').click(function(){
                Project.dispatchIE("/?commType=onData");
            })
        },
        pageInfo:function(param){
            var _this=this;
            $(".listPagination").empty().pagination(param.totalItemCount, {
                items_per_page: param.pageItemCount,
                current_page: param.pageIndex-1,
                num_edge_entries: 2, //边缘页数
                num_display_entries: 3, //主体页数
                link_to: 'javascript:void(0);',
                itemCallback: function(pageIndex) {
                    _this.loadComponentList({
                        pageNum:pageIndex+1
                    });
                },
                prev_text: "上一页",
                next_text: "下一页"
            });
            $('.footPage').css('textAlign','right');
        },
        loadModal: function () {
            var _this=this;
            var viewer = new bimView({
                type: 'model',
                element: $('#modelView'),
                sourceId: this.Settings.sourceId,
                etag: this.Settings.etag,
                projectId: this.Settings.projectId,
                projectVersionId: this.Settings.projectVersionId
            })
            viewer.on("loaded", function () {
                _this.loadComponentList.call(_this);
                _this.initEvent();
                _this.showInModel(true);
                $('#modelView .modelSidebar').addClass('hideMap');
                $('#isolation').show();/*add by wangbing*/
            });
            viewer.on('click',function(){
                $('#isolation').show();
            })
            viewer.viewer.setMarkerClickCallback(function(marker){
                var id = marker? marker.id:"",
                    userId=marker? marker.userId:"",
                    data={};
                if(id){
                    _this.loadComponentList({id:id});
                    var t=$('tr[data-item="'+id+'"]');
                    if(t.length){
                        t.addClass('preview');
                    }
                    Project.Viewer.highlight({
                        type: 'userId',
                        ids: [userId]
                    });
                    Project.Viewer.viewer.getFilters().setSelectedIds([userId]);//选中与否
                    // Project.viewer.getFilters().setSelectedIds([userId]);
                }else{
                    var t=$('tr.preview').removeClass('preview');;
                }
            });
            Project.Viewer=viewer;
        },
        loadComponentList:function(param){
            var result=Tools.catchPageData(param);
            var data=result.items;
            var strVar = "",
                list=Project.dataCore.list;
            _.each(data,function(item){
                var _flag=_.find(list,function(listItem){return listItem.id==item.id });
                strVar += " <tr data-item="+item.id+" data-cid="+item.componentId+">";
                strVar += "                    <td class=\"checkbox\">";
                if(_flag){
                    strVar += "                        <input checked=\"checked\" class=\"checkBoxInput\" type=\"checkbox\">";
                }else{
                    strVar += "                        <input class=\"checkBoxInput\" type=\"checkbox\">";
                }
                strVar += "                    <\/td>";
                strVar += "                    <td  class=\"colItem\">"+item.uniqueId+"<\/td>";
                strVar += "                <\/tr>";
            })
            $('.contentList').empty().append(strVar);
            this.pageInfo(result);

            $('.contentList').niceScroll({
                cursorcolor:"#CFCFCF",
                cursoropacitymin: 0.5,
                cursoropacitymax: 0.5
            })
        },
        formatMark: function(location, color, id, shaType) {
            var _temp = location;
            if (typeof location === 'string') {
                _temp = JSON.parse(location)
            }
            _temp.shapeType = Number(_temp.shapeType || shaType || 0);
            _temp.state = Number(_temp.state || color || 0);
            _temp.userId = _temp.userId || _temp.componentId;
            _temp.id = id || '';
            return JSON.stringify(_temp);
        },
        formatBBox: function(data) {
            if (!data) {
                return [];
            }
            var box = [],
                min = data.min,
                minArr = [min.x, min.y, min.z],
                max = data.max,
                maxArr = [max.x, max.y, max.z];
            box.push(minArr);
            box.push(maxArr);
            return box;
        },
        zoom:function(ids,markers,boxs){
            Project.Viewer.setAllView(boxs,0.01);
            Project.Viewer.loadMarkers(markers);
            Project.Viewer.translucent(true);
            Project.Viewer.highlight({
                type: 'userId',
                ids: ids
            });
            Project.Viewer.viewer.getFilters().setSelectedIds(ids);
        },
        showInModel:function(isAll){
            var _this=this;
            var list=isAll?Project.data:Project.dataCore.list,
                markers=[],
                ids=[],
                boxs=[];
            _.each(list,function(item){
                var box=item.boundingbox||item.boundingBox;
                var location={
                    componentId:item.componentId,
                    position : box.max,
                    boundingBox:box
                }
                ids.push(item.componentId);
                markers.push(_this.formatMark(location,0,item.id));
                boxs.push(box);
            })
            _this.zoom(ids,markers,boxs);
        }
    }
    win.DeviceSelection = DeviceSelection;
}(window))