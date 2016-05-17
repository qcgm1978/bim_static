 //模拟
 App.Project.PlanAnalog = Backbone.View.extend({

 	tagName: "div",

 	className: "planAnalog",

 	events: {
 		"click .playOrPause": "playAnalog",
 		"click .tbPlan tr.itemClick": "pickPlayAnalog"
 	},

 	initialize: function() {
 		this.listenTo(App.Project.PlanAttr.PlanAnalogCollection, "add", this.addOne);
 	},

 	render: function() {
 		var html = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.html", true);
 		this.$el.html(html);
 		return this;
 	},

 	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


 	addOne: function(model) {

 		var data = model.toJSON();
 		this.$(".tbPlan tbody").html(this.template(data));

 		var OrderArr = _.sortBy(data.data, "planStartTime"),
 			PlayArr = []; 

 		$.each(OrderArr, function(i, item) {
 			PlayArr.push(item.code);
 		});

 		if (PlayArr.length>0) {
 			PlayArr.push(-1);
 		} 
 		this.SourcePlay = PlayArr;
 		this.analogCount = this.SourcePlay.length; 
 	},


 	//挑选播放
 	pickPlayAnalog(event) { 
 		 
 		//进度模拟中 不做操作
 		if (this.timer) {
 			return;
 		}

 		var code = $(event.target).closest("tr").addClass("selected").siblings().removeClass("selected").end().data("code"),
 		index=this.SourcePlay.indexOf(code);

 		this.PlayArr = this.SourcePlay.slice(index);

 	},


 	//开始模拟
 	playAnalog(event) {  

 		var $target = $(event.target);

 		//没有模拟数据
 		if (!this.SourcePlay || this.SourcePlay.length <= 0) {
 			alert("没有模拟数据");
 			return;
 		}

 		if ($target.hasClass("myIcon-play")) {

 			//克隆数据
 			if (!this.PlayArr || this.PlayArr.length <= 0) {
 				this.PlayArr = $.extend([], this.SourcePlay);
 			}

 			//隐藏全部
 			App.Project.Settings.Viewer.hide({
 				type: "plan",
 				ids: this.PlayArr
 			});

 			//开始模拟
 			this.starAnalog();

 		} else {
 			clearInterval(this.timer);
 			this.timer = null;
 		}

 		$target.toggleClass("myIcon-play myIcon-pause");

 	},

 	//开始模拟
 	starAnalog() {

 		this.timer = setInterval(() => {

 			if (this.PlayArr.length) {

 				var code = this.PlayArr.splice(0, 1),
 					$tr = this.$(".planContent tbody tr[data-code='" + code[0] + "']");

 				App.Project.Settings.Viewer.show({
 					type: "plan",
 					ids: code
 				});

 				var processAnalog = (this.analogCount - this.PlayArr.length) / this.analogCount,
 					sourceWidth = this.$(".progressAnalog .bg").width(),
 					width = sourceWidth * processAnalog,
 					$planContent = this.$(".planContent");
 					 
 				//不可以超过最大
 				if (width > sourceWidth) {
 					width = sourceWidth;
 				}

 				this.$(".progressAnalog .processBg").width(width);
 				this.$(".progressAnalog .processPos").css("left", width-10);
 				$tr.addClass("selected");
 				 
 				//滚动条位置 
 				$planContent.scrollTop($tr.index()*36);
 				//底部文字
 				this.$(".desctionAnalog .analogDate").text($tr.find(".start").text());
 				this.$(".desctionAnalog .analogTitle").text($tr.find(".operationalMatters").text());

 			} else {
 				//停止模拟
 				this.stopAnalog();
 			}
 		}, 500);
 	},

 	//停止模拟
 	stopAnalog() {
 		clearInterval(this.timer);
 		this.timer = null;
 		this.$(".planContent tbody tr").removeClass("selected");
 		this.$(".playOrPause").toggleClass("myIcon-play myIcon-pause");
 		this.$(".progressAnalog .processBg").width(0);
 		this.$(".progressAnalog .processPos").css("left", 0);
 	}


 });