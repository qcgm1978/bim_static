App.INBox = {

	init() {
		$('#pageLoading').hide();
		$('#dataLoading').hide();
		$("#topBar li").hide();
		$("#topBar li.imbox").show();
		$("#topBar li.user").show();
		$("#contains").html(new App.INBox.NavView().render().$el);
		$("#contains").append(new App.INBox.imboxContainerView().render().$el);
		this.loadData('un');
		App.Common.loadMessageCount();
		// this.messageCollection.fetch({
		// 	reset:true,
		// 	data:{
		// 		status:0
		// 	},
		// 	success:function(collection, response, options){
		// 		collection.relData=response;
		// 	}
		// });
	},

	read(id,_this){
		App.Comm.loadMessageCount(-1);
		//window.open(App.API.Settings.hostname+"platform/message/read?id="+id);
		$(_this).closest('li').remove();
	//	this.loadData('un');
		//location.reload();

		//弹窗显示详情

	},

	messageCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchIMBoxList",
		parse: function(response) {
			return response.data;
		}
	})),

	messageAllCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchIMBoxList",
		parse: function(response) {
			return response.data;
		}
	})),

	loadData(type,index,size) {
		if(type=='all'){
			this.messageAllCollection.fetch({
				reset: true,
				data: {
					pageIndex:index||1,
					pageItemCount:size||10
				}
			})
		}else{
			this.messageCollection.fetch({
				reset: true,
				data: {
					pageIndex:index||1,
					pageItemCount:size||10,
					status: 0
				}
			})
		}
		
	}


}