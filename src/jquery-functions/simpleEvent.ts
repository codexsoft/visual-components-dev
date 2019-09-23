interface JQuery {
    simpleEvent( eventName: string): void;
}

/**
 * trigger a DOM event via script
 * @param {String} eventName a given event to be fired - click,dblclick,mousedown,etc.
 */
$.fn.simpleEvent = function( eventName: string ): void {

    $(this).each( function( index, elem: HTMLElement ){
        le.tools.fireEvent( elem, eventName );
    });

};