import * as $ from "jquery";
import {fireCustomEvent} from "../shortcut-functions/tools";

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
// $.fn.triggerEvent = function( eventName: string, params: Object = {} ) {
function triggerEvent(this: JQuery, eventName: string, params: Object = {} ) {

    // debugger;
    console.log('$.triggerEvent');

    $(this).each( function( index, elem: HTMLElement ){
        fireCustomEvent( elem, eventName, params );
    });

    return false;

};

export default function() {
    $.fn.triggerEvent = triggerEvent;
}