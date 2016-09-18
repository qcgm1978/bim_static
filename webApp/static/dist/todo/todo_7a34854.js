;/*!/todo/module/todo.list.es6*/
'use strict';

App.TodoModule = {};

App.TodoModule.TodoListModule = Backbone.Model.extend({

	defaults: function defaults() {
		return {
			title: ''
		};
	}
});
;/*!/todo/collections/index.js*/
/**
 * @require todo/module/todo.list.es6
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
;/*!/todo/views/todo.list.detail.js*/


App.Todo.TodoDetailView=Backbone.View.extend({

	tagName:'li',

	className:'todoDetailView',

	// 重写初始化
	initialize:function(){ 
		this.listenTo(this.model, 'change', this.render);
	    this.listenTo(this.model, 'destroy', this.removeItem); 
	},



	//代办
	events:{
		 
	},  

	template:_.templateUrl("./todo/tpls/todo.list.detail.html"),

	// template:function(){
	// 	if (App.Todo.Settings.type=="commission") {
	// 		return _.templateUrl("./todo/tpls/todo.list.detail.html");
	// 	}else{
	// 		 return _.templateUrl("./todo/tpls/todo.list.detail.html");
	// 	}
	// }


	

	render:function(){
	 
		var data=this.model.toJSON();
		data.type=App.Todo.Settings.type;
		this.$el.html(this.template(data)).attr("cid",this.model.cid); 
		 
		return this;

	}

});

;/*!/todo/views/todo.list.js*/


App.Todo.TodoListView=Backbone.View.extend({

	tagName:'div',

	className:'todoList',

	// 重写初始化
	initialize:function(){ 
		this.listenTo(App.Todo.TodoCollection, 'reset', this.resetDom);  
		this.listenTo(App.Todo.TodoCollection, 'add', this.addOne);  
		Backbone.on('todoEmptyDataEvent',this.emptyDom,this);
	}, 

	//代办
	events:{
		 
	},  

	template:_.templateUrl("./todo/tpls/todo.list.html",true),

	render:function(){ 
	 
		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	},

	addOne:function(model){ 
		//渲染单个view
	    var view=new App.Todo.TodoDetailView({model:model});
	    
	    if (App.Todo.Settings.type=="commission") {
			this.$el.find('.commissionLists').append(view.render().el); 
			this.bindScroll("commissionLists");
	    }else{
	    	this.$el.find('.alreadyLists').append(view.render().el); 
	    	this.bindScroll();
	    }
    	
	} ,

	resetDom:function(){
		this.$el.find('.'+App.Todo.Settings.type+'Lists').empty();
	},
	emptyDom:function(){
		this.$el.find('.'+App.Todo.Settings.type+'Lists').html('<span class="noData"><i class="tip"></i>暂无'+(App.Todo.Settings.type=='already'?'已':'待')+'办</span>');
	},

	bindScroll:function(type){

		//  $(selector).mCustomScrollbar("destroy");
		 
		var $content = $("#todoContent"),$el;
		if (type=="commissionLists") {
			$el=$content.find(".commissionBox");
		}else{
			$el=$content.find(".alreadyBox");
		}

		//绑定过了
		if ($el.hasClass('mCustomScrollbar ')) {
			return;
		} 

		//代办滚动条
		$el.mCustomScrollbar({
			set_height: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		}); 

	}


});

;/*!/todo/views/todo.Nav.js*/
App.Todo.NavView = Backbone.View.extend({

	tagName: 'div',

	className: 'todoNav',

	//代办
	events: {
		'click .already': 'already', //已办
		'click .commission': 'commission' //代办
	},

	//已办
	commission: function() {
		$(".todoNav .commission").addClass("selected");
		$(".todoNav .already").removeClass("selected");

		//显示并清空
		$("#todoContent").find(".alreadyBox").hide().end().find(".commissionBox").show().find(".commissionLists").empty();

		App.Todo.Settings.type = "commission";
		App.Todo.Settings.pageIndex=1;
		//App.Todo.fetch();
	 	App.Todo.loadData();
		//App.Todo.TodoCollection.fetch();
	},

	already: function() {
		$(".todoNav .already").addClass("selected");
		$(".todoNav .commission").removeClass("selected");
		//显示并清空
		$("#todoContent").find(".commissionBox").hide().end().find(".alreadyBox").show().find(".alreadyLists").empty();
		App.Todo.Settings.type = "already";
		App.Todo.Settings.pageIndex=1;
		App.Todo.loadData(); 
	 
	},

	template:_.templateUrl("./todo/tpls/todo.Nav.html",true),


	render: function() {

		this.$el.html(this.template);
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');
		return this;

	}

});