App.AddViewUser.AddViewUserListV = Backbone.View.extend({
	el:'tr',
	default:{
		data:{
			userListData:[{
				id:1,
				userName:"张三",
				accountPrefix:"ys-",
				accountName:"zhangsan",
				accountPassWord:'123456'

			},{
				id:2,
				userName:"李四",
				accountPrefix:"ys-",
				accountName:"lisi",
				accountPassWord:'aaaaaa'

			}],
		}
	},
	template:_.templateUrl("/addViewUser/tpls/viewUserList.html"),
	render:function(){
		//渲染数据
		var data=this.model.toJSON();
		console.log("data",data);
		this.$el.html(this.template(data)).attr("cid",this.model.cid);
		return this;
	}
})