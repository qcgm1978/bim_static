App.Suggest = {



	init() {
		$('#pageLoading').hide();
		$('#dataLoading').hide();
		$("#topBar li").hide();
		$("#topBar li.imbox").show();
		$("#topBar li.user").show();
		$("#contains").append(new App.Suggest.containerView().render().$el);
		this.loadData('un');
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
		model: Backbone.Model.extend({
			defaults:function(){
				return {
					title:''
				}
			}
		}),
		urlType: "serviceSuggestHistory",
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
		this.messageCollection.fetch({
			reset: true,
			data: {
				pageIndex:index||1,
				pageItemCount:size||10
			}
		})
	}
};
