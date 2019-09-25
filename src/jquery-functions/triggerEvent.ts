import Tools from "../Tools";

declare global {
    interface JQuery{
        triggerEvent(eventName: string, params?: Object ): boolean;
    }
}

/**
 * trigger a DOM event via script
 * @param {String} eventName a given event to be fired - click,dblclick,mousedown,etc.
 * @param params
 */
$.fn.triggerEvent = function( eventName: string, params: Object = {} ) {

    // debugger;

    $(this).each( function( index, elem: HTMLElement ){
        Tools.fireCustomEvent( elem, eventName, params );
    });

    return false;

};