

var App = App || {};
App.Services.step1 = Backbone.View.extend({

  tagName:'div',

  template:_.templateUrl("/services/tpls/auth/keyUser/services.addKeyUser.step1.html"),

  events:{
    "click p":"changeStatus",
    //"click .keyUserList li":'toggleClass'
  },

  render:function(){
    //准备Collection的MODELS
    var datas={
      direction : App.Services.KeyUser.Step1.toJSON() || [],

    };
    this.$el.html(this.template(datas));
    return this;
  },


  initialize:function(){
    this.listenTo(App.Services.KeyUser.Step1,'add',this.render)
  },

  //打开或关闭目录
  changeStatus:function(e){
    
    var $ul=$(e.target).siblings('ul');

    //是否需要加载子目录
    var canLoad=$(e.target).attr('data-canLoad');

    var orgId=$(e.target).attr('data-id');

    if($ul.hasClass('shut')){

      $(e.target).removeClass('shut').addClass('open');

      if(canLoad=='true'){
        $ul.removeClass('shut').addClass('open');
        App.Comm.ajax({URLtype:'fetchServiceMemberInnerList',data:{parentId:orgId,includeUsers:true}},function(r){
          console.log(r)

          if(r && !r.code && r.data){
            var str = '';
            _.each(r.data.org,function(data){
              data.shut = true;
              data.canLoad = true;
              str+="<li>"+
                       "<p class='shut' data-id='"+data['orgId']+ "' data-canLoad='true' ><i ></i>"+ data['name']+"</p>"+
                       "<ul class='shut'></ul>"+
                   "</li>";
            });
            $ul[0].innerHTML = str;
            $(e.target).siblings('ul').html(str);


          }
        });
        $(e.target).attr('data-canLoad','false')
      }else{
        $ul.removeClass('shut').addClass('open');
        $(e.target).removeClass('shut').addClass('open');

      }

    }else{
      $ul.removeClass('open').addClass('shut');
      $(e.target).removeClass('open').addClass('shut');

    }

  }
});