import VisualComponent from "./VisualComponent";
import * as _ from "lodash";

export default class Detect {

    static isVisualComponent(smth: any) {

        // if (_.isFunction(smth)) {
        if (typeof smth === 'function') {
            try {
                smth = new smth;
            } catch ( e ) {
                return false;
            }
        }

        if ( !_.isFunction(smth) && _.isObject(smth) && smth instanceof VisualComponent )
            return true;

    }

    static className(inputClass:Object|Function):string {

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
        return ( window[className] != undefined && window[className] != 'undefined' && window[className] != false );
    }

}