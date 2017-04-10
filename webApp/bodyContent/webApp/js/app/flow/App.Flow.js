/*
write by wuweiwei

templateUrl:tpls/flow/flowList.html
*/
App.FLow = {
	init : function(){
		this.loadData();
	},
	loadData : function(){
		var th = this;
		App.Comm.ajax({
			type:"get",
			url:App.Restful.urls.projectsList,
			dataType:"json",
			success:function(data){
				th.viewToPage(data);
			}
		});
	},
	viewToPage : function(data){
		template.repeat({
			repeatElement : $("#projectList")[0],
			data : data.data
		});
	}
}