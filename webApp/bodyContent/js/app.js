/*
 * @require /bodyContent/js/model/model.js
 */
var App = App || {};
App.BodyContent.App=Backbone.View.extend({

    el:$("#contains"),

    template:_.templateUrl("/bodyContent/tpls/bodyContent.html",true),

    render:function(){
        this.$el.html(this.template);
        if(localStorage.getItem("yesKnow") == "false"){
            this.checkAuthorityHandle();//检查当前用户的权限方法
        }
        this.getMonthLinkDataFun();//获取本月更多链接的方法
        return this;
    },
	getMonthLinkDataFun:function(){//获取本月更多链接的方法
		var _this = this;
		var pdata = {
            URLtype: "relLink",
            data:{
                type:4
            }
        };
        App.Comm.ajax(pdata,function(response){
        	if(response.code==0){
                $("#monthMore").attr("href",response.data[0].url+"&MonthType=2");
        		$("#monthMore").attr("data-morehref",response.data[0].url);
        	}
        });
	},
    checkAuthorityHandle:function(){//检查当前用户的权限方法
        var tipDialogBg = $('<div class="tipDialogBgBox" id="tipDialogBgBox"></div>');
        var tipDialogBox = $('<div class="tipDialogBox" id="tipDialogBox"></div>');
        var TipDialogV = new App.BodyContent.App.TipDialogV;
        $("body").append(tipDialogBg);
        $("body").append(tipDialogBox);
        $("#tipDialogBox").html(TipDialogV.render().el);
    }
});