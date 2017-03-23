App.Services.NoticeAttrManagerTopbarNewTextNotice = Backbone.View.extend({
	tagName:'div',
	className:"newTextNoticeDialog",
	template:_.templateUrl("/services/tpls/system/notice/newTextNotice.html"),
	events:{
		"click #publishBtn":"publicAjaxHandle",
		"click #saveBtn":"publicAjaxHandle",
		"click #cancelBtn":"cancelBtn",
		"click #previewNotice":"previewNotice",
	},
	default:{
		flag:true,
		edit:false,
		noticeTime:''
	},
	render(parmers){
		var defaultData = {
			title:null,
			href:null,
			publishTime:null,
			id:null,
			department:null,
			type:null,
			content:null
		};
		var data = $.extend({},defaultData,parmers);
		if(parmers){
			this.default.edit=true;
		}
		this.$el.html(this.template(data));
		this.$('#noticeTime').datetimepicker({
		  language: 'zh-CN',
		  autoclose: true,
		  format: 'yyyy-mm-dd',
		  minView: 'month'
		});
		this.$('#noticeTime').on('change',function(){
		  // _this.default.noticeTime=$(this).val();
		})
		return this;
	},
	cancelBtn(){//取消按钮的方法
		App.Services.SystemCollection.um.destroy();
		App.Services.SystemCollection.addTextNoticeDialog.close();
	},
	publicAjaxHandle(event){//公用的提交方法
		var _this = this;
		var target = $(event.target);
		var saveOrPublish = target.attr("id");
		var noticeTitleVal = $("#noticeTitle").val();
		var noticeTimeVal = $("#noticeTime").val();
		var noticeDepartementVal = $("#noticeDepartement").val();
		var dataObjAdd = {},
			dataObjEdit = {},
			linkUrl="",
			status=(saveOrPublish=="publishBtn")?1:3;
		if(noticeTitleVal==""){
			alert("公告标题不能为空！");
			return;
		}
		if(this.default.edit){
			dataObjEdit.title = noticeTitleVal;
			dataObjEdit.department = noticeDepartementVal;
			dataObjEdit.publishTime = noticeTimeVal;
			dataObjEdit.content = App.Services.SystemCollection.um.getContent();
			dataObjEdit.href = $("#hideVal").data("noticeLink");
			dataObjEdit.type = $("#hideVal").data("type");
			dataObjEdit.id = $("#hideVal").data("id");
			dataObjEdit.status = status;
		}else{
			dataObjAdd.title = noticeTitleVal;
			dataObjAdd.publishTime = noticeTimeVal;
			dataObjAdd.department = noticeDepartementVal;
			dataObjAdd.content = App.Services.SystemCollection.um.getContent();
			dataObjAdd.href = "";
			dataObjAdd.type = 2;
			dataObjAdd.status = status;
		}
		var dataObj = this.default.edit?dataObjEdit:dataObjAdd;
		var linkUrl = this.default.edit?"editNotice":"addLinkNotice";
		if(!target.hasClass("disable")){
			if(this.default.flag){
				this.default.flag=false;
				App.Comm.ajax({
					URLtype:linkUrl,
					data:JSON.stringify(dataObj),
					type:this.default.edit?"PUT":"POST",
					contentType:"application/json",
				}).done(function(res){
					if(res.code==0){
						App.Services.SystemCollection.addTextNoticeDialog.close();
						App.Services.SystemCollection.getListHandle();
						App.Services.SystemCollection.um.destroy();
						$(".buttonBox > button:gt(1)").addClass("disable");
						_this.default.flag=true;
					}else{
						alert(res.message);
					}
				})
			}
		}
	},
	previewNotice(){//预览文本公告内容
		var noticeid = $("#hideVal").data("id");
		window.open("#services/system/notice/"+noticeid,"about:blank");  
	}
})