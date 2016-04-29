//我管理的项目列表view
App.Services.projectMember.projects = Backbone.View.extend({

  tagName: 'ul',

  className: 'projects',

  template: _.templateUrl('/services/tpls/auth/projectMember/projects.html', true),

  // 重写初始化
  initialize: function() {

  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }
});