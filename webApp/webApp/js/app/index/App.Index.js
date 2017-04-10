/*

write by wuweiwei

首页contrller功能

*/

App.Index = {
	init : function(){
		this.loadData();
		this.bindEvent();
	},
	loadData : function(){
		var th = this;
		App.Comm.ajax({
			type:"get",
			url:App.Restful.urls.todo,
			dataType:"json",
			success:function(data){
				if(data.code==0)
				{
					th.viewTodo(data.data.items);
				}
			}
		});
		App.Comm.ajax({
			type:"get",
			url:App.Restful.urls.broadcast,
			dataType:"json",
			success:function(data){
				if(data.code==0)
				{
					th.viewBroadcast(data.data.items);
				}
			}
		});
	},

	bindEvent : function(){
		alert(1);
		$(".sidePad").on("click",function(){
			alert(99);
		});
	},

	viewTodo : function(data){
		/*渲染数据*/
		template.repeat({
			repeatElement : $("#todo")[0], /*页面的DOM元素*/
			data : data,
			count: 5,
			process : function(itemObject){
				var item = itemObject.item;
				return {
					"receiveTime" : Assister.Date.getDateFromLong(item.receiveTime)
				}
			}
		});
	},
	viewBroadcast : function(data){
		/*渲染数据*/
		template.repeat({
			repeatElement : $("#broadcast")[0], /*页面的DOM元素*/
			data : data
		});
	}
};
