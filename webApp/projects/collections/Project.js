App.Project={ 
	init:function(){ 

		var $contains = $("#contains");
 		//nav
 		$contains.html(new App.Project.ProjectHeader().render().$el);
 		// 左侧导航
 		$contains.append(new App.Project.ProjectNav().render().$el);

 		//主体
 		$contains.append(new App.Project.ProjectContainer().render().$el);

 	 
	}
}