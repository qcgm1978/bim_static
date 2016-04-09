// 注意  删除操作 参数需要在url 中 jq 不会 处理 所以 url 命名的时候 以 delete 开头，我会处理

App.API = {

	Settings: {
		hostname: "http://bim.wanda.cn/",
		debug: false
	},

	URL: {

		//代办$chars
		fetchTodoData: "platform/todo", //获取代办数据

		//项目
		fetchProjects: "platform/project?type=3", //项目列表
		fetchFileList: "doc/{projectId}/{projectVersionId}/file/children", //获取文件列表  ?fileId={parentId}
		fetchDesignFileNav: "doc/{projectId}/{projectVersionId}/file/tree", //项目设计文件导航
		fetchDesignModelNav: "dataJson/project/project.design.model.json", //项目设计模型导航

		// 项目面包屑
		fetchCrumbsProject: "platform/project/groupByProvince", // 项目导航
		fetchCrumbsProjectVersion: "platform/project/{projectId}/version/groupBy", //项目面包屑版本  platform/project/{projectId}/version/orderBy
		fetchProjectVersionInfo: "platform/project/{projectId}/version/{projectVersionId}", //项目版本信息


		//模型
		fetchModelIdByProject: "view/{projectId}/{projectVersionId}/init",
		fetchFileModelIdByFileVersionId: "doc/{projectId}/{projectVersionId}/file/meta", //?fileVersionId={fileVersionId}

		fetchScene:"view/{etag}/{sourceId}/tree",// 获取楼层,专业信息
		fetchCategory:"view/{etag}/{sourceId}/categories",// 获取构件信息

		fetchFloors:'/datajson/map/map.json',//获取模型楼层信息
		fetchAxisGrid:'/datajson/map/gridAndLevel.json',//获取楼层地图,轴网信息

		uploadFile: "doc/{projectId}/{projectVersionId}/file/data", //上传文件  ?parentId={parentId}&fileName={fileName}&size={size}&digest={digest}&position={position}
		"checkDownLoad":"doc/{projectId}/{versionId}/file/size", // 下载确认 是否可以下载  ?fileVersionId={fileVersionId} 
		downLoad: "doc/{projectId}/{projectVersionId}/file/data", //文件下载  ?fileId={fileId}

		//视点
		fetchModelViewpoint: 'sixD/{projectId}/viewPoint', // 获取视点列表
		createViewpointById: 'sixD/{projectId}/viewPoint', // 创建视点
		editViewpointById: 'sixD/{projectId}/viewPoint/{viewPointId}', // 修改视点
		deleteViewpointById: 'sixD/{projectId}/viewPoint/{viewPointId}', // 删除视点


		//设计
		fetchDesignProperties: "sixD/{projectId}/{projectVersionId}/property", //设计属性 ?sceneId={sceneId}&elementId={elementId}
		fetchDesignVerification: "", // 设计 检测
		fetchDesignCollision: "", // 设计碰撞
		// 碰撞
		fetchDesignFiles:"view/{etag}/{sourceId}/collision/tree",// 碰撞文件列表
		fetchDesignCategory:"view/{etag}/{sourceId}/collision/categories",// 构件列表
		fetchDesignTaskList:"view/{projectId}/{projectVerionId}/collision/setting/list",//碰撞任务列表
		fetchDesignTaskDetail:"sixD/{projectId}/{projectVersionId}/{collisionId}/point?pageNo={pageNo}&pageSize={pageSize}",//碰撞点列表
		creatCollisionTask:"view/{projectId}/{projectVerionId}/collision/setting",//碰撞任务详情

		// 模型对比
		fetchDesignChange:"view/{projectId}/{projectVersionId}/comparison", // 获取模型对比列表
		fetchDesignChangeInfo:"sixD/{projectId}/{projectVersionId}/comparison/result?comparisonId={comparisonId}", // 获取模型对比结果

		//计划
		fetchPlanModel: "sixD/{projectId}/{projectVersionId}/plan", //模型
		fetchPlanAnalog: "", //模拟
		fetchPlanPublicity: "", //关注
		fetchPlanInspection: "", //检验
		fetchPlanProperties: "", //属性

		//陈本
		fetchCostReference: "sixD/{projectId}/{projectVersionId}/cost/summary", // 清单 
		fetchCostChange: "platform/auditSheet?type=9", // 变更
		fetchCostVerification: "", // 效验
		fetchCostProperties: "", //属性


		// 质量
		fetchQualityMaterialEquipment: "", //材料设备
		fetchQualityProcessAcceptance: "", //过程验收
		fetchQualityProcessCheck: "", //过程检查
		fetchQualityOpeningAcceptance: "", //开业验收
		fetchQualityConcerns: "", //隐患
		fetchQualityProperties: "", // 属性


		 



		//资源
		fetchStandardLibs: "platform/project?type=1", //获取 标准模型库
		fetchFamLibs: "platform/project?type=2", //获取族库
		fetchVersion: "platform/project/{projectId}/version/{versionId}",
		fetchFileTree: "doc/{projectId}/{projectVersionId}/file/tree", //项目设计文件导航
		deleteFile: "doc/{projectId}/{projectVersionId}/file?fileVersionId={fileVersionId}", //删除文件  ?fileVersionId={fileVersionId}
		putFileReName: "doc/{projectId}/{projectVersionId}/file/rename", // 重命名文件 ?fileVersionId={fileVersionId}&name={name}
		createNewFolder: "doc/{projectId}/{projectVersionId}/file", // 创建新文件夹 ?parentId={parentId}&filePath={filePath}


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

		fetchModelIdByProject:"/dataJson/project/design/fetchModelIdByProject.json",


		//设计
		fetchDesignProperties: "/dataJson/project/project.design.property.json", //设计属性
		fetchDesignVerification: "/dataJson/project/project.design.property.json", //设计检测

		// 碰撞
		fetchDesignCollision: "/dataJson/project/project.design.property.json", //设计碰撞
		fetchDesignFileList:"/dataJson/project/project.design.filesList.json",// 设计碰撞文件
		fetchDesignTaskList:"/dataJson/project/project.design.collision.taskList.json",//碰撞任务列表
		fetchDesignTaskDetail:"/dataJson/project/project.design.task.detail.json",//碰撞任务详情
		creatCollisionTask:"",

		// 模型对比
		fetchDesignChange:"/dataJson/project/fetchDesignChange.json", // 获取模型对比列表
		fetchDesignChangeInfo:"/dataJson/project/fetchDesignChangeInfo.json", // 获取模型对比结果


		//计划
		fetchPlanModel: "/dataJson/project/project.design.property.json", //模型
		fetchPlanAnalog: "/dataJson/project/project.design.property.json", //模拟
		fetchPlanPublicity: "/dataJson/project/project.design.property.json", //关注
		fetchPlanInspection: "/dataJson/project/project.design.property.json", //检验
		fetchPlanProperties: "/dataJson/project/project.design.property.json", //属性


		//陈本
		fetchCostReference: "/dataJson/project/cost/list.json", // 清单
		fetchCostChange: "/dataJson/project/project.design.property.json", // 变更
		fetchCostVerification: "/dataJson/project/cost/list.json", // 效验
		fetchCostProperties: "/dataJson/project/project.design.property.json", //属性

		// 质量
		fetchQualityMaterialEquipment: "/dataJson/project/project.design.property.json", //材料设备
		fetchQualityProcessAcceptance: "/dataJson/project/project.design.property.json", //过程验收
		fetchQualityProcessCheck: "/dataJson/project/project.design.property.json", //过程检查
		fetchQualityOpeningAcceptance: "/dataJson/project/project.design.property.json", //开业验收
		fetchQualityConcerns: "/dataJson/project/project.design.property.json", //隐患
		fetchQualityProperties: "/dataJson/project/project.design.property.json", // 属性


		//资源
		fetchStandardLibs: "/dataJson/resources/StandardLibs.json", //获取 标准模型库
		fetchFamLibs: "/dataJson/resources/StandardLibs.json", //获取族库
		fetchStandardVersion: "/dataJson/resources/fetchStandardVersion.json",
		fetchFileTree: "/dataJson/project/project.design.file.json", //项目设计文件导航
		deleteFile: "", //删除文件
		putFileReName: "", //重命名文件
		createNewFolder: "",

		test: ""



	}


}
