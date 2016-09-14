/**
 * @require /todo/module/todo.list.es6
 */

App.Todo = {

	Settings: {
		type: "commission",
		pageIndex: 1,
		pageItemCount: Math.floor(($("body").height() + 60) / 70) > 10 && Math.floor(($("body").height() + 60) / 70) || 10
	},

	TodoCollection: new(Backbone.Collection.extend({

		model: App.TodoModule.TodoListModule,  

		urlType: "fetchTodoData",

		parse: function(responese) {
			//成功
			if (responese.message == "success") {
				return responese.data.items;
			}
		}
	})),


	init: function() {

		//独立todo页面、隐藏头部
		$("#topBar li").hide();

		//nav
		$("#contains").html(new App.Todo.NavView().render().$el);
		// list contain
		$("#contains").append(new App.Todo.TodoListView().render().$el);


		App.Todo.loadData();
		//App.Todo.TodoCollection.fetch();

		//初始化滚动条
		App.Todo.initScroll(); 
		 
	},

	//加载数据
	loadData: function() {
		//数据重置
		App.Todo.TodoCollection.reset();
		// load list
		App.Todo.TodoCollection.fetch({

			data: {
				status: App.Todo.Settings.type == "commission" ?1 : 2,
				pageIndex: App.Todo.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			},
			success: function(collection, response, options) {

				//隐藏加载
				$("#pageLoading").hide();

				var $content = $("#todoContent"),
					$el,pageCount=response.data.totalItemCount;
				//todo 分页
				if (App.Todo.Settings.type == "commission") {
					$el = $content.find(".commissionListPagination");
					$content.find(".sumDesc").html('共 '+pageCount+' 条待办事项');
				} else {
					$el = $content.find(".alreadyListPagination");
					$content.find(".sumDesc").html('共 '+pageCount+' 条已办事项');
				}


				$el.pagination(pageCount, {
					items_per_page: response.data.pageItemCount,
					current_page: response.data.pageIndex - 1,
					num_edge_entries: 3, //边缘页数
					num_display_entries: 5, //主体页数
					link_to: 'javascript:void(0);',
					itemCallback: function(pageIndex) {
						//加载数据
						App.Todo.Settings.pageIndex = pageIndex + 1;
						App.Todo.onlyLoadData();
					},
					prev_text: "上一页",
					next_text: "下一页"

				});

				if(pageCount==0){
					Backbone.trigger('todoEmptyDataEvent');
				}
			}
		});
	},

	//只是加载数据  不分页
	onlyLoadData: function() {
		App.Todo.TodoCollection.reset();
		App.Todo.TodoCollection.fetch({
			data: {
				status: App.Todo.Settings.type == "commission" ? 1 : 2,
				pageIndex: App.Todo.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			}
		});
	},

	initScroll: function() {



	},


	//未用
	fetch: function(type) {

		//删除所有数据
		App.Todo.TodoCollection.models = [];

		$(".todoLists").empty();

		var data = [],
			msg = "我是未完成";

		if (type) {
			msg = "我是已经完成"
		};
		for (var i = 0; i < 13; i++) {
			data.push();
		}

		App.Todo.TodoCollection.add(data);
	}

}