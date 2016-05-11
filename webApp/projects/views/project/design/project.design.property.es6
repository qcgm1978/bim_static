App.Project.ProjectDesignPropety = Backbone.View.extend({

	tagName: "div",

	className: "designPropetyBox",

	template: _.templateUrl("/projects/tpls/project/design/project.design.propety.html"),

	events: {
		"click .projectPropetyHeader .item": "navItemClick",
		"click .btnFilter": "filterVerification",
		"click .clearSearch": "clearSearch"

	},

	render: function() {

		this.$el.html(this.template);

		this.initVerificationOptions();

		this.$el.find(".projectNavContentBox").append(new App.Project.DesignCollision().render().el);
		this.$el.find(".projectNavContentBox").append(new App.Project.DesignVerification().render({
			verOpts: this.VerificationOptions
		}).el);
		this.$el.find(".projectNavContentBox").append(new App.Project.DesignProperties().render().el);
		return this;
	},

	//初始化设计检查产生
	initVerificationOptions() {
		this.VerificationOptions = {
			status: "", //	否	Integer	1：待整改；2：已整改；3：已关闭
			specialty: "", //	否	String	专业
			type: "", //	否	Integer	1：安全；2：功能；3：品质
			reporter: "", //	否	Integer	1：设计总包；2：第三方
			pageIndex: 1,
			pageItemCount: 400

		};
	},

	//切换tab
	navItemClick: function(event) {
		var $target = $(event.target),
			type = $target.data("type");
		$target.addClass('selected').siblings().removeClass('selected');
		App.Project.Settings.property = type;


		if (type == "collision") {
			//碰撞
			this.$el.find(".detailList").show().siblings().hide();

		} else if (type == "verifi") {
			
			//设计检查  

			var $designVerification=this.$el.find(".designVerification");

			$designVerification.show().siblings().hide();

			if ($designVerification.find(".noLoading").length>0) {
				this.getVerificationData();
			} 
			

		} else if (type == "poperties") {

			//属性 
			this.$el.find(".designProperties").show().siblings().hide();
			//属性渲染
			App.Project.renderProperty();

		}


	},

	//获取 设计检查数据
	getVerificationData() {

		App.Project.DesignAttr.VerificationCollection.reset();
		App.Project.DesignAttr.VerificationCollection.projectId = App.Project.Settings.projectId;
		App.Project.DesignAttr.VerificationCollection.versionId = App.Project.Settings.CurrentVersion.id; 
		App.Project.DesignAttr.VerificationCollection.fetch({
			data: this.VerificationOptions
		});


	},

	//筛选设计检查
	filterVerification() {
		this.getVerificationData();
	},

	clearSearch: function() {
		this.initVerificationOptions();
		this.getVerificationData();
	}



});