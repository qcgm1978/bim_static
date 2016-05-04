/**
 * @require /services/collections/index.es6
 */

App.Services.projectMember = {
	
	
	//初始化
	init: function() {
		$('.serviceBody').html(new App.Services.projectMember.mainView().render().el);
		this.loadData(this.projectMemberProjectCollection,{
			outer:false
		},{
			userId:App.Comm.getCookie("userId")
		});
		this.loadData(this.projectMemberMemberCollection,{outer:true},{
			dataPrivilegeId:"1"
		});
	},

	method:{
		model2JSON:function(models){
			var data=[];
		  	models.forEach(function(m){
		  		data.push(m.toJSON());
		  	})
		  	return data;
		}
	},

	projectMemberProjectCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchServicesProjectMemberProjectList",
		parse: function(response) {
			if (response.message == "success") {
				var data=response.data,
					result=[{
				      "id": 1, 
				      "name": "周浦万达项目",
				      "startTime": 1457536342000,
				      "endTime": 0,
				      "province": "上海市",
				      "city": null,
				      "image":'/static/dist/services/images/demoProject.png'
				    }];
					_.each(data,function(item){
						result.push({
							image:item.image||'/static/dist/services/images/demoProject.png',
							startTime:item.startTime||new Date(),
							endTime:item.startTime||new Date(),
							name:item.name,
							address:item.address||'测试地址',
						})
					})
				return result;
			}else{
				return [];
			}
		}
	})),
	
	projectMemberMemberCollection: new(Backbone.Collection.extend({
		model:  Backbone.Model.extend({
			   defaults:function(){
			   		return {
			   			title:''
			   		}
			   } 
		}),
		urlType: "fetchServicesProjectMemberMemberList",
		parse: function(response) {
			if (response.message == "success") {
				var _member=response.data.member||[],
					_org=response.data.org||[],
				_member=_.map(_member,function(item){
					return item={
						name:item.name,
						project:item.org.name,
						id:item.id, //成员ID
						outer:item.outer
					}
				})
				_org=_.map(_org,function(item){
					return item={
						name:item.name,
						project:"",
						id:item.id, //成员ID
						outer:item.outer
					}
				})
				return _member.concat(_org);
			}else{
				return []
			}
		}
	})),
	
	projectMemberOrgCollection: new(Backbone.Collection.extend({
		model: App.Services.model,
		urlType: "fetchServicesProjectMemberMemberList",
		parse: function(response) {
			if (response.message == "success") {
				return response.data;
			}
		}
	})),

	loadData: function(collection,data,path) {
		data=data||{};
		//path参数赋值
		if(path && typeof path === "object"){
			for(var p in path){
				if(path.hasOwnProperty(p)){
					collection[p]=path[p];
				}
			}
		}
		
		collection.fetch({
			reset: true,
			data: data,
			success:function(collection, response, options){},
			error:function(collection, response, options){
			}
		});
	}

}