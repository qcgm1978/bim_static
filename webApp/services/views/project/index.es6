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

 		this.$(".projectContainer .projectBase").html(new App.Services.ProjectBase().render().el);

 		this.$(".projectContainer .projectMapping").html(new App.Services.ProjectMapping().render().el);

 		this.$(".projectContainer .projectDetail").html(new App.Services.ProjectDetail().render().el);

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
 		var $item=$(event.target).closest(".item");
 		$item.addClass("selected").siblings().removeClass("selected");
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
 			//映射
 			this.$(".projectContainer .projectMapping").show().siblings().hide();

 		} else if (type == "detail") {
 			this.$(".projectContainer .projectDetail").show().siblings().hide();
 		}

 	}



 });