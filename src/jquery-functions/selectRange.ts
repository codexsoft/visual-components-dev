interface JQuery {
    selectRange(start: number, end?: number): void;
    selectionStart?: number;
    selectionEnd?: number;
    setSelectionRange?(start: number, end: number): void;
    createTextRange?(): any;
}

/**
 * @param start
 * @param end
 */
$.fn.selectRange = function(start: number, end: number): void {

    if (end === undefined) {
        end = start;
    }

    // @ts-ignore
    this.each(function(this: JQuery) {
        if ('selectionStart' in this) {
            this.selectionStart = start;
            // (<JQuery>this).selectionStart = start;
            // (<JQuery>this).selectionEnd = end;
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