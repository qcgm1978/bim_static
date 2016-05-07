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
		}
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
				data.logo=data.logo ? data.logo['200x150']:"";
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
				data.logo=data.logo ? data.logo['200x150']:"";
				data.logo=data.logo+'?t='+new Date().getTime();
                return data;
            }
		}
	}))
 

}