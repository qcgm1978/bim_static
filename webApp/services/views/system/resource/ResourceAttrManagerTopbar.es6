//资源管理
App.Services.System.ResourceAttrManagerTopbar=Backbone.View.extend({
	default:{
		startTime:'',
		endTime:''
	},
	tagName:'div',
	className:"resourceTopbar",
	events:{
		"click .btnFileUpload":"uploadFun",
		"click .btnFileDel":"deleteFun"
	},
	render(){//渲染
		var template = _.templateUrl('/services/tpls/system/resource/resourceTopbar.html');
		this.$el.html(template);
		this.bindTimeFun();
		return this;
	},
	uploadFun(){//点击上传的你方法
		var _self = this;
		var dialogHtml = _.templateUrl('/services/tpls/system/resource/resourceUploadDialog.html',true);
		var dialog = new App.Comm.modules.Dialog({
			title: "资源上传",
			width: 500,
			height: 214,
			isConfirm: false,
			isAlert: true,
			message: dialogHtml,
			okCallback: () => {
			},
			readyFn:function(){
				var _this = this;
				var uploadLink = this.find('.upload');
				var inputSuggestFile = $('#inputSuggestFile');
				var uploadSuggestForm = $('#uploadSuggestForm');//form提交
				var uploadIframeSuggest = $('#uploadIframeSuggest');//提交之后打开ifrem保证不跳转页面 上传 
				uploadLink.on("click",function(){//点击上传按钮之后执行的方法
					inputSuggestFile.click();
				})
				uploadIframeSuggest.on("load",function(){//上传到ifrem 执行上传 并且执行了load放法
					var data = JSON.parse(this.contentDocument.body.innerText);//上传成功之后 返回的数据放到当前的ifrem里面
					_self.afterUpload(data,_this);
				})
				inputSuggestFile.on("change",function(){//当上传那妞有变化执行的方法
					uploadSuggestForm.submit();
				})
			}
		});
	},
	afterUpload(res,self){//上传完成之后执行的方法
	    if(res.code==0){
	    	var attachList = self.find('.attachList');
	    	attachList.html("");
	    	attachList.append('<li data-id="'+res.data.attachmentId+'">'+res.data.attachmentName+'</li>');
        }
	},
	deleteFun(){//删除弹出层
		var _self = this;
		var dialogHtml = _.templateUrl('/services/tpls/system/resource/resourceDeleteDialog.html',true);
		var dialog = new App.Comm.modules.Dialog({
			width: 300,
			height: 100,
			isConfirm: false,
			isAlert: false,
			message: dialogHtml,
		})
	},
	bindTimeFun(){//绑定开始和结束时间的点击事件
		var _this = this;
		this.$('#dateStar').datetimepicker({
		  language: 'zh-CN',
		  autoclose: true,
		  format: 'yyyy-mm-dd',
		  minView: 'month'
		});
		this.$('#dateEnd').datetimepicker({
		  language: 'zh-CN',
		  autoclose: true,
		  format: 'yyyy-mm-dd',
		  minView: 'month'
		});
		this.$('#dateStar').on('change',function(){
		  _this.default.startTime=$(this).val();
		})
		this.$('#dateEnd').on('change',function(){
		  _this.default.endTime=$(this).val();
		})
	}
});