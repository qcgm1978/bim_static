/*
 * @require /bodyContent/js/model/model.js
 */
var App = App || {};
App.BodyContent.App=Backbone.View.extend({

    el:$("#contains"),

    template:_.templateUrl("/bodyContent/tpls/bodyContent.html",true),

    render:function(){
        this.$el.html(this.template);
        this.getMonthLinkDataFun();//获取本月更多链接的方法
        return this;
    },
	//获取本月更多链接的方法
	getMonthLinkDataFun:function(){
		var _this = this;
		var pdata = {
            URLtype: "relLink",
            data:{
                type:4
            }
        };
        App.Comm.ajax(pdata,function(response){
        	if(response.code==0){
        		$("#monthMore").attr("href",response.data[0].url);
        	}
        });
	},
});