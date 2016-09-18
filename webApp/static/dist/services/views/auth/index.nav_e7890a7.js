"use strict";

/**
 * @require services/collections/auth/keyuser/keyuser.js
 */

App.Services.AuthNav = Backbone.View.extend({

	tagName: "div",
	template: _.templateUrl("/services/tpls/auth/auth.nav.html"),

	events: {
		"click .memCtrl": "memCtrl",
		"click .roleManager": "roleManager",
		"click .keyUser": "keyUser",
		"click .projectMember": "projectMember",
		"click .serviceBody": "hideAllMenu"
	},
	render: function render() {
		var user = JSON.parse(localStorage.user || "{}"),

		//isadmin = user.isAdmin || false,
		auth = App.AuthObj.service && App.AuthObj.service.auth,
		    isKeyUser = user.isKeyUser || false;
		this.$el.html(this.template({ isadmin: auth, iskeyuser: isKeyUser }));
		return this;
	},
	//面包屑
	initialize: function initialize() {
		Backbone.on('loadProjectMemberEvent', this.projectMember, this);
		this.breadCrumb(this.$el.find(".memCtrl"));
	},
	hideAllMenu: function hideAllMenu() {
		Backbone.trigger("hideSearchMenu");
	},
	breadCrumb: function breadCrumb(el) {
		//debugger;
		var $el = $(el);
		$el.addClass("active").siblings("li").removeClass("active");
		App.Services.Member.memLoadingStatus = true;
	},
	memCtrl: function memCtrl() {
		$(".serviceBody").empty();
		$("#blendList").addClass("services_loading");
		this.breadCrumb(this.$el.find(".memCtrl"));
		Backbone.trigger("loadMemberData", "1");
	},
	roleManager: function roleManager() {
		var _this = this;
		this.$(".serviceBody").empty();
		this.$(".serviceBody").addClass("services_loading");
		this.breadCrumb(this.$el.find(".roleManager"));
		App.Services.role.init(function () {
			_this.$(".serviceBody").removeClass("services_loading");
		});
	},
	keyUser: function keyUser() {

		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".keyUser"));
		App.Services.KeyUser.init();
		var keyUserFrame = new App.Services.keyUserFrame();
		$(".serviceBody").html(keyUserFrame.render().el); //框架
		$('.keyUserList .needloading').html("<div class='smallLoading'><img  src='/static/dist/images/comm/images/load.gif'/></div>");
		App.Services.KeyUser.loadData(App.Services.KeyUser.KeyUserList, '', function (r) {
			if (r && !r.code && r.data) {
				App.Services.KeyUser.KeyUserList.set(r.data);
				keyUserFrame.render();
				App.Services.KeyUser.userList = r.data;
			}
		});
	},
	projectMember: function projectMember() {
		$(".serviceBody").empty();
		this.breadCrumb(this.$el.find(".projectMember"));
		App.Services.projectMember.init({ type: "auth", tab: "projectMember" });
	}
});