interface JQuery {
    scrollToTop(): void;
}

/**
 * Довольно специфичный хардкод. Использовался в avarkom.center
 */
$.fn.scrollToTop = function(){

    $(this).hide().removeAttr("href");
    if( $(window).scrollTop() != 0 ){
        $(this).fadeIn("slow");
    }
    let scrollDiv=$(this);

    // скроллинг, который кнопку делает видимой или невидимой
    $(window).scroll(function(){
        if( $(window).scrollTop() == 0 ){
            $(scrollDiv).fadeOut("slow")
        }else{
            $(scrollDiv).fadeIn("slow")
        }
    });

    // нажатие на кнопку наверх
    $(this).click(function(){
        $("html, body").animate({scrollTop:0},"slow");
    });

};