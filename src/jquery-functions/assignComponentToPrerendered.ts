import VisualComponent from "../VisualComponent";
import * as _ from "lodash";

declare global {

    interface JQuery {
        assignComponentToPrerendered(componentModel: VisualComponent|Function, parameters?: Object): JQuery;
    }

}

/**
 * @WARE
 * @param componentModel
 * @param parameters
 */
$.fn.assignComponentToPrerendered = function(componentModel: VisualComponent|Function, parameters: Object = {} ): JQuery {

    if ( !this.length ) {
        throw new Error('No elements in a set :'+<JQuery<HTMLElement>>this.selector);
    }

    let element = this.get(0);

    // if ( _.isFunction( componentModel ) ) {
    if (typeof componentModel === 'function') {
        componentModel = new componentModel(parameters);
    }

    if (componentModel instanceof VisualComponent === false) {
        throw new Error('Класс '+componentModel+' не является визуальным компонентом!');
    }

    // expect( componentModel instanceof VisualComponent, 'Класс '+componentModel+' не является визуальным компонентом!' );

    le.components.tie(element,componentModel);
    componentModel.beforeRender();
    componentModel.__start();
    return $(this);
};