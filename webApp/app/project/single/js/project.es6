App.Project = {

	Settings:{},

	GetRequest() {
			var url = location.search; //获取url中"?"符后的字串 
			var theRequest = new Object();
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
				}
			}
			return theRequest;
		},

		getUrlByType: function(data) {

			//是否调试
			if (App.API.Settings.debug) {
				data.url = App.API.DEBUGURL[data.URLtype];
			} else {
				data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
			}

			//没有调试接口
			if (!data.url) {
				data.url = App.API.Settings.hostname + App.API.URL[data.URLtype];
			}

			//url 是否有参数
			var urlPars = data.url.match(/\{([\s\S]+?(\}?)+)\}/g);
			if (urlPars) {
				for (var i = 0; i < urlPars.length; i++) {
					var rex = urlPars[i],
						par = rex.replace(/[{|}]/g, ""),
						val = data.data[par];
					if (val) {
						data.url = data.url.replace(rex, val);
					}
				}
			}

			return data;

		},

		//获取模型id
		getModelId: function() {
			var Request = App.Project.GetRequest();

			var data = {
				URLtype: "fetchFileModelIdByFileVersionId",
				data: {
					projectId: Request.projectId,
					projectVersionId: Request.projectVersionId
				}
			}

			var url = App.Project.getUrlByType(data).url;

			$.ajax({
				url: url,
				data: {
					fileVersionId: Request.id
				}
			}).done(function(data) {

				if (_.isString(data)) {
					// to json
					if (JSON && JSON.parse) {
						data = JSON.parse(data);
					} else {
						data = $.parseJSON(data);
					}
				}
				if (data.message == "success") {
					 
					$(".header .name").text(data.data.name);
					document.title = data.data.name + "模型预览";
					App.Project.Settings.Model=data;
					if (data.data.modelId) {
						var viewer = new BIM({
							single:true,
							element: $("#modelBox")[0],
							projectId: data.data.modelId, //"b7554b6591ff6381af854fa4efa41f81", //App.Project.Settings.projectId,
							// projectId:'testrvt',
							tools: true
						});
					} else {
						alert("模型转换中");
					}
				} else {
					alert(data.message);
				}
			});
		},

		//渲染模型
		renderModel: function() {

			var Request = App.Project.GetRequest();
			App.Project.getModelId();
			// if (Request.model) {
			// 	var viewer = new BIM({
			// 		element: $("#modelBox")[0],
			// 		projectId: Request.model, //"b7554b6591ff6381af854fa4efa41f81", //App.Project.Settings.projectId,
			// 		// projectId:'testrvt',
			// 		tools: true
			// 	});
			// } else {
			// 	App.Project.getModelId();
			// }
		},

		downLoad() {

			var Request = App.Project.GetRequest(); 

			// //请求数据
			var data = {
				URLtype: "downLoad",
				data: {
					projectId: Request.projectId,
					projectVersionId: Request.projectVersionId
				}
			};

			var data = App.Project.getUrlByType(data);
			var url = data.url + "?fileVersionId=" + App.Project.Settings.Model.data.fileVersionId;
			window.location.href = url;

		},


		init() {

			//渲染模型
			App.Project.renderModel();

			//下载
			$(".header .downLoad").on("click",function(){
				App.Project.downLoad();
			});

		}
}