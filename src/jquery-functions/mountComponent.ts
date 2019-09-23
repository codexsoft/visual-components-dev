import VisualComponent from "../VisualComponent";

declare global {

    interface JQuery {
        mountComponent(component: VisualComponent, options?: Object ): Promise<Element>;
    }

}

$.fn.mountComponent = async function( component: VisualComponent, options: {mode: string} = {mode: 'replace'} ): Promise<Element> {

    if (component instanceof VisualComponent === false) {
        throw new Error('component must be instance of VisualComponent!');
    }

    let originalDomElement = this.get(0);
    let $originalDomElement = this.first();
    let mode = options['mode'];

    switch( mode ) {

        case 'replace':
            le.components.stopComponentsInNode( originalDomElement );
            if ( 'model' in originalDomElement ) {
                originalDomElement.model.__stop();
            }
            break;

        case 'into':
            le.components.stopComponentsInNode( originalDomElement );
            break;

    }

    return new Promise<Element>(async (resolve, reject) => {

        let rendered = await component.display();

        switch( mode ) {

            case 'append':
                originalDomElement.appendChild( rendered );
                break;

            case 'replace':
                $originalDomElement.empty();
                $originalDomElement.replaceWith( rendered );
                break;

            case 'into':
                $originalDomElement.empty();
                $originalDomElement.html( rendered );
                break;

        }

        resolve( rendered );
    });
};