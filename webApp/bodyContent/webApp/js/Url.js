/*

write by wuweiwei

*/

App.Restful = {
	urls :{
		"projectsList" : "url",
		"todo" : "/platform/todo",
		"broadcast" : "/platform/announce/list"
	},
	localUrls:{
		"projectsList" : "/jsonData/projectsList.json"
	},
	changeLocalUrls : function(){
		if(App.Switch.useLocalJson)
		{
			this.urls = this.localUrls;
		}
	}
}
App.Restful.changeLocalUrls();

