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

	}

	 

}