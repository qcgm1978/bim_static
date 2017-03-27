App.Services.System.FeedBackAttrManagerTopbar=Backbone.View.extend({
	tagName:'div',
	className:"feedBackTopbarSearchBox",
	template:_.templateUrl("/services/tpls/system/feedBack/feedBackAttrManagerTopbar.html"),
	default:{
		startTime:'',
		endTime:''
	},
	render(){
		var startTime = new Date().setMonth(new Date().getMonth()-1);
		var sTimeStr = new Date(startTime);
		var eTimeStr = new Date();
		var startTimeStr = sTimeStr.getFullYear() + "-" + (sTimeStr.getMonth() + 1) + "-" + sTimeStr.getDate();
		var endTimeStr = eTimeStr.getFullYear() + "-" + (eTimeStr.getMonth() + 1) + "-" + eTimeStr.getDate();
		this.default.startTime = startTimeStr;
		this.default.endTime = endTimeStr;
		this.$el.html(this.template(this.default));
		this.bindTimeFun();
		return this;
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
		this.$(".dateBox .iconCal").on("click",function() {
		    $(this).next().focus();
		});
		this.$('#dateStar').on('change',function(){
		  _this.default.startTime=$(this).val();
		})
		this.$('#dateEnd').on('change',function(){
		  _this.default.endTime=$(this).val();
		})
	},
})