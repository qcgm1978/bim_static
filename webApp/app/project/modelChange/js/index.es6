App.Index={


	bindEvent(){

		 $("#projectContainer").on("click",".projectPropetyHeader .item",function(){
		 	var index=$(this).index();
		 	$(this).addClass("selected").siblings().removeClass("selected");
		 	$(this).closest(".designPropetyBox").find(".projectPropetyContainer div").eq(index).show().siblings().hide();
		 });
	},

	init(){ 
		this.bindEvent();
	}
}