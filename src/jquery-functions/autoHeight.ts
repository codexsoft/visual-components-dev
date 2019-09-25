interface JQuery {
    autoHeight(): JQuery;
}

$.fn.autoHeight = function(this: JQuery): JQuery {
    $(this).each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    return $(this);
};