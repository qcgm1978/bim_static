/**
 * @require /services/collections/index.es6
 */

App.Services.projectMember  = {
  //初始化
  init  : function(){
    $('.serviceBody').html(new App.Services.projectMember.mainView().render().el);
  },



}
