App.Suggest = {
	Settings:{
		pageIndex:1
	},
	init() {
		$('#pageLoading').hide();
		$('#dataLoading').hide();
		$("#topBar li").hide();
		$("#topBar li.imbox").show();
		$("#topBar li.user").show();
		$("#contains").append(new App.Suggest.containerView().render().$el);
		// this.loadData();
		this.getSuggestList();//获取反馈历史的列表
	},

	read(id,_this,projectId,version,shareId){
		//window.open(App.API.Settings.hostname+"platform/message/read?id="+id);
		if($(_this).data('status')==0){
			App.Comm.loadMessageCount(-1);
			$(_this).closest('li').remove();

		}
		this.id = id;
		//	this.loadData('un');
		//location.reload();
		//发送已读状态
		$.ajax({
			url: App.API.Settings.hostname+"platform/message/read?flag=1&id="+id
		}).done(function(data){
			//console.log(data)

		});
		//弹窗显示详情
		$('#comment').show();
		App.INBox.comment.init(id,projectId,version,shareId,_this);
	},

	show:function(_this){
		_.require('/static/dist/services/services.css');
		_.require('/static/dist/services/services.js');
		App.Services.SuggestView.init($(_this).data('id'));
	},

	messageCollection: new(Backbone.Collection.extend({
		model:Backbone.Model.extend({
			defaults:function(){
				return {
					items:[{
						name:''
					}]
				}
			}
		}),
		urlType:"getFeedBackList",
		parse(response){
			if(response.code == 0){
				return response.data.items;
			}
		}
	})),
	// messageCollection: new(Backbone.Collection.extend({
	// 	model: Backbone.Model.extend({
	// 		defaults:function(){
	// 			return {
	// 				title:''
	// 			}
	// 		}
	// 	}),
	// 	urlType: "serviceSuggestHistory",
	// 	parse: function(response) {
	// 		return response.data;
	// 	}
	// })),

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
	getSuggestList(parmer) {
		var self = this;
		var defaultData = {
			query:'all',
			content:'',
			createName:'',
			opTimeStart:'',
			opTimeEnd:'',
			have_reply:"",
			pageIndex:App.Suggest.Settings.pageIndex,
			pageItemCount:15,
		};
		var extendData = $.extend({},defaultData,parmer);
		App.Suggest.messageCollection.reset();
		App.Suggest.messageCollection.fetch({
			data:JSON.stringify(extendData),
			type:"POST",
			contentType:"application/json",
			success:function(collection, response, options){
				$("#commissionLists").find(".loading").remove();
				var $content = $(".listBoxFeedBoxDown");
				var pageCount = response.data.totalItemCount;
				$content.find(".sumDesc").html('共 ' + pageCount + ' 个资源');
				$content.find(".listPagination").empty().pagination(pageCount, {
				    items_per_page: response.data.pageItemCount,
				    current_page: response.data.pageIndex - 1,
				    num_edge_entries: 3, //边缘页数
				    num_display_entries: 5, //主体页数
				    link_to: 'javascript:void(0);',
				    itemCallback: function(pageIndex) {
				        //加载数据
				        App.Suggest.Settings.pageIndex = pageIndex + 1;
				        App.Suggest.loadData();
				    },
				    prev_text: "上一页",
				    next_text: "下一页"
				});
				return response.data;
			}
		})
	}
};
