

//系统 管理入口
App.Services.System=Backbone.View.extend({

	tagName:"div",

	className:"systemContainerBox",

	events:{
		"click .serviceNav .item":"itemClick"
	},

	render(){

		this.$el.html(new App.Services.System.topBar().render().el);

		var $container = this.$el.find('.serviceNav'),
		    tabs = App.Comm.AuthConfig.Service.system,
		    Auth = App.AuthObj.service.sys;
		if (Auth.bizCategary) {
			$container.append(tabs.bizCategary.tab);

		}
		//if (Auth.workflow) {
		//	$container.append(tabs.workflow.tab);
    //
		//}
		// console.log("Auth",Auth);
		if (Auth.extendedAttribute) {
			$container.append(tabs.extendedAttribute.tab);
		}
		if (!Auth.announcementAttribute) {//公告管理标签
			$container.append(tabs.announcementAttribute.tab);
		}
		if (Auth.feedbackAttribute) {//反馈管理标签
			$container.append(tabs.feedbackAttribute.tab);
		}
		if (!Auth.resourceAttribute) {//资源管理标签
			$container.append(tabs.resourceAttribute.tab);
		}

		this.$(".serviceNav .item").eq(2).trigger("click");

		return this;
	},

	//tab 切换
	itemClick(event){
		var $target=$(event.target),type=$target.data("type"),viewer;
		$target.addClass("selected").siblings().removeClass("selected");

		if (type=="category") { 
			//业务类别
			viewer=new App.Services.System.CategoryManager();
		}else if (type=="flow") {
			//流程
			viewer=new App.Services.System.FolwManager();
		}else if (type=="extend") {
			//扩展
			viewer=new App.Services.System.ExtendAttrManager();
		}else if (type=="announcement") {
			//公告
			viewer=new App.Services.System.AnnouncementAttrManager();
		}else if (type=="feedback") {
			//反馈
			viewer=new App.Services.System.FeedbackAttrManager();
		}else if (type=="resource") {
			//资源
			viewer=new App.Services.System.ResourceAttrManager();
		} 
		this.$("#systemContainer").html(viewer.render().el);
	}
});