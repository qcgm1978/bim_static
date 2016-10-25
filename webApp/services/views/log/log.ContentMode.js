App.Services.ContentMode = Backbone.View.extend({

	tagName: 'div',

	id: 'logModes',

	// 重写初始化
	initialize: function() {
		this.listenTo(App.Services.logCollection, "add", this.addOne);
		this.listenTo(App.Services.logCollection, "reset", this.emptyContent);
		Backbone.on('servicesListNullData',this.showNullTip,this);
	},

	template: _.templateUrl('/services/tpls/log/services.ContentMode.html', true),

	render: function() {
		this.$el.html(this.template);
		return this;
	},

	//切换改变
	addOne: function(model) { 
		
		var listView = new App.Services.listView({
			model: model
		}),$proListBox=this.$el.find(".proListBox"); 

		$proListBox.find(".loading").remove(); 

		$proListBox.append(listView.render().el);

	 
	},

	//清空内容
	emptyContent:function(){
	//	this.$el.find(".proListBox").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问项目</div></li>');
		this.$el.find(".proListBox").html('<li class="loading">正在加载...</li>');
	},

	showNullTip:function(){

		if (App.Services.Settings.pageIndex!=1) {
			this.$el.find(".proListBox").html('<li class="loading">此页没有数据</li>');
		}else{
			this.$el.find(".proListBox").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问项目</div></li>');
		}		
	}

});

