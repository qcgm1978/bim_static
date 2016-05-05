 
//项目基本设置
App.Services.ProjectBase=Backbone.View.extend({

	tagName:"div",


	template:_.templateUrl('/services/tpls/project/index.base.html',true),
	
	initialize(){
		this.listenTo(App.Services.ProjectCollection.ProjectBaseInfoCollection,'reset',this.render);
	},

	render(data){
		var _html=_.template(this.template);
		this.$el.html(_html(data.toJSON()[0]));   
		$(".projectContainer .projectBase").html(this.$el);
		
		$(".projectLogo").hover(function(){
			$(this).find("label").animate({
				bottom:'0'
			},500)
		},function(){
			$(this).find("label").animate({
				bottom:'-26px'
			},500)
		}).on("click",function(){
			var view=new App.Services.ImageJcrop();
			App.Services.maskWindow=new App.Comm.modules.Dialog({title:'修改图片',width:600,height:500,isConfirm:false,message:view.render().el});
		})
		
		return this;
	}

});