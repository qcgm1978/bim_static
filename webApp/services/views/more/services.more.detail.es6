App.Services=App.Services||{};
App.Services.MoreDetail=Backbone.View.extend({
	tagName:"li",
	template:_.templateUrl("/services/tpls/services.more.detail.html"),
	events:{
		"click .fileName a":"download"
	},
	render:function(){
		this.model.createTime = this.changeTimeHandle(this.model.createTime);
		this.model.size = this.changeSizeHandle(this.model.size);
		this.$el.html(this.template(this.model));
		return this;
	},
	changeTimeHandle(time){//时间转换
		var timeStr = new Date(time);
		timeStr = timeStr.getFullYear() + "-" + (timeStr.getMonth() + 1) + "-" + timeStr.getDate() + " " + timeStr.getHours() + ":" + timeStr.getMinutes() + ":" + timeStr.getSeconds();
		return timeStr;
	},
	changeSizeHandle(size){//字节转换
		var sizeStr = "";
		if(size>=1024){
			sizeStr = (size/(1024*1024)).toFixed(2)+"M";
		}else{
			sizeStr = size+"KB"
		}
		return sizeStr;
	},
	download(event){
		var targetId = $(event.target).data("id");
		var data = {
			URLtype: "downloadResource",
			data: {
				id: targetId,
			}
		} 
		window.location.href = App.Comm.getUrlByType(data).url;
	}
});
