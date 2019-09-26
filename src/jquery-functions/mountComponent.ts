import VisualComponent from "../VisualComponent";
import Components from "../Components";

declare global {

    interface JQuery {
        mountComponent(component: VisualComponent, options?: Object ): Promise<Element>;
    }

}

$.fn.mountComponent = async function(this: JQuery, component: VisualComponent, options: {mode: string} = {mode: 'replace'} ): Promise<Element> {

    // noinspection SuspiciousTypeOfGuard
    if (!(component instanceof VisualComponent)) {
        throw new Error('component must be instance of VisualComponent!');
    }

    let originalDomElement = this.get(0);
    let $originalDomElement = this.first();
    let mode = options['mode'];

    switch( mode ) {

        case 'replace':
            Components.stopComponentsInNode( originalDomElement );
            if ( 'model' in originalDomElement ) {
                originalDomElement.model.__stop();
            }
            break;

        case 'into':
            Components.stopComponentsInNode( originalDomElement );
            break;

    }

    return new Promise<Element>(async (resolve: Function, reject: Function) => {

        let rendered = await component.display();

        switch( mode ) {

            case 'append':
                originalDomElement.appendChild(rendered);
                break;

            case 'replace':
                $originalDomElement.empty();
                $originalDomElement.replaceWith(rendered);
                break;

            case 'into':
                $originalDomElement.empty();
                $originalDomElement.html(rendered);
                break;

        }

        resolve(rendered);
    });
};