/**
 * @require /resources/collection/resource.nav.es6
 */
//App.Resources.artifactsTreeData;//��������
App.Resources.artifactsTree = function(dataList,code){
    var data = [];
    if(!code){
        data = _.filter(dataList,function(item){
            return !item.parentCode
        });
        //ע���и�����ѡ��,code == -1
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
//������׼tree
App.Resources.artifactsQualityTree = function(dataList){
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
        var  a  = data[i].ruleContain == 1 ? 1 : 0 ;
        li.attr("data-check",a);
        li.attr("data-code",data[i].code);
        li.append(new App.Resources.ArtifactsQualityDetail({model:initModel}).render().el);
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


App.Resources.dealStr = function(model){
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
    return list;
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




//���й���
App.Resources.queue = {
    que : [],
    permit : true,
    present : [],
    //���֤���ţ�400ms�󷢷�һ�����֤������������
    certificates:function(){
        this.permit = false;
        setTimeout(function(){
            App.Services.queue.permit = true;
        },400);
    },
    //��֤����������ִ�к���
    promise:function(fn,_this){
        if(!this.permit){ return;}
        if(!this.que.length){//û��ֱ�����
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
    //ִ����ϣ�ˢ�¶��У�ִ����һ��
    next:function(){
        this.que.shift();
        this.present.shift();
        if(this.que.length){
            this.que[0]();
        }
    }
};
