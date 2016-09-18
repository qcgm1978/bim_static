;/*!/flow/collections/index.es6*/
'use strict';

App.Flow = App.Flow || {};

App.Flow.Controller = {

    icon: {
        '成本管理': 'm-chengbenguanli',
        '商管工程': 'm-shangguangongcheng',
        '发展管理': 'm-fazhanguanli',
        '计划管理': 'm-jihuaguanli',
        '设计管理': 'm-shejiguanli',
        '招商管理': 'm-zhaoshangguanli',
        '质量管理': 'm-zhiliangguanli',
        '经营管理': 'm-jingyingguanli32'
    },

    toIcon: function toIcon(key) {
        return this.icon[key] || 'm-moren';
    },

    init: function init() {

        //实例化
        $('#contains').html(new App.Flow.View().render().$el);
        new App.Flow.NavView();
        new App.Flow.ContentView();

        this.flowNavCollection.fetch({
            reset: true
        });

        $("#pageLoading").hide();
    },

    flowCollection: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {
                    url: ''
                };
            }
        }),
        urlType: "fetchFlow",
        parse: function parse(response) {
            if (response.message == "success") {
                return response;
            }
        }

    }))(),

    flowNavCollection: new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function defaults() {
                return {
                    url: ''
                };
            }
        }),
        urlType: "fetchNavFlow",
        parse: function parse(response) {
            if (response.message == "success") {
                return response;
            }
        }

    }))()

};
;/*!/flow/views/flow.container.es6*/
"use strict";

App.Flow = App.Flow || {};

App.Flow.View = Backbone.View.extend({

	tagName: "div",

	className: "flowContainer",

	template: _.templateUrl("/flow/tpls/flow.container.html"),

	render: function render() {
		this.$el.html(this.template({ data: [] }));
		return this;
	}

});
;/*!/flow/views/flow.content.es6*/
"use strict";

App.Flow = App.Flow || {};

App.Flow.ContentView = Backbone.View.extend({

	tagName: "div",

	template: _.templateUrl("/flow/tpls/flow.content.html", true),

	events: {
		//'click .text':'detail'
	},

	initialize: function initialize() {
		this.listenTo(App.Flow.Controller.flowCollection, 'reset', this.load);
	},
	detail: function detail(txt) {
		App.Comm.ajax({
			URLtype: 'fetchFlowDetail',
			data: {
				itemName: txt,
				simpleMode: false
			}
		}).done(function (data) {
			new App.Flow.FlowDialog().render(data.data);
		});
	},


	load: function load(m) {
		var _this = this;
		var data = m.toJSON()[0];
		var _html = _.template(this.template);
		this.$el.html(_html(data));
		$("#flowContainer").html(this.$el);
		this.$('.text').on('click', function () {
			_this.detail($(this).attr('title').replace('【模块化】', ''));
		});
		return this;
	}
});
;/*!/flow/views/flow.dialog.es6*/
"use strict";

App.Flow = App.Flow || {};

App.Flow.FlowDialog = Backbone.View.extend({

    className: "flowModal",

    template: _.templateUrl("/flow/tpls/flow.dialog.html"),

    events: {
        'click .dialogClose': 'close'
    },

    close: function close() {
        this.$el.remove();
    },
    render: function render(data) {
        this.$el.html(this.template(data));
        $('#flowContainer').append(this.$el);
        return this;
    }
});
;/*!/flow/views/flow.nav.es6*/
"use strict";

App.Flow = App.Flow || {};

App.Flow.NavView = Backbone.View.extend({

	tagName: "ul",

	className: "flowTabNav",

	template: _.templateUrl("/flow/tpls/flow.nav.html", true),

	events: {
		'click .flowTabItem': 'switchModel'
	},

	initialize: function initialize() {
		this.listenTo(App.Flow.Controller.flowNavCollection, 'reset', this.load);
	},
	switchModel: function switchModel(e) {
		var $target = $(e.currentTarget);
		if (!$target.hasClass('itemSelected')) {
			$('.itemSelected').removeClass('itemSelected');
			$target.addClass('itemSelected');
			var id = $target.data('id');
			this.$("#flowMoreBtn a").attr('href', $target.data('link'));
			this.loadContent(id);
		}
	},


	load: function load(m) {
		var data = m.toJSON()[0];
		var _html = _.template(this.template);
		this.$el.html(_html(data));
		$("#flowTabNavContainer").html(this.$el);
		this.loadContent(data.data[0].id);
		return this;
	},

	loadContent: function loadContent(id) {
		App.Flow.Controller.flowCollection.phaseId = id;
		App.Flow.Controller.flowCollection.fetch({
			reset: true
		});
	}
});