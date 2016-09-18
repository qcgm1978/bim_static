;/*!/resources/collection/index.es6*/
"use strict";

App.Resources = {

	//初始化

	init: function init() {
		//渲染

		new App.Resources.App().render();
	}
};
;/*!/resources/collection/resource.artifacts.es6*/
"use strict";

//fetchArtifactsPlan   获取计划
//fetchArtifactsPlanRule   获取规则
App.ResourceArtifacts = {
    Status: {
        saved: true, //创建规则后的保存状态，已保存  /  未保存
        qualityProcessType: 1, //质量标准 -过程选择  type
        delRule: "",
        qualityStandardType: "GC", //质量标准 -过程选择  type
        type: "", //1:标准规则；2：项目规则
        projectId: "", //如果有项目规则就有项目id
        templateId: "",
        modelEdit: false,
        templateName: "",
        rule: {
            biz: "", //1：模块化；2：质监标准
            type: "", //1:标准规则；2：项目规则
            targetCode: "", //对应模块的code
            targetName: "",
            count: "",
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList": []
            }
        },
        quality: {
            standardType: "GC",
            parentCode: ""
        }
    },
    Settings: {
        delayCount: 0, //每层加载数量
        model: ""
    },
    //计划节点
    PlanNode: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {};
            }
        }),
        urlType: "fetchArtifactsPlan",
        parse: function parse(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {}
        }
    }))(),
    //计划规则/获取
    operator: Backbone.Model.extend({
        defaults: function defaults() {
            return {
                code: ""
            };
        } }),
    //计划规则/获取节点规则
    PlanRules: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {};
            }
        }),
        urlType: "fetchArtifactsPlanRule",
        parse: function parse(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {}
        },
        comparator: function comparator(item) {
            return item.get("mappingCategory").categoryCode;
        }
    }))(),

    //创建计划规则
    newPlanRules: Backbone.Model.extend({
        defaults: function defaults() {
            return {
                code: ""
            };
        }
    }),
    //新建的规则数据模型
    saveRuleModel: function saveRuleModel() {
        return {
            "biz": 1, //1：模块化；2：质监标准  //新建时写入值
            "targetCode": "", //新建时写入当前计划编号
            "targetName": "", //计划名称
            "type": 1, //1:标准规则；2：项目规则  //新建时写入值
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList": [{
                    "propertyKey": "",
                    "operator": "",
                    "propertyValue": ""
                }]
            }
        };
    },
    //创建计划规则，模板
    createPlanRules: function createPlanRules() {
        //创建新的构件映射计划节点
        var newPlanRuleData = {
            "biz": "", //1：模块化；2：质监标准  //新建时写入值
            "targetCode": "", //新建时写入当前计划编号
            "targetName": "", //计划名称
            "type": "", //1:标准规则；2：项目规则  //新建时写入值
            "mappingCategory": {
                "categoryCode": "",
                "categoryName": "",
                "mappingPropertyList": [{
                    "propertyKey": "",
                    "operator": "",
                    "propertyValue": ""
                }]
            }
        };
        //写入基础数据
        newPlanRuleData.biz = App.ResourceArtifacts.Status.biz;
        newPlanRuleData.targetCode = App.ResourceArtifacts.Status.rule.targetCode;
        newPlanRuleData.targetName = "";
        newPlanRuleData.type = App.ResourceArtifacts.Status.type;

        return new this.newPlanRules(newPlanRuleData);
    },

    //保存计划规则
    SavePlanRules: Backbone.Model.extend({
        defaults: function defaults() {
            return {
                code: ""
            };
        },
        urlType: "",
        parse: function parse(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
                //保存成功
            }
        }
    }),
    //新映射数据模型
    newModel: {
        "id": null,
        "propertyKey": "",
        "operator": "",
        "propertyValue": null,
        categoryId: '',
        ruleList: {
            left: '',
            right: '',
            leftValue: '',
            rightValue: ''
        }
    },
    //新建规则
    newRule: Backbone.Model.extend({
        defaults: function defaults() {
            return {
                code: ""
            };
        }
    }),
    //新建条目
    newCode: Backbone.Model.extend({
        defaults: function defaults() {
            return {
                code: ""
            };
        }
    }),
    //规则collection
    ArtifactsRule: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {};
            }
        }),
        urlType: "",
        parse: function parse(responese) {
            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                //$().html('<li>无数据</li>');
            }
        }
    }))(),
    //规则模板列表
    TplCollection: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {};
            }
        })
    }))(),
    //规则模板规则列表
    TplCollectionRule: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {};
            }
        })
    }))(),

    init: function init(_this, optionType) {
        var tabs = App.Comm.AuthConfig.resource.mappingRule,
            Auth = App.AuthObj.lib;
        //console.log(_this);
        _this.$(".breadcrumbNav .breadItem").hide();
        _this.$(".breadcrumbNav .fileNav").hide();
        _this.$(".breadcrumbNav .breadItem.project").show();

        this.loaddeaprt(); //分类编码

        if (optionType == "library" || optionType == "template") {
            App.ResourceArtifacts.Status.projectId = "";
            App.ResourceArtifacts.Status.projectName = "";
            this.ArtifactsIndexNav = new App.Resources.ArtifactsIndexNav(); //模块化/质量标准菜单
            _this.$el.append(this.ArtifactsIndexNav.render().el);
        } else {
            //项目
            App.ResourceArtifacts.Status.projectId = optionType;
            this.ArtifactsProjectBreadCrumb = new App.Resources.ArtifactsProjectBreadCrumb();
            _this.$el.html(this.ArtifactsProjectBreadCrumb.render().el);
            //项目映射规则名称
            App.ResourceArtifacts.Status.projectName = App.Comm.publicData.services.project.projectName;
        }
        //公用组件
        this.menu = new App.Resources.ArtifactsMapRule(); //外层菜单
        this.plans = new App.Resources.ArtifactsPlanList(); //模块化列表 /计划节点
        this.planRuleTitle = new App.Resources.ArtifactsPlanRuleTitle(); //规则头部
        this.planRule = new App.Resources.ArtifactsPlanRule(); //规则列表
        this.quality = new App.Resources.ArtifactsQualityList(); //质量标准，外层
        this.plans.planRule = this.menu;
        this.menu.quality = this.quality;
        this.menu.plans = this.plans;

        App.ResourceArtifacts.Status.rule.biz = 1;
        App.ResourceArtifacts.Status.templateId = "";

        if (optionType == "template") {
            //规则模板
            _this.$(".resourcesMappingRule .template").addClass("active").siblings("a").removeClass("active");
            App.ResourceArtifacts.Status.qualityStandardType = "GC";
            if (App.ResourceArtifacts.Settings.ruleModel == 2) {
                App.ResourceArtifacts.Status.rule.biz = 2;
            }

            this.tplFrame = new App.Resources.ArtifactsTplFrame().render();
            this.tplList = new App.Resources.ArtifactsTplList();
            this.detail = new App.Resources.ArtifactsTplDetail();

            _this.$el.append(this.tplFrame.el); //菜单
            this.tplFrame.$(".tplListContainer").html(this.tplList.render().el); //右侧框架
            this.tplFrame.$(".tplContent .content").html(this.detail.render().el);
            this.detail.$(".tplDetailCon").append(this.menu.render().el); //菜单

            this.tplFrame.$el.addClass("services_loading");

            if (Auth.moduleMappingRule.view) {
                this.menu.$(".plans").html(this.plans.render().el); //计划
            }

            if (Auth.qualityMappingRule.view) {
                this.menu.$(".qualifyC").append(this.quality.render().el); //质量
            }

            if (Auth.moduleMappingRule.edit || Auth.qualityMappingRule.edit) {
                this.menu.$(".rules").append(this.planRuleTitle.render().el); //规则
                this.planRuleTitle.$(".ruleContentRuleList").append(this.planRule.render().el); //规则列表
            }

            this.detail.$(".artifactsContent").addClass("explorer");

            this.getTpl();
        } else {
            //规则库
            $("#artifacts").addClass("services_loading");
            App.ResourceArtifacts.modelEdit = false;
            _this.$(".resourcesMappingRule .library").addClass("active").siblings("a").removeClass("active");
            _this.$el.append(this.menu.render().el); //菜单
            this.menu.$el.addClass("services_loading");
            //写入项目名称
            if (App.ResourceArtifacts.Status.projectId) {
                this.getProjectName(_this, App.ResourceArtifacts.Status.projectId);
            }
            //读入数据
            if (Auth.moduleMappingRule.view) {
                this.menu.$(".plans").html(this.plans.render().el); //计划节点
                this.getPlan();
            }
            if (Auth.qualityMappingRule.view) {
                this.menu.$(".qualifyC").hide().html(this.quality.render().el);
                this.getAllQuality(function (data) {
                    App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListGC"), App.ResourceArtifacts.allQualityGC, null, "0");
                    App.ResourceArtifacts.menu.$(".qualityMenuListGC").show();
                    App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListKY"), App.ResourceArtifacts.allQualityKY, null, "0");
                });
            }
            if (Auth.moduleMappingRule.edit || Auth.qualityMappingRule.edit) {
                this.menu.$(".rules").html(this.planRuleTitle.render().el); //映射规则标题
                this.planRuleTitle.$(".ruleContentRuleList").html(this.planRule.render().el); //映射规则列表
            }
        }
        $(".resourcesMappingRule").show();
    },
    //获取项目名称
    getProjectName: function getProjectName(_this, projectId) {
        var pdata = {
            URLtype: "fetchArtifactsProjectName",
            data: {
                projectId: projectId
            }
        };
        App.Comm.ajax(pdata, function (response) {
            if (response.code == 0) {
                _this.$(".projectName").html(response.data.name);
            }
        });
    },
    // 获取分类编码
    loaddeaprt: function loaddeaprt() {
        //获取分类编码
        var cdata = {
            URLtype: "fetchArtifactsCategoryRule",
            data: {}
        };
        App.Comm.ajax(cdata, function (response) {
            if (response.code == 0 && response.data && response.data.length) {
                App.Resources.artifactsTreeData = response.data;
            }
        });
    },
    //获取计划节点
    getPlan: function getPlan() {

        var _this = App.ResourceArtifacts,
            pdata;
        pdata = {
            URLtype: "fetchArtifactsPlan",
            data: {
                type: App.ResourceArtifacts.Status.type
            }
        };
        if (App.ResourceArtifacts.Status.templateId) {
            pdata.data.templateId = App.ResourceArtifacts.Status.templateId;
        } else if (App.ResourceArtifacts.Status.projectId) {
            pdata.data.projectId = App.ResourceArtifacts.Status.projectId;
        }
        App.ResourceArtifacts.PlanRules.reset();

        App.Comm.ajax(pdata, function (response) {
            if (response.code == 0 && response.data) {
                if (response.data.length) {
                    App.ResourceArtifacts.PlanNode.reset();
                    App.ResourceArtifacts.PlanNode.add(response.data);
                } else {
                    Backbone.trigger("mappingRuleNoContent");
                }
            }
            _this.menu.$el.removeClass("services_loading");
        });
    },
    //所有
    modelSaving: {
        templateId: "",
        templateName: "",
        codeIds: []
    },
    allQualityGC: [],
    allQualityKY: [],
    //获取全部质量标准
    getAllQuality: function getAllQuality(fn) {
        var _this = this;
        var pdata = {
            URLtype: 'fetchArtifactsQuality',
            data: {
                parentCode: "all",
                type: App.ResourceArtifacts.Status.type
            }
        };

        if (App.ResourceArtifacts.Status.templateId) {
            pdata.data.templateId = App.ResourceArtifacts.Status.templateId;
        } else if (App.ResourceArtifacts.Status.projectId) {
            pdata.data.projectId = App.ResourceArtifacts.Status.projectId;
        }

        App.Comm.ajax(pdata, function (response) {
            if (response.code == 0 && response.data.length) {
                App.ResourceArtifacts.allQualityKY = _.filter(response.data, function (item) {
                    return item.type == "KY";
                });
                App.ResourceArtifacts.allQualityGC = _.filter(response.data, function (item) {
                    return item.type == "GC";
                });
                if (fn && typeof fn == "function") {
                    fn(response.data);
                }
            }
        });
    },
    //获取已经加载并且要存储的有效数据
    getValid: function getValid(obj) {
        return {
            code: obj.code,
            ruleIds: obj.ruleIds || []
        };
    },
    //质量标准三级分类，要插入元素，数据，是否有父节点，ruleContain
    // 值是否存在
    departQuality: function departQuality(ele, cdata, parentCode, ruleContain) {
        var data = cdata,
            levelData;

        if (!parentCode) {

            levelData = _.filter(data, function (item) {
                return !item.parentCode;
            });
        } else {
            levelData = _.filter(data, function (item) {
                return item.parentCode == parentCode;
            });
        }
        if (levelData.length) {
            $(ele).html(App.Resources.artifactsQualityTree(levelData, ruleContain));
        }
    },
    //获取规则模板
    getTpl: function getTpl() {
        var _this = this,
            pdata;
        pdata = {
            URLtype: "fetchArtifactsTemplate",
            data: {}
        };
        App.ResourceArtifacts.TplCollection.reset();
        App.Comm.ajax(pdata, function (response) {
            if (response.code == 0 && response.data) {
                if (response.data.length) {
                    App.ResourceArtifacts.TplCollection.add(response.data);
                } else {}
            }
            _this.tplFrame.$el.removeClass("services_loading");
        });
    },
    loading: function loading(ele) {
        $(ele).addClass("services_loading");
    },
    loaded: function loaded(ele) {
        $(ele).removeClass("services_loading");
    },
    //重置规则
    resetPreRule: function resetPreRule() {
        App.ResourceArtifacts.Status.templateId = "";
        App.ResourceArtifacts.Status.templateName = "";
        App.ResourceArtifacts.Status.rule.biz = "";
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
    }
};
;/*!/resources/collection/resource.famlibs.es6*/
"use strict";

App.ResourceFamLibs = {};
;/*!/resources/collection/resource.model.es6*/
"use strict";

App.ResourceModel = {

	Settings: {
		leftType: "file",
		DataModel: "", //模型id
		fileVersionId: "",
		searchText: "", //搜索文本
		type: "", //模型类型
		projectId: "", //项目id
		versionId: "", // 版本id
		pageIndex: 1,
		CurrentVersion: {}
	},

	// 文件 容器
	FileCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchFileList",

		parse: function parse(responese) {

			if (responese.code == 0 && responese.data.length > 0) {
				return responese.data;
			} else {
				$("#resourceListContent .fileContent").html('<li class="loading">无数据</li>');
			}
		}

	}))(),
	// 文件 容器
	FileThumCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchFileList",

		parse: function parse(responese) {
			if (responese.code == 0 && responese.data.length > 0) {
				return responese.data;
			} else {
				$("#resourceThumContent .thumContent").html('<li class="loading">无数据</li>');
			}
		}

	}))(),

	PropertiesCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}
		}),

		urlType: "fetchDesignProperties",

		parse: function parse(response) {

			if (response.message == "success") {
				return response;
			}
		}

	}))(),

	//初始化
	init: function init() {

		//释放上传
		App.Comm.upload.destroy();

		//重置参数
		this.reset();

		//存在直接渲染 否则 加载数据
		if (App.ResourceModel.Settings.CurrentVersion && App.ResourceModel.Settings.CurrentVersion.id) {
			App.ResourceModel.renderLibs();
		} else {
			App.ResourceModel.getVersion();
		}

		if (!App.ResourceModel.Settings.bindGlobalEvent) {
			App.ResourceModel.Settings.bindGlobalEvent = true;
			App.ResourceModel.bindGlobalEvent();
		}
	},

	//token 初始化
	initToken: function initToken() {
		//释放上传
		App.Comm.upload.destroy();

		//重置参数
		this.reset();

		//存在直接渲染 否则 加载数据
		if (App.ResourceModel.Settings.CurrentVersion && App.ResourceModel.Settings.CurrentVersion.id) {
			App.ResourceModel.renderLibs();
		} else {
			App.ResourceModel.getVersionByToken();
		}

		if (!App.ResourceModel.Settings.bindGlobalEvent) {
			App.ResourceModel.Settings.bindGlobalEvent = true;
			App.ResourceModel.bindGlobalEvent();
		}
	},


	reset: function reset() {

		App.ResourceModel.Settings.leftType = "file";
		App.ResourceModel.Settings.searchText = "";
		App.ResourceModel.Settings.pageIndex = 1;
		App.ResourceModel.Settings.DataModel = null;
		App.ResourceModel.Settings.CurrentVersion = {};
	},

	//绑定全局的事件
	bindGlobalEvent: function bindGlobalEvent() {

		$(document).on("click.resources", function (event) {

			var $target = $(event.target);

			if ($target.closest('.thumContent .item').length <= 0) {
				$('.thumContent .item').each(function (i, item) {
					if ($(item).hasClass("selected")) {
						if (!$(item).find(".filecKAll input").is(":checked")) {
							$(item).removeClass("selected");
						}
					}
				});
			}

			//面包屑 切换 文件 模型 浏览器
			if ($target.closest(".breadItem.fileModelNav").length <= 0) {
				$(".breadItem .fileModelList").hide();
			}

			//面包屑 切换 文件 模型 浏览器
			if ($target.closest(".breadItem.resourcesList").length <= 0) {
				$(".breadItem.resourcesList .projectVersionList").hide();
			}
			if ($target.closest(".breadItem.standardLibsVersion ").length <= 0) {
				$(".breadItem.standardLibsVersion  .projectVersionList").hide();
			}
		});
	},


	//获取数据
	getVersion: function getVersion() {

		var data = {
			URLtype: "fetchVersion",
			data: {
				projectId: App.ResourceModel.Settings.projectId,
				versionId: App.ResourceModel.Settings.versionId
			}
		};

		App.Comm.ajax(data, function (data) {

			if (data.message == "success") {

				App.ResourceModel.Settings.CurrentVersion = data.data;

				if (!App.ResourceModel.Settings.CurrentVersion) {
					alert("无默认版本");
					return;
				} else {
					//渲染数据
					App.ResourceModel.renderLibs();
				}
			} else {
				alert("获取版本失败");
			}
		});
	},

	//根据token获取版本
	getVersionByToken: function getVersionByToken() {

		var data = {
			URLtype: "fetchProjectBaseInfo",
			data: {
				projectId: App.ResourceModel.Settings.projectId

			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {

				App.ResourceModel.Settings.CurrentVersion = data.data.version;

				if (!App.ResourceModel.Settings.CurrentVersion) {
					alert("无默认版本");
					return;
				} else {
					//渲染数据
					App.ResourceModel.renderLibs();
				}
			} else {
				alert("获取版本失败");
			}
		});
	},


	//渲染标准模型库
	renderLibs: function renderLibs() {
		if (!App.ResourceModel.Settings.CurrentVersion) {
			alert("无默认版本");
			return;
		} else {
			//渲染数据
			new App.ResourceModel.App().render();
			var type = App.ResourcesNav.Settings.type;
			if (type == "standardLibs") {
				App.ResourceModel.FileCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.FileCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.FileCollection.reset();
				App.ResourceModel.FileCollection.fetch({
					success: function success() {

						$("#pageLoading").hide();
					}
				});
			} else if (type == "famLibs") {
				App.ResourceModel.FileThumCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.FileThumCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.FileThumCollection.reset();
				App.ResourceModel.FileThumCollection.fetch({
					success: function success() {

						$("#pageLoading").hide();
					}
				});
			}

			var status = App.ResourceModel.Settings.CurrentVersion.status;

			if (status != 9 && status != 4 && status != 7) {
				//上传
				App.ResourceUpload.init($(document.body));
				$("#navContainer .topBar").find(".btnNewFolder,.btnFileUpload,.btnFileDel").show();
			} else {
				$("#navContainer .topBar").find(".btnNewFolder,.btnFileUpload,.btnFileDel").hide();
			}
		}
	},


	//创建文件夹
	createNewFolder: function createNewFolder() {

		var virModel = {
			isAdd: true,
			id: "createNew",
			children: null,
			fileVersionId: 520,
			folder: true,
			name: "新建文件夹",
			createTime: null,
			creatorId: null,
			creatorName: null,
			digest: null,
			floor: null
		};

		var type = App.ResourceModel.Settings.type;
		if (type == "standardLibs") {
			App.ResourceModel.FileCollection.push(virModel);
		} else if (type == "famLibs") {
			App.ResourceModel.FileThumCollection.push(virModel);
		}
	},

	//创建文件夹后处理
	afterCreateNewFolder: function afterCreateNewFolder(file, parentId) {

		var $treeViewMar = $(".projectNavFileContainer .treeViewMar"),
		    $treeViewMarUl = $treeViewMar.find(".treeViewMarUl");

		var data = {
			data: [file],
			iconType: 1
		};

		//窜仔
		if ($treeViewMar.find('span[data-id="' + file.id + '"]').length > 0) {
			return;
		}

		//没有的时候绑定点击事件
		if ($treeViewMarUl.length <= 0) {

			data.click = function (event) {
				var file = $(event.target).data("file");
				if (file.folder) {
					$('#navContainer .returnBack').removeClass('theEnd').attr('isReturn', '1').html('返回上级');
				}
				if (type == "standardLibs") {
					//清空数据
					$("#resourceListContent .fileContent").empty();
					App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
					App.ResourceModel.FileCollection.reset();

					App.ResourceModel.FileCollection.fetch({
						data: {
							parentId: file.fileVersionId
						}
					});
				} else if (type == "famLibs") {
					var file = $(event.target).data("file");
					//清空数据
					$("#resourceThumContent .thumContent").empty();
					App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
					App.ResourceModel.FileThumCollection.reset();

					App.ResourceModel.FileThumCollection.fetch({
						data: {
							parentId: file.fileVersionId
						}
					});
				}
			};
		}

		var navHtml = new App.Comm.TreeViewMar(data);
		//不存在创建
		if ($treeViewMarUl.length <= 0) {
			$treeViewMar.html($(navHtml).find(".treeViewMarUl"));
		} else {

			if (parentId) {

				var $span = $treeViewMarUl.find("span[data-id='" + parentId + "']");
				if ($span.length > 0) {
					var $li = $span.closest('li');
					if ($li.find(".treeViewSub").length <= 0) {
						$li.append('<ul class="treeViewSub mIconOrCk" style="display:block;" />');
					}

					var $itemContent = $li.children('.item-content'),
					    $noneSwitch = $itemContent.find(".noneSwitch");

					if ($noneSwitch.length > 0) {
						$noneSwitch.toggleClass('noneSwitch nodeSwitch on');
					}

					var $newLi = $(navHtml).find(".treeViewMarUl li").removeClass("rootNode").addClass('itemNode');
					$li.find(".treeViewSub").prepend($newLi);
				}
			} else {
				$treeViewMarUl.prepend($(navHtml).find(".treeViewMarUl li"));
			}
		}
	},
	afterRemoveFolder: function afterRemoveFolder(file) {

		if (!file.folder) {
			return;
		}

		var $treeViewMar = $(".projectNavFileContainer .treeViewMar"),
		    $treeViewMarUl = $treeViewMar.find(".treeViewMarUl");

		if ($treeViewMarUl.length > 0) {
			var $span = $treeViewMarUl.find("span[data-id='" + file.id + "']");
			if ($span.length > 0) {
				var $li = $span.closest('li'),
				    $parent = $li.parent();
				$li.remove();
				//没有文件夹了
				if ($parent.find("li").length <= 0) {
					$parent.parent().children(".item-content").find(".nodeSwitch").removeClass().addClass("noneSwitch");
				}
			}
		}
	},


	//删除文件弹出层
	delFileDialog: function delFileDialog($item) {

		var dialog = new App.Comm.modules.Dialog({
			width: 580,
			height: 168,
			limitHeight: false,
			title: '删除文件提示',
			cssClass: 'deleteFileDialog',
			okClass: "delFile",
			okText: '确&nbsp;&nbsp;认',
			okCallback: function okCallback() {

				var fileVersionId = $item.find(".filecKAll").data("fileversionid"),
				    id = $item.find(".text").data("id"),
				    models = App.ResourceModel.FileCollection.models;

				if (App.ResourceModel.Settings.type == "famLibs") {
					models = App.ResourceModel.FileThumCollection.models;
				}

				//修改数据
				$.each(models, function (i, model) {
					if (model.toJSON().id == id) {

						model.urlType = "deleteFile";
						model.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
						model.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
						model.fileVersionId = fileVersionId;
						model.destroy();

						return false;
					}
				});

				// //请求数据
				// var data = {
				// 	URLtype: "deleteFile",
				// 	type: "DELETE",
				// 	data: {
				// 		projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				// 		projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				// 		fileVersionId: fileVersionId
				// 	}
				// };

				// //删除
				// App.Comm.ajax(data, function(data) {
				// 	console.log(data);
				// });
			},
			message: $item.find(".folder").length > 0 ? "确认要删除该文件夹么？" : "确认要删除该文件么？"

		});
	},

	//获取文件名称 搜索
	getName: function getName(name) {

		var searchText = App.ResourceModel.Settings.searchText;
		if (searchText) {

			name = name.replace(searchText.toLowerCase(), '<span class="searchText">' + searchText.toLowerCase() + '</span>').replace(searchText.toUpperCase(), '<span class="searchText">' + searchText.toUpperCase() + '</span>');
		}
		return name;
	}
};
;/*!/resources/collection/resource.nav.es6*/
"use strict";

App.ResourcesNav = {

	Settings: {

		pageIndex: 1,
		type: "" // 库的类型

	},

	//标准模型库
	StandardLibsCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}

		}),

		urlType: "fetchStandardLibs",

		parse: function parse(responese) {
			if (responese.message == "success") {
				if (responese.data.items.length <= 0) {
					Backbone.trigger('StandModelNullData');
				} else {
					return responese.data.items;
				}
			}
		}

	}))(),

	//族库
	FamLibsCollection: new (Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function defaults() {
				return {
					title: ""
				};
			}

		}),

		urlType: "fetchFamLibs",

		parse: function parse(responese) {
			if (responese.message == "success") {
				if (responese.data.items.length <= 0) {
					Backbone.trigger('FamlibNullData');
				} else {
					return responese.data.items;
				}
			}
		}

	}))(),

	//获取名称更具类型
	getNameByType: function getNameByType() {

		var name = "",
		    href,
		    type = App.ResourcesNav.Settings.type;
		if (type == "standardLibs") {
			name = " 标准模型库";
			href = "#resources/standardLibs";
		} else if (type == "famLibs") {
			name = "族库";
			href = "#resources/famLibs";
		} else if (type == "qualityStandardLibs") {
			name = "质量标准库";
			href = "#resources/qualityStandardLibs";
		} else if (type == "manifestLibs") {
			name = " 清单库";
			href = "#resources/manifestLibs";
		} else if (type == "artifactsMapRule") {
			name = " 映射规则库";
			href = "#resources/artifactsMapRule";
		}
		return {
			name: name,
			href: href
		};
	},
	init: function init() {
		App.ResourcesNav.reset();
		new App.ResourcesNav.App().render();
	},


	//重置数据
	reset: function reset() {
		App.ResourcesNav.Settings.pageIndex = 1;

		if (App.ResourceModel) {

			var settings = App.ResourceModel.Settings;
			for (var p in settings) {
				settings[p] = "";
			}
			App.ResourceModel.Settings.leftType = "file";
			App.ResourceModel.Settings.pageIndex = 1;
		}
	},

	//生成url
	getNavUrl: function getNavUrl(id, version) {

		var url = "#resources/";
		if (App.ResourcesNav.Settings.type == 'famLibs') {
			url += "famLibs/";
		} else {
			url += "standardLibs/";
		}
		url += id + "/";
		if (version) {
			url += version.id;
		}
		return url;
	}
};
;/*!/resources/collection/resource.upload.js*/
/**
 * @author baoym@grandsoft.com.cn
 */
(function($) {

	'use strict'

	var docUpload = {

		__container: null,

		init: function(container, options) {
			var self = this;
			self.__options = options;
			self.__container = container;

			//添加元素
			var upload = $('<div>', {
				'class': 'mod-plupload'
			}).appendTo(container)

			//初始化
			App.Comm.upload.init(upload, {

				getParentId: function() {

					return App.ResourceModel.Settings.fileVersionId;
				},

				getQuotaInfo: function() {
					return self.getQuotaInfo()
				},

				//是否可以上传
				canUploadFile: function() {
					if (App.ResourceModel.Settings.fileVersionId) {
						return true;
					} else {
						return false;
					}


					//return App.Comm.modules.util.canUploadFile()
				},

				// getUploadedBytesUrl: function(parentId) {
				//     // return App.Comm.modules.util.getUrl(parentId, {
				//     //     bytes: false
				//     // })
				// },

				//获取上传url
				getUploadUrl: function(file) {


					var data = {
						data: {
							projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
							projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
						},
						URLtype: "uploadFile"
					};

					return App.Comm.getUrlByType(data).url;


					//return "http://172.16.233.210:8080/bim/api/1232321/file/data?fileId=444444444444";
					// return App.Comm.modules.util.getUrl(App.Comm.modules.util.getParentId(), {
					//     upload: false,
					//     returnFirst: false
					// })
				},

				//上传成功
				fileUploaded: function(response, file) {


					var data = JSON.parse(response.response),
						type = App.ResourceModel.Settings.type,
						models = App.ResourceModel.FileCollection.models,
						$leftSel=$("#resourceFamlibsLeftNav .treeViewMarUl .selected"),
						parentId="",
						has = false;
					if (type == "famLibs") {
						models = App.ResourceModel.FileThumCollection.models;
					}


					$.each(models, function(index, model) {
						if (model.toJSON().id == data.data.id) {
							has = true;
							model.set(data.data);
							return false;
						}
					});
					//新增
					if (!has) {
						data.data.isAdd = true;
						if (type == "famLibs") {
							App.ResourceModel.FileThumCollection.add(data.data);
						} else if (type == "standardLibs") {
							App.ResourceModel.FileCollection.add(data.data);
						}

					}

					if ($leftSel.length > 0) {
						parentId = $leftSel.data("file").fileVersionId;
					}

					if(data.data.folder){
						this.afterCreateNewFolder(data.data);
						//App.ResourceModel.afterCreateNewFolder(data.data, parentId);
					}
					
					//$.jps.publish('add-upload-file', response, file)
				},

				  //上传文件后操作
                afterCreateNewFolder(data) {

                    App.ResourceModel.afterCreateNewFolder(data, data.parentId);

                    if (data.children) {

                        var count=data.children.length;

                        for(var i=0;i<count;i++){
                            this.afterCreateNewFolder(data.children[i]);
                        }
                    }
                },

				//上传失败
				uploadError: function(file) {
					//App.Comm.modules.util.actionTip('上传失败:' + file.message + '。文件：' + file.file.name)
				}
			})
			self.updateQuotaInfo()
		},

		//获取上传容量
		getQuotaInfo: function() {
			//var quota = this.quota;
			//return "共 20GB，已用 564.2MB"; //App.Comm.modules.util.format('共 $0，已用 $1', [App.common.modules.util.formatSize(quota.total), App.common.modules.util.formatSize(quota.used)])
		},

		//更新上传容量
		updateQuotaInfo: function() {
			App.Comm.upload.setQuotaInfo(this.getQuotaInfo())
		}
	}

	App.ResourceUpload = docUpload

})(jQuery)
;/*!/resources/views/resoucesModel/resouces.model.app.es6*/
"use strict";

App.ResourceModel.App = Backbone.View.extend({

  el: $("#contains"),

  render: function render() {

    this.$el.html(new App.ResourceCrumbsNav().render().el);
    //标准模型库
    if (App.ResourcesNav.Settings.type == "standardLibs") {
      this.$el.append(new App.ResourceModel.LeftNav().render().el);
    } else if (App.ResourcesNav.Settings.type == "famLibs") {
      //族库
      this.$el.append(new App.ResourceFamLibs.leftNav().render().el);
    }
    this.$el.append(new App.ResourceModel.ListNav().render().el);

    //右键菜单
    if (!document.getElementById("listContext")) {
      //右键菜单
      var contextHtml = _.templateUrl("/resources/tpls/context/listContext.html", true);
      $("body").append(contextHtml);
    }
    //右键菜单
    if (!document.getElementById("listContextFamily")) {
      //右键菜单
      var contextHtml = _.templateUrl("/resources/tpls/context/listContextFamily.html", true);
      $("body").append(contextHtml);
    }
  }
});
;/*!/resources/views/resoucesModel/resource.model.listNav.list.es6*/
"use strict";

//列表
App.ResourceModel.ListContent = Backbone.View.extend({

	tagName: "div",

	id: "resourceListContent",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.ResourceModel.FileCollection, "add", this.addOneFile);
		this.listenTo(App.ResourceModel.FileCollection, "reset", this.reset);
		this.listenTo(App.ResourceModel.FileCollection, "searchNull", this.searchNull);
	},

	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.listNav.list.html", true),

	events: {
		"click .header .ckAll": "ckAll"
	},

	//渲染
	render: function render() {

		this.$el.html(this.template);
		return this;
	},

	ckAll: function ckAll(event) {
		this.$el.find(".fileContent .ckAll").prop("checked", event.target.checked);
	},


	//添加单个文件
	addOneFile: function addOneFile(model) {
		var view = new App.ResourceModel.ListNavDetail({
			model: model
		});

		this.$el.find(".fileContent .loading").remove();

		if (model.toJSON().isAdd) {
			this.$el.find(".fileContent").prepend(view.render().el);
		} else {
			this.$el.find(".fileContent").append(view.render().el);
		}

		App.Comm.initScroll(this.$el.find(".fileLists"), "y");
	},

	reset: function reset() {
		this.$el.find(".fileContent").html('<li class="loading">正在加载，请稍候…</li>');
	},


	//搜索为空
	searchNull: function searchNull() {
		this.$el.find(".fileContent").html('<li class="loading"><i class="iconTip"></i>未搜索到相关文件/文件夹</li>');
	}
});
;/*!/resources/views/resoucesModel/resource.model.listNav.list.topBar.es6*/
"use strict";

App.ResourceModel.TopBar = Backbone.View.extend({

  tagName: "div",

  className: "topBar",

  events: {
    "click .btnNewFolder": "createNewFolder", //创建文件夹
    "click .btnFileDownLoad": "fileDownLoad", //文件下载 
    "click .btnFileDel": "deleteFile", //删除文件
    'click .returnBack': 'returnBack',
    "click .btnFileSearch": "fileSearch",
    "click .clearSearch": "clearSearch",
    "keyup #txtFileSearch": "enterSearch"
  },

  template: _.templateUrl('/resources/tpls/resourceModel/resource.model.listNav.list.topBar.html', true),

  render: function render() {
    var type = App.ResourcesNav.Settings.type == "famLibs" ? 'family' : 'model';
    this.$el.html(this.template);
    if (App.AuthObj.lib) {

      if (!App.Comm.isAuth('create', type)) {
        this.$('.btnNewFolder').addClass('disable');
      }
      //删除、重命名权限判断方式一样
      if (!App.Comm.isAuth('upload', type)) {
        this.$('.btnFileUpload ').addClass('disable');
      }
      if (!App.Comm.isAuth('delete', type)) {
        this.$('.btnFileDel ').addClass('disable');
      }
    }
    return this;
  },

  isDisabled: function isDisabled() {
    if (App.ResourceModel.Settings.CurrentVersion.status == 4 || App.ResourceModel.Settings.CurrentVersion.status == 7) {
      return true;
    }
    return false;
  },

  returnBack: function returnBack(e) {
    if ($(e.currentTarget).attr('isReturn') == '0') {
      return;
    }
    var type = App.ResourcesNav.Settings.type;
    var id = type == "standardLibs" ? "resourceModelLeftNav" : "resourceFamlibsLeftNav";
    var $currentLevel = $('#' + id + ' .treeViewMarUl .selected');
    var file = $currentLevel.data('file');
    var parentId = file.parentId;
    var $parent = $('#' + id + ' .treeViewMarUl span[data-id="' + parentId + '"]');
    if ($parent.length) {
      $parent.click();
    } else {
      $(e.currentTarget).attr('isReturn', '0').addClass('theEnd').html('全部文件');
      if (type == "standardLibs") {
        App.ResourceModel.FileCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
        App.ResourceModel.FileCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
        App.ResourceModel.FileCollection.reset();
        App.ResourceModel.FileCollection.fetch({
          success: function success() {
            $("#pageLoading").hide();
          }
        });
      } else if (type == "famLibs") {
        App.ResourceModel.FileThumCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
        App.ResourceModel.FileThumCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
        App.ResourceModel.FileThumCollection.reset();
        App.ResourceModel.FileThumCollection.fetch({
          success: function success() {
            $("#pageLoading").hide();
          }
        });
      }
    }
  },

  //创建新文件家
  createNewFolder: function createNewFolder(e) {
    if ($(e.currentTarget).is('.disable')) {
      return;
    }
    App.ResourceModel.createNewFolder();
  },

  //下载
  fileDownLoad: function fileDownLoad(e) {
    if ($(e.currentTarget).is('.disable')) {
      return;
    }
    var $resourceListContent = $("#resourceListContent"),
        $selFile = $resourceListContent.find(".fileContent :checkbox:checked").parent();

    if (App.ResourceModel.Settings.type == "famLibs") {
      $resourceListContent = $("#resourceThumContent");
      $selFile = $resourceListContent.find(".thumContent :checkbox:checked").parent();
    }

    if ($selFile.length < 1) {
      alert("请选择需要下载的文件");
      return;
    }

    var FileIdArr = [];
    $selFile.each(function (i, item) {
      FileIdArr.push($(this).data("fileversionid"));
    });

    var fileVersionId = FileIdArr.join(",");

    //下载
    App.Comm.checkDownLoad(App.ResourceModel.Settings.CurrentVersion.projectId, App.ResourceModel.Settings.CurrentVersion.id, fileVersionId);
  },

  //删除文件
  deleteFile: function deleteFile(e) {
    if ($(e.currentTarget).is('.disable')) {
      return;
    }
    var $resourceListContent = $("#resourceListContent"),
        $selFile = $resourceListContent.find(".fileContent :checkbox:checked");

    if (App.ResourceModel.Settings.type == "famLibs") {
      $resourceListContent = $("#resourceThumContent");
      $selFile = $resourceListContent.find(".thumContent :checkbox:checked");
    }

    if ($selFile.length > 1) {
      alert("目前只支持单文件删除");
      return;
    }

    if ($selFile.length < 1) {
      alert("请选择需要删除的文件");
      return;
    }

    var $item = $selFile.closest(".item");
    //删除
    App.ResourceModel.delFileDialog($item);
  },

  //回车搜索
  enterSearch: function enterSearch(event) {
    if (event.keyCode == 13) {
      this.fileSearch();
    }
  },


  //搜索
  fileSearch: function fileSearch() {
    var _this = this;

    var txtSearch = $("#txtFileSearch").val().trim();

    //没有搜索内容
    if (!txtSearch) {
      return;
    }
    //搜索赋值
    App.ResourceModel.Settings.searchText = txtSearch;
    var data = {
      URLtype: "fileSearch",
      data: {
        projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
        versionId: App.ResourceModel.Settings.CurrentVersion.id,
        key: txtSearch
      }
    };

    App.Comm.ajax(data, function (data) {

      if (data.code == 0) {
        var count = data.data.length,
            collection,
            type = App.ResourceModel.Settings.type;

        _this.$(".clearSearch").show();
        _this.$(".opBox").hide();
        _this.$(".searchCount").show().find(".count").text(count);

        if (type == "standardLibs") {
          collection = App.ResourceModel.FileCollection;
        } else if (type == "famLibs") {
          collection = App.ResourceModel.FileThumCollection;
        }

        collection.reset();

        if (count > 0) {
          var _temp = data.data || [];
          _.each(_temp, function (item) {
            item.isSearch = 'search';
          });
          collection.push(_temp);
        } else {
          collection.trigger("searchNull");
        }
      }
    });
  },


  //搜索为空
  searchNull: function searchNull() {
    this.$el.find(".fileContent").html('<li class="loading"><i class="iconTip"></i>未搜索到相关文件/文件夹</li>');
  },


  //清除搜索
  clearSearch: function clearSearch() {

    this.$(".clearSearch").hide();
    this.$(".opBox").show();
    this.$(".searchCount").hide();
    $("#txtFileSearch").val("");

    App.ResourceModel.Settings.searchText = "";

    var collection,
        type = App.ResourceModel.Settings.type;
    if (type == "standardLibs") {
      collection = App.ResourceModel.FileCollection;
    } else if (type == "famLibs") {
      collection = App.ResourceModel.FileThumCollection;
    }

    collection.reset();

    var $selectFile = $("#resourceFamlibsLeftNav .selected");

    if ($selectFile.length > 0) {
      collection.fetch({
        data: {
          parentId: $selectFile.data("file").fileVersionId
        }
      });
    } else {
      collection.fetch();
    }
  }
});
;/*!/resources/views/resoucesModel/resources.model.leftNav.es6*/
"use strict";

App.ResourceModel.LeftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceModelLeftNav",

	template: _.templateUrl("/resources/tpls/resourceModel/resources.model.leftNav.html", true),

	//渲染
	render: function render(type) {

		this.$el.html(this.template);

		this.getfileTree();

		return this;
	},

	//文件浏览器
	getfileTree: function getfileTree() {

		var data = {
			URLtype: "fetchFileTree",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		};
		var that = this;

		App.Comm.ajax(data, function (data) {

			data.click = function (event) {
				var file = $(event.target).data("file");

				if (file.folder) {
					$('#navContainer .returnBack').removeClass('theEnd').attr('isReturn', '1').html('返回上级');
				}
				//清除搜索
				$("#navContainer").find(".clearSearch").hide().end().find(".opBox").show().end().find(".searchCount").hide();
				$("#txtFileSearch").val("");
				App.ResourceModel.Settings.searchText = "";

				//清空数据
				$("#navContainer .header .ckAll").prop("checked", false);
				$("#resourceListContent .fileContent").empty();
				App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
				App.ResourceModel.FileCollection.reset();

				App.ResourceModel.FileCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			};

			data.iconType = 1;
			if (data.data) {
				var navHtml = new App.Comm.TreeViewMar(data);
				that.$el.find(".fileTree").html(navHtml);

				App.Comm.initScroll(that.$el.find(".fileTree"), "y");
			} else {
				that.$el.find(".fileTree").html('<div class="loading">无数据</div>');
			}
		});
	}

});
;/*!/resources/views/resoucesModel/resources.model.listNav.es6*/
"use strict";

App.ResourceModel.ListNav = Backbone.View.extend({

	tagName: "div",

	id: "navContainer",

	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.listNav.html", true),

	initialize: function initialize(options) {
		this.listenTo(App.ResourceModel.PropertiesCollection, "add", this.reRender);
		Backbone.on('navClickCB', this.navClickCB, this);
	},

	events: {
		"click .modleShowHide": "slideUpAndDown",
		"click .modelAttr .slideBar": "slideBarToggle",
		"mousedown .modelAttr .dragSize": "dragSize"
	},

	render: function render() {

		this.$el.html(this.template);

		this.$el.find(".listContent").html(new App.ResourceModel.TopBar().render().el);

		var type = App.ResourcesNav.Settings.type;
		if (type == "standardLibs") {
			//获取标准模型库数据
			this.$el.find(".listContent").append(new App.ResourceModel.ListContent().render().el);
		} else if (type == "famLibs") {
			this.$el.find(".listContent").append(new App.ResourceModel.ThumContent().render().el);
		}

		return this;
	},

	//左侧试图
	navClickCB: function navClickCB(type) {

		if (this.$el.closest('body').length <= 0) {
			this.remove();
			return;
		}

		if (type == "file") {

			this.$el.removeClass('hideLeft');
			this.$el.find(".listContent").show().end().find(".modelContentBox").hide().end().find(".modelAttr").hide();

			$("#resourceModelLeftNav").show();

			//绑定上传
			var status = App.ResourceModel.Settings.CurrentVersion.status;

			if (status != 9 && status != 4 && status != 7) {
				//上传
				App.ResourceUpload.init($(document.body));
				$("#file-upload-btn").show();
			} else {
				$("#file-upload-btn").hide();
			}
		} else {

			//销毁上传
			App.Comm.upload.destroy();

			$("#resourceModelLeftNav").hide();

			this.$el.addClass('hideLeft');

			this.$el.find(".listContent").hide().end().find(".modelContentBox").show().end().find(".modelAttr").show();

			if (App.ResourceModel.Settings.DataModel.bind) {
				return;
			}

			//设置onlymodel
			App.Comm.setOnlyModel();

			App.ResourceModel.Settings.DataModel.bind = true;

			App.ResourceModel.Settings.Viewer = new bimView({
				element: this.$el.find(".modelContent"),
				sourceId: App.ResourceModel.Settings.DataModel.sourceId,
				etag: App.ResourceModel.Settings.DataModel.etag, //"a1064f310fa8204efd9d1866ef7370ee" ||
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId
			});

			App.ResourceModel.Settings.Viewer.on("click", function (model) {

				if (!model.intersect) {
					$("#navContainer .attrContent").html('<div class="nullTip">请选择构件</div>');
					return;
				}
				App.ResourceModel.PropertiesCollection.projectId = App.ResourceModel.Settings.CurrentVersion.projectId;
				App.ResourceModel.PropertiesCollection.projectVersionId = App.ResourceModel.Settings.CurrentVersion.id;
				App.ResourceModel.PropertiesCollection.fetch({
					data: {
						elementId: model.intersect.userId,
						sceneId: model.intersect.object.userData.sceneId
					}
				});
			});
		}
	},

	reTemplate: _.templateUrl('/resources/tpls/resourceModel/resources.model.attr.detail.html'),

	//重新渲染苏醒
	reRender: function reRender(model) {

		if (this.$el.closest('body').length <= 0) {
			this.remove();
			return;
		}
		//渲染数据
		var data = model.toJSON().data;
		this.$el.find(".attrContentBox .attrContent").html(this.reTemplate(data));
	},

	//展开和收起
	slideUpAndDown: function slideUpAndDown(event) {
		var $parent = $(event.target).parent(),
		    $modleList = $parent.find(".modleList");
		$(event.target).toggleClass("down");
		if ($modleList.is(":hidden")) {
			$modleList.slideDown();
		} else {
			$modleList.slideUp();
		}
	},

	//收起展开
	slideBarToggle: function slideBarToggle() {

		App.Comm.navBarToggle(this.$el.find(".modelAttr"), $("#navContainer"), "right", App.ResourceModel.Settings.Viewer);
	},

	//拖拽改变大小
	dragSize: function dragSize(event) {
		App.Comm.dragSize(event, this.$el.find(".modelAttr"), $("#navContainer"), "right", App.ResourceModel.Settings.Viewer);
		return false;
	}

});
;/*!/resources/views/resoucesModel/resources.model.listNav.list.detail.es6*/
"use strict";

App.ResourceModel.ListNavDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	template: _.templateUrl("/resources/tpls/resourceModel/resource.model.list.nav.detail.html"),

	initialize: function initialize() {
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.destroy);
	},

	//事件绑定
	events: {
		"click .fileName  .text": "fileClick",
		"click .btnEnter": "enterEditNameOrCreateNew",
		"click .btnCalcel": "calcelEditName",
		"click .ckAll": "singleCheck"

	},

	render: function render() {
		var data = this.model.toJSON();
		data.isSearch = data.isSearch || false;
		if (data.isSearch) {
			$('#resourceListContent .ckAll').hide();
		} else {
			$('#resourceListContent .ckAll').show();
		}
		this.$el.html(this.template(data)).data("status", data.status);
		if (data.isAdd) {
			this.$el.addClass('createNew');
		} else {
			this.$el.removeClass('createNew');
		}
		this.bindContext();
		return this;
	},

	//文件或者文件夹点击
	fileClick: function fileClick(event) {

		var $target = $(event.target),
		    id = $target.data("id"),
		    isFolder = $target.data("isfolder");
		//文件夹
		if (isFolder) {

			var $leftItem = $("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']");

			if ($leftItem.length > 0) {

				var $nodeSwitch = $leftItem.parent().find(".nodeSwitch");

				if ($nodeSwitch.length > 0 && !$nodeSwitch.hasClass('on')) {
					$nodeSwitch.click();
				}
				$leftItem.click();
			}
			$('#navContainer .returnBack').removeClass('theEnd').attr('isReturn', '1').html('返回上级');
		} else {

			//文件直接跳转 不做处理

		}
	},

	//绑定右键菜单
	bindContext: function bindContext(event) {

		var that = this;
		this.$el.contextMenu('listContext', {
			//显示 回调
			onShowMenuCallback: function onShowMenuCallback(event) {
				event.preventDefault();
				var $item = $(event.target).closest(".item");
				$("#reNameModel").removeClass('disable');
				//预览
				if ($item.find(".folder").length > 0) {
					$("#previewModel").addClass("disable");
					$("#previewModel").find("a").removeAttr("href");
				} else {

					$("#previewModel").removeClass("disable");
					var href = $item.find(".fileName .text").prop("href");
					$("#previewModel").find("a").prop("href", href);

					//重命名 未上传
					if ($item.data("status") == 1) {
						$("#reNameModel").addClass('disable');
					}
				}
				$item.addClass("selected").siblings().removeClass("selected");

				if (!App.Comm.isAuth('rename', 'model')) {
					$("#reNameModel").addClass('disable').attr('disabled', 'disabled');
				}
				if (!App.Comm.isAuth('delete', 'model')) {
					$("#delModel").addClass('disable').attr('disabled', 'disabled');
				}
				if ($('#listContext li[class!=disable]').length == 0) {
					$('#listContext').parent().hide();
				}
			},
			shadow: false,
			bindings: {
				'previewModel': function previewModel($target) {
					//预览

				},
				'downLoadModel': function downLoadModel(item) {
					if ($('#downLoadModel').is('.disable')) {
						return '';
					}
					//下载
					var $item = $(item),
					    fileVersionId = $item.find(".filecKAll").data("fileversionid");

					App.Comm.checkDownLoad(App.ResourceModel.Settings.CurrentVersion.projectId, App.ResourceModel.Settings.CurrentVersion.id, fileVersionId);
				},
				'delModel': function delModel(item) {
					if ($('#delModel').is('.disable')) {
						return '';
					}
					//删除提示
					App.ResourceModel.delFileDialog($(item));
				},
				'reNameModel': function reNameModel(item) {
					if ($('#reNameModel').is('.disable')) {
						return '';
					}
					//重命名
					var $reNameModel = $("#reNameModel");
					//不可重命名状态
					if ($reNameModel.hasClass('disable')) {
						return;
					}

					var $prevEdit = $("#resourceListContent .fileContent .txtEdit");
					if ($prevEdit.length > 0) {
						that.cancelEdit($prevEdit);
					}

					var $item = $(item),
					    $fileName = $item.find(".fileName"),
					    text = $fileName.find(".text").hide().text().trim();

					$fileName.append('<input type="text" value="' + text + '" class="txtEdit txtInput" /> <span class="btnEnter myIcon-enter"></span><span class="btnCalcel pointer myIcon-cancel"></span>');
				}
			}
		});
	},

	//取消修改名称
	calcelEditName: function calcelEditName(event) {

		var $fileContent = $("#resourceListContent .fileContent"),
		    $prevEdit = $fileContent.find(".txtEdit");

		if ($prevEdit.length > 0) {
			this.cancelEdit($prevEdit);
		}

		var $fileContent = $("#resourceListContent .fileContent");

		if ($fileContent.find("li").length <= 0) {
			$fileContent.html('<li class="loading">无数据</li>');
		}
	},
	//修改名称 或者创建
	enterEditNameOrCreateNew: function enterEditNameOrCreateNew(event) {

		var $item = $(event.target).closest(".item");

		//创建
		if ($item.hasClass('createNew')) {
			this.createNewFolder($item);
		} else {
			this.editFolderName($item);
		}
	},

	//执行修改
	editFolderName: function editFolderName($item) {

		var that = this,
		    fileVersionId = $item.find(".filecKAll").data("fileversionid"),
		    name = $item.find(".txtEdit").val().trim();
		// //请求数据
		var data = {
			URLtype: "putFileReName",
			type: "PUT",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				fileVersionId: fileVersionId,
				name: encodeURI(name)
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {
				var models = App.ResourceModel.FileCollection.models,
				    id = data.data.id;
				$.each(models, function (i, model) {
					var dataJson = model.toJSON();
					if (dataJson.id == id) {
						//backbone 中 数据相同不会修改
						if (dataJson.name == data.data.name) {
							that.cancelEdit($item.find(".txtEdit"));
						} else {
							model.set(data.data);
						}

						return false;
					}
				});

				//tree name
				$("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);
			} else {

				alert("修改失败");
				//取消
				var $prevEdit = $item.find(".txtEdit");
				if ($prevEdit.length > 0) {
					$prevEdit.prev().show().end().nextAll().remove().end().remove();
				}
			}
		});
	},

	//创建文件夹
	createNewFolder: function createNewFolder($item) {

		var filePath = $item.find(".txtEdit").val().trim(),
		    that = this,
		    $leftSel = $("#resourceModelLeftNav .treeViewMarUl .selected"),
		    parentId = "";
		if ($leftSel.length > 0) {
			parentId = $leftSel.data("file").fileVersionId;
		}
		// //请求数据
		var data = {
			URLtype: "createNewFolder",
			type: "POST",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				parentId: parentId,
				filePath: filePath
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.code == 0) {

				var id = data.data.id,
				    isExists = false;

				$.each(App.ResourceModel.FileCollection.models, function (i, item) {
					if (item.id == id) {
						isExists = true;
						return false;
					}
				});

				//已存在的不在添加 返回
				if (isExists) {
					that.cancelEdit($item.find(".fileName"));
					return;
				}

				var models = App.ResourceModel.FileCollection.models;
				data.data.isAdd = false;
				//修改数据
				App.ResourceModel.FileCollection.last().set(data.data);

				App.ResourceModel.afterCreateNewFolder(data.data, parentId);
				//tree name
				//$("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);
			} else {
					alert(data.message);
				}
		});
	},

	//取消修改
	cancelEdit: function cancelEdit($prevEdit) {
		var $item = $prevEdit.closest(".item");
		if ($item.hasClass('createNew')) {
			//取消监听 促发销毁
			var model = App.ResourceModel.FileCollection.last();
			model.stopListening();
			model.trigger('destroy', model, model.collection);
			App.ResourceModel.FileCollection.models.pop();
			//删除页面元素
			$item.remove();
		} else {
			$prevEdit.prev().show().end().nextAll().remove().end().remove();
		}
	},

	//销毁
	destroy: function destroy(model) {

		//新建的  不用处理
		if (model.toJSON().id != "createNew") {
			this.$el.remove();
			App.ResourceModel.afterRemoveFolder(model.toJSON());
		}
	},

	//是否全选
	singleCheck: function singleCheck(event) {

		if (this.$el.parent().find(".ckAll:not(:checked)").length > 0) {
			$("#resourceListContent .header .ckAll").prop("checked", false);
		} else {
			$("#resourceListContent .header .ckAll").prop("checked", true);
		}
	}
});
;/*!/resources/views/resourceFamLibs/resource.famlibs.leftNav.es6*/
"use strict";

App.ResourceFamLibs.leftNav = Backbone.View.extend({

	tagName: "div",

	id: "resourceFamlibsLeftNav",

	template: _.templateUrl("/resources/tpls/resourceFamLibs/resource.famlibs.leftNav.html", true),

	//渲染
	render: function render(type) {

		this.$el.html(this.template);

		this.getfileTree();

		return this;
	},

	getfileTree: function getfileTree() {

		var data = {
			URLtype: "fetchFileTree",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		};
		var that = this;

		App.Comm.ajax(data, function (data) {

			data.click = function (event) {
				var file = $(event.target).data("file");
				if (file.folder) {
					$('#navContainer .returnBack').removeClass('theEnd').attr('isReturn', '1').html('返回上级');
				}
				//清除搜索
				$("#navContainer").find(".clearSearch").hide().end().find(".opBox").show().end().find(".searchCount").hide();
				$("#txtFileSearch").val("");
				App.ResourceModel.Settings.searchText = "";

				//清空数据
				$("#resourceThumContent .thumContent").empty();
				App.ResourceModel.Settings.fileVersionId = file.fileVersionId;
				App.ResourceModel.FileThumCollection.reset();

				App.ResourceModel.FileThumCollection.fetch({
					data: {
						parentId: file.fileVersionId
					}
				});
			};
			data.iconType = 1;
			if (data.data) {
				var navHtml = new App.Comm.TreeViewMar(data);
				that.$el.find(".fileTree").html(navHtml);
				App.Comm.initScroll(that.$el.find(".fileTree"), "y");
			} else {
				that.$el.find(".fileTree").html('<div class="loading">无数据</div>');
			}

			$("#pageLoading").hide();
		});
	}

});
;/*!/resources/views/resourceFamLibs/resources.model.listNav.thum.detail.es6*/
"use strict";

//列表
App.ResourceModel.ThumDetail = Backbone.View.extend({

	tagName: "li",

	className: "item",

	//事件绑定
	events: {
		"click .boxText": "fileClick",
		"click .btnEnter": "enterEditNameOrCreateNew",
		"click .btnCalcel": "calcelEditName",
		"click .ckMe": "itemSelected",
		"keyup .txtEdit": "enterCreateNew",
		"click .txtEdit": "returnPop",
		//	"click .ckMe": "stopPop",
		'click .returnBack': 'returnBack'

	},

	initialize: function initialize() {
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.destroy);
	},

	template: _.templateUrl("/resources/tpls/resourceFamLibs/resources.model.listNav.thum.detail.html"),

	//渲染
	render: function render() {
		var data = this.model.toJSON();

		this.$el.html(this.template(data)).data("status", data.status);

		if (data.isAdd) {
			this.$el.addClass('createNew');
		} else {
			this.$el.removeClass('createNew');
		}
		this.bindContext();
		return this;
	},

	itemSelected: function itemSelected(event) {
		var $target = $(event.target),
		    ck = $target.prop("checked");
		$target.closest(".item")[ck ? 'addClass' : 'removeClass']('selected');
		event.stopPropagation();
	},

	returnBack: function returnBack() {
		alert();
	},
	//文件或者文件夹点击
	fileClick: function fileClick(event) {

		var $target = $(event.target).closest(".boxText"),
		    id = $target.data("id"),
		    isFolder = $target.data("isfolder");
		//文件夹
		if (isFolder) {

			var $leftItem = $("#resourceFamlibsLeftNav .treeViewMarUl span[data-id='" + id + "']");

			if ($leftItem.length > 0) {

				var $nodeSwitch = $leftItem.parent().find(".nodeSwitch");

				if ($nodeSwitch.length > 0 && !$nodeSwitch.hasClass('on')) {
					$nodeSwitch.click();
				}
				$leftItem.click();
			}
			$('#navContainer .returnBack').removeClass('theEnd').attr('isReturn', '1').html('返回上级');
		}
	},

	//绑定右键菜单
	bindContext: function bindContext(event) {

		var that = this;

		this.$el.contextMenu('listContextFamily', {
			//显示 回调
			onShowMenuCallback: function onShowMenuCallback(event) {
				event.preventDefault();
				var $item = $(event.target).closest(".item");
				$("#reNameModelFamily").removeClass('disable');
				//预览
				if ($item.find(".folder").length > 0) {
					$("#previewModelFamily").addClass("disable");
					$("#previewModelFamily").find("a").removeAttr("href");
				} else {

					$("#previewModelFamily").removeClass("disable");
					var href = $item.find(".boxText").prop("href");
					$("#previewModelFamily").find("a").prop("href", href);

					//重命名 未上传
					if ($item.data("status") == 1) {
						$("#reNameModelFamily").addClass('disable');
					}
				}
				$item.addClass("selected").siblings().removeClass("selected");

				if (!App.Comm.isAuth('rename', 'family')) {
					$("#reNameModelFamily").addClass('disable').attr('disabled', 'disabled');
				}
				if (!App.Comm.isAuth('delete', 'family')) {
					$("#delModelFamily").addClass('disable').attr('disabled', 'disabled');
				}
				if ($('#listContextFamily li[class!=disable]').length == 0) {
					$('#listContextFamily').parent().hide();
				}
			},
			shadow: false,
			bindings: {
				'previewModel': function previewModel($target) {
					//预览

				},
				'downLoadModelFamily': function downLoadModelFamily(item) {

					if ($('#downLoadModel').is('.disable')) {
						return '';
					}
					//下载
					var $item = $(item),
					    fileVersionId = $item.find(".filecKAll").data("fileversionid");

					App.Comm.checkDownLoad(App.ResourceModel.Settings.CurrentVersion.projectId, App.ResourceModel.Settings.CurrentVersion.id, fileVersionId);
				},
				'delModelFamily': function delModelFamily(item) {
					if ($('#delModel').is('.disable')) {
						return '';
					}
					//删除提示
					App.ResourceModel.delFileDialog($(item));
				},
				'reNameModelFamily': function reNameModelFamily(item) {
					if ($('#reNameModel').is('.disable')) {
						return '';
					}

					//重命名
					var $reNameModel = $("#reNameModel");
					//不可重命名状态
					if ($reNameModel.hasClass('disable')) {
						return;
					}

					var $prevEdit = $("#resourceThumContent .thumContent .txtEdit");
					if ($prevEdit.length > 0) {
						that.cancelEdit($prevEdit);
					}

					var $item = $(item),
					    $fileName = $item.find(".fileName"),
					    text = $item.find(".text").hide().text().trim();

					$fileName.append('<input type="text" value="' + text + '" class="txtEdit txtInput" /> <span class="btnEnter myIcon-enter"></span><span class="btnCalcel pointer myIcon-cancel"></span>');
				}
			}
		});
	},

	//取消修改名称
	calcelEditName: function calcelEditName(event) {

		var $prevEdit = this.$el.find(".txtEdit");
		if ($prevEdit.length > 0) {
			this.cancelEdit($prevEdit);
		}

		var $fileContent = $("#resourceThumContent .thumContent");

		if ($fileContent.find("li").length <= 0) {
			$fileContent.html('<li class="loading">无数据</li>');
		}

		return false;
	},

	//回车创建
	enterCreateNew: function enterCreateNew(event) {
		if (event.keyCode == 13) {
			this.enterEditNameOrCreateNew(event);
		}
	},


	//修改名称 或者创建
	enterEditNameOrCreateNew: function enterEditNameOrCreateNew(event) {

		var $item = $(event.target).closest(".item");

		//创建
		if ($item.hasClass('createNew')) {
			this.createNewFolder($item);
		} else {
			this.editFolderName($item);
		}

		return false;
	},

	//执行修改
	editFolderName: function editFolderName($item) {

		var that = this,
		    fileVersionId = $item.find(".filecKAll").data("fileversionid"),
		    name = $item.find(".txtEdit").val().trim();
		// //请求数据
		var data = {
			URLtype: "putFileReName",
			type: "PUT",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				fileVersionId: fileVersionId,
				name: encodeURI(name)
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.message == "success") {
				var models = App.ResourceModel.FileThumCollection.models,
				    id = data.data.id;
				$.each(models, function (i, model) {
					var dataJson = model.toJSON();
					if (dataJson.id == id) {
						//backbone 中 数据相同不会修改
						if (dataJson.name == data.data.name) {
							that.cancelEdit($item.find(".txtEdit"));
						} else {
							model.set(data.data);
						}

						return false;
					}
				});

				//tree name
				$("#resourceFamlibsLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);
			} else {

				alert("修改失败");
				//取消
				var $prevEdit = $item.find(".txtEdit");
				if ($prevEdit.length > 0) {
					$prevEdit.prev().show().end().nextAll().remove().end().remove();
				}
			}
		});
	},

	//创建文件夹
	createNewFolder: function createNewFolder($item) {

		var filePath = $item.find(".txtEdit").val().trim(),
		    that = this,
		    $leftSel = $("#resourceFamlibsLeftNav .treeViewMarUl .selected"),
		    parentId = "";
		if ($leftSel.length > 0) {
			parentId = $leftSel.data("file").fileVersionId;
		}
		// //请求数据
		var data = {
			URLtype: "createNewFolder",
			type: "POST",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id,
				parentId: parentId,
				filePath: filePath
			}
		};

		App.Comm.ajax(data, function (data) {
			if (data.message == "success") {

				var id = data.data.id,
				    isExists = false;

				$.each(App.ResourceModel.FileThumCollection.models, function (i, item) {
					if (item.id == id) {
						isExists = true;
						return false;
					}
				});

				//已存在的不在添加 返回
				if (isExists) {
					that.cancelEdit($item.find(".thumBg"));
					return;
				}

				//修改数据
				App.ResourceModel.FileThumCollection.last().set(data.data);
				App.ResourceModel.afterCreateNewFolder(data.data, parentId);
				//tree name
				//$("#resourceModelLeftNav .treeViewMarUl span[data-id='" + id + "']").text(name);
			}
		});
	},

	//取消修改
	cancelEdit: function cancelEdit($prevEdit) {
		var $item = $prevEdit.closest(".item");
		if ($item.hasClass('createNew')) {
			//取消监听 促发销毁
			var model = App.ResourceModel.FileThumCollection.last();
			model.stopListening();
			model.trigger('destroy', model, model.collection);
			App.ResourceModel.FileThumCollection.models.pop();
			//删除页面元素
			$item.remove();
		} else {
			$prevEdit.prev().show().end().nextAll().remove().end().remove();
		}
	},

	//销毁
	destroy: function destroy(model) {

		//新建的  不用处理
		if (model.toJSON().id != "createNew") {
			this.$el.remove();
			App.ResourceModel.afterRemoveFolder(model.toJSON());
		}
	},

	//阻止浏览器默认行为
	returnPop: function returnPop(event) {
		event.stopPropagation();
		$(event.target).focus();
		return false;
	},


	//禁止冒泡
	stopPop: function stopPop(event) {
		event.stopPropagation();
	}
});
;/*!/resources/views/resourceFamLibs/resources.model.listNav.thum.es6*/
"use strict";

//列表
App.ResourceModel.ThumContent = Backbone.View.extend({

	tagName: "div",

	id: "resourceThumContent",

	//初始化
	initialize: function initialize() {
		this.listenTo(App.ResourceModel.FileThumCollection, "add", this.addOneFile);
		this.listenTo(App.ResourceModel.FileThumCollection, "reset", this.reset);
		this.listenTo(App.ResourceModel.FileThumCollection, "searchNull", this.searchNull);
	},

	template: _.templateUrl("/resources/tpls/resourceFamLibs/resources.model.listNav.thum.html", true),

	//渲染
	render: function render() {

		this.$el.html(this.template);
		return this;
	},

	//添加单个文件
	addOneFile: function addOneFile(model) {
		var view = new App.ResourceModel.ThumDetail({
			model: model
		});

		var data = model.toJSON();

		this.$el.find(".thumContent .loading").remove();
		if (data.isAdd) {
			this.$el.find(".thumContent").prepend(view.render().el);
		} else {
			this.$el.find(".thumContent").append(view.render().el);
		}

		App.Comm.initScroll(this.$el.find(".thumLists"), 'y');
	},

	//加载
	reset: function reset() {
		this.$el.find(".thumContent").html('<li class="loading">正在加载，请稍候…</li>');
	},


	//搜索为空
	searchNull: function searchNull() {
		this.$el.find(".thumContent").html('<li class="loading"><i class="iconTip"></i>未搜索到相关文件/文件夹</li>');
	}
});
;/*!/resources/views/resources.app.es6*/
"use strict";

/**
 * @require resources/collection/index.es6
 */

App.Resources.App = Backbone.View.extend({

	el: $("#contains"),

	template: _.templateUrl("/resources/tpls/resources.app.html", true),

	render: function render() {

		this.$el.html(this.template);
		var $resoucesNav = $(".resoucesNavBox .resoucesNav");
		if (!App.AuthObj.lib) {
			//$resoucesNav.remove();
		} else {
				var Auth = App.AuthObj.lib;
				//族库
				if (!Auth.family && !App.Global.User.hasFamilies) {
					$resoucesNav.find(".famLibs").closest("li").remove();
				}
				//质量标准库
				if (!Auth.quality) {
					$resoucesNav.find(".qualityStandardLibs").closest("li").remove();
				}
				//清单库
				if (!Auth.list) {
					$resoucesNav.find(".manifestLibs").closest("li").remove();
				}
				//标准模型库
				if (!Auth.model && !App.Global.User.hasModels) {
					$resoucesNav.find(".standardLibs").closest("li").remove();
				}
				//映射规则管理
				if (!Auth.mappingRuleTemplate) {
					$resoucesNav.find(".artifactsMapRule").closest("li").remove();
				}
			}

		return this;
	}
});
;/*!/resources/views/resources.crumbsNav.es6*/
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

App.ResourceCrumbsNav = Backbone.View.extend({

	tagName: "div",

	className: "resourceCrumbsNav",

	events: {
		"click .resourcesList": "itemClick",
		"click .fileModelNav": "toggleSwitchFileModel",
		"click .fileNav .commSpan": "switchFileMoldel",
		"click .standardLibsVersion": "standardLibsVersion",
		"click .itemA": "stopPropagation"

	},

	template: _.templateUrl('/resources/tpls/resources.crumbsNav.html'),

	render: function render() {

		this.$el.html(this.template);

		return this;
	},

	//点击
	itemClick: function itemClick(event) {

		var $projectVersionList = $(event.target).closest('.resourcesList').find(".projectVersionList"),
		    type = App.ResourceModel.Settings.type;
		//标准模型
		if (type == "standardLibs") {

			App.Comm.ajax({
				URLtype: "fetchStandardLibs"
			}, function (data) {

				var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.navDetail.html");
				$projectVersionList.find(".listResource").html(detail(data));
				$projectVersionList.show();
			});
		} else if (type == "famLibs") {

			App.Comm.ajax({
				URLtype: "fetchFamLibs"
			}, function (data) {

				var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.navDetail.html");
				$projectVersionList.find(".listResource").html(detail(data));
				$projectVersionList.show();
			});
		}
	},


	//切换项目版本
	standardLibsVersion: function standardLibsVersion(event) {

		App.Comm.ajax({
			URLtype: "fetchStandardVersion",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId
			}
		}, function (data) {

			var detail = _.templateUrl("/resources/tpls/resources.crumbsNav.nav.version.Detail.html");

			this.$(".standardLibsVersion .projectVersionList").html(detail(data)).show();
		});
	},
	stopPropagation: function stopPropagation(event) {

		$("#pageLoading").show();
		location.reload();

		//this.$(".projectVersionList").hide();
		event.stopPropagation();
	},


	//切换 file model
	toggleSwitchFileModel: function toggleSwitchFileModel(event) {

		$(event.target).closest('.fileModelNav').find(".fileModelList").show();
	},


	//切换 文件 模型 浏览器
	switchFileMoldel: function switchFileMoldel(event) {

		var $target = $(event.target),
		    type = $target.data("type");

		App.ResourceModel.Settings.leftType = type;

		if (type == "file") {

			Backbone.trigger('navClickCB', type);
			//隐藏下拉
			$target.addClass("selected").siblings().removeClass("selected");
		} else {

			if (!(typeof Worker === "undefined" ? "undefined" : _typeof(Worker))) {
				alert("请使用现代浏览器查看模型");
				return;
			}

			if (App.ResourceModel.Settings.DataModel && App.ResourceModel.Settings.DataModel.sourceId) {
				Backbone.trigger('navClickCB', App.ResourceModel.Settings.leftType);
			} else {
				//获取模型id
				this.fetchModelIdByResource();
			}
			//隐藏下拉
			$target.addClass("selected").siblings().removeClass("selected");
		}
	},


	//获取模型id
	fetchModelIdByResource: function fetchModelIdByResource(errCb) {

		var that = this;
		var data = {
			URLtype: "fetchModelIdByProject",
			data: {
				projectId: App.ResourceModel.Settings.CurrentVersion.projectId,
				projectVersionId: App.ResourceModel.Settings.CurrentVersion.id
			}
		};

		// App.ResourceModel.Settings.modelId = "e0c63f125d3b5418530c78df2ba5aef1";
		// this.renderModel();
		// return;

		//获取模型
		App.Comm.ajax(data, function (data) {

			if (data.message == "success") {

				if (data.data) {

					App.ResourceModel.Settings.DataModel = data.data;
					//成功渲染 在 resources.model.listNav.es6 中
					Backbone.trigger('navClickCB', App.ResourceModel.Settings.leftType);
					that.$(".fileModelNav  .breadItemText .text").text("模型浏览器");
				} else {
					alert("模型转换中");
				}
			} else {
				alert(data.message);
			}
		});
	}

});
;/*!/resources/views/resources.nav.es6*/
"use strict";

/**
 * @require resources/collection/resource.nav.es6
 */

App.ResourcesNav.App = Backbone.View.extend({

	el: $("#contains"),

	template: _.templateUrl("/resources/tpls/resources.app.html", true),

	render: function render() {

		var _this = this;

		this.$el.html(new App.ResourceCrumbsNav().render().el);

		var type = App.ResourcesNav.Settings.type;
		var optionType = App.ResourcesNav.Settings.optionType;

		if (type == "standardLibs") {
			//获取标准模型库数据
			this.fetchStandardLibs();
		} else if (type == "famLibs") {
			//族库
			this.fetchFamLibs();
		} else if (type == "qualityStandardLibs") {
			//质量标准库
			this.$el.append(new App.ResourcesNav.QualityStandardLibs().render().el);
		} else if (type == "manifestLibs") {
			//清单库
			this.$el.append(new App.ResourcesNav.ManifestLibs().render().el);
		} else if (type == "artifactsMapRule" || type == "project") {

			//构件映射规则
			if (optionType) {
				//映射规则/规则模板
				App.ResourceArtifacts.init(_this, optionType);
			}
			$("#pageLoading").hide();
		}
		this.bindScroll();
		return this;
	},


	//获取标准模型库数据
	fetchStandardLibs: function fetchStandardLibs() {
		this.$('.breadcrumbNav').append($('<div class="btns-flow stand"><a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_SMD001">标准模型研发指令</a>' + '<a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_SMA001">标准模型报审</a>' + '<a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_SMP001">标准模型发布</a></div>'));
		//标准模型库
		this.$el.append(new App.ResourcesNav.StandardLibs().render().el);
		//重置 和 加载数据
		App.ResourcesNav.StandardLibsCollection.reset();
		var that = this;
		App.ResourcesNav.StandardLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			},
			success: function success(collection, response, options) {
				$("#pageLoading").hide();
				var $standardLibs = $("#standardLibs"),
				    $standarPagination,
				    pageCount = response.data.totalItemCount;
				//todo 分页

				$standarPagination = $standardLibs.find(".standarPagination");
				$standardLibs.find(".sumDesc").html('共 ' + pageCount + ' 个标准模型');

				$standarPagination.pagination(pageCount, {
					items_per_page: response.data.pageItemCount,
					current_page: response.data.pageIndex - 1,
					num_edge_entries: 3, //边缘页数
					num_display_entries: 5, //主体页数
					link_to: 'javascript:void(0);',
					itemCallback: function itemCallback(pageIndex) {
						//加载数据
						App.ResourcesNav.Settings.pageIndex = pageIndex + 1;
						that.onlyLoadStandardLibsData();
					},
					prev_text: "上一页",
					next_text: "下一页"

				});
			}
		});
	},

	//只是加载数据
	onlyLoadStandardLibsData: function onlyLoadStandardLibsData() {

		App.ResourcesNav.StandardLibsCollection.reset();
		App.ResourcesNav.StandardLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			}
		});
	},

	//获取族库数据
	fetchFamLibs: function fetchFamLibs() {
		this.$('.breadcrumbNav').append($('<div class="btns-flow"><a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_FD001">族库研发指令</a>' + '<a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_FA001">族库报审</a>' + '<a target="_blank" href="http://vendor.wanda-dev.cn/mkh-uat/WfForms/CommonFormPartitioned.aspx?wfid=BIM_FP001">族库发布</a></div>'));

		//标准模型库
		this.$el.append(new App.ResourcesNav.FamLibs().render().el);
		//重置 和 加载数据
		App.ResourcesNav.FamLibsCollection.reset();
		var that = this;
		App.ResourcesNav.FamLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			},
			success: function success(collection, response, options) {
				$("#pageLoading").hide();
				var $standardLibs = $("#famLibs"),
				    $standarPagination,
				    pageCount = response.data.totalItemCount;
				//todo 分页

				$standarPagination = $standardLibs.find(".standarPagination");
				$standardLibs.find(".sumDesc").html('共 ' + pageCount + ' 个族库');

				$standarPagination.pagination(pageCount, {
					items_per_page: response.data.pageItemCount,
					current_page: response.data.pageIndex - 1,
					num_edge_entries: 3, //边缘页数
					num_display_entries: 5, //主体页数
					link_to: 'javascript:void(0);',
					itemCallback: function itemCallback(pageIndex) {
						//加载数据
						App.ResourcesNav.Settings.pageIndex = pageIndex + 1;
						that.onlyLoadFamLibsData();
					},
					prev_text: "上一页",
					next_text: "下一页"

				});
			}
		});
	},

	onlyLoadFamLibsData: function onlyLoadFamLibsData() {
		App.ResourcesNav.FamLibsCollection.reset();
		App.ResourcesNav.FamLibsCollection.fetch({
			data: {
				pageIndex: App.ResourcesNav.Settings.pageIndex,
				pageItemCount: App.Comm.Settings.pageItemCount
			}
		});
	},

	bindScroll: function bindScroll() {
		this.$el.find(".standarBodyScroll").mCustomScrollbar({
			set_height: "100%",
			set_width: "100%",
			theme: 'minimal-dark',
			axis: 'y',
			keyboard: {
				enable: true
			},
			scrollInertia: 0
		});
	}
});
;/*!/resources/views/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityDetail = Backbone.View.extend({

    tagName:"div",

    className : "title",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.qualitydetail.html"),

    events:{
        "click .item":"getDetail",
        "click .ruleCheck":"checked"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        if (this.model.get("ruleContain") == 1){
            this.$(".ruleCheck").addClass("all");
        }else if(this.model.get("ruleContain") == 3){
            this.$(".ruleCheck").addClass("half");
        }
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.changeCount,this);
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("modelRuleEmpty",this.modelRuleEmpty,this);
        Backbone.on("modelRuleFull",this.modelRuleFull,this);
        Backbone.on("modelRuleHalf",this.modelRuleHalf,this);
    },



    modelRuleEmpty:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").removeClass("all").removeClass("half");
            Backbone.trigger("modelRuleSelectNone");
            this.$el.closest("li").attr("data-check",2);
            this.changeFatherStatus("cancel");
        }
    },
    modelRuleFull:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")) {
            this.$(".ruleCheck").addClass("all").removeClass("half");
            Backbone.trigger("modelRuleSelectAll");
            this.$el.closest("li").attr("data-check",1);
            this.changeFatherStatus("check");
        }
    },
    modelRuleHalf:function(){
        if(this.model.get("leaf")&&App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").addClass("half").removeClass("all");
            this.$el.closest("li").attr("data-check",3);
            this.changeFatherStatus("cancel");
        }
    },

    checked:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        var leaf = this.model.get("leaf");
        var _this = this.$el.closest("li");
        ele.removeClass("half");
        //非叶子节点，加载
        if(!leaf && !this.$el.siblings(".childList").html()){
            this.loadNextTree();
        }

        //存储模型
        var model = JSON.parse(this.$el.closest("li").attr("data-model")),already;
        var modelSaving = App.ResourceArtifacts.modelSaving.codeIds;
        var n = "string";
        for(var is = 0 ; is < modelSaving.length ; is++){
            if(modelSaving[is].code == this.model.get("code")){
                n = is;
                break
            }
        }

        if(ele.hasClass("all")){
            ele.removeClass("all").removeClass("half");
            _this.attr("data-check","2");
            //取消所有上级菜单
            this.changeFatherStatus("cancel");
            if(leaf){
                //包含现有
                if(n=="string"){
                    model.ruleIds = [];
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }else{
                    App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = []
                }
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectNone");
                }
            }else{
                //移除所有下级菜单
                if(this.$el.siblings(".childList").find("li").length) {
                    _.each(this.$el.siblings(".childList").find("li"),function (item) {
                        if($(item).attr("data-code") == App.ResourceArtifacts.Status.rule.targetCode && ($(item).attr("data-check") == "1" ||  $(item).attr("data-check") == "3")){
                            Backbone.trigger("modelRuleSelectNone");
                        }
                        $(item).attr("data-check", "2");
                        $(item).find(".ruleCheck").removeClass("all").removeClass("half")
                    });
                }
                this.checkControl("cancel");
            }
        }else{
            ele.addClass("all").removeClass("half");
            _this.attr("data-check","1");
            //选择填充上级菜单
            this.changeFatherStatus("check");

            if(leaf){
                //包含现有
                if(n=="string"){
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
                }else{
                    App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = App.ResourceArtifacts.getValid(model).ruleIds
                }
                //操作右侧全选
                if(this.model.get("code") == App.ResourceArtifacts.Status.rule.targetCode){
                    Backbone.trigger("modelRuleSelectAll");
                }
            }else{
                //添加所有下级菜单
                if(this.$el.siblings(".childList").find("li").length) {
                    _.each(this.$el.siblings(".childList").find("li"),function(item){
                        if($(item).attr("data-code") == App.ResourceArtifacts.Status.rule.targetCode && $(item).attr("data-check") != "1"){
                            Backbone.trigger("modelRuleSelectAll");
                        }
                        $(item).attr("data-check","1");
                        if($(item).hasClass("all")){
                            return
                        }
                        $(item).find(".ruleCheck").removeClass("half").addClass("all")
                    });
                    this.checkControl("check");
                }
            }
        }
    },

    //修正父项状态
    changeFatherStatus:function(status){
        var _this = this.$el.closest("li");
        var siblings = _this.siblings("li");
        var _thisStatus = _this.attr("data-check");
        var father = _this.closest("ul").closest("li");
        var fatherSiblings = father.siblings("li");
        var grandfather = father.closest("ul").closest("li");
        var val = status == "check" ? "2" : "1";
        var pre,grPre,data,fatherData;

        if(siblings.length){//多个元素
            data = _.filter(siblings,function(item){
                var s = $(item).attr("data-check");
                if(s == "3"){ s = "2";}
                return val == s;
            });
        }
        if(fatherSiblings.length){
            //查找父级同类是否有选
            fatherData  =  _.filter(fatherSiblings,function(item){
                var s = $(item).attr("data-check");
                if(s == "3"){ s = "2";}
                return s == val;
            });
        }
        if(status == "cancel"){
            if(father.length){
                pre = this.searchSelf(father);
                if(_thisStatus != "2"){
                    father.attr("data-check","3");
                    pre.addClass("half");
                }

                if(!siblings.length){
                    pre.removeClass("all").removeClass("half");
                }else{
                    pre.removeClass("all").addClass("half");
                    if(!data.length && _thisStatus == "2"){
                        pre.removeClass("half").removeClass("half");
                    }
                }
            }
            if(grandfather.length){
                grPre = this.searchSelf(grandfather);
                if(_thisStatus != "2"){
                    grandfather.attr("data-check","3");
                    grPre.addClass("half");
                }
                if(!fatherSiblings.length){
                    grPre.removeClass("all").removeClass("half");
                }else{
                    grPre.removeClass("all").addClass("half");
                    if(!data.length && !fatherData.length &&  _thisStatus == "2"){
                        grPre.removeClass("half").removeClass("half");
                    }
                }
            }
        }else if(status == "check"){
            if(father.length){
                pre = this.searchSelf(father);
                pre.addClass("half");
                if(!siblings.length){
                    pre.addClass("all");
                    father.attr("data-check","1");
                }else{
                    if(!data.length){
                        father.attr("data-check","1");
                        pre.removeClass("half").addClass("all");
                    }
                }
            }
            if(grandfather.length){
                grandfather.attr("data-check","1");
                grPre = this.searchSelf(grandfather);
                grPre.addClass("half");
                if(!fatherSiblings.length){
                    grPre.addClass("all").removeClass("half");
                }else{
                    if(!data.length && !fatherData.length){
                        grPre.addClass("all").removeClass("half");
                    }
                }
            }
        }
    },
    //为模板-保存数据
    checkControl:function(judge){
        var _this = this,data;
        var type = this.model.get("type") ;
        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }
        var allNode = _.filter(data,function(item){
            return item["parentCode"] == _this.model.get("code")
        });
        //存在叶子节点
        var isLeaf = _.filter(allNode,function(item){
            return item.leaf
        });
        if(isLeaf.length){
            _.each(isLeaf, function (item) {
                var model  = item;
                var val = model.ruleIds;
                if(judge == "cancel"){
                    val = [];
                }
                if(App.ResourceArtifacts.modelSaving.codeIds.length){
                    for(var i = 0 ; i < App.ResourceArtifacts.modelSaving.codeIds.length ; i++){
                        if(model.code == App.ResourceArtifacts.modelSaving.codeIds[i].code){
                            App.ResourceArtifacts.modelSaving.codeIds[i].ruleIds = val;
                            return
                        }
                    }
                }
                App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
            });
        }
        //存在树枝节点
        var isNotLeaf = _.filter(allNode,function(item){
            return !item.leaf
        });
        if(isNotLeaf.length){
            _.each(isNotLeaf,function(item){
                var childrenCode = _.filter(data,function(model){
                    return item.code == model.parentCode
                });
                _.each(childrenCode,function(leafNode){
                    var val = leafNode.ruleIds;
                    if(judge == "cancel"){
                        val = [];
                    }
                    if(App.ResourceArtifacts.modelSaving.codeIds.length){
                        for(var j = 0 ; j < App.ResourceArtifacts.modelSaving.codeIds.length ; j++){
                            if(leafNode.code == App.ResourceArtifacts.modelSaving.codeIds[j].code){
                                App.ResourceArtifacts.modelSaving.codeIds[j].ruleIds = val;
                                return
                            }
                        }
                    }
                    App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(leafNode))
                });
            })
        }
    },
    //查找所给元素的check元素
    searchSelf:function(ele){
        var childList = ele.find(".childList");
        var pre = _.filter(childList,function(item){
            return $(item).attr("data-code") == ele.attr("data-code");
        });
        return   $(pre).eq(0).siblings(".title").find(".ruleCheck");
    },
    //数量更改时的操作
    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode ){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
    },
    //取得规则列表
    getDetail:function(e){
        this.$(".fold").addClass("active");
        var hasCon =  this.$(".item").closest(".title").siblings(".childList:hidden");
        if(hasCon.length && hasCon.html()){
            hasCon.show();//显示列表
            return
        }
        var innerCon =  this.$(".item").closest(".title").siblings(".childList:visible");
        if(innerCon.html()){
            innerCon.hide();//隐藏列表
            this.$(".fold").removeClass("active");
            return
        }
        var item = $(e.target);
       /* if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }*/
        if(this.model.get("leaf")){
            this. getRules(item);
        }else if(!this.$(".item").closest(".title").siblings(".childList").html()){}{
            this.loadNextTree();
        }
    },
    //切换计划
    toggleClass:function(item){
        $(".item").removeClass("active");
        item.closest(".item").addClass("active");
    },
    //加载子树
    loadNextTree:function(){
        var children,data;
        var _this = this,n = this.$el.closest("li").attr("data-check");
        var type = this.model.get("type") ;
        var parentCode = this.model.get("code");
        var list ;

        if(type == "GC"){
            data = App.ResourceArtifacts.allQualityGC;
        }else if(type == "KY"){
            data = App.ResourceArtifacts.allQualityKY;
        }

        if(!this.model.get("leaf")){
            //存在，加载二级或三级标准
            children =  _.filter(data,function(item){
                return item.parentCode == parentCode;
            });
            list = App.Resources.artifactsQualityTree(children,n);
            _this.$el.closest("li").find(".childList").html(list);
        }
    },

    //获取质量标准相关规则
    getRules:function(event) {
        Backbone.trigger("resetRule");//重置右侧规则
        if(!App.ResourceArtifacts.Status.saved){
            return
        }
        var _this = this,pdata;
        var leaf = this.model.get("leaf");
        var ruleContain = this.$el.closest("li").attr("data-ruleContain");
        App.ResourceArtifacts.Status.check = this.$el.closest("li").attr("data-check");

        App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");

        this.toggleClass(event);
        //刷新右面视图
        var code = App.ResourceArtifacts.Status.rule.targetCode;
        pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:code,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.Status.rule.biz = pdata.data.biz = 2 ;
        App.ResourceArtifacts.loading($(".rules"));
        App.ResourceArtifacts.PlanRules.reset();
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                    if(ruleContain == "1"){
                        Backbone.trigger("modelRuleSelectAll");
                    }
                }else{
                    App.ResourceArtifacts.Status.rule.count  = response.data.length = 0;
                    Backbone.trigger("mappingRuleNoContent")
                }
                Backbone.trigger("resetTitle");
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});
;/*!/resources/views/resourcesArtifacts/mappingRule/resources.artifacts.qualitylist.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsQualityList = Backbone.View.extend({

    tagName:"div",

    className: "qualityCon",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/mappingRule/resources.artifacts.quality.html"),

    events:{
        "click .present": "present",
        "click .pro": "choose"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){

    },

    //当前选项
    present:function(){
        var active = this.$(".qualityProcess");
        if( active.hasClass("active") ){
            active.removeClass("active") ;
            return
        }
        active.addClass("active");
    },

    //切换，一次加载，仅切换不同对话框
    choose:function(){
        var _this = this;
        this.toggle();
        App.ResourceArtifacts.departQuality();
    },
    //切换过程
    toggle:function(){
        var extendData,extendText;
        this.$(".qualityProcess").removeClass("active");
        var newData = this.$(".pro").data("type") , newText =  this.$(".pro").text();
        var oldData = this.$(".present").data("type") , oldText = this.$(".present").text();
        extendData = oldData;
        extendText = oldText;
        this.$(".present").data("type",newData);
        this.$(".present").text(newText);
        this.$(".pro").data("type",extendData);
        this.$(".pro").text(extendText);
        App.ResourceArtifacts.Status.qualityStandardType = newData;
        if(newData == "GC"){
            this.$(".qualityMenuListGC").show().siblings(".qualityMenuListKY").hide();
        }else{
            this.$(".qualityMenuListKY").show().siblings(".qualityMenuListGC").hide();
        }
    }
});
;/*!/resources/views/resourcesArtifacts/resources.artifacts.indexnav.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsIndexNav = Backbone.View.extend({

    tagName:"div",

    className: "resourcesMappingRule",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.indexnavx.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    }
});
;/*!/resources/views/resourcesArtifacts/resources.artifacts.nav.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsMapRule = Backbone.View.extend({

    tagName:"div",

    id: "artifacts",

    events:{
        "click .sele": "select",
        "click .default" : "create",
        "click .rules" : "closeMenu"
    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.nav.html"),

    render:function() {
        this.$el.html(this.template);
        var tabs = App.Comm.AuthConfig.resource.mappingRule,
            Auth = App.AuthObj.lib;
        if(Auth.moduleMappingRule.view){
            this.$(".artifactsNav ul").append(tabs.module);
            this.$(".artifactsNav ul .modularization").addClass("active");
            App.ResourceArtifacts.Status.rule.biz = 1;
        }
        if(Auth.qualityMappingRule.view){
            this.$(".artifactsNav ul").append(tabs.quality);
            if(!Auth.moduleMappingRule.view){
                this.$(".artifactsNav ul .quality").addClass("active");
            }
            App.ResourceArtifacts.Status.rule.biz = 2;
        }
        if(Auth.moduleMappingRule.view && Auth.qualityMappingRule.view){
            App.ResourceArtifacts.Status.rule.biz = 1;
        }
        return this;
    },

    closeMenu:function(){
        this.$(".ruleDetail .conR ul").hide();
    },

    initialize:function(){
        Backbone.on("checkedChange",this.checkList,this);
        Backbone.on("projectMappingRuleCheckedClose",this.checkClose,this);
        Backbone.on("resetRule",this.resetRule,this);
    },

    checkList:function(){
       this.$(".artifactsContent").addClass("edit").removeClass("explorer");
    },

    checkClose:function(){
        this.$(".artifactsContent").removeClass("edit").addClass("explorer");
    },
    //切换选项
    select:function(e){
        var $pre = $(e.target),_this = this;

        App.ResourceArtifacts.Status.saved = true;

        if($pre.closest(".artifactsNav").length){
            if(!$pre.hasClass("active")){
                $pre.addClass("active").siblings("li").removeClass("active");
            }
        }
        var modularization = this.$(".modularization.active").length;
        var quality = this.$(".quality.active").length;

        if(modularization){//模块化
            App.ResourceArtifacts.Status.rule.biz = 1 ;
            if(this.$(".default:visible").length){
                return
            }
            this.resetRule();
            this.$(".qualifyC").hide();
            this.$(".qualifyC li").removeClass("active");
            this.$(".plans").show();
        }else if(quality){//质量
            App.ResourceArtifacts.Status.rule.biz = 2 ;
            if(this.$(".default:visible").length){
                return
            }
            this.resetRule();
            this.$(".plans").hide();
            this.$(".qualifyC").show();
            this.$(".plans li").removeClass("active");
        }
        this.$(".rules").show();
    },
    //重置规则
    resetRule:function(){
        App.ResourceArtifacts.PlanRules.reset();
        App.ResourceArtifacts.Status.rule.targetCode = "";
        App.ResourceArtifacts.Status.rule.targetName = "";
        this.$(".rules h2 .name").html("没有选择模块/质量标准");
        this.$(".ruleContentRuleList ul").html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
    },
    //为项目设置创建规则
    create:function(e){
        if(App.AuthObj.lib.mappingRuleTemplate.edit){
            this.$(".default").hide();
            this.select(e);
            Backbone.trigger("mappingRuleModelEdit");
        }else{
            alert("您没有修改模板权限！")
        }
    }
});
;/*!/resources/views/resourcesArtifacts/resources.artifacts.projectbreadcrumb.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsProjectBreadCrumb= Backbone.View.extend({

    tagName:"div",

    className:"artifactsProjectBreadCrumb",

    events:{},

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.projectbreadcrumb.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){}
});
;/*!/resources/views/resourcesArtifacts/resources.tree.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
//App.Resources.artifactsTreeData;//所有数据
App.Resources.artifactsTree = function(dataList,code){
    var data = [];
    if(!code){
        data = _.filter(dataList,function(item){
            return !item.parentCode
        });
        //注意有个其他选项,code == -1
    }else{
        data = _.filter(dataList,function(item){
            return item.parentCode == code
        });
    }
    var ele  = $("<ul></ul>");
    for(var i =0 ; i < data.length ; i++){
        if(data[i].code ==  "-1"){ break}
        var model = Backbone.Model.extend({
            defaults:function(){
                return{
                    title:''
                }
            }
        });
        var initModel = new model(data[i]);
        var li = $("<li></li>");
        li.append(new App.Resources.ArtifactsWindowRuleDetail({model:initModel}).render().el);
        li.append("<div class='childList' data-code='"+data[i].code +"'></div>");
        ele.append(li);
        App.Comm.initScroll($(".concc"),"y");
    }
    return ele;
};
//质量标准tree
App.Resources.artifactsQualityTree = function(dataList,n){
    var data = dataList;
    var ele  = $("<ul></ul>");
    for(var i =0 ; i < data.length ; i++){
        if(data[i].code ==  "-1"){ break}
        var model = Backbone.Model.extend({
            defaults:function(){
                return{
                    title:''
                }
            }
        });
        var initModel = new model(data[i]);
        var li = $("<li></li>");
        var  a  = data[i].ruleContain ;

        li.attr("data-model",JSON.stringify(data[i]));
        li.attr("data-code",data[i].code);
        //li.attr("data-ruleContain",data[i].ruleContain);
        li.attr("data-leaf",(data[i].leaf ? "1" : 0));

        if(!data[i].count){
            li.addClass("tplShow");
        }

        var as = new App.Resources.ArtifactsQualityDetail({model:initModel}).render();
        if(n == "1"){
            as.$(".ruleCheck").addClass("all").removeClass("half");
            li.attr("data-check",n);
        }else if(n == "0"){
            as.$(".ruleCheck").removeClass("all").removeClass("half");
            li.attr("data-check",n);
        }else{
            li.attr("data-check",a);
        }

        li.append(as.el);
        li.append("<div class='childList' data-code='"+data[i].code +"'></div>");
        ele.append(li);
        App.Comm.initScroll($(".qualityMenu"),"y");
    }
    return ele;
};

App.Resources.cancelBubble = function(e){
    if(e.stopPropagation){
        e.stopPropagation();
    }else{
        window.cancelBubble = true;
    }
};

App.Resources.dealStr2 = function(model){
    var con = model.get("mappingCategory"),
        list = con.mappingPropertyList;

    if(list && list.length){
        _.each(list,function(item){
            var obj = {left:'',right:'',leftValue:'',rightValue:''};
            if(item.operator == "<>" || item.operator == "><"){
                var str= item.propertyValue,
                    index;
                index = _.indexOf(str,",");
                obj.left =str[0];
                obj.right = str[str.length-1];
                for(var i = 1 ; i < str.length-1 ; i++){
                    if(i < index){
                        obj.leftValue =  obj.leftValue + str[i];
                    }else if(i>index){
                        obj.rightValue = obj.rightValue +str[i];
                    }
                }
                obj.leftValue = parseInt(obj.leftValue);
                obj.rightValue = parseInt(obj.rightValue);
            }
            item.ruleList = obj;
        });
    }
    con.mappingPropertyList = list;
    return con;
};

//轮换计数
    App.Resources.prev = function(present,length){
        var a;
        if( present  > 0 ){
            a =  present - 1;
        }else if( present  == 0){
            a = length - 1;
        }
        return a;
    };
    App.Resources.next = function( present,length ){
    var a;
    if( present + 1 < length ) {
        a = present + 1;
    }else if( present + 1 == length ){
        a = 0;
    }
    return a;
};

//队列管理
App.Resources.queue = {
    que : [],
    permit : true,
    present : [],
    //许可证发放，400ms后发放一个许可证，避免点击过快
    certificates:function(){
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },400);
    },
    //验证并向队列添加执行函数
    promise:function(fn,_this){
        if(!this.permit){ return;}
        if(!this.que.length){//没有直接添加
            this.que.push(fn);
            this.present.push(_this);
            this.que[0]();
            this.certificates();
            return;
        }

        /*if(this.que.length > 1){
            return
        }*/
        this.present.push(_this);
        this.que.push(fn);
        this.certificates();
    },
    stop:function(){

    },
    //执行完毕，刷新队列，执行下一个
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};

;/*!/resources/views/resourcesArtifacts/ruleModel/reources.artifacts.planrule.alert.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleAlert = Backbone.View.extend({
    tagName :'div',
    className:"resourcesAlert",
    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.alert.html"),
    events:{
        "click #resourcesSure":"sure",
        "click #resourcesCancel":"cancel",
        "click #resourcesClose":"close"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(models){},
    //确定
    sure : function(){
        var id = App.ResourceArtifacts.Status.delRule;
        //新建规则，直接删除
        if(!id){
            //直接删除末尾内容
            $(".outsideList>li").last().remove();
            App.Resources.ArtifactsAlertWindow.close();
            App.ResourceArtifacts.Status.saved = true;
            App.ResourceArtifacts.Status.delRule = "";
            return
        }
        //非新建
        $.ajax({
            url:App.API.Settings.hostname +"platform/mapping/rule/delete/" + id + "?projectId="+ App.ResourceArtifacts.Status.projectId,
            type:"DELETE",
            success:function(response){
                 if(response.code==0){ //删除成功
                     $(".ruleDetail").hide();
                     App.ResourceArtifacts.Status.saved = true ;//保存状态
                     var pre = App.ResourceArtifacts.PlanRules.filter(function(item){
                         return item.get("id") == id;
                     });
                     App.ResourceArtifacts.PlanRules.remove(pre);
                     App.ResourceArtifacts.Status.rule.count = App.ResourceArtifacts.PlanRules.length;
                     console.log(App.ResourceArtifacts.PlanRules);
                     if(App.ResourceArtifacts.Status.rule.count ==0){
                         Backbone.trigger("mappingRuleNoContent")
                     }

                     _.each($(".ruleTitle"),function(item){
                         if(parseInt($(item).attr("data-id")) == id){
                             $(item).closest("li").remove();
                         }
                     });
                     Backbone.trigger("resetTitle");
                }else{
                     alert("删除失败");
                 }
                App.Resources.ArtifactsAlertWindow.close();
            },
            error:function(error){
                App.Resources.ArtifactsAlertWindow.close();
                alert("错误类型"+ error.status +"，无法成功删除!");
            }
        });
        App.ResourceArtifacts.Status.delRule = null;
    },
        //取消
    cancel:function(){
        App.Resources.ArtifactsAlertWindow.close();
    },
    //关闭
    close:function(){
        App.Resources.ArtifactsAlertWindow.close();
    }
});


;/*!/resources/views/resourcesArtifacts/ruleModel/reources.artifacts.rule.legend.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsRuleLegend = Backbone.View.extend({

    tagName :'li',

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.rule.legend.html"),

    events:{
        "click .searEnd":"sele"
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){},
    //选择
    sele : function(){
        var list = this.$el.closest("ul"),
            data = this.$(".searEnd").data("code"),
            dataKeeper = list.siblings("div").find(".chide"),
            input = list.siblings("div").find(".categoryCode"),
            name = this.model.get("name"),
            dataName = "[" + data +"]";
        input.val(data).css({"opacity":"0"});
        list.hide();
        dataKeeper.css({"visibility": "visible"}).data("code",data).attr("data-name",name).find("span").html(dataName).siblings("i").html(name);
        App.ResourceArtifacts.Status.rule.mappingCategory.categoryCode = data;
        App.ResourceArtifacts.Status.rule.mappingCategory.categoryName = name;
    }
});


;/*!/resources/views/resourcesArtifacts/ruleModel/reources.artifacts.window.rule.js*/
/*
 * @require  services/views/auth/member/services.member.ozDetail.js
 * */
App.Resources.ArtifactsWindowRule = Backbone.View.extend({

    tagName :'div',
    className:"resourcesAlert",

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.window.rule.html"),

    events:{
        "click .windowSubmit":"sure"
    },

    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize:function(models){

    },
    //确定
    sure : function(){
        var _this = this,data,
        code  = $(".ruleNodeName span.active").closest(".ruleNodeName").attr("data-id"),
        name  = $(".ruleNodeName span.active").closest(".ruleNodeName").attr("data-name");

        if(code){
            data = App.ResourceArtifacts.presentRule.get("mappingCategory");

            data["categoryCode"] = code + '';
            data["categoryName"] = name;

            $(".ruleDetail:visible").find(".chide").data("code",code).siblings("input").val(code).end().find("span").html("["+code + "]").end().find("i").html(name);

            App.ResourceArtifacts.presentRule.set({"mappingCategory":data},{silent:true});

            App.ResourceArtifacts.Status.rule.mappingCategory.categoryCode  = code;
            App.ResourceArtifacts.Status.rule.mappingCategory.categoryName = name;
        }
        App.Resources.ArtifactsMaskWindow.close();
    },
        //取消
    cancel:function(){
        App.Resources.ArtifactsMaskWindow.close();
    },
    //关闭
    close:function(){
        App.Resources.ArtifactsMaskWindow.close();
    }
});


;/*!/resources/views/resourcesArtifacts/ruleModel/reources.artifacts.window.ruledetail.js*/
/*
 * @require resources/collection/resource.nav.es6
 * */
App.Resources.ArtifactsWindowRuleDetail = Backbone.View.extend({

    tagName :'div',
    className:"",

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.ruletreedetail.html"),

    events:{
        "click .hasChild":"hasChild",
        "click .name":"select"
    },
    render:function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(models){},
    //展开
    hasChild : function(e){
        var pre = $(e.target),
            alreadyLoad= this.$el.closest("li").find(".childList"),
            id = pre.closest(".ruleNodeName").data("id");
        if(!alreadyLoad.html()){
            var childNode = App.Resources.artifactsTree(App.Resources.artifactsTreeData,id);
            alreadyLoad.html(childNode);
            pre.addClass("active");
            alreadyLoad.show();
            return
        }
        if(pre.hasClass("active")){
            alreadyLoad.hide();
            pre.removeClass("active")
        }else{
            alreadyLoad.show();
            pre.addClass("active")
        }
    },
    select:function(e){
        var pre = $(e.target);
        if(!pre.hasClass("active")){
            $(".ruleNodeName span.name").removeClass("active");
            pre.addClass("active");

            App.ResourceArtifacts.Status.rule.mappingCategory.categoryCode = this.$(".ruleNodeName").data("id");
            App.ResourceArtifacts.Status.rule.mappingCategory.categoryName = this.$(".ruleNodeName").data("name");

        }
    }
});


;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.plandetail.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanDetail = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.plandetail.html"),

    events:{
        "click .item":"getPlanId",
        "click .ruleCheck":"checked"
    },

    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        var ruleContain = this.model.get("ruleContain");
        if(!this.model.get("ruleIds").length){
            this.$el.addClass("tplShow");
        }
        this.$el.attr("data-check", ruleContain);
        this.$el.attr("data-model",JSON.stringify(this.model.toJSON()));
        this.$el.attr("data-code", this.model.get("code"));
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.changeCount,this);
        Backbone.on("modelRuleEmpty",this.modelRuleEmpty,this);
        Backbone.on("modelRuleFull",this.modelRuleFull,this);
        Backbone.on("modelRuleHalf",this.modelRuleHalf,this);
    },
    modelRuleEmpty:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").removeClass("all").removeClass("half");
            this.$el.attr("data-check","0")
        }
    },
    modelRuleFull:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")) {
            this.$(".ruleCheck").addClass("all").removeClass("half");
            this.$el.attr("data-check","1")
        }
    },
    modelRuleHalf:function(){
        if(App.ResourceArtifacts.Status.rule.targetCode == this.model.get("code")){
            this.$(".ruleCheck").addClass("half").removeClass("all");
            this.$el.attr("data-check","0")
        }
    },
    checked:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        var model = jQuery.parseJSON(this.$el.attr("data-model")),already;

        var modelSaving = App.ResourceArtifacts.modelSaving.codeIds;
        var n = "string";
        for(var is = 0 ; is < modelSaving.length ; is++){
            if(modelSaving[is].code == this.model.get("code")){
                n = is;
                break
            }
        }

        if(ele.hasClass("all")){
            ele.removeClass("all");
            ele.closest("li").attr("data-check","0");
            //保存提交数据
            if( n == "string"){
                model.ruleIds = [];
                App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
            }else{
                App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = []
            }

            if(this.$el.hasClass("active")){
                Backbone.trigger("modelRuleSelectNone");
                //触发全不选事件
            }
        }else{
            ele.addClass("all");
            ele.closest("li").attr("data-check","1");
            //保存提交数据
            if( n == "string"){
                App.ResourceArtifacts.modelSaving.codeIds.push(App.ResourceArtifacts.getValid(model));
            }else{
                App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = model.ruleIds
            }

            if(this.$el.hasClass("active")){
                //触发全选事件
                Backbone.trigger("modelRuleSelectAll");
            }
        }
        ele.removeClass("half");
        //不设置模型类型
    },
    //改变数量
    changeCount:function(){
        var count = App.ResourceArtifacts.Status.rule.count;
        if(this.model.get("code") ==App.ResourceArtifacts.Status.rule.targetCode){
            this.model.set({count:count},{silent:true});
            this.$(".count").text("("+ count + ")");
        }
    },

    //取得规则列表
    getPlanId:function(e){
        var $this = $(e.target);
        if($this.closest("li").hasClass("active")){
            return
        }

        App.ResourceArtifacts.Status.check = this.$el.attr("data-check");

     /*   if(!App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }*/
        App.ResourceArtifacts.PlanRules.reset();
         App.ResourceArtifacts.Status.rule.targetCode = this.model.get("code");
        App.ResourceArtifacts.Status.rule.targetName = this.model.get("name");
        App.ResourceArtifacts.Status.rule.count = this.model.get("count");


        App.ResourceArtifacts.loading($(".rules"));

        this.toggleClass();
        this. getRules();



    },
//切换计划
    toggleClass:function(e){
        $(".artifactsList .plcon li").removeClass("active");
        this.$el.addClass("active");
    },
//获取计划节点相关规则
    getRules:function() {

        var _this = this;
        var pdata = {
            URLtype: "fetchArtifactsPlanRule",
            data:{
                code:App.ResourceArtifacts.Status.rule.targetCode,
                type:App.ResourceArtifacts.Status.type,
                projectId:App.ResourceArtifacts.Status.projectId
            }
        };
        App.ResourceArtifacts.Status.rule.biz = pdata.data.biz = 1 ;

        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 ){
                if(response.data  &&  response.data.length){
                    App.ResourceArtifacts.PlanRules.add(response.data);
                }else{
                    App.ResourceArtifacts.Status.rule.count  = response.data.length = 0;
                }
                Backbone.trigger("resetTitle");
            }
            App.ResourceArtifacts.loaded($(".rules"));
        });
    }
});
;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.planlist.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanList = Backbone.View.extend({

    tagName:"div",

    className: "artifactsList",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planlist.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        this.listenTo(App.ResourceArtifacts.PlanNode,"add",this.addOne);
        this.listenTo(App.ResourceArtifacts.PlanNode,"reset",this.render);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanDetail({model: model});
        this.$("ul").append(newList.render().el);
        App.Comm.initScroll(this.$(".list"),"y");
    }
});
;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.planrule.detail.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetail = Backbone.View.extend({

    tagName:"li",

    template: function(){
        var url = "";
        if(App.ResourceArtifacts.Status.templateId){
            url = "/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planruledetail.projectx.html";
        }else{
            url = "/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planruledetailx.html";
        }
        return _.templateUrl(url)
    },

    events:{
        "click .desc":"getDetail",
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .saveRule":"saveRule",
        "click .choose":"choose",
        "click .delRule": "delRule",
        "click .categoryCode": "legend",
        "click .text":"seleRule",
        "click .myItem":"myItem",
        "click .ruleCheck":"ruleCheck"
    },

    render:function() {
        var _this = this;
        //映射规则
        var operatorData = App.Resources.dealStr2(_this.model);//规则数据
        this.model.set({mappingCategory:operatorData},{silent:true});
        this.$el.html(this.template()(this.model.toJSON()));

        //写入是否选中
        if(App.ResourceArtifacts.Status.check == "1"){
            this.$(".ruleCheck").addClass("all");
            this.$el.attr("data-check",App.ResourceArtifacts.Status.check );
        }else if(App.ResourceArtifacts.Status.check == "0"){
            this.$el.attr("data-check",App.ResourceArtifacts.Status.check );
        }else{
            var modelRule = this.getModelRule();
            var check = _.find(modelRule,function(item){
                return item == _this.model.get("id");
            });
            if(check){
                this.$(".ruleCheck").addClass("all");
                this.$el.attr("data-check","1");
            }else{
                this.$el.attr("data-check","0");
            }
        }
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        Backbone.on("modelRuleSelectNone",this.modelRuleSelectNone,this);
        Backbone.on("modelRuleSelectAll",this.modelRuleSelectAll,this);
    },

    modelRuleSelectNone:function(){
        this.$el.attr("data-check","0");
        if(this.$(".ruleCheck").hasClass("all")){
            this.$(".ruleCheck").removeClass("all")
        }
    },

    modelRuleSelectAll:function(){
        this.$el.attr("data-check","1");
        if(!this.$(".ruleCheck").hasClass("all")){
            this.$(".ruleCheck").addClass("all")
        }
    },
    //查找 项目规则collection，返回规则id数组
    getModelRule:function(){
        return App.ResourceArtifacts.TplCollectionRule.map(function(item){
            return item.get("ruleId");
        })
    },
    //选中状态
    ruleCheck:function(e){
        App.Resources.cancelBubble(e);
        var _this = this,id = _this.model.get("id");
        //原有的所有数据
        var modelSaving = App.ResourceArtifacts.modelSaving.codeIds;
        //查找当前已选code的并修改其内的ruleId列表

        var n = "string";
        for(var is = 0 ; is < modelSaving.length ; is++){
            if(modelSaving[is].code == App.ResourceArtifacts.Status.rule.targetCode){
                n = is;
                break
            }
        }
        if( n == "string"){
            App.ResourceArtifacts.modelSaving.codeIds.push({code:App.ResourceArtifacts.Status.rule.targetCode,ruleIds:[]});
            n = App.ResourceArtifacts.modelSaving.codeIds.length - 1;
        }

        var ele = $(e.target);
        var allSele = ele.closest("ul").find("li");
        //半选状态

        if(ele.hasClass("all")){
            ele.removeClass("all");
            ele.closest("li").attr("data-check","0");

            //全不选时触发左侧变化
            var checked1 = _.filter(allSele,function(item){
                return $(item).attr("data-check") == "1"
            });
            if(!checked1.length){
                Backbone.trigger("modelRuleEmpty");
            }else{
                Backbone.trigger("modelRuleHalf");
            }
            var listEle = _.filter($(".outsideList li"),function(item){
                return $(item).attr("data-check") == "1"
            });
            var idList = [];
            _.each(listEle,function(item){
                idList.push($(item).find(".ruleTitle").attr("data-id"));
            });
            App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = idList;

        }else{
            ele.closest("li").attr("data-check","1");

            //全选时触发左侧变化
            var checked2 = _.filter(allSele,function(item){
                return $(item).attr("data-check") == "0"
            });
            ele.addClass("all");
            if(!checked2.length){
                Backbone.trigger("modelRuleFull");
            }else{
                Backbone.trigger("modelRuleHalf");
            }

            var listEle2 = _.filter($(".outsideList li"),function(item){
                return $(item).attr("data-check") == "1"
            });
            var idList2 = [];
            _.each(listEle2,function(item){
                idList2.push($(item).find(".ruleTitle").attr("data-id"));
            });
            App.ResourceArtifacts.modelSaving.codeIds[n].ruleIds = idList2;
        }
    },
    getDetail:function(){
        if(this.$(".ruleDetail:visible").length){    //显示
            this.$(".ruleDetail").hide();
        }else{
            $(".ruleDetail").hide();
            this.$(".ruleDetail").show();
        }
    },
    //选择分类编码
    choose:function(){
        var tree  = new App.Resources.ArtifactsWindowRule().render().el;
        this.window(tree);
        App.Resources.ArtifactsMaskWindow.find(".content").css({"position":"relative"});
        var contain = App.Resources.artifactsTree(App.Resources.artifactsTreeData);
        $(".resourcesArtifactTree").html(contain);
        App.ResourceArtifacts.presentRule = this.model;
    },
    //增加新规则
    addNewRule:function(){
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        var view = new App.Resources.ArtifactsPlanRuleDetailNew({model:model}).render().el;
        this.$(".conR dl").append(view);
    },
    //保存
    saveRule:function(e){
        App.Resources.cancelBubble(e);
        var ele = $(e.target);
        //校验
        /*var  check = this.check();
        if(!check){return}*/

        var _this =this;
        //查找所有数据，拼接成字符串
        var title =  this.$(".ruleTitle");
        var id = title.data("id");

        var categoryCode = App.ResourceArtifacts.Status.rule.mappingCategory.categoryCode  ||  this.$(".categoryCode").val();
        var categoryName = App.ResourceArtifacts.Status.rule.mappingCategory.categoryName || this.$(".chide i").text();
        //验证分类编码有效性
        var  departCode = _.find(App.Resources.artifactsTreeData,function(item){
            return item.code == categoryCode;
        });
        if(!departCode){
            alert("分类编码不合法!");
            ele.closest(".mapRule").siblings(".typeCode").find(".categoryCode").focus();
            return
        }
        if(!categoryCode){
            alert("分类编码不能为空!");
            return
        }
        if(!this.$(".conR dd").length){
            alert("至少添加一项规则!");
            return
        }
        var ruleCon = ele.closest(".mapRule").find(".myDropDown");
        var unSelect =  _.find(ruleCon,function(item){
            return !$(item).attr("data-operator")
        });
        if(unSelect){
            alert("请选择规则类型!");
            $(unSelect).find(".myDropList").show();
            return
        }

        var model = App.ResourceArtifacts.saveRuleModel();
        var dd =  this.$("dd");
        var Rulist = [];
        var operator = "";

        for(var i =0 ; i < dd.length ; i++){
            Rulist[i]  ={};
            var propertyKey = dd.eq(i).find(".leftten input");
            if(!propertyKey.val()){
                propertyKey.focus();
                alert("规则名称不能为空！");
                return
            }
            Rulist[i].propertyKey = propertyKey.val();

            operator = dd.eq(i).find(".leftten .myDropDown").attr("data-operator");

            Rulist[i].operator = operator;

            if(dd.eq(i).find(".eIn").hasClass("active")){
                var name = dd.eq(i).find(".eIn input");
                if(!name.val()){
                    name.focus();
                    alert("规则内容不能为空");
                    return
                }
                Rulist[i].propertyValue = name.val();

            }else if(dd.eq(i).find(".ioside").hasClass("active")){
                if(!dd.eq(i).find(".ioside.active").length && !dd.eq(i).find(".eIn.active").length){
                    alert("至少选一项规则！");
                    return
                }
                var left = dd.eq(i).find(".ioside .myDropDown").eq(0).data("operator");
                var leftValue = dd.eq(i).find(".ioside input").eq(0);
                var right = dd.eq(i).find(".ioside .myDropDown").eq(1).data("operator");
                var rightValue = dd.eq(i).find(".ioside input").eq(1);

                if(!leftValue.val() && !rightValue.val()){
                    leftValue.focus();
                    alert("请至少填写一项数据");
                    //设定数据
                    return
                }

                if(!leftValue.val()){
                    left = ""
                }
                if(!rightValue.val()){
                    right = ""
                }

                //有效性验证
                if(leftValue.val() && rightValue.val()){
                    if(parseInt(leftValue.val()) >=parseInt(rightValue.val())){
                        alert("请填写有效的数字");
                        leftValue.focus();
                        return
                    }
                }

                var str = left  + leftValue.val() +","+ rightValue.val()+ right ;
                Rulist[i].propertyValue = str;
            }
        }

        model.mappingCategory.categoryCode = categoryCode;
        model.mappingCategory.categoryName = categoryName;
        model.mappingCategory.mappingPropertyList = Rulist;


        this.model.set({"targetCode":App.ResourceArtifacts.Status.rule.targetCode},{silent:true});
        this.model.set({"targetName":App.ResourceArtifacts.Status.rule.targetName},{silent:true});
        this.model.set({"biz":App.ResourceArtifacts.Status.rule.biz},{silent:true});
        this.model.set({"type":App.ResourceArtifacts.Status.type},{silent:true});
        this.model.set({"mappingCategory": model.mappingCategory},{silent:true});

        var baseData = this.model.toJSON();

        var cdata = {
            type:"POST",
            data : JSON.stringify(baseData),
            contentType: "application/json",
            projectId : App.ResourceArtifacts.Status.projectId
        };

        $(".artifactsContent .rules").addClass("services_loading");

        if(id){
            //更新
            cdata.URLtype = "modifyArtifactsPlanRule";
            cdata.type ="PUT";

            $.ajax({
                url: App.API.Settings.hostname +"platform/mapping/rule/update?projectId=" + App.ResourceArtifacts.Status.projectId,
                data:JSON.stringify(baseData),
                contentType: "application/json",
                type:"PUT",
                success:function(response){
                    if(response.code == 0 && response.data){
                        _this.$(".ruleTitle").attr("data-id",response.data.id);
                        _this.model.set({id:response.data.id},{silent:true});
                        _this.$(".ruleTitle .desc").text("[" + categoryCode + "] " + categoryName);
                        _this.$(".ruleDetail").hide();
                    }
                    $(".artifactsContent .rules").removeClass("services_loading");
                }
            });
        }else{
            //创建
            cdata.URLtype = "createArtifactsPlanNewRule";
            $.ajax({
                url: App.API.Settings.hostname +"platform/mapping/rule/create?projectId=" + App.ResourceArtifacts.Status.projectId,
                data:JSON.stringify(baseData),
                type:"POST",
                contentType: "application/json",
                success:function(response){
                    if(response.code == 0 && response.data){
                        _this.model.set({id:response.data.id},{silent:true});
                        _this.$el.remove();
                        App.ResourceArtifacts.PlanRules.push(_this.model);
                        App.ResourceArtifacts.Status.rule.count = App.ResourceArtifacts.PlanRules.length;
                        Backbone.trigger("resetTitle");
                    }
                    $(".artifactsContent .rules").removeClass("services_loading");
                }
            });
        }
        App.ResourceArtifacts.Status.saved = true;
    },

    //删除计划中的整条规则
    deleteRule:function(){
        var _this = this;
        App.ResourceArtifacts.Status.delRule = this.model.get("id");
        var frame = new App.Resources.ArtifactsPlanRuleAlert().render().el;
        App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 150,
            isConfirm: false,
            isAlert: false,
            message: frame
        });
        $(".mod-dialog .wrapper .header").hide();//隐藏头部
        $(".alertInfo").html('确认删除 “'+ _this.model.get("mappingCategory").categoryName   +' "?');
    },

    //联想模块
    legend:function(e){
        App.Resources.cancelBubble(e);
        var _this = this;
        _this.$(".chide").css({"visibility":"hidden"});
        var ac = _.map(App.Resources.artifactsTreeData,function(item){return item.code}); //对象-数组
        var pre = $(e.target);
        $(e.target).addClass("active");
        pre.css({"opacity":"1"});
        var list = pre.closest("div").siblings("ul");
        list.html();
        if(pre.val()){
            list.show();
        }
        //变红
        pre.on("keydown",function(e){
            list.show();
            //console.log(e.keyCode);
            var key = e.keyCode;
            var ele = $(e.target).closest("div").siblings("ul");
            var preList = ele.find("li");
            var preEle = ele.find("li.active").index(preList);
            var index = preEle != -1 ? preEle : 0;
            if(key == 38){
                //上移
                var prev = App.Resources.prev(index,preList.length);
                preList.eq(prev).addClass("active").siblings("li").removeClass("active");
            }else if(key == 40){
                //下移
                var next = App.Resources.next(index,preList.length);
                preList.removeClass("active");
                preList.eq(next).addClass("active").siblings("li").removeClass("active");
            }
            pre.removeClass("alert");
        });
        pre.on("keyup",function(e){
            App.Resources.cancelBubble(e);
            var key = e.keyCode;
            if(key != 38 || key != 40 || key != 13){
                var val = pre.val(),test, count = 5,str = '',index,unResult = "<li>搜索：无匹配结果</li>";  //显示5条
                list.html("");
                val = val.replace(/\s+/,'');
                if(!val){list.hide();return}
                val = val.replace(/\u3002+/,'.');
                //禁止输出除数字，半角句号外的
                test = /[^\d\.]+/.test(val);
                if(test){
                    list.html(unResult);
                    return;
                }

                str = val;
                var x = str.length%3;
                if(x ==0){
                    if(_.last(str) != "."){ list.html(unResult);return}
                    str = _.initial(str);
                    str = str.join('');
                    index = _.indexOf(ac,str,true);
                }else if(x == 1){
                    for(var s = 0 ; s< 9 ; s++){
                        var sd = str + s + '';
                        index = _.indexOf(ac,sd);
                        if(index >= 0){
                            break
                        }
                    }
                }else{
                    index = _.indexOf(ac,str,true);
                }

                if(index < 0 ){
                    list.html(unResult);
                    return
                }
                for(var j = index  ;  j < App.Resources.artifactsTreeData.length  ; j++){
                    if(App.Resources.artifactsTreeData[j].length <= val.length ||  j - index  + 1 >count) {
                        break
                    }
                    var newRule = new App.ResourceArtifacts.newCode(App.Resources.artifactsTreeData[j]);
                    list.append(new App.Resources.ArtifactsRuleLegend({model:newRule}).render().el);
                }
            }else if(key == 13){
                //回车键
            }
        });
    },

    //校验模块
    check:function(){
        var vals = this.$(".categoryCode");
        if(!vals.val()){
            vals.focus();
            this.redAlert(vals);
            return false;
        }
        return true
    },
    //初始化窗口
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"选择分类编码",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    },
    //红色提示输入
    redAlert:function(ele){
        ele.addClass("alert");
    },
    //切换规则
    seleRule:function(e) {
        App.Resources.cancelBubble(e);
        var _this = $(e.target);
        $(".myDropList").hide();
        _this.closest(".myDropText").siblings(".myDropList").show();
        _this.siblings(".myDropArrorw").removeClass("down").addClass("up");
    },
    //选择规则，切换输入方式
    myItem:function(e){
        var _this = $(e.target);
        var operator = _this.data("operator");
        var text = _this.text();
        var parent =  _this.parent(".myDropList");
        var eIn = _this.closest(".leftten").siblings(".eIn");
        var ioside  = _this.closest(".leftten").siblings(".ioside");
        //数据写入模型
        parent.hide().siblings(".myDropText").find(".text").text(text);
        _this.closest(".myDropDown").attr("data-operator",operator);
        _this.closest(".myDropDown").find(".myDropArrorw").removeClass("up").addClass("down");
        if(operator == "==" || operator == "!="){
            ioside.removeClass("active");
            if(eIn.hasClass("active")){return}
            eIn.addClass("active");
        }else if(operator == "<>" || operator == "><"){
            eIn.removeClass("active");
            if(ioside.hasClass("active")){return}
            ioside.addClass("active");
        }
    },
    //删除
    delRule:function(e){
        var _this = $(e.target);
        _this.closest("dd").remove();//删除元素
        //还用管未更新的model么？
    }
});
;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.planrule.detailnew.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailNew = Backbone.View.extend({

    tagName:"dd",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planruledetailnewx.html"),

    events:{
        "click .delRule": "delRule",
        "click .myItem":"myItem",
        "click .myDropText":"seleRule"
    },

    render:function() {

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    initialize:function(){
        this.listenTo(this.model,"change",this.render);
    },
    //切换规则
    seleRule:function(e){
        var _this = $(e.target);
        App.Resources.cancelBubble(e);
        $(".myDropList").hide();
        _this.closest(".myDropText").siblings(".myDropList").show();
        _this.siblings(".myDropArrorw").removeClass("down").addClass("up");
    },
    //选择规则，切换输入方式
    myItem:function(e){
        var _this = $(e.target);
        var operator = _this.data("operator");
        var text = _this.text();
        var parent =  _this.parent(".myDropList");
        var eIn = _this.closest(".leftten").siblings(".eIn");
        var ioside  = _this.closest(".leftten").siblings(".ioside");
        //数据写入模型
        parent.hide().siblings(".myDropText").find(".text").text(text);
        _this.closest(".myDropDown").attr("data-operator",operator);
        _this.closest(".myDropDown").find(".myDropArrorw").removeClass("up").addClass("down");

        if(operator == "==" || operator == "!="){
            ioside.removeClass("active");
            if(eIn.hasClass("active")){return}
            eIn.addClass("active");
        }else if(operator == "<>" || operator == "><"){
            eIn.removeClass("active");
            if(ioside.hasClass("active")){return}
            ioside.addClass("active");
        }
    },
    //删除
    delRule:function(){
        this.$el.remove();//删除元素
    }
});
;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.planrule.js*/
/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRule = Backbone.View.extend({

    tagName:"ul",
    className :"outsideList",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.html"),

    events:{},

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.resetTitle,this);
    },

    addOne:function(model) {
        var newList = new App.Resources.ArtifactsPlanRuleDetail({model: model});
        this.$el.append(newList.render().el);
        App.Comm.initScroll($(".ruleContentRuleList"),"y");
    },

    resetTitle:function(){
        var _this = this;
        this.collection = App.ResourceArtifacts.PlanRules;
        this.$el.html("");
        if(this.collection.length == 0){
            this.$el.html("<li><div class='ruleTitle delt'>暂无内容</div></li>");
        }else{
            this.collection.each(function(item){
                _this.addOne(item);
            })
        }
    }
});
;/*!/resources/views/resourcesArtifacts/ruleModel/resources.artifacts.planrule.title.js*/
/**
 * @require /resources/collection/resources.nav.es6
 */
App.Resources.ArtifactsPlanRuleTitle = Backbone.View.extend({

    tagName:"div",

    className:"pozero",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planruletitle.html"),

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("resetTitle",this.resetTitle,this);
    },

    resetTitle:function(){
        this.$("h2 .name").html(App.ResourceArtifacts.Status.rule.targetCode +
            " " +App.ResourceArtifacts.Status.rule.targetName  +
            "("+App.ResourceArtifacts.Status.rule.count + ")");
    },
    //创建规则
    newPlanRule:function(){
        var _this = this;
        var targetCode = App.ResourceArtifacts.Status.rule.targetCode;

        if(!targetCode){
            alert("请选择模块/质量标准");
            return;
        }//没有选择计划无法创建规则
        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            return
        }
        //重置删除状态
        App.ResourceArtifacts.Status.delRule ="";

        //无数据或无更改，更改当前数据
        $(".ruleDetail:visible").hide();

        //创建规则
        var model =  App.ResourceArtifacts.createPlanRules();
        //加载底下规则
        var operatorData = App.Resources.dealStr2(model);//规则数据
        model.set({mappingCategory:operatorData},{silent:true});
        var container = new App.Resources.ArtifactsPlanRuleDetail({model:model});

        var li = $(".ruleContentRuleList ul.outsideList>li");
        if(li.length == 1 && !li.attr("data-check")){
            $(".ruleContentRuleList ul.outsideList").html(container.render().el).show();
        }else{
            $(".ruleContentRuleList ul.outsideList").append(container.render().el).show();
        }

        App.ResourceArtifacts.Status.saved = false;
        $(".ruleContentRuleList ul.outsideList>li:last-child .ruleDetail").show();


    }

});
;/*!/resources/views/resourcesArtifacts/ruleTemplate/reources.artifacts.tempalte.alert.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplAlert = Backbone.View.extend({

    tagName :'div',
    className:"resourcesAlert",

    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleModel/resources.artifacts.planrule.alert.html"),

    events:{
        "click #resourcesSure":"sure",
        "click #resourcesCancel":"cancel"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(models){},
    //确定
    sure : function(){
        var templateId =  App.ResourceArtifacts.Status.templateId;
        //非新建
        $.ajax({
            url: App.API.Settings.hostname +"platform/rule/template/delete/" + templateId ,
            type:"DELETE",
            success:function(response){
                 if(response.code == 0){ //删除成功

                     App.ResourceArtifacts.Status.saved = true ;//保存状态

                    //删除模型
                     var pre = App.ResourceArtifacts.TplCollection.filter(function(item){
                         return item.get("id") == templateId;
                     });
                     App.ResourceArtifacts.TplCollection.remove(pre);

                    //删除相应视图
                     _.each($(".tplCon .item"),function(item){
                         if(parseInt($(item).attr("data-id")) == templateId){
                             $(item).closest("li").remove();
                         }
                     });

                     Backbone.trigger("resetTitle");//刷新右侧标题
                     Backbone.trigger("mappingRuleResetModel");//刷新右侧正文
                     App.ResourceArtifacts.Status.templateId = "";//清空所选模板
                }else{
                     alert("删除失败");
                 }
                App.Resources.ArtifactsAlertWindow.close();
                $(".artifactsContent .rules").removeClass("services_loading");
            },
            error:function(error){
                alert("错误类型"+ error.status +"，无法成功删除!");
            }
        });
    },
        //取消
    cancel:function(){
        $(".artifactsContent .rules").removeClass("services_loading");
        App.Resources.ArtifactsAlertWindow.close();
    },
    //关闭
    close:function(){
        $(".artifactsContent .rules").removeClass("services_loading");
        App.Resources.ArtifactsAlertWindow.close();
    }
});


;/*!/resources/views/resourcesArtifacts/ruleTemplate/reources.artifacts.window.tpl.js*/
/*
 * @require  services/views/auth/member/services.member.ozDetail.js
 * */
App.Resources.ArtifactsWindowTpl = Backbone.View.extend({

    tagName :'div',
    className:"resourcesAlert",
    template:_.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.window.tpl.html"),
    events:{
        "click .windowSubmit":"sure"
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },
    initialize:function(models){},
    //确定
    sure : function(){
        var _this = this,pdata;
        var name = $("#artifactsTplName").val();
        if(!name){
            alert("模板名称不能为空!");
            return
        }
        var baseData = {
            "name": name,
            "descr": "",
            "biz": App.ResourceArtifacts.Status.rule.biz
        };
        pdata = {
            URLtype:"createArtifactsTemplate",
            data:JSON.stringify(baseData),
            type:"POST",
            contentType: "application/json"
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0&&  response.data ){
                    baseData.id = response.data.id;
                    App.ResourceArtifacts.TplCollection.push(baseData);
                //刷新右面名称，数据，视图
                App.ResourceArtifacts.TplCollectionRule.reset();
                //触发事件
            }
        });
        App.Resources.ArtifactsMaskWindow.close();
    },
    //取消
    cancel:function(){
        App.Resources.ArtifactsMaskWindow.close();
    },
    //关闭
    close:function(){
        App.Resources.ArtifactsMaskWindow.close();
    }
});


;/*!/resources/views/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplDetail = Backbone.View.extend({

    tagName:"div",
    className:"cont",
    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpldetail.html"),
    events:{
        "click .delete":"delete",
        "click .edit":"edit",
        "click #resourcesSure":"resourcesSure",
        "click #resourcesCancel":"resourcesCancel"
    },

    render:function() {
        this.$el.html(this.template);
        var tabs = App.Comm.AuthConfig.resource.mappingRule;
        if(App.AuthObj.lib.mappingRuleTemplate.edit){
            this.$(".tplDetailInfo").prepend(tabs.mappingRuleTemplateEdit);
        }
        return this;
    },

    initialize:function(){
        Backbone.on("mappingRuleModelEdit",this.edit,this);
    },

    delete:function(){
        var _this = this;
        var frame = new App.Resources.ArtifactsTplAlert();
        App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
            title: "",
            width: 280,
            height: 150,
            isConfirm: false,
            isAlert: false,
            message: frame.render().el
        });
        $(".mod-dialog .wrapper .header").hide();//隐藏头部
        frame.$(".alertInfo").html('确认删除 “'+ App.ResourceArtifacts.Status.templateName   +' "?');
    },
    //编辑
    edit:function() {
        this.$(".tplDetailInfo").hide();
        this.$(".tplDetailEdit").show();
        App.ResourceArtifacts.modelEdit = true;
        Backbone.trigger("checkedChange");
    },
    //当模板为空时触发
    reset:function(){
        this.$(".tplDetailInfo h2").empty();
    },
    //保存
    resourcesSure:function(){
        var _this = this;
        var modelSaving = App.ResourceArtifacts.modelSaving;
        //如果不存在模板id则无法保存
        if(!App.ResourceArtifacts.Status.templateId){
            return
        }
        App.ResourceArtifacts.modelSaving.templateId = App.ResourceArtifacts.Status.templateId;
        App.ResourceArtifacts.modelSaving.templateName = App.ResourceArtifacts.Status.templateName = this.$(".tplDetailEdit .tplName").val();
        console.log(App.ResourceArtifacts.modelSaving);
        //要查找两级看是否是叶子节点直接过滤即可，无需查找
        var pdata = {
            URLtype: "saveArtifactsTemplateRule",
            type:"PUT",
            data:JSON.stringify(modelSaving),
            contentType: "application/json"
        };
        App.ResourceArtifacts.loading($(".modelContent"));
        App.Comm.ajax(pdata,function(response){
            console.log(response);
            if(response.code == 0 && response.data){
                //更改模板名称
                _this.$(".tplDetailTitle h2").text(App.ResourceArtifacts.Status.templateName);
                Backbone.trigger("resourcesChangeMappingRuleModelName");
                //修正模板数据
                App.ResourceArtifacts.TplCollection.each(function(item){
                    if(item.get("id") == App.ResourceArtifacts.Status.templateId){
                        item.set({"ruleId":response.data.ruleIds},{silent:true})
                    }
                });
                //取消编辑状态
                _this.resourcesCancel();
                App.ResourceArtifacts.modelEdit = false

            }else{
                alert("提交失败");
            }
            App.ResourceArtifacts.loaded($(".modelContent"));
        });
    },
    //取消编辑状态
    resourcesCancel:function(){
        this.$(".tplDetailInfo").show();
        this.$(".tplDetailEdit").hide();
        Backbone.trigger("projectMappingRuleCheckedClose");
        App.ResourceArtifacts.modelEdit = false
    }
});
;/*!/resources/views/resourcesArtifacts/ruleTemplate/resources.artifacts.tplframe.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplFrame = Backbone.View.extend({

    tagName:"div",

    className: "artifactsTplFrame",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tplframe.html"),

    render:function() {
        this.$el.html(this.template);
        return this;
    },

    initialize:function(){
        Backbone.on("mappingRuleModelLoadContent",this.loadContent,this);
        Backbone.on("mappingRuleResetModel",this.mappingRuleResetModel,this);
    },

    mappingRuleResetModel:function(){
        this.$(".tplContent>.default").show();
    },

    //写入模板包含的内容
    loadContent:function(name){
        var _this = this;
        this.$(".tplContent").addClass("services_loading");
        //重置右侧列表
        $("#artifacts").addClass("tpl");//此处为修正样式表现
        //修改内容
        this.$(".tplDetailTitle h2").text(name);
        this.$(".tplDetailTitle .tplName").val(name);
        this.$(".artifactsContent").addClass("explorer");
        this.$(".artifactsContent .default").show().siblings().hide();
        this.$(".artifactsNav li").eq(0).addClass("active").siblings("li").removeClass("active");

        //隐藏默认
        this.$(".tplContent>.default").hide();

        this.getTplRule();//获取规则模板列表
    },

    //获取模板规则列表
    getTplRule:function(){
        var _this = this;
        var pdata = {
            URLtype:"fetchArtifactsTemplateRule",
            data:{
                templateId : App.ResourceArtifacts.Status.templateId
            }
        };
        App.Comm.ajax(pdata,function(response){
            if(response.code == 0 && response.data){
                if(response.data.length){
                    App.ResourceArtifacts.TplCollectionRule.add(response.data);
                    _this.$(".artifactsContent .default").hide();
                    _this.$(".artifactsContent .plans").show();
                    _this.$(".artifactsContent .rules").show();
                }else{
                    //没有任何规则时候，显示创建规则按钮
                    _this.$(".artifactsContent .default").siblings().hide();
                }
                _this.$(".tplContent").removeClass("services_loading");
            }
        })
    }
});
;/*!/resources/views/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllist.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplList = Backbone.View.extend({

    tagName:"div",

    className: "artifactsList",

    events:{
        "click .newPlanRule":"newPlanRule"
    },

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllist.html"),
    render:function() {
        this.$el.html(this.template);
        return this;
    },
    initialize:function(){
        this.listenTo(App.ResourceArtifacts.TplCollection,"add",this.addOne);
    },
    addOne:function(model) {
        var newList = new App.Resources.ArtifactsTplListItem({model: model});
        this.$("ul").append(newList.render().el);
        App.Comm.initScroll($(".list"),"y");
    },
    //创建规则
    newPlanRule:function(){
        var _this = this;
        if(App.ResourceArtifacts.modelEdit){
            alert("编辑状态不能创建模板！");
            return;
        }

        if( !App.ResourceArtifacts.Status.saved){
            alert("您还有没保存的");
            //查找未保存的元素并高亮提示变红
            return
        }
        var frame = new App.Resources.ArtifactsWindowTpl().render().el; //新建模板
        this.window(frame);
    },
    //初始化窗口
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"新建模板",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    }
});
;/*!/resources/views/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllistitem.js*/
/**
 * @require resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsTplListItem = Backbone.View.extend({

    tagName:"li",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/ruleTemplate/resources.artifacts.tpllistitem.html"),

    events:{
        "click .item":"getTpl"
    },
    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"remove",this.render);
        Backbone.on("resourcesChangeMappingRuleModelName",this.changeName,this);
    },
    //修改模板名称时修改名字
    changeName:function(){
        if(this.$(".item").attr("data-id") == App.ResourceArtifacts.Status.templateId){
            this.$(".item div").text(App.ResourceArtifacts.Status.templateName);
            this.model.set("name",App.ResourceArtifacts.Status.templateName)
        }
    },
    //取得模板
    getTpl:function(){
        var Auth = App.AuthObj.lib;
        if(App.ResourceArtifacts.modelEdit){
            alert("编辑状态不能切换模板");
            return;
        }
        var _this = this;
        App.ResourceArtifacts.Status.templateId = this.model.get("id");//保存id
        App.ResourceArtifacts.Status.templateName = this.model.get("name");//保存name

        this.toggleClass();
        //保存状态
        //if(!App.ResourceArtifacts.Status.saved){
        //    alert("您还有没保存的");
        //    return
        //}
        if(Auth.moduleMappingRule.view) {
            App.ResourceArtifacts.getPlan();
        }
        if(Auth.qualityMappingRule.view){
            App.ResourceArtifacts.getAllQuality(function(){
                App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListGC"),App.ResourceArtifacts.allQualityGC,null,null);
                App.ResourceArtifacts.menu.$(".qualityMenuListGC").show();
                App.ResourceArtifacts.departQuality(App.ResourceArtifacts.menu.$(".qualityMenuListKY"),App.ResourceArtifacts.allQualityKY,null,null);
                App.ResourceArtifacts.tplFrame.$(".tplContent").removeClass("services_loading");
            });
        }
        if(Auth.moduleMappingRule.view || Auth.qualityMappingRule.view){
            Backbone.trigger("mappingRuleModelLoadContent",this.model.get("name"));
        }
    },
    //切换
    toggleClass:function(){
        $(".tplCon li").removeClass("active");
        this.$el.addClass("active");
    }
});
;/*!/resources/views/resourcesNav/resource.nav.famLibs.es6*/
"use strict";

App.ResourcesNav.FamLibs = Backbone.View.extend({

	tagName: "div",

	id: "famLibs",

	template: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.html"),

	//初始化
	initialize: function initialize() {
		this.listenTo(App.ResourcesNav.FamLibsCollection, "add", this.addOne);
		this.listenTo(App.ResourcesNav.FamLibsCollection, "reset", this.emptyContent);
		Backbone.on('FamlibNullData', this.nullData, this);
	},


	render: function render() {
		this.$el.html(this.template());
		return this;
	},

	templateDetail: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.detail.html"),

	//添加单个
	addOne: function addOne(model) {

		var $standar = this.$el.find(".standarBody .standar"),
		    $loading = $standar.find(".loading");

		if ($loading.length > 0) {
			$loading.remove();
		}
		var data = model.toJSON();

		$standar.append(this.templateDetail(data));
	},


	//清空内容
	emptyContent: function emptyContent() {
		this.$el.find(".standarBody .standar").html(' <li class="loading">正在加载，请稍候……</li>');
	},
	nullData: function nullData() {
		this.$el.find(".standarBody .standar").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问族库</div></li>');
	}
});
;/*!/resources/views/resourcesNav/resource.nav.qualityStandardLibs.es6*/
"use strict";

App.ResourcesNav.QualityStandardLibs = Backbone.View.extend({

	tagName: "div",

	id: "qualityStandardLibs",

	render: function render() {
		this.$el.html("QualityStandardLibs");
		return this;
	}

});
;/*!/resources/views/resourcesNav/resource.nav.standardlibs.es6*/
"use strict";

App.ResourcesNav.StandardLibs = Backbone.View.extend({

	tagName: "div",

	id: "standardLibs",

	template: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.html"),

	//初始化
	initialize: function initialize() {
		this.listenTo(App.ResourcesNav.StandardLibsCollection, "add", this.addOne);
		this.listenTo(App.ResourcesNav.StandardLibsCollection, "reset", this.emptyContent);
		Backbone.on('StandModelNullData', this.nullData, this);
	},


	events: {
		"click .title .name": "setVersion"
	},

	render: function render() {

		this.$el.html(this.template());
		return this;
	},

	templateDetail: _.templateUrl("/resources/tpls/resourcesNav/resource.nav.standardlibs.detail.html"),

	//添加单个
	addOne: function addOne(model) {
		var $standar = this.$el.find(".standarBody .standar"),
		    $loading = $standar.find(".loading");

		if ($loading.length > 0) {
			$loading.remove();
		}

		var data = model.toJSON(),
		    $el = $(this.templateDetail(data)).data("file", data);

		$standar.append($el);
	},

	//设置版本
	setVersion: function setVersion(event) {

		var $target = $(event.target),
		    $item = $target.closest(".item"),
		    data = $item.data("file");

		if (data.version) {
			App.ResourceModel.Settings.CurrentVersion = data.version;
		} else {
			alert("暂无版本");
			$target.removeAttr("href");
		}
	},

	//清空内容为加载
	emptyContent: function emptyContent() {
		this.$el.find(".standarBody .standar").html(' <li class="loading">正在加载，请稍候……</li>');
	},
	nullData: function nullData() {
		this.$el.find(".standarBody .standar").html('<li class="loading"><img src="/static/dist/images/projects/images/emptyProject.png"><div>暂无可访问标准模型</div></li>');
	}
});
;/*!/resources/views/resourcesNav/resources.nav.manifestLibs.es6*/
"use strict";

App.ResourcesNav.ManifestLibs = Backbone.View.extend({

	tagName: "div",

	id: "manifestLibs",

	render: function render() {
		this.$el.html("manifestLibs");
		return this;
	}

});