App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Section=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	status:'read',
	
	events:{
		'click .createSection':'createSection'
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.section.html',true),
	
	initialize(){
	
		var _this=this;
		this.on('read',function(){
			_this.status='read';
		})
		
		this.listenTo(App.Services.ProjectCollection.ProjecDetailSectionCollection,'reset',this.resetView);
	
	},
	
	setUserData(data){
		this.userData=data;
	},
	
	render(){
		this.$el.html(this.template);   
		return this;
	},
	
	resetView(items){
		var _this=this;
		var $container=this.$('.detailContainer .scrollWrapContent');
		this.status='read';
		$container.html("");
		items.models.forEach(function(model){
			var view=new App.Services.DetailView.Section({
				projectId:_this.userData.projectId
			});
			$container.append(view.render(model.toJSON()).el);
		})
	},
	
	createSection(){
		var _this=this;
		if(this.status !=='create'){
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');
			var view=new App.Services.DetailView.Section({
				projectId:_this.userData.projectId,
				_parentView:_this
			});
			this.$('.detailContainer .scrollWrapContent').prepend(view.render().el);
			this.status='create';
		}else{
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
		
	}
	
})