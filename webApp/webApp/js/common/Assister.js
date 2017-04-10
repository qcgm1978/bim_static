/*
write by wuweiwei
function:常用函数
*/

(function(){
	var Assister = {
		version:"1.0",

		ChineseSort : function(arr){
			var resultArr=[];
			resultArr = array.sort(
			    function compareFunction(param1, param2) {
			        return param1.localeCompare(param2);
			    }
			);
		},

		Date : {
			guid : function(){
			    var date = new Date(),dataid="";
			    dataid = date.getFullYear().toString() + 
			             date.getMonth().toString() + 
			             date.getDate().toString() + 
			             date.getHours().toString() + 
			             date.getMinutes().toString() + 
			             date.getSeconds().toString() +
			             date.getMilliseconds().toString();
			    return dataid;
			},

			getLong : function(stringDate){
				/*
				stringDate is 2017-1-2
				*/
				var date = new Date(stringDate);
			    return date.getTime();
			},

			getDateFromLong : function(value,format){
				/*
				value is "19794234242" is 时间的毫秒格式
				format is "yyyy-dd-mm hh:mm:ss"
				*/
			    var date = new Date(value);
			    /*return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();*/
			    var result="";
			    if(format==undefined)
			    {
			    	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
			    }
			    else
			    {
			    	result = format;
			    	result = result.replace("yyyy",date.getFullYear());
			    	result = result.replace("mm",date.getMonth()+1);
			    	result = result.replace("dd",date.getDate());
			    	result = result.replace("hh",date.getHours());
			    	result = result.replace("mm",date.getMinutes());
			    	result = result.replace("ss",date.getSeconds());
			    }
			    
			}

		},

		getURLParam : function(key){
	        var search = location.search;
	        search = search.replace("?","");
	        var items = search.split("&");
	        var item,i;
	        for(i=0;i<items.length;i++)
	        {
	            item = items[i].split("=");
	            if(item[0]==key)
	            {
	                return item[1];
	            }
	        }
	        return ""; 
		},

		round : function(value,cn){
			/*
			cn is 保留的小数位数,is number
			*/
			var v = value;
			var i , pow = 1;
			for(i=0;i<cn;i++)
			{
				pow = pow * 10; 
			}
			v = v * pow + 0.5;
			v = parseInt(v);
			return v/pow;
		}
	};

	window.Assister = Assister;
})();

