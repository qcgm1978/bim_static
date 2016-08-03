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
	      PlayArr = [],
	      toTranslucent = [],
	      inners = [],
	      ifOuter = {};


	  $.each(OrderArr, function(i, item) {
 			PlayArr.push(item.code);
		  if(!item.inner){
			  ifOuter[item.code] ={
				  index : toTranslucent.length,
				  isout : true
			  };
			  toTranslucent.push(item.code)
		  }else{
			  ifOuter[item.code] ={
				  index : inners.length,
				  isout : false
			  };
			  inners.push(item.code);
		  }


 		});

 		if (PlayArr.length>0) {
 			PlayArr.push(-1);
 		}
	  window.toTranslucent=toTranslucent;
	  window.ifOuter    =ifOuter;
	  window.inners    =inners;
	  console.log(PlayArr);
 		this.SourcePlay = PlayArr;
 		this.analogCount = this.SourcePlay.length;
	  this.ifOuter = ifOuter;
	  this.toTranslucent = toTranslucent;
	  this.inners = inners;
 	},


 	//挑选播放
 	pickPlayAnalog(event) { 
 		 
 		//进度模拟中 不做操作
 		if (this.timer) {
 			return;
 		}

 		this.showInModle($(event.currentTarget));


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
 			App.Project.Settings.Viewer.filter({
 				type: "plan",
 				ids: this.PlayArr
 			});

		  $('.m-fit').click();
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



	        if(!this.ifOuter[code[0]]['isout']){
		        debugger
		        App.Project.Settings.Viewer.filter({
			        type: "plan",
			        ids: this.PlayArr
		        });
		        App.Project.Settings.Viewer.translucent(true);

		        App.Project.Settings.Viewer.highlight({
			        type: "plan",
			        ids: undefined
		        });

		        App.Project.Settings.Viewer.highlight({
			        type: "plan",
			        //ids: [code[0]]
			        ids: this.inners.slice(0,this.ifOuter[code[0]]['index'])
		        });
		        console.log(this.ifOuter[code[0]]['index'])
	        }else{
		        App.Project.Settings.Viewer.translucent(false);

		        App.Project.Settings.Viewer.filter({
			        type: "plan",
			        ids: this.PlayArr
		        });
		        App.Project.Settings.Viewer.highlight({
			        type: "plan",
			        ids: undefined
		        });
	        }



 				var processAnalog = (this.analogCount - this.PlayArr.length) / this.analogCount,
 					sourceWidth = this.$(".progressAnalog .bg").width(),
 					width = sourceWidth * processAnalog,
 					$planContent = this.$(".planContent");
 					 
 				//不可以超过最大
 				if (width > sourceWidth) {
 					width = sourceWidth;
 				}
 				
 				//this.showInModle($tr);

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
			  App.Project.Settings.Viewer.translucent(false);
			  App.Project.Settings.Viewer.highlight({
				  type: "plan",
				  ids: undefined
			  });
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
 	},

 	showInModle(event) {
		var $target = event,
			ids=$target.data("userId"),
			box=$target.data("box");
		if ($target.hasClass("selected")) {
			$target.parent().find(".selected").removeClass("selected");
			App.Project.cancelZoomModel();
			return;
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		if (box && ids) {
			App.Project.zoomModel(ids,box);
			return;
		}
		var data = {
			URLtype: "fetchModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				planCode: $target.data("code")
			}
		};
		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				var box=App.Project.formatBBox(data.data.boundingBox);
				if(box && box.length){
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					App.Project.zoomModel(data.data.elements,box);
				}
			}
		});
	}


 });