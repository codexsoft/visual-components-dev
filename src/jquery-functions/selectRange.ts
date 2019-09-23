interface JQuery {
    selectRange(start: bigint, end?): void;
}

$.fn.selectRange = function(start, end): void {
    if(end === undefined) {
        end = start;
    }
    this.each(function() {
        if ('selectionStart' in this) {
            this.selectionStart = start;
            this.selectionEnd = end;
        } else if (this.setSelectionRange) {
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            let range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};