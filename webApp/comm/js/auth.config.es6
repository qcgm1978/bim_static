//权限配置
App.Comm.AuthConfig = {
	//项目 
	Project: {
		//设计
		DesignTab: {
			tab: '<li data-type="design" class="item design">设计<i class="line"></i></li>',
			prop: ' <li data-type="poperties" class="item">属性</li>',
			collision: '<li data-type="collision" class="item selected">碰撞</li>',
			check: '<li data-type="verifi" class="item">设计检查</li>'
		},
		//计划
		PlanTab: {
			tab: '<li data-type="plan" class="item plan">计划<i class="line"></i></li>',
			modularization: '<li data-type="model" class="item selected">模块化</li>',
			simulation: '<li data-type="analog" class="item">模拟</li>',
			follow: '<li data-type="publicity" class="item">关注</li>',
			proof: ' <li data-type="inspection" class="item">校验</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		},
		//成本
		CostTab: {
			tab: '<li data-type="cost" class="item cost">成本<i class="line"></i></li>',
			list: '<li data-type="reference" class="item selected">清单</li>',
			change: '<li data-type="change" class="item">变更</li>',
			proof: '<li data-type="verification" class="item">校验</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		},
		//质量
		QualityTab: {
			tab: '<li data-type="quality" class="item quality">质量<i class="line"></i></li>',
			material: '<li data-type="materialequipment" class="item selected">材料设备</li>',
			processAcceptanc: '<li data-type="processacceptance" class="item">过程验收</li> ',
			openAcceptance: '<li data-type="openingacceptance" class="item">开业验收</li>',
			latentDanger: '<li data-type="concerns" class="item">隐患</li>',
			prop: '<li data-type="poperties" class="item">属性</li>'
		}

	},

	//服务
	Service:{
		//项目
		project:{
			//项目基本信息
			baseInfo : {
				tab : '<li data-type="base" class="item ">项目基本信息</li>'
			},
			//项目映射规则
			mappingRule : {
				tab : '<li data-type="mappingRule" class="item">项目映射规则</li>'
			},
			//设计信息
			designInfo : {
				tab :  '<li data-type="floor" class="item">楼栋信息</li>'
							+'<li data-type="basehole" class="item">基坑</li>'
							+'<li data-type="section" class="item">剖面</li>'
							+'<li data-type="pile" class="item">桩</li>'
			}
		},
		//系统管理
		system : {
			//业务类别管理
			bizCategary : {
				tab : '<li data-type="category" class="item">业务类别管理</li>'
			},
			//业务流程管理
			workflow : {
				tab : '<li data-type="flow"     class="item ">业务流程管理</li>'

			},
			//扩展属性管理
			extendedAttribute : {
				tab : '<li data-type="extend"   class="item ">扩展属性管理</li>'

			},
			//公告属性管理
			announcementAttribute : {
				tab : '<li data-type="announcement"   class="item ">公告管理</li>'

			},
			//反馈属性管理
			feedbackAttribute : {
				tab : '<li data-type="feedback"   class="item ">反馈管理</li>'

			},
			//资源属性管理
			resourceAttribute : {
				tab : '<li data-type="resource"   class="item ">资源管理</li>'

			}
		}
	},

	//映射规则 模块化/质量标准  管理
	resource:{
		mappingRule:{
			module : '<li class="sele modularization">模块化</li>',
			quality : '<li class="sele quality">质量标准</li>',
			mappingRuleTemplateEdit:'<span class="edit">编辑</span><span class="delete">删除</span>'
		}
	}

	 

};