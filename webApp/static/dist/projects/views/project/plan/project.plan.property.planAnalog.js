"use strict";

//模拟
App.Project.PlanAnalog = Backbone.View.extend({

	tagName: "div",

	className: "planAnalog",

	events: {
		"click .playOrPause": "playAnalog",
		"click .tbPlan tr.itemClick": "pickPlayAnalog"
	},

	initialize: function initialize() {
		this.listenTo(App.Project.PlanAttr.PlanAnalogCollection, "add", this.addOne);
	},

	render: function render() {
		var html = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.html", true);
		this.$el.html(html);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),

	addOne: function addOne(model) {

		var data = model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));

		var OrderArr = _.sortBy(data.data, "planStartTime"),
		    PlayArr = [],
		    toTranslucent = [],
		    inners = [],
		    ifOuter = {},
		    allCodes = [],
		    allPlayArr = [];

		$.each(OrderArr, function (i, item) {
			allCodes.push(item.code);
			if (item.join) {
				PlayArr.push(item.code);
				if (!item.inner) {
					ifOuter[item.code] = {
						index: toTranslucent.length,
						isout: true
					};
					toTranslucent.push(item.code);
				} else {
					ifOuter[item.code] = {
						index: inners.length,
						isout: false
					};
					inners.push(item.code);
				}

				ifOuter[item.code]['join'] = item.join;
				ifOuter[item.code]['demerge'] = item.demerge;
			} else {
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
		this.allPlayArr = allPlayArr;
	},

	//挑选播放
	pickPlayAnalog: function pickPlayAnalog(event) {
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
		if (App.Project.Settings.checkBoxIsClick) {
			App.Project.Settings.Viewer.filterByUserIds(undefined);

			App.Project.Settings.checkBoxIsClick = false;
		}
		this.showInModle($(event.currentTarget));

		//.addClass("selected").siblings().removeClass("selected").end()
		var code = $(event.target).closest("tr").data("code"),
		    index = this.SourcePlay.indexOf(code);

		this.PlayArr = this.SourcePlay.slice(index);
	},


	//开始模拟
	playAnalog: function playAnalog(event) {

		if (App.Project.Settings.checkBoxIsClick) {
			App.Project.Settings.Viewer.filterByUserIds(undefined);

			App.Project.Settings.checkBoxIsClick = false;
		}
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

			App.Project.Settings.Viewer.zoomToBuilding(0.05, 1);
			//开始模拟
			this.starAnalog();
		} else {
			clearInterval(this.timer);
			this.timer = null;
		}

		$target.toggleClass("myIcon-play myIcon-pause");
	},


	//开始模拟
	starAnalog: function starAnalog() {
		var _this = this;

		this.timer = setInterval(function () {

			//判断是否需要拆分
			if (_this.demerge) {
				if (_this.floorNum < 7) {
					$('#floors .tree input').eq(_this.floorNum).trigger('click');
					_this.floorNum++;
					return;
				} else {
					_this.demerge = false;
					var tree = $('#specialty>ul.tree>li').eq(1);
				}
			} else {
				if (_this.PlayArr[0] == -1) {
					//停止模拟
					_this.stopAnalog();
					App.Project.Settings.Viewer.translucent(false);

					App.Project.Settings.Viewer.ignoreTranparent({
						type: "plan",
						ids: undefined
					});
					App.Project.Settings.Viewer.filter({
						type: "plan",
						ids: undefined
					});
					if (!$('#floors>div input').prop('checked')) {
						$('#floors>div input').trigger('click');
					}
					_this.PlayArr = [];
					if ($('#specialty>div input').prop('checked')) {
						$('#specialty>div input').trigger('click').trigger('click');
					} else {
						$('#specialty>div input').trigger('click');
					}
					return;
				}
				if (_this.ifOuter[_this.PlayArr[0]]['demerge']) {
					_this.demerge = true;
					_this.flag = true;
					_this.floorNum = 3;
					//this.PlayArr.push(this.SourcePlay[0],this.SourcePlay[1],this.SourcePlay[2],this.SourcePlay[3]);
					if ($('#floors>div input').prop('checked')) {
						$('#floors>div input').trigger('click');
					} else {
						$('#floors>div input').trigger('click').trigger('click');
					}
					$('#floors .tree input').eq(2).trigger('click');
					//$('#floors .tree input').eq(0).trigger('click');
					//$('#floors .tree input').eq(6).trigger('click');
					//专业隐藏
					var tree = $('#specialty>ul.tree>li').eq(1);

					if (tree.find('input').eq(7).prop('checked')) {
						tree.find('input').eq(7).trigger('click');
					}
					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
					if (tree.find('input').eq(8).prop('checked')) {
						tree.find('input').eq(8).trigger('click');
					}
					if (tree.find('input').eq(9).prop('checked')) {
						tree.find('input').eq(9).trigger('click');
					}
					if (tree.find('input').eq(10).prop('checked')) {
						tree.find('input').eq(10).trigger('click');
					}
					if (tree.find('input').eq(11).prop('checked')) {
						tree.find('input').eq(11).trigger('click');
					}
					if (tree.find('input').eq(12).prop('checked')) {
						tree.find('input').eq(12).trigger('click');
					}
					//建筑隐藏
					var tree = $('#specialty>ul.tree>li').eq(0);

					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
					if (tree.find('input').eq(3).prop('checked')) {
						tree.find('input').eq(3).trigger('click');
					}
					if (tree.find('input').eq(4).prop('checked')) {
						tree.find('input').eq(4).trigger('click');
					}
					//内饰隐藏
					var tree = $('#specialty>ul.tree>li').eq(7);

					if (tree.find('input').eq(1).prop('checked')) {
						tree.find('input').eq(1).trigger('click');
					}
					if (tree.find('input').eq(2).prop('checked')) {
						tree.find('input').eq(2).trigger('click');
					}
				}
			}

			if (_this.PlayArr.length == _this.analogCount) {
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});

				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: _this.PlayArr.concat(_this.allPlayArr)
				});
			}

			if (_this.PlayArr.length) {

				var code = _this.PlayArr.splice(0, 1);

				//judge(code);
				var $tr = _this.$(".planContent tbody tr[data-code='" + code[0] + "']"),
				    $planContent = _this.$(".planContent");

				_this.$(".planContent tbody .selected").removeClass('selected');

				$tr.addClass("selected");
				//滚动条位置
				$planContent.scrollTop($tr.index() * 30);

				if (code[0] == -1) {} else if (!_this.ifOuter[code[0]]['isout']) {
					if (_this.flag) {
						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
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
							ids: _this.inners.slice(0, _this.ifOuter[code[0]]['index']).concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
						});
					} else {
						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr)
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
							ids: _this.inners.slice(0, _this.ifOuter[code[0]]['index']).concat(_this.allPlayArr)
						});
					}
				} else {
					if (_this.flag) {
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});

						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr).concat(_this.SourcePlay.slice(0, 4))
						});
					} else {
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});

						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: _this.PlayArr.concat(_this.allPlayArr)
						});
					}
				}

				var processAnalog = (_this.analogCount - _this.PlayArr.length) / _this.analogCount,
				    sourceWidth = _this.$(".progressAnalog .bg").width(),
				    width = sourceWidth * processAnalog;

				//不可以超过最大
				if (width > sourceWidth) {
					width = sourceWidth;
				}

				//this.showInModle($tr);

				_this.$(".progressAnalog .processBg").width(width);
				_this.$(".progressAnalog .processPos").css("left", width - 10);

				//底部文字
				_this.$(".desctionAnalog .analogDate").text($tr.find(".start").text());
				_this.$(".desctionAnalog .analogTitle").text($tr.find(".operationalMatters").text());
			} else {
				//停止模拟
				_this.stopAnalog();
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					ids: undefined
				});
				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: undefined
				});

				if (!$('#floors>div input').prop('checked')) {
					$('#floors>div input').trigger('click');
				}
			}
		}, 2000);
	},


	//停止模拟
	stopAnalog: function stopAnalog() {
		clearInterval(this.timer);
		this.timer = null;
		this.flag = false;
		this.$(".planContent tbody tr").removeClass("selected");
		this.$(".playOrPause").toggleClass("myIcon-play myIcon-pause");
		this.$(".progressAnalog .processBg").width(0);
		this.$(".progressAnalog .processPos").css("left", 0);
	},
	showInModle: function showInModle(event) {
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
		App.Comm.ajax(data, function (data) {
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