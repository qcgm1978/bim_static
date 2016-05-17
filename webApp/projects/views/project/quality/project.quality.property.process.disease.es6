//隐患列表视图
App.Project.ProcessDisease=Backbone.View.extend({

	tagName:"div",

	className:"disease",
	
	template:_.templateUrl('/projects/tpls/project/quality/project.quality.disease.html'),

	initialize:function(data){
		this.loadData(data);
		return this;
	},


	events:{
		
		'click .closeBtn':'closeView'
	
	},

	
	//渲染
	render:function(data){
		this.$el.html(this.template(data));
		return this;
	},
	
	loadData(data){
		var _this=this,
			url='fetchQualityProcessDisease';
		App.Comm.ajax({
			URLtype:url,
			type:'get',
			data:data.params
		},function(response){
			_this.render(response||{data:[]}).show(data);
		}).fail(function(){
			//失败流程处理
		})
	},
	
	show(options){
		var _right=options._parent[0].offsetParent.clientWidth-options._parent[0].offsetLeft-14;
		this.$el.css(options.viewConfig);
		
		
		if(options._flag=='up'){
			this.$(".safter").css({
				right:(_right+1)+'px'
			})
			this.$(".sbefore").css({
				right:_right+'px'
			})
			this.$(".dafter").css({
				border:'none'
			})
			this.$(".dbefore").css({
				border:'none'
			})
		}else{
			this.$(".dafter").css({
				right:(_right+1)+'px'
			})
			this.$(".dbefore").css({
				right:(_right+1)+'px'
			})
			this.$(".safter").css({
				border:'none'
			})
			this.$(".sbefore").css({
				border:'none'
			})
		}
		
		$('.processAccessList').append(this.$el);
		
		App.Comm.initScroll(this.$('.scrollWrap'),"y");
		
		clearMask();
		
		return this;
	},
	closeView(){
		this.$el.remove();
	}

});