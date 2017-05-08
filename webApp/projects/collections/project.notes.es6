/**
 * @require /projects/collections/Project.es6
 */
App.Project.NotesCollection={
	defaults:{
		pageIndexFeedBack:1
	},
	//获取批注列表的方法
	GetNotesListCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					name: ""
				}
			}
		}),
		urlType:"getNotesList",
		parse(response){
			if(response.code == 0){
				return response.data.items;
			}
		}
	})),
	getNotesListHandle(parmer){//获取批注列表的方法
		var self = this;
		var defaultData = {
			"projectId":App.Project.Settings.projectId,
			"toMeBool":true,
			"projectVersionId":"",
			"content":"",
			"opTimeStart":"",
			"opTimeEnd":"",
			"pageIndex":App.Project.NotesCollection.defaults.pageIndexFeedBack,
			"pageItemCount":15
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Project.NotesCollection.GetNotesListCollection.reset();
		App.Project.NotesCollection.GetNotesListCollection.fetch({
			data:JSON.stringify(extendData),
			type:"POST",
			contentType:"application/json",
			success:function(collection, response, options){
				// $("#listDom").find(".noDataTd").parent().remove();
				// var $content = $(".noticeListDownBox");
				// var pageCount = response.data.totalItemCount;
				// $content.find(".sumDesc").html('共 ' + pageCount + ' 个公告');
				// $content.find(".listPagination").empty().pagination(pageCount, {
				//     items_per_page: response.data.pageItemCount,
				//     current_page: response.data.pageIndex - 1,
				//     num_edge_entries: 3, //边缘页数
				//     num_display_entries: 5, //主体页数
				//     link_to: 'javascript:void(0);',
				//     itemCallback: function(pageIndex) {
				//         //加载数据
				//         App.Services.SystemCollection.Settings.pageIndex = pageIndex + 1;
				//         App.Services.SystemCollection.getListHandle();
				//     },
				//     prev_text: "上一页",
				//     next_text: "下一页"
				// });
				return response.data;
			}
		})
	}
}