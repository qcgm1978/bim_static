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
        pageSize:14,
        pageNum:1,
        Settings: null,
        dataEntry:null,
        data:null,
        dataCore:{
          list:[]
        },
        checkboxAllText:'选择全部记录',
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
        formatSelectedData:function(){//google
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
        console.log("options",options);
        var _this = this;
        if (!(this instanceof DeviceSelection)) {
            return new DeviceSelection(options);
        }
        var defaults = {
            appKey: "18fbec1ae3da477fb47d842a53164b14",
            token: "abc3f4a2981217088aed5ecf8ede5b6397eed0795978449bda40a6987f9d6f7b0d061e9c8ad279d740ef797377b4995eb55766ccf753691161e73c592cf2416f9744adce39e1c37623a794a245027e79cd3573e7938aff5b4913fe3ed4dbea6d5be4693d85fe52f972e47e6da4617a508e5948f65135c63f",
            isShowConfirm:true,
            searchDatas:[],
            checkboxLen:0,
            markers:[]
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
        if (this.Settings.etag) {//ie下 执行了model页面之后再次执行进来
            ourl = options.host || ourl;
            Project.Settings = _this.Settings;
            Project.dataEntry=Project.Settings.data;
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
                            Project.dataEntry=_this.Settings.data;
                            _this.Project = Project;
                            _this.init();
                        } else if (data.code == 10004) {
                            //  document.location.href=ourl+"/login.html";
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
                this.activeXObject();//ie
            } else {
                this.loadLib();//google
            }
        },
        setData:function(data){
            Project.data=data;
        },
        getData:function(){//点击确定按钮之后把选中的列表的 发送出去
            return Project.dataCore;
        },
        isIE: function () {//判断浏览器类型
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                return true;
            }else{
                return false;
            }
        },
        activeXObject: function () {//ie下查看 activeXObject 渲染模型
            var _this=this;

            WebView = document.createElement("object");
            WebView.classid = "CLSID:15A5F85D-A81B-45D1-A03A-6DBC69C891D1";

            var viewport = document.getElementById('deviceSelector');
            viewport.appendChild(WebView);
            function resizeWebView() {//窗体变化
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
                    WebView.runScript('getData()',function(data){//点击确定按钮 获取已经选中的列表的方法
                        Project.Settings.callback.call(this,JSON.parse(data));
                    })
                }
                if(/onSelect$/.test(url)){
                    Project.Settings.callback.call(this,{});
                }
                if(/onLoad$/.test(url)){//ie下操作
                    WebView.runScript("init('"+data+"')", function() {
                    });
                }
            });
        },
        initStyle:function(){//google
            if(!this.Settings.isShowConfirm){
                $('.deviceSelector .rightSilderBar .contentbar ').css('bottom','40px')
                $('.deviceSelector .rightSilderBar .footBar ').css('bottom','-40px')
                $('.footTool').hide();
            }
        }, 
        loadLib: function () {//google。ie第二次进来执行
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
                    strVar += "    <div id=\"modelView\" class=\"model\"><\/div>";
                    strVar += "    <div class=\"rightSilderBar\">";
                    strVar += "      <div class=\"before\">展开<\/div>";
                    strVar += "      <div class=\"hedaerSearch\">";
                    strVar += "        <span class=\"searchToggle\">选择筛选条件</span>";
                    strVar += "        <span class=\"clearSearch\">清除条件</span>";
                    strVar += "        <span class=\"groupRadio\">";
                    strVar += "          <label class=\"btnCk\"><i class=\"iconPic\"></i>显示搜索结果对应位置</label>";
                    strVar += "        </span>";
                    strVar += "      </div>";
                    strVar += "      <div class=\"searchDetail\">";
                    strVar += "        <div class=\"searchOptons\">";
                    strVar += "          <div class=\"optonLine\">";
                    strVar += "            <div class=\"myDropDown floorOption\">";
                    strVar += "                <span class=\"myDropText\">";
                    strVar += "                <span>楼层：</span> <span class=\"text\">全部</span> <i class=\"myDropArrorw\"></i> </span>";
                    strVar += "                <ul class=\"myDropList\">";
                    strVar += "                </ul>";
                    strVar += "            </div>";
                    strVar += "            <div class=\"searchName\">";
                    strVar += "                <span>位置：</span>";
                    strVar += "                <input type=\"text\" class=\"txtSearchName\" placeholder=\"请输入关键字\"/>";
                    strVar += "            </div>";
                    strVar += "          </div>";
                    strVar += "          <div class=\"optonLine btnOption\">";
                    strVar += "            <input type=\"button\" class=\"myBtn myBtn-primary btnFilter\" value=\"筛选\" />";
                    strVar += "          </div>";
                    strVar += "        </div>";
                    strVar += "      </div>";
                    strVar += "      <div class=\"headerBar\"><\/div>";
                    strVar += "      <div class=\"contentbar\">";
                    strVar += "        <div class=\"contentbarBox\">";
                    strVar += "          <div class=\"listTheader\">";
                    strVar += "            <table>";
                    strVar += "              <tr>";
                    strVar += "                <td class=\"checkbox\"><input class=\"checkAllBox\" type=\"checkbox\"></td>";
                    strVar += "                <td class=\"colItem\">楼层</td>";
                    strVar += "                <td class=\"colItem\">位置</td>";
                    strVar += "              </tr>";
                    strVar += "            </table>";
                    strVar += "          </div>";
                    strVar += "          <div class=\"listTBody\">";
                    strVar += "            <table  cellspacing=\"0\" >";
                    strVar += "              <tbody class=\"contentList\">";
                    strVar += "              </tbody>";
                    strVar += "            </table>";
                    strVar += "          </div>";
                    strVar += "        </div>";
                    strVar += "      </div>";
                    strVar += "      <div class=\"footBar\">";
                    strVar += "        <div class=\"footPage\">";
                    strVar += "          <div class=\"sumDesc\"></div>";
                    strVar += "          <div class=\"listPagination\">正在加载...</div>";
                    strVar += "        </div>";
                    strVar += "        <div class=\"footTool\"><a class=\"mmh-btn confirm\">确认</a></div>";
                    strVar += "      </div>";
                    strVar += "    </div>";
                    $('#deviceSelector').append(strVar);
                }
                self.initStyle();//google
                var data=[];
                _.each(Project.dataEntry,function(item){
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
                            _.each(Project.dataEntry,function(item){
                                item.id='rid_uuid_'+count;
                                var _temp=_.find(res.data, function(i){
                                    return i.fileName.toUpperCase()==item.fileName.toUpperCase();
                                });
                                if(_temp){
                                    item.componentId= _temp.modelId+"."+item.uniqueId;
                                }else{
                                    item.componentId= "";
                                }
                                count++;
                            })
                            self.loadFloorData();//获取楼层的信息
                            Tools.formatSelectedData();//google
                            self.loadModal();//google
                        }
                    }
                })
            })
        },
        loadFloorData:function(){//获取楼层的信息
            var ajaxUrl = "/doc/"+Project.Settings.projectId+"/"+Project.Settings.projectVersionId+"/floor/info";
            $.ajax({
                type:"get",
                url:ajaxUrl,
                contentType:'application/json',
                success:function(response){
                    var html = "<li class='myItem' data-val=''>全部</li>";
                    if(response.code == 0){
                        var data = response.data;
                        if(data.length>0){
                           for(var i=0,dataLen=data.length-1;i<=dataLen;i++){
                               html+='<li class="myItem" data-val="'+data[i].code+'">'+data[i].floor+'</li>'
                           }
                           $(".myDropList").append(html);
                        }
                    }
                }
            });
        },
        initEvent: function () {//google
            var _self=this;
            $(".groupRadio").myRadioCk({//点击显示搜索结果对应位置执行的方法
                click:function(isCk){
                    $(".contentList>tr").removeClass('preview');
                    if(Project.data.length>0){
                        _self.showInModel(true);//google
                    }else{
                        _self.showInModel(false);//google
                    }
                    if(isCk){
                        Project.Viewer.loadMarkers(_self.Settings.markers);
                    }
                }
            });
            $(".checkAllBox").click(function(e){//全选按钮的方法
                var target = $(e.target);
                var allDatas = Project.data;//点击全选的时候 刷新列表的数据
                var targetBool = target.prop("checked");
                Project.dataCore.list = targetBool?allDatas:[];//同时设置用于判断哪些是选中的数据的
                _self.Settings.checkboxLen = targetBool?allDatas.length:0;
                Project.checkboxAllText=targetBool?"取消全部记录":"选择全部记录";
                _self.addDomHtml();//拼接html结构
            })
            $(".checkAllBox").on("mouseover",function(event) {
                /* Act on the event */
                event.target.title=Project.checkboxAllText;
            });
            $(".btnFilter").click(function(e){//点击筛选按钮执行的方法
                var floorText = $(".floorOption .text").html();
                var txtSearchNameVal = $(".txtSearchName").val();
                var searchDatas = _self.Settings.searchDatas;
                var htmlData = [];
                if(floorText == "全部" && txtSearchNameVal==""){
                    htmlData=searchDatas;
                }else if(floorText != "全部" && txtSearchNameVal!=""){
                    for(var i=0,len=searchDatas.length-1;i<=len;i++){
                        if(searchDatas[i].floor.indexOf(floorText)>=0&&searchDatas[i].axis.indexOf(txtSearchNameVal)>=0){
                            htmlData.push(searchDatas[i]);
                        }
                    }
                }else if(floorText == "全部" && txtSearchNameVal!=""){
                    for(var i=0,len=searchDatas.length-1;i<=len;i++){
                        if(searchDatas[i].axis.indexOf(txtSearchNameVal)>=0){
                            htmlData.push(searchDatas[i]);
                        }
                    }
                }else if(floorText != "全部" && txtSearchNameVal==""){
                    for(var i=0,len=searchDatas.length-1;i<=len;i++){
                        if(searchDatas[i].floor.indexOf(floorText)>=0){
                            htmlData.push(searchDatas[i]);
                        }
                    }
                }
                if ($(".searchDetail").is(":animated")) {
                    return;
                }
                $(".searchDetail").slideUp();
                $(".searchToggle").removeClass('expandArrowIcon');
                Project.data = htmlData;//修改了 初始化的数据 此数据也用于了分页效果
                if($(".btnCk").hasClass("selected")){
                    $(".btnCk").removeClass("selected");
                    Project.Viewer.loadMarkers();
                }
                if(Project.data.length>0){
                    _self.showInModel(false);//google
                }else{
                    _self.showInModel(true);//google
                }
                _self.addDomHtml();//拼接html结构
            })
            $(".searchToggle").click(function(e){//搜索的切换效果
                var $searchDetail = $(".searchDetail");
                if ($searchDetail.is(":animated")) {
                    return;
                }
                $(e.currentTarget).toggleClass('expandArrowIcon');
                $searchDetail.slideToggle();
            })
            $(".clearSearch").click(function() {//清空搜索条件
                var checkAllBoxS = $(".checkAllBox");

                checkAllBoxS.prop("checked",false);
                Project.dataCore.list=[];//点击清空按钮的时候 页面列表从新刷新
                Project.data = _self.Settings.searchDatas;//把初始化的时候存起来的数据 复制给全选 使用的数据 用于全选使用

                $(".floorOption .text").html('全部');

                $(".txtSearchName").val('');

                if($(".btnCk").hasClass("selected")){
                    $(".btnCk").removeClass("selected");
                }
                Project.Viewer.loadMarkers();
                _self.Settings.checkboxLen = 0;
                Project.dataCore.list=[];//点击清空按钮的时候 页面列表从新刷新
                Project.data = _self.Settings.searchDatas;//把初始化的时候存起来的数据 复制给全选 使用的数据 用于全选使用
                $(".searchDetail").slideUp();
                $(".searchToggle").removeClass('expandArrowIcon');
                _self.addDomHtml();//拼接html结构
            })
            $(".floorOption").myDropDown({
                click: function($item) {
                    // _self.changePA('floor', $item.data("val"))
                }
            });
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

            $('.contentList').on('click',function(event){//右侧列表点击之后执行的方法
                if(event.target.className=='checkBoxInput'){//点击的是列表前面的复选框
                    var $target=$(event.target),
                        flag=$target.is(':checked');
                    var val=$target.closest('tr').data('item');
                    var list=Project.data;
                    var allDatas = Project.data;//点击单个列表的时候 用于判断当前的全选按钮是否选中的数据
                    var allDatasLen = allDatas.length;
                    var obj = _.find(list, function(item){ return item.id==val; });
                    if(flag){
                        Project.dataCore.list.push(obj);//选中的数组
                    }else{
                        Project.dataCore.list=_.reject(Project.dataCore.list, function(item){
                            return val == item.id;
                        });
                    }
                    if(flag){
                        _self.Settings.checkboxLen++;//用于判断当前复选框 选中了几个的参数
                    }else{
                        _self.Settings.checkboxLen--;
                    }
                    Project.checkboxAllText=allDatasLen==_self.Settings.checkboxLen?"取消全部记录":"选择全部记录";
                    if(allDatasLen==_self.Settings.checkboxLen){
                        $(".checkAllBox").prop('checked', true);
                    }else{
                        $(".checkAllBox").prop('checked', false);
                    }
                }
                if(event.target.className=='colItem'){//点击的是列表文字 模型高亮
                    var $target=$(event.target);
                    $target=$target.closest('tr');
                    var markers=[];
                    $(".btnCk").removeClass("selected");
                    if($target.hasClass('preview')){
                        $target.removeClass('preview');
                        Project.Viewer.highlight({
                            type: 'userId',
                            ids: []
                        });
                        Project.Viewer.loadMarkers(markers);
                        Project.Viewer.viewer.getFilters().setSelectedIds();//选中与否
                    }else{
                        $('.contentList tr.preview').removeClass('preview');
                        $target.addClass('preview');
                        var list=Project.data;
                        var val=$target.data('item');
                        var item = _.find(list, function(item){ return item.id==val; });
                        var box=item.boundingbox||item.boundingBox;
                        var location={
                            componentId:item.componentId,
                            position : box.max,
                            boundingBox:box
                        }
                        markers.push(_self.formatMark(location,0,item.id));//google
                        Project.Viewer.loadMarkers(markers);//google
                        Project.Viewer.highlight({
                            type: 'userId',
                            ids: [item.componentId]
                        });
                        Project.Viewer.zoomToBox( _self.formatBBox(box));//google
                    }
                }
            })
            $('.confirm').click(function(){
                Project.dispatchIE("/?commType=onData");
            })
        },
        loadModal: function () {//google
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
                _this.loadComponentList.call(_this);//google
                _this.initEvent();//google
                _this.showInModel(true);//google
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
                    Project.Viewer.highlight({
                        type: 'userId',
                        ids: [userId]
                    });
                    Project.Viewer.viewer.getFilters().setSelectedIds([userId]);//选中与否
                    // _this.loadComponentList({id:id});
                    _this.addDomHtml({id:id});
                    var t=$('tr[data-item="'+id+'"]');
                    if(t.length){
                        t.addClass('preview');
                    }
                    // Project.viewer.getFilters().setSelectedIds([userId]);
                }else{
                    var t=$('tr.preview').removeClass('preview');
                    Project.Viewer.viewer.getFilters().setSelectedIds();//选中与否
                    Project.Viewer.viewer.render();
                }
            });
            Project.Viewer=viewer;
        },
        loadComponentList:function(param){//google
            // var result=Tools.catchPageData(param);//用于当前数据 分页格式化
            //  // result.items 772af781efa944901a8ea5a61f1db9b6
            // Project.DataEntry//传进来的数据
            var _this = this;
            var componentListUrl = "/sixD/972066904318560/972066904318560/material/equipment";
            var urlData= [{
                "fileName": "WDGC-Q-AR-B01-构造柱.rvt",
                "revitFileId": "5d68b36c-be08-47fe-bbbc-7113ee36b953",
                "uniqueId": "238691c2-ac82-4509-8756-57dc37b357f0-00082c63",
                "boundingbox": {
                    "min": {
                        "x": -123131.73324769066,
                        "y": 68664.52547268308,
                        "z": -4299.999999999999
                    },
                    "max": {
                        "x": -122931.73324769066,
                        "y": 71964.52547268309,
                        "z": -750.0000000000027
                    }
                },
                "id": "rid_uuid_1",
                "componentId": "a7b881bc0a6a57333d16e634c41acc84.8987404e-67d4-42cb-adf0-1532249fd8b0-00222613"
            },
            {
                "fileName": "WDGC-Q-AR-B01-构造柱.rvt",
                "revitFileId": "5d68b36c-be08-47fe-bbbc-7113ee36b953",
                "uniqueId": "238691c2-ac82-4509-8756-57dc37b357f0-00082cdd",
                "boundingbox": {
                    "min": {
                        "x": -122431.73324769066,
                        "y": 68314.52547286882,
                        "z": -4679.999999999999
                    },
                    "max": {
                        "x": -114731.73324769083,
                        "y": 68514.52547286885,
                        "z": -750.0000000000027
                    }
                },
                "id": "rid_uuid_2",
                "componentId": "a7b881bc0a6a57333d16e634c41acc84.8987404e-67d4-42cb-adf0-1532249fd8b0-00222613"
            }]
            $.ajax({
                type:"post",
                url:componentListUrl,
                data:JSON.stringify({"employees":urlData}),
                contentType: "application/json",
                success:function(response){
                    if(response.code == 0){
                        var data = response.data;
                        _this.Settings.searchDatas = data;//初始化用于筛选用的数据 每次在这里数组里面筛选
                        Project.data = data;
                        _this.addDomHtml();//拼接html结构
                    }
                }
            });
        },
        addDomHtml:function(param){//拼接html结构
            var result=Tools.catchPageData(param);
            var data = Project.data;
            var strVar = "",
                list=Project.dataCore.list;
            if(data.length>0){
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
                   strVar += "                    <td  class=\"colItem\">"+item.floor+"<\/td>";
                   strVar += "                    <td  class=\"colItem\">"+item.axis+"<\/td>";
                   strVar += "                <\/tr>";
               }) 
            }else{
                strVar+="<div class=\"dataIsNull\">没有检索内容!</div>";
            }
            $('.contentList').empty().append(strVar);
            this.pageInfo(result);//google
        },
        zoom:function(ids,boxs){//google
            Project.Viewer.setAllView(boxs,0.01);
            Project.Viewer.translucent(true);
            // Project.Viewer.loadMarkers(markers);/
            // Project.Viewer.highlight({
            //     type: 'userId',
            //     ids: ids
            // });
            // Project.Viewer.viewer.getFilters().setSelectedIds(ids);
        },
        showInModel:function(isAll){//google
            var _this=this;
            // var list=isAll?Project.data:Project.dataCore.list,
            var list=isAll?Project.dataEntry:Project.data,
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
            this.Settings.markers = markers;
            _this.zoom(ids,boxs);//google
        },
        pageInfo:function(param){//google
            var _this=this;
            $(".listPagination").empty().pagination(param.totalItemCount, {
                items_per_page: param.pageItemCount,
                current_page: param.pageIndex-1,
                num_edge_entries: 2, //边缘页数
                num_display_entries: 3, //主体页数
                link_to: 'javascript:void(0);',
                itemCallback: function(pageIndex) {
                    _this.addDomHtml({
                        pageNum:pageIndex+1
                    });
                },
                prev_text: "上一页",
                next_text: "下一页"
            });
            $('.footPage').css('textAlign','right');
        },
        formatMark: function(location, color, id, shaType) {//google
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
        formatBBox: function(data) {//google
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
    }
    win.DeviceSelection = DeviceSelection;
}(window))