/**
 * @require /resources/collection/index.es6
 */


App.Resources.App = Backbone.View.extend({

	el: $("#contains"),

	template: _.templateUrl("/resources/tpls/resources.app.html", true),

	render() {

		this.$el.html(this.template);
		var $resoucesNav = $(".resoucesNavBox .resoucesNav");
		if (!App.AuthObj.lib) {
			//$resoucesNav.remove();
		} else {
			var Auth = App.AuthObj.lib;
			//族库
			if (!Auth.family) {
				$resoucesNav.find(".famLibs").closest("li").remove();
			}
			//质量标准库
			if (!Auth.quality) {
				$resoucesNav.find(".qualityStandardLibs").closest("li").remove();
			}
			//清单库
			if (!Auth.list) {
				$resoucesNav.find(".manifestLibs").closest("li").remove();
			}
			//标准模型库
			if (!Auth.list) {
				$resoucesNav.find(".model").closest("li").remove();

			}

			//一直显示
			//if(!Auth.list){
			//	$resoucesNav.find(".artifactsMapRule").closest("li").remove();
			//}
			//映射规则库-规则模板-模块化/质量标准
			switch(Auth.ruleModel){
				case 1:{
					break;
				}
				case 2:{
					break;
				}
				case 3:{
					break;
				}
			}


		}


		return this;
	}


});