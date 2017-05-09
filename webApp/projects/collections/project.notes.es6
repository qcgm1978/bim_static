/**
 * @require /projects/collections/Project.es6
 */
App.Project.NotesCollection={
	defaults:{
		pageIndexNotes:1,
		toMeBool:true
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
	//获取批注评论列表的方法
	GetCommentListCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					name: ""
				}
			}
		}),
		urlType:"getCommentList",
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
			"toMeBool":App.Project.NotesCollection.defaults.toMeBool,
			"projectVersionId":"",
			"content":"",
			"opTimeStart":"",
			"opTimeEnd":"",
			"pageIndex":App.Project.NotesCollection.defaults.pageIndexNotes,
			"pageItemCount":8
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Project.NotesCollection.GetNotesListCollection.reset();
		App.Project.NotesCollection.GetNotesListCollection.fetch({
			data:JSON.stringify(extendData),
			type:"POST",
			contentType:"application/json",
			success:function(collection, response, options){
				var $content = $(".leftNotesListBox");
				var pageCount = response.data.totalItemCount;
				$content.find(".loading").remove();
				$content.find(".sumDesc").html('共 ' + pageCount + ' 条批注');
				$content.find(".listPagination").empty().pagination(pageCount, {
				    items_per_page: response.data.pageItemCount,
				    current_page: response.data.pageIndex - 1,
				    num_edge_entries: 3, //边缘页数
				    num_display_entries: 5, //主体页数
				    link_to: 'javascript:void(0);',
				    itemCallback: function(pageIndex) {
				        //加载数据
				        $content.find("#leftNotesListBox").html("");
				        App.Project.NotesCollection.defaults.pageIndexNotes = pageIndex + 1;
				        App.Project.NotesCollection.getNotesListHandle();
				    },
				    prev_text: "上一页",
				    next_text: "下一页"
				});
				return response.data;
			}
		})
	},
	getCommentListHandle(parmer){//获取批注评论列表的方法
		var self = this;
		var defaultData = {
			"viewpointId":'',
			"pageIndex":App.Project.NotesCollection.defaults.pageIndexNotes,
			"pageItemCount":8
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Project.NotesCollection.GetCommentListCollection.reset();
		App.Project.NotesCollection.GetCommentListCollection.fetch({
			data:JSON.stringify(extendData),
			type:"POST",
			contentType:"application/json",
			success:function(collection, response, options){
				// var $content = $(".leftNotesListBox");
				// var pageCount = response.data.totalItemCount;
				// $content.find(".sumDesc").html('共 ' + pageCount + ' 条批注');
				// $content.find(".listPagination").empty().pagination(pageCount, {
				//     items_per_page: response.data.pageItemCount,
				//     current_page: response.data.pageIndex - 1,
				//     num_edge_entries: 3, //边缘页数
				//     num_display_entries: 5, //主体页数
				//     link_to: 'javascript:void(0);',
				//     itemCallback: function(pageIndex) {
				//         //加载数据
				//         App.Project.NotesCollection.defaults.pageIndexNotes = pageIndex + 1;
				//         App.Project.NotesCollection.getNotesListHandle();
				//     },
				//     prev_text: "上一页",
				//     next_text: "下一页"
				// });
				return response.data;
			}
		})
	}
}