App.Services.SystemCollection = {
	//分类列表
	CategoryCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "servicesCategoryList",
		parse(response) {
			if (response.code == 0) {
                 return response.data.items;
             }
		}
	})),

	//流程列表
	FlowCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "servicesFlowList",
		parse(response) {
			if (response.code == 0) { 
				if (response.data.length<=0) {
					$("#systemContainer .flowListBody").html('<li class="loading">无数据</li>');
				}
                 return response.data;
             }
		}
	})),

	ExtendAttrCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "extendAttrList",
		parse(response) {
			if (response.code == 0) { 
				if (response.data.length<=0) {
					$("#systemContainer .extendAttrListBody").html('<li class="loading">无数据</li>');
				}
                 return response.data;
             }
		}
	})),
	ResourceCollection:new(Backbone.Collection.extend({
		model:Backbone.Model.extend({
			defaults:function(){
				return {
					fileName:''
				}
			}
		}),
		urlType:"resourceList",
		parse(response){
			if(response.code == 0){
				return response.data;
			}
		}
	})),
	NoticeCollection:new(Backbone.Collection.extend({
		model:Backbone.Model.extend({
			defaults:function(){
				return {
					title:''
				}
			}
		}),
		urlType:"getServersNoticeList",
		parse(response){
			if(response.code == 0){
				return response.data;
			}
		}
	})),
	getListHandle(parmer){//获取公告列表的方法
		var self = this;
		var defaultData = {
			title:'',
			status:'',
			pageIndex:1,
			pageItemCount:15,
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Services.SystemCollection.NoticeCollection.reset();
		App.Services.SystemCollection.NoticeCollection.fetch({
			data:extendData,
			success:function(response){
				$("#listDom").find(".noDataTd").parent().remove();
				return response.data;
			}
		})
	},
}