import VisualComponent from "./VisualComponent";
import * as _ from "lodash";

export default class Detect {

    static isVisualComponentConstructor(smth: any): boolean {

        if (typeof smth === 'function') {
            try {
                smth = new smth;
            } catch ( e ) {
                return false;
            }
        }

        return true;
    }

    static isVisualComponent(smth: ObjectConstructor|VisualComponent): smth is VisualComponent {

        if (typeof smth === 'function' && smth.constructor !== undefined) {
            try {
                smth = <VisualComponent>(new smth);
            } catch ( e ) {
                return false;
            }
        }

        return smth instanceof VisualComponent;
    }

    static className(inputClass:Object|Function):string {

        // debugger;

        let functionText: string;

        if ( _.isFunction(inputClass) ) {
            functionText = (<any> inputClass).toString();
        } else if ( _.isObject(inputClass) ) {
            functionText = (<any> inputClass).constructor.toString();
        } else {
            return '_unknown_';
        }

        let funcNameRegex = /function (\w+)\(.*/;
        let results = (funcNameRegex).exec(functionText);
        return (results && results.length > 1) ? results[1] : '_unknown_';

    }

    /**
     * @deprecated - не факт что с неймспейсами работать сможет
     * @param className
     * @returns {boolean}
     */
    static classExists( className: string ) {
        // @ts-ignore
        return ( window[className] != undefined && window[className] != 'undefined' && window[className] != false );
    }

}