
//主容器
App.Services.projectMember.mainView = Backbone.View.extend({

  tagName: 'div',

  id: 'projectMember',

  // 重写初始化
  initialize: function() {

  },

  render: function() {
    this.$el.append(new App.Services.projectMember.projects().render().el);
    this.$el.append(new App.Services.projectMember.members().render().el);
    return this;
  }
});