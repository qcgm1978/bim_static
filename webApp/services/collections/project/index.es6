App.Services.ProjectCollection = {

	methods:{
		projectType(v){
			v=v||4;
			var _m=['','综合体','文化旅游','境外','其他'];
			return _m[Number(v)]
		},
		projectMode(v){
			v=v||0;
			var _m=['','轻资产','重资产'];
			return _m[Number(v)]
		},
		
		keyValue(key,name,array){
			var result=array.filter(function(item){
				return item.id==key;
			})
			if(result.length){
				return result[0][name];
			}
			return '';
		},
		zIndex:(function(){
			var i=10;
			return function(){
				return i++;
			}
		}())
	},

	
	datas:{
	
		intensity:['6度','7度','8度','9度'],//抗震设防烈度
		seiGrade:['一级','二级','三级','四级'],//抗震等级
		doorFireLevel:['A','B1'],//防火等级
		installType:['无','铝板幕墙','玻璃幕墙','涂料','GRC板','石材幕墙'],
		orgType:['剪力墙结构','钢结构','框架剪力墙结构','框架结构','劲性混凝土结构','框筒结构'],
		baseholeLv:['一级','二级','三级'],
		bracingType:['支护桩','锚索','土钉墙','其他'],
		pitData:[]
	
	},

	//分类列表
	ProjectSlideBarCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjects",
		parse(response) {
			if (response.code == 0) {
                 return response.data.items;
            }
		}
	})),
	
	ProjectBaseInfoCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjectBaseInfo",
		parse(response) {
			if (response.code == 0) {
				var data=response.data;
				data.logo=data.logoUrl ? data.logoUrl['middle']:"";
				data.logo=data.logo+'?t='+new Date().getTime();
                return data;
            }
		}
	})),
	
	ProjecMappingCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "projectCodeMapping",
		parse(response) {
			if (response.code == 0) {
				var data=response.data;
				data.logo=data.logoUrl ? data.logoUrl['middle']:"";
				data.logo=data.logo+'?t='+new Date().getTime();
                return data;
            }
		}
	})),
	
	ProjecDetailBaseHoleCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjectDetailBaseholeList",
		parse(response) {
			if (response.code == 0) {
				return  response.data.pits;
            }
		}
	})),
	
	ProjecDetailFloorCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjectDetailFloorList",
		parse(response) {
			if (response.code == 0) {
				return  response.data.buildings;
            }
		}
	})),
	
	ProjecDetailSectionCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjectDetailSectionList",
		parse(response) {
			if (response.code == 0) {
				return  response.data.profiles;
            }
		}
	})),
	
	ProjecDetailPileCollection: new(Backbone.Collection.extend({
		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),
		urlType: "fetchProjectDetailPileList",
		parse(response) {
			if (response.code == 0) {
				this.data=response.data;
				return  response.data.soilNails ;
            }
		}
	}))
 

}