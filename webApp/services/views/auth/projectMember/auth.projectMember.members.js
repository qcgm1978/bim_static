//项目成员列表view
App.Services.projectMember.members = Backbone.View.extend({

  tagName: 'ul',

  className: 'members',

  template: _.templateUrl('/services/tpls/auth/projectMember/members.html', true),

  // 重写初始化
  initialize: function() {

  },

  render: function() {
    this.$el.html(this.template);
    return this;
  }
});