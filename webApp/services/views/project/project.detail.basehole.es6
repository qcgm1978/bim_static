App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.BaseHole=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		'click .createBaseHole':'createBaseHole'
	},
	
	status:'read',
	
	template:_.templateUrl('/services/tpls/project/project.detail.basehole.html',true),
	
	setUserData(data){
		this.userData=data;
	},
	
	initialize(){
		var _this=this;
		this.on('read',function(){
			_this.status='read';
		})
		this.listenTo(App.Services.ProjectCollection.ProjecDetailBaseHoleCollection,'add',this.addView)
		
	},
	
	render(){
		this.$el.html(this.template);   
		this.$(".outerInstall").myDropDown();
		this.$(".structure").myDropDown();
		return this;
	},
	
	addView(items){
		var view=new App.Services.DetailView.BaseHole({
			projectId:this.userData.projectId
		});
		this.$('.detailContainer .scrollWrapContent').append(view.render(items.toJSON()).el);
		view.toggleProFrom('.accordionDatail');
	},
	
	createBaseHole(){
		var _this=this;
		if(_this.status !=='create'){
			this.$('dd').slideUp();
			this.$('dt span').addClass('accordOpen');
			var view=new App.Services.DetailView.BaseHole({
				projectId:_this.userData.projectId,
				_parentView:_this
			});
			this.$('.detailContainer .scrollWrapContent').prepend(view.render().el);
			_this.status='create';
		}else{
			App.Services.Dialog.alert('请先完成当前新增操作...');
		}
	}
	
})