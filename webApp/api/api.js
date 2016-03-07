App.API={

	Settings:{
		hostname:"http://bim.wanda.cn/",
		debug:true
	},

	URL:{

		//代办 
		fetchTodoData:"platform/api/todo",   //获取代办数据
 
		//项目 
		fetchProjects:"platform/api/project", //项目列表 
		fetchFileList:"doc/{projectId}/{projectVersionId}/file/children",//获取文件列表  ?fileId={parentId}
		fetchDesignFileNav:"doc/{projectId}/{projectVersionId}/file/tree",//项目设计文件导航 
		fetchDesignModelNav:"",//项目设计模型导航

		uploadFile:"doc/{projectId}/{projectVersionId}/file/data", //上传文件  ?parentId={parentId}&fileName={fileName}&size={size}&digest={digest}&position={position}
		downLoad:"doc/{projectId}/{projectVersionId}/file/data", //文件下载  ?fileId={fileId}

		//设计
		fetchDesignProperties:"", //设计属性
		fetchDesignVerification:"",  // 设计 检测
		fetchDesignCollision:"",    // 设计碰撞

		//计划
		fetchPlanModel:"",

		test:""
	},

	DEBUGURL:{

		//代办		
		fetchTodoData:"/dataJson/todo/todo.json",    //获取代办数据


		// 项目
		fetchProjects:"/dataJson/{project}/project.list.json",//项目列表
		fetchFileList:"dataJson/project/project.design.json", //获取文件列表
		fetchDesignFileNav:"/dataJson/project/project.design.file.json",  //项目设计文件导航
		fetchDesignModelNav:"/dataJson/project/project.design.model.json",//项目设计模型导航

		//设计
		fetchDesignProperties:"/dataJson/project/project.design.property.json",  //设计属性
		fetchDesignVerification:"/dataJson/project/project.design.property.json",  //设计检测
		fetchDesignCollision:"/dataJson/project/project.design.property.json",     //设计碰撞

		//计划 
		fetchPlanModel:"/dataJson/project/project.design.property.json",  //模型
		fetchPlanAnalog:"/dataJson/project/project.design.property.json",  //模拟
		fetchPlanPublicity:"/dataJson/project/project.design.property.json", //关注
		fetchPlanInspection:"/dataJson/project/project.design.property.json",  //检验
		fetchPlanProperties:"/dataJson/project/project.design.property.json", //属性


		test:""


		
	}


} 

