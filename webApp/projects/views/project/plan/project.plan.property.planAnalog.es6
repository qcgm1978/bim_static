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
		    ifOuter = {},
		    allPlayArr=[];


		$.each(OrderArr, function(i, item) {

			if(item.join){
				PlayArr.push(item.code);
				if (!item.inner ) {
					ifOuter[item.code] = {
						index: toTranslucent.length,
						isout: true
					};
					toTranslucent.push(item.code)
				} else {
					ifOuter[item.code] = {
						index: inners.length,
						isout: false
					};
					inners.push(item.code);
				}

				ifOuter[item.code]['join']=item.join;
				ifOuter[item.code]['demerge']=item.demerge;

			}else{
				allPlayArr.push(item.code);

			}

		});

		if (PlayArr.length > 0) {
			PlayArr.push(-1);
		}


		this.SourcePlay = PlayArr;
		this.analogCount = this.SourcePlay.length;
		this.ifOuter = ifOuter;
		this.toTranslucent = toTranslucent;
		this.inners = inners;
		window.ifOuter = ifOuter;
		window.SourcePlay = PlayArr;
		this.allPlayArr = allPlayArr;
		window.toTranslucent = toTranslucent;
		window.inners = inners;
	},


	//挑选播放
	pickPlayAnalog(event) {

		//进度模拟中 不做操作
		if (this.timer) {
			return;
		}

		//高亮钱取消
		App.Project.cancelZoomModel();

		//取消 样式
		App.Project.Settings.Viewer.highlight({
			type: "plan",
			ids: undefined
		});

		this.showInModle($(event.currentTarget));

		//.addClass("selected").siblings().removeClass("selected").end()
		var code = $(event.target).closest("tr").data("code"),
		    index = this.SourcePlay.indexOf(code);

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
				ids: this.PlayArr.concat(this.allPlayArr)
			});

			App.Project.Settings.Viewer.zoomToBuilding(0.05,1);
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

			//判断是否需要拆分
			if(this.demerge ){
				if(this.floorNum<6){
					$('#floors .tree input').eq(this.floorNum).trigger('click');
					this.floorNum++;
					return
				}else{
					this.demerge=false;
					var tree = $('#specialty>ul.tree>li').eq(1);
					if(!tree.find('input').eq(7).prop('checked')){
						tree.find('input').eq(7).trigger('click');

					}
					if(!tree.find('input').eq(13).prop('checked')){
						tree.find('input').eq(13).trigger('click');

					}
				}
			}else{
				if (this.PlayArr[0]==-1){
					//停止模拟
					this.stopAnalog();
					App.Project.Settings.Viewer.translucent(false);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						ids: undefined
					});
					App.Project.Settings.Viewer.filter({
						type: "plan",
						ids: undefined
					});
					if(!$('#floors>div input').prop('checked')){
						$('#floors>div input').trigger('click');
					}
					this.PlayArr=[];
					return
				}
				if(this.ifOuter[this.PlayArr[0]]['demerge']){
					this.demerge=true;
					this.floorNum=2;
					if($('#floors>div input').prop('checked')){
						$('#floors>div input').trigger('click');
					}else{
						$('#floors>div input').trigger('click').trigger('click');

					}
					$('#floors .tree input').eq(1).trigger('click');
					$('#floors .tree input').eq(0).trigger('click');
					$('#floors .tree input').eq(6).trigger('click');
					var tree = $('#specialty>ul.tree>li').eq(1);
					if(tree.find('input').eq(7).prop('checked')){
						tree.find('input').eq(7).trigger('click');

					}
					if(tree.find('input').eq(13).prop('checked')){
						tree.find('input').eq(13).trigger('click');

					}

				}
			}

			if(this.PlayArr.length==this.analogCount){
				App.Project.Settings.Viewer.translucent(false);
				debugger
				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});
				debugger
				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: this.PlayArr.concat(this.allPlayArr)
				});

debugger
			}
			var self = this;
			var judge = function(code){
				if(!self.ifOuter[code[0]]['join']){
					code = self.PlayArr.splice(0, 1);
					judge(code);
				}
			};
			if (this.PlayArr.length) {



				var code = this.PlayArr.splice(0, 1);

				judge(code);
				var $tr = this.$(".planContent tbody tr[data-code='" + code[0] + "']"),
				    $planContent = this.$(".planContent");

				this.$(".planContent tbody .selected").removeClass('selected');

				$tr.addClass("selected");
				//滚动条位置
				$planContent.scrollTop($tr.index() * 30);



				if (code[0]==-1){
					
				}else if(!this.ifOuter[code[0]]['isout']) {
					App.Project.Settings.Viewer.filter({
						type: "plan",
						ids: this.PlayArr.concat(this.allPlayArr)
					});
					App.Project.Settings.Viewer.translucent(false);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						ids: undefined
					});
					App.Project.Settings.Viewer.translucent(true);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						//ids: [code[0]]
						ids: this.inners.slice(0, this.ifOuter[code[0]]['index']).concat(this.allPlayArr)
					});

				}else{
					App.Project.Settings.Viewer.translucent(false);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						//ids: [code[0]]
						ids: undefined
					});

					App.Project.Settings.Viewer.filter({
						type: "plan",
						ids: this.PlayArr.concat(this.allPlayArr)
					});
				}




				var processAnalog = (this.analogCount - this.PlayArr.length) / this.analogCount,
				    sourceWidth = this.$(".progressAnalog .bg").width(),
				    width = sourceWidth * processAnalog;

				//不可以超过最大
				if (width > sourceWidth) {
					width = sourceWidth;
				}

				//this.showInModle($tr);

				this.$(".progressAnalog .processBg").width(width);
				this.$(".progressAnalog .processPos").css("left", width - 10);


				//底部文字
				this.$(".desctionAnalog .analogDate").text($tr.find(".start").text());
				this.$(".desctionAnalog .analogTitle").text($tr.find(".operationalMatters").text());



			} else {
				//停止模拟
				this.stopAnalog();
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					ids: undefined
				});
				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: undefined
				});

				if(!$('#floors>div input').prop('checked')){
					$('#floors>div input').trigger('click');
				}
			}
		}, 2000);
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
		    ids = $target.data("userId"),
		    box = $target.data("box");
		if ($target.hasClass("selected")) {
			$target.parent().find(".selected").removeClass("selected");
			App.Project.cancelZoomModel();
			return;
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}
		if (box && ids) {
			App.Project.zoomToBox(ids, box);
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
				var box = App.Project.formatBBox(data.data.boundingBox);
				if (box && box.length) {
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					App.Project.zoomToBox(data.data.elements, box);
				}
			}
		});
	}


});