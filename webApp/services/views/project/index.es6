 //项目管理入口
 App.Services.Project = Backbone.View.extend({

 	tagName: "div",

 	id: "projectManger",

 	events: {
 		"click .serviceNav .item": "switchTab",
 		"click .flowSliderUl .item":"slideBarClick"
 	},

 	//初始化事件
 	initialize() {
 		this.listenTo(App.Services.ProjectCollection.ProjectSlideBarCollection, "add", this.slideBarAdd);
 		this.listenTo(App.Services.ProjectCollection.ProjectSlideBarCollection, "reset", this.resetLoading);
 	},


 	template: _.templateUrl('/services/tpls/project/index.html', true),

 	render() {
 	
 		this.$el.html(this.template);
 		
		new App.Services.ProjectBase();
		
		this.viewProjectMapping = new App.Services.ProjectMapping();
		this.viewProjectBaseHole = new App.Services.ProjectDetail.BaseHole();
		this.viewProjectFloor = new App.Services.ProjectDetail.Floor();
		this.viewProjectSection = new App.Services.ProjectDetail.Section();
		
		this.viewProjectPile = new App.Services.ProjectDetail.Pile();
		
		this.$(".projectContainer .projectMapping").html(this.viewProjectMapping.render().el);

 		this.$(".projectContainer .projectFloor").html(this.viewProjectFloor.render().el);
 		
 		this.$(".projectContainer .projectBaseHole").html(this.viewProjectBaseHole.render().el);
 		
 		this.$(".projectContainer .projectSection").html(this.viewProjectSection.render().el);
 		
 		this.$(".projectContainer .projectPile").html(this.viewProjectPile.render().el);

 		this.fetchData();

 		return this;
 	},

 	//获取数据	
 	fetchData() {
 	
 		$('#pageLoading').show();
 		var that = this;
 		this.$(".serviceNav .item:first").click();

 		//重置，拉取数据
 		App.Services.ProjectCollection.ProjectSlideBarCollection.reset();

 		App.Services.ProjectCollection.ProjectSlideBarCollection.fetch({
 			data: {
 				pageIndex: 1,
 				pageItemCount: 30
 			},
 			success(child, data) {
 				that.$(".folwSlideBar .header .count").text(data.data.items.length);
 				this.$(".flowSliderUl .item:first").click();
 			}
 		});

 	},

 	//左侧点击
 	slideBarClick(event){
 		var _this=this,
 			$item=$(event.target).closest(".item"),
 			_collection=App.Services.ProjectCollection.ProjectBaseInfoCollection;
 		let _projectId=$item.attr('data-projectId');
 		
 		$item.addClass("selected").siblings().removeClass("selected");
 		//加载项目基本信息数据
 		_collection.projectId=_projectId;
 		_collection.fetch({
 			reset:true,
 			success(child, data) {
 			}
 		});
 		
 		
 		//参数传递
 		this.viewProjectMapping.setUserData({
 			projectId:_projectId
 		});
 		
 		//加载项目映射数据
 		let collectionMap=App.Services.ProjectCollection.ProjecMappingCollection;
 		collectionMap.projectId=_projectId;
 		collectionMap.fetch({
 			reset:true,
 			success(child, data) {
 			}
 		});
 		
 		//加载基坑数据
 		this.viewProjectBaseHole.setUserData({
 			projectId:_projectId
 		});
 		let collectionBasehole=App.Services.ProjectCollection.ProjecDetailBaseHoleCollection;
 		collectionBasehole.projectId=_projectId;
 		collectionBasehole.fetch({
 			reset:true,
 			success(child, data) {
 				
 				App.Services.ProjectCollection.datas.pitData=data.data.pits;
 				//加载楼层信息数据
		 		_this.viewProjectFloor.setUserData({
		 			projectId:_projectId
		 		});
		 		let collectionFloor=App.Services.ProjectCollection.ProjecDetailFloorCollection;
		 		collectionFloor.projectId=_projectId;
		 		collectionFloor.fetch({
		 			reset:true,
		 			success(child, data) {
		 			}
		 		});
		 		
		 		//加载剖面信息
		 		_this.viewProjectSection.setUserData({
		 			projectId:_projectId
		 		});
		 		let collectionSection=App.Services.ProjectCollection.ProjecDetailSectionCollection;
		 		collectionSection.projectId=_projectId;
		 		collectionSection.fetch({
		 			reset:true,
		 			success(child, data) {
		 			}
		 		});
		 		
		 		//加载桩信息
		 		_this.viewProjectPile.setUserData({
		 			projectId:_projectId
		 		});
		 		let collectionPile=App.Services.ProjectCollection.ProjecDetailPileCollection;
		 		collectionPile.projectId=_projectId;
		 		collectionPile.fetch({
		 			reset:true,
		 			success(child, data) {
		 			}
		 		});
 				
 			}
 		});
 		
 		
 		
 		$('#pageLoading').hide();
 		
 	},

 	templateDetail: _.templateUrl('/services/tpls/project/slidebar/list.detail.html'),

 	//侧边栏数据
 	slideBarAdd(model) {

 		var $flowSliderUl=this.$(".flowSliderUl"),data=model.toJSON();

 		//移除加载
 		$flowSliderUl.find(".loading").remove();

 		$flowSliderUl.append(this.templateDetail(data));
 		//绑定滚动条
 		App.Comm.initScroll(this.$(".slideBarScroll"),"y");
 	 
 	},

 	//加载前 重置
 	resetLoading() {
 		this.$(".flowSliderUl").empty().append('<li class="loading">正在加载，请稍候……</li>');
 	},

 	//切换tab
 	switchTab(event) {

 		var $target = $(event.target),
 			type = $target.data("type");

 		$target.addClass("selected").siblings().removeClass("selected");
 		if (type == "base") {
 			this.$(".projectContainer .projectBase").show().siblings().hide();
 		} else if (type == "mapping") {
 			this.$(".projectContainer .projectMapping").show().siblings().hide();
 		} else if (type == "floor") {//楼
 			this.$(".projectContainer .projectFloor").show().siblings().hide();
 		} else if (type == "basehole") {//基坑
 			this.$(".projectContainer .projectBaseHole").show().siblings().hide();
 		} else if (type == "section") {//剖面
 			this.$(".projectContainer .projectSection").show().siblings().hide();
 		} else if (type == "pile") {//桩
 			this.$(".projectContainer .projectPile").show().siblings().hide();
 		}

 	}



 });