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
		
		this.$(".projectContainer .projectMapping").html(this.viewProjectMapping.render().el);

 		this.$(".projectContainer .projectFloor").html(new App.Services.ProjectDetail.Floor().render().el);

 		this.fetchData();

 		return this;
 	},

 	//获取数据	
 	fetchData() {
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
 		var $item=$(event.target).closest(".item"),
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