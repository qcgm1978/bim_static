App.Services.ProjectDetail=App.Services.ProjectDetail||{};

App.Services.ProjectDetail.Pile=Backbone.View.extend({
	
	tagName:'div',
	
	className:'projectDetail',
	
	events:{
		
		'click .save':'savePile',
		'click .update':'updatePile'
	
	},
	
	template:_.templateUrl('/services/tpls/project/project.detail.pile.html'),
	
	setUserData(data){
		this.userData=data;
	},
	
	initialize(){
		this.listenTo(App.Services.ProjectCollection.ProjecDetailPileCollection,'reset',this.resetView);
	},
	
	render(){
		this.$el.html(this.template({
			isCreate:false,
			soilNails:[]
		}));   
		return this;
	},
	
	resetView(items){
		var data=items.data,
			$container=this.$('.detailContainer .scrollWrapContent');
		debugger
		this.$el.html(this.template(data));
		$container.html('').append(this.$el);
	},
	
	savePile(){
		var _this=this,
			_data=[];
		this.$('.txtInput').each(function(){
			var __=$(this);
			_data.push({
				projectId:_this.userData.projectId,
				pileName:__.attr('data-label'),
				pileNumber:__.val()
			})
		})
		
		debugger
		return
		App.Comm.ajax({
			URLtype:'fetchProjectCreatePile',
			type:'post',
			data:'',
			contentType:'application/json'
		},function(){
			_this.reloadView();
		}).fail(function(){
		})
	},
	
	updatePile(){
		var _this=this;
		App.Comm.ajax({
			URLtype:'fetchProjectCreatePile',
			type:'put',
			data:{
				pitId:_this.formData.id
			}
		},function(){
			_this.reloadView();
		}).fail(function(){
		})
	},
	
	reloadView(){
	
	}
})