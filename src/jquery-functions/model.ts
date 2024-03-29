import VisualComponent from "../VisualComponent";
import * as _ from "lodash";

declare global {

    interface Element {
        model: VisualComponent;
    }

    interface HTMLElement {
        // fireEvent: any; // IE
        model: VisualComponent;
    }

    interface JQuery {
        // fireEvent: any; // IE
        // model: VisualComponent;
        model(): VisualComponent;
    }

}

/**
 * Доступ к модели визуального компонента через элемент
 * @returns {(()=>VisualComponent)|VisualComponent}
 */
$.fn.model = function(this: JQuery): VisualComponent {

    // let dummyComponent = new DummyVisualComponent;

    if ( !this.length ) {
        throw new Error('Empty JQuery set while accessing to component model');
        // le.console.error('Empty JQuery set while accessing to component model');
        // return new DummyVisualComponent;
    }

    let _self = this.get(0);

    if ( !('model' in _self) || _.isUndefined(_self.model) ) {
        throw new Error('Failed accessing to component model');
        // debugger;
        // le.console.error('Failed accessing to component model');
        // return new DummyVisualComponent;
    }

    return _self.model;
};