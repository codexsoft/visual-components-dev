import VisualComponent from "../VisualComponent";
// import * as _ from "lodash";
import Components from "../Components";

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
$.fn.assignComponentToPrerendered = function(this: JQuery, componentModel: VisualComponent|Function, parameters: Object = {} ): JQuery {

    if ( !this.length ) {
        // @ts-ignore
        throw new Error('No elements in a set :'+this.selector);
    }

    let element = this.get(0);

    // if ( _.isFunction( componentModel ) ) {
    if (componentModel instanceof Function) {
    // if (typeof componentModel === 'function') {
        // @ts-ignore
        componentModel = new componentModel(parameters);
    }

    // /** @var componentModel VisualComponent */

    if (!(componentModel instanceof VisualComponent)) {
        throw new Error('Класс '+componentModel+' не является визуальным компонентом!');
    } else {
        Components.tie(element, componentModel);
        componentModel.beforeRender();
        componentModel.__start();
        return $(this);
    }

    // expect( componentModel instanceof VisualComponent, 'Класс '+componentModel+' не является визуальным компонентом!' );


};