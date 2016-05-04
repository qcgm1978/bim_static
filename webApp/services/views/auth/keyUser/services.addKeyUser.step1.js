

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
    if(orgId){
      if($ul.hasClass('shut')){

        $(e.target).removeClass('shut').addClass('open');

        if(canLoad=='true'){
          $ul.removeClass('shut').addClass('open');
          App.Comm.ajax({URLtype:'fetchServiceMemberInnerList',data:{parentId:orgId,includeUsers:true}},function(r){
            console.log(r)

            if(r && !r.code && r.data){
              var str = '';
              _.each(r.data.user,function(data){
                data.canLoad = false;
                //<%= data[i]['child'] && data[i]['child'][0]=='string'?'lastLayer':''%>
                str+="<li>"+
                  "<p class='person "+"' data-uid='"+data['userId']+ "' data-canLoad='true' ><i ></i><span>"+ data['name']+"</span></p>"+
                  "</li>";
              });
              _.each(r.data.org,function(data){
                data.shut = true;
                data.canLoad = true;
                //<%= data[i]['child'] && data[i]['child'][0]=='string'?'lastLayer':''%>
                str+="<li>"+
                  "<p class='shut "+"' data-id='"+data['orgId']+ "' data-canLoad='"+(data['hasChildren']||data['hasUser']?true:false)+ "'><i ></i>"+ data['name']+"</p>"+
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
    }else{

      //选定人员
      this.$el.find('.toselected').removeClass('toselected');
      $(e.target).parent().addClass('toselected');

    }


  }
});