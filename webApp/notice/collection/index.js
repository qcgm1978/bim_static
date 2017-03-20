App.Notice = {
	defaults:{
		searchData:[]
	},
	init: function() {
		$("#pageLoading").hide();//隐藏加载
		$("#contains").html(new App.Notice.NoticeListView().render().$el);
		// App.Notice.loadData();//初始化之后获取列表数据
	},
	NoticeCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults:function(){
				return {
					title:''
				}
			} 
		}),  
		urlType: "getServersNoticeList",
		parse: function(responese) {
			if (responese.message == "success") {
				return responese.data.items;
			}
		}
	})),
	loadData:function(parme){//初始化之后获取列表数据
		var self = this;
		var defaultData = {
			title:'',
			status:1,
			pageIndex:1,
			pageItemCount:15,
		};
		var extendData = $.extend({},defaultData,parme);
		//数据重置
		App.Notice.NoticeCollection.reset();
		App.Notice.NoticeCollection.fetch({
			data:extendData,
			success:function(response){
				$("#listDomBox").find(".noDataTd").parent().remove();
				return response.data;
			}
		})


		
		// App.Notice.NoticeCollection.reset();
		// App.Notice.NoticeCollection.fetch({
		// 	data:extendData,
		// 	success: function(collection, response, options) {
		// 		//隐藏加载
		// 		$("#pageLoading").hide();
				// self.defaults.searchData = response.data.data;
		// 		// var $content = $("#todoContent"),
		// 		// 	$el,pageCount=response.data.totalItemCount;
		// 		// //todo 分页
		// 		// if (App.Todo.Settings.type == "commission") {
		// 		// 	$el = $content.find(".commissionListPagination");
		// 		// 	$content.find(".commissionBottom .sumDesc").html('共 '+pageCount+' 条待办事项');
		// 		// } else {
		// 		// 	$el = $content.find(".alreadyListPagination");
		// 		// 	$content.find(".alreadyBottom .sumDesc").html('共 '+pageCount+' 条已办事项');
		// 		// }


		// 		// $el.pagination(pageCount, {
		// 		// 	items_per_page: response.data.pageItemCount,
		// 		// 	current_page: response.data.pageIndex - 1,
		// 		// 	num_edge_entries: 3, //边缘页数
		// 		// 	num_display_entries: 5, //主体页数
		// 		// 	link_to: 'javascript:void(0);',
		// 		// 	itemCallback: function(pageIndex) {
		// 		// 		//加载数据
		// 		// 		App.Todo.Settings.pageIndex = pageIndex + 1;
		// 		// 		App.Todo.onlyLoadData();
		// 		// 	},
		// 		// 	prev_text: "上一页",
		// 		// 	next_text: "下一页"

		// 		// });

		// 		// if(pageCount==0){
		// 		// 	Backbone.trigger('todoEmptyDataEvent');
		// 		// }
		// 	}
		// })
	}
}