/**
 * @require /projects/collections/Project.es6
 */
App.Project.NotesCollection={
	defaults:{
		pageIndexNotes:1,
		pageIndexComment:1,
		toMeBool:true,
		viewpointId:''
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
				$content.find(".sumDesc").html('共 ' + pageCount + ' 条批注');
				if(pageCount == 0){
					$("#leftNotesListBox").html('<li class="loading">暂无评论</li>');
				}else{
					$content.find(".loading").remove();
				 	// $("#leftNotesListBox li").eq(0).click();//如果有批注默认去第一个批注的评论
					$content.find(".listPagination").empty().pagination(pageCount, {
					    items_per_page: response.data.pageItemCount,
					    current_page: response.data.pageIndex - 1,
					    num_edge_entries: 3, //边缘页数
					    num_display_entries: 5, //主体页数
					    link_to: 'javascript:void(0);',
					    itemCallback: function(pageIndex) {
					        //加载数据
					        App.Project.NotesCollection.defaults.pageIndexNotes = pageIndex + 1;
					        App.Project.NotesCollection.defaults.pageIndexComment=1;
					        App.Project.NotesCollection.getNotesListHandle();
					    },
					    prev_text: "上一页",
					    next_text: "下一页"
					});
				}
				return response.data;
			}
		})
	},
	getCommentListHandle(parmer){//获取批注评论列表的方法
		var self = this;
		var defaultData = {
			"viewpointId":App.Project.NotesCollection.defaults.viewpointId,
			"pageIndex":App.Project.NotesCollection.defaults.pageIndexComment,
			"pageItemCount":1
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Project.NotesCollection.GetCommentListCollection.reset();
		App.Project.NotesCollection.GetCommentListCollection.fetch({
			data:JSON.stringify(extendData),
			type:"POST",
			contentType:"application/json",
			success:function(collection, response, options){
				var commentComponentBox = this.$("#commentComponentBox");
				var pageCount = response.data.totalItemCount;
				$("#commentNumberBox").html('共 ' + pageCount + ' 条评论');
				$("#listPagination").html("");
				if(pageCount == 0){
					commentComponentBox.find(".loading").html('暂无评论');
				}else{
					commentComponentBox.find(".loading").remove();
					$("#listPagination").empty().pagination(pageCount, {
					    items_per_page: response.data.pageItemCount,
					    current_page: response.data.pageIndex - 1,
					    num_edge_entries: 3, //边缘页数
					    num_display_entries: 5, //主体页数
					    link_to: 'javascript:void(0);',
					    itemCallback: function(pageIndex) {
					        //加载数据
					        App.Project.NotesCollection.defaults.pageIndexComment = pageIndex + 1;
					        App.Project.NotesCollection.getCommentListHandle();
					    },
					    prev_text: "上一页",
					    next_text: "下一页"
					});
				}
				return response.data;
			}
		})
	},
	clickModelHandle(){//点击查看模型执行的方法
        var fileNav = $(".fileNav span.model");
        fileNav.click();
	},
	renderModelCallBackHandle(){//批注里面查看模型执行的方法
    	var hideInput = $("#viewpointInput");
		var viewpoint = hideInput.data("viewpoint");
		if(viewpoint && App.Project.Settings.Viewer){
			App.Project.Settings.Viewer.setCamera(viewpoint);
		}
	},
}