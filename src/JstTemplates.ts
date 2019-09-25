import { TemplateExecutor } from "lodash";
import * as _ from "lodash";
import * as Crypto from "crypto-js";

/**
 * Инструменты компиляции шаблонов
 */
export default class JstTemplates {

    private _cache: {[index:string] : TemplateExecutor} = {};

    private getCached(template: string) {
        if ( this._cache[template] )
            return this._cache[template];
    }

    public render(template: string, thisContext: any, parameters: {[index:string] : any} = {}) {
        let hash: string = Crypto.MD5(template).toString();
        let compiled: TemplateExecutor|undefined = this.getCached(hash);
        if (compiled === undefined) {
            compiled = _.template(template, {variable: 'data'});
            this.cacheTemplate(hash, compiled);
        }

        parameters._this = thisContext;
        return compiled(parameters);
    }

    private templateIsCached(templateId: string): boolean {
        return (this._cache[templateId] !== undefined);
    }

    private cacheTemplate(templateId: string, compiledTemplate: TemplateExecutor): void {
        this._cache[templateId] = compiledTemplate;
    }

}