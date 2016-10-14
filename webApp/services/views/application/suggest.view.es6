App.Services.SuggestView = {

    init: function (id) {
        var _this=this;
        var tpl = _.templateUrl('/services/tpls/application/suggest.view.html', true);
        var opts = {
            title: "建议反馈",
            width: 601,
            isConfirm: false,
            isAlert: id?false:true,
            message: tpl,
            okCallback: function(){
                var _self=this;
                _this.commit(_self);
            },
            readyFn: function () {
                var self=this;
                self.find('.upload').on("click", function () {
                    $('#inputSuggestFile').click();
                })
                self.find('#uploadIframeSuggest').on('load', function () {
                    var data = JSON.parse(this.contentDocument.body.innerText);
                    _this.afterUpload(data,self);
                })
                self.find('#inputSuggestFile').on('change', function () {
                    self.find('#uploadSuggestForm').submit();
                })
                if(id){
                    _this.initData(self,id);
                }else{
                    self.find('.footer').prepend('<a style="float:left;" href="/#suggest" target="_blank">历史反馈</a>');
                }
            }
        }
        new App.Comm.modules.Dialog(opts);
    },

    download:function(_this){
        var id=$(_this).data('id');
        window.open('/platform/advice/feedback/download/'+id,'_blank');
    },

    afterUpload:function(res,_this){
        if(res.code==0){
            _this.find('.attachList').append('<div><a data-id="'+res.data.attachmentId+'" href="javascript:;" onclick="App.Services.SuggestView.download(this);" class="alink listItem">'+res.data.attachmentName+'</a></div>');
        }
    },

    commit:function(_this){
        var user= JSON.parse(localStorage.getItem("user"));
        var data={
            "title": _this.find('#sugTitle').val(),   //标题
            "content": _this.find('#sugDescr').val(),//内容
            "createId": user.userId,//上传人用户id
            "createName": user.name,//上传人姓名
            "attachmentList": []
        }
        _this.find('.attachList a').each(function(){
            data.attachmentList.push({
                id:$(this).data('id')
            })
        })
        App.Comm.ajax({
            URLtype: "serviceCommitSuggest",
            type:"POST",
            contentType:"application/json",
            data:JSON.stringify(data)
        },function(data){
            _this.close();
        })
    },

    initData:function(_this,id){
        _this.find('#sugTitle').attr("disabled","disabled");
        _this.find('#sugDescr').attr("disabled","disabled");
        _this.find('.upload').hide();
        App.Comm.ajax({
            URLtype: "serviceQuerySuggest",
            data:{
                adviceId:id
            }
        },function(res){
            if(res.code==0){
                var data=res.data;
                _this.find('#sugTitle').val(data.title);
                _this.find('#sugDescr').val(data.content);
                _.each(data.attachmentList,function(item){
                    _this.find('.attachList').append('<div><a data-id="'+item.id+'" href="javascript:;" onclick="App.Services.SuggestView.download(this);" class="alink listItem">'+item.attachmentName+'</a></div>');
                })
            }
        })
    }

}