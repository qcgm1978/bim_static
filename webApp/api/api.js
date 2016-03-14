App.API = {

	Settings: {
		hostname: "http://bim.wanda.cn/",
		debug: true
	},

	URL: {

		//代办 
		fetchTodoData: "platform/todo", //获取代办数据

		//项目 
		fetchProjects: "platform/project", //项目列表   
		fetchFileList: "doc/{projectId}/{projectVersionId}/file/children", //获取文件列表  ?fileId={parentId}
		fetchDesignFileNav: "doc/{projectId}/{projectVersionId}/file/tree", //项目设计文件导航 
		fetchDesignModelNav: "dataJson/project/project.design.model.json", //项目设计模型导航

		// 项目面包屑
		fetchCrumbsProject: "platform/project/groupByProvince", // 项目导航
		fetchCrumbsProjectVersion: "platform/project/{projectId}/version/groupBy", //项目面包屑版本  platform/project/{projectId}/version/orderBy
		fetchProjectVersionInfo: "platform/project/{projectId}/version/{projectVersionId}", //项目版本信息


		//模型
		fetchModelIdByProject: "doc/{projectId}/{projectVersionId}/model",
		fetchFileModelIdByFileVersionId: "doc/{projectId}/{projectVersionId}/file/meta", //?fileVersionId={fileVersionId}

		uploadFile: "doc/{projectId}/{projectVersionId}/file/data", //上传文件  ?parentId={parentId}&fileName={fileName}&size={size}&digest={digest}&position={position} 
		downLoad: "doc/{projectId}/{projectVersionId}/file/data", //文件下载  ?fileId={fileId}

		//设计
		fetchDesignProperties: "sixD/{projectId}/{projectVersionId}/property", //设计属性 ?sceneId={sceneId}&elementId={elementId}
		fetchDesignVerification: "", // 设计 检测
		fetchDesignCollision: "", // 设计碰撞

		//计划 
		fetchPlanModel: "", //模型
		fetchPlanAnalog: "", //模拟
		fetchPlanPublicity: "", //关注
		fetchPlanInspection: "", //检验
		fetchPlanProperties: "", //属性

		//陈本
		fetchCostReference: "", // 清单
		fetchCostChange: "", // 变更
		fetchCostVerification: "", // 效验
		fetchCostProperties: "", //属性


		// 质量
		fetchQualityMaterialEquipment: "", //材料设备
		fetchQualityProcessAcceptance: "", //过程验收
		fetchQualityProcessCheck: "", //过程检查
		fetchQualityOpeningAcceptance: "", //开业验收
		fetchQualityConcerns: "", //隐患
		fetchQualityProperties: "", // 属性


		//计划
		fetchPlanModel: "",



		//资源
		fetchStandardLibs: "", //获取 标准模型库
		fetchFamLibs: "", //获取族库



		test: ""
	},

	DEBUGURL: {

		//代办		
		fetchTodoData: "/dataJson/todo/todo.json", //获取代办数据


		// 项目
		fetchProjects: "/dataJson/{project}/project.list.json", //项目列表
		fetchFileList: "dataJson/project/project.design.json", //获取文件列表
		fetchDesignFileNav: "/dataJson/project/project.design.file.json", //项目设计文件导航
		fetchDesignModelNav: "/dataJson/project/project.design.model.json", //项目设计模型导航

		// 项目面包屑
		fetchCrumbsProject: "/dataJson/project/fetchCrumbsProject.json", // 项目导航
		fetchCrumbsProjectVersion: "/dataJson/project/fetchCrumbsProjectVersion.json", //项目面包屑版本
		fetchProjectVersionInfo: "platform/project/{projectId}/version/{projectVersionId}", //项目版本信息

		//设计
		fetchDesignProperties: "/dataJson/project/project.design.property.json", //设计属性
		fetchDesignVerification: "/dataJson/project/project.design.property.json", //设计检测
		fetchDesignCollision: "/dataJson/project/project.design.property.json", //设计碰撞

		//计划 
		fetchPlanModel: "/dataJson/project/project.design.property.json", //模型
		fetchPlanAnalog: "/dataJson/project/project.design.property.json", //模拟
		fetchPlanPublicity: "/dataJson/project/project.design.property.json", //关注
		fetchPlanInspection: "/dataJson/project/project.design.property.json", //检验
		fetchPlanProperties: "/dataJson/project/project.design.property.json", //属性


		//陈本
		fetchCostReference: "/dataJson/project/project.design.property.json", // 清单
		fetchCostChange: "/dataJson/project/project.design.property.json", // 变更
		fetchCostVerification: "/dataJson/project/project.design.property.json", // 效验
		fetchCostProperties: "/dataJson/project/project.design.property.json", //属性

		// 质量
		fetchQualityMaterialEquipment: "/dataJson/project/project.design.property.json", //材料设备
		fetchQualityProcessAcceptance: "/dataJson/project/project.design.property.json", //过程验收
		fetchQualityProcessCheck: "/dataJson/project/project.design.property.json", //过程检查
		fetchQualityOpeningAcceptance: "/dataJson/project/project.design.property.json", //开业验收
		fetchQualityConcerns: "/dataJson/project/project.design.property.json", //隐患
		fetchQualityProperties: "/dataJson/project/project.design.property.json", // 属性


		//资源
		fetchStandardLibs: "/dataJson/resources/StandardLibs.json",//获取 标准模型库
		fetchFamLibs: "/dataJson/resources/StandardLibs.json", //获取族库


		test: ""



	}


}