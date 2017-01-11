 App.ResourceModel.FileStatus = Backbone.View.extend({
	tagName: "div",
	className: "fileStatus",
	events: {
		"click .lookRvtFailList": "lookRvtFailListFun",
		"click .lookDwgFailList": "lookDwgFailListFun",
	},
	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.listNav.list.fileState.html"),
	//渲染
	render: function() {
		this.getFileStatusFun();
		return this;
	},
	getFileStatusFun(){//获取文件上传转换状态的方法
		var data = {
			URLtype: "getFileStatus",
			data: {
				projectId: App.ResourceModel.FileCollection.projectId,
				versionId: App.ResourceModel.FileCollection.projectVersionId,
			}
		}
		App.Comm.ajax(data, (data) => {
			if(data.code == 0){
				this.$el.html(this.template(data.data));
				// App.Comm.initScroll(this.$(".fileStateFail"), "y");
			}
		});
	},
	lookRvtFailListFun:function(evt){
		var target = $(evt.target);
		var failCount = target.data("failcount");
		var rvtFailBox = $(".rvtFailBox");
		if(failCount != 0){
			if(rvtFailBox.css("display") == "block"){
				rvtFailBox.css("display","none");
			}else{
				rvtFailBox.css("display","block");
			}
		}
	},
	lookDwgFailListFun:function(evt){
		var target = $(evt.target);
		var failCount = target.data("failcount");
		var rvtFailBox = $(".dwgFailBox");
		if(failCount != 0){
			if(rvtFailBox.css("display") == "block"){
				rvtFailBox.css("display","none");
			}else{
				rvtFailBox.css("display","block");
			}
		}
	}
})