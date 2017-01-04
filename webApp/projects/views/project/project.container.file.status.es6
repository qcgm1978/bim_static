App.Project.FileContainer.FileStatus = Backbone.View.extend({
	tagName: "div",
	className: "fileStatus",
	events: {
		"click .header .ckAll": "ckAll",
	},
	template: _.templateUrl("/projects/tpls/project/project.container.file.status.html"),
	//渲染
	render: function() {
		this.getFileStatusFun();
		return this;
	},
	getFileStatusFun(){//获取文件上传转换状态的方法
		var data = {
			URLtype: "getFileStatus",
			data: {
				projectId: App.Project.Settings.projectId,
				versionId: App.Project.Settings.versionId,
			}
		}
		App.Comm.ajax(data, (data) => {
			if(data.code == 0){
				this.$el.html(this.template(data.data));
			}
		});
	}
})