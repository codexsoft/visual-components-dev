import * as _ from "lodash";
import * as $ from "jquery";
import Detect from "./Detect";
import VisualComponent from "./VisualComponent";
import LoggerInterface from "./LoggerInterface";
import NullLogger from "./NullLogger";
import {JsxRenderResultType} from "./types/JsxRenderResultType";
import ConsoleLogger from "./ConsoleLogger";

export default class JsxArray {

    private tokenType: any;
    private attributes: {
        config?: any,
        class?: any,
        var?: any
    } = {};
    private children: Array<any> = [];

    /**
     * Resolver for render() method
     */
    private resolve: Function;
    private logger: LoggerInterface;

    constructor(type: any, attributes: Object = {}, ...children: Array<any>) {

        // debugger;
        this.resolve = function(){};
        // this.logger = new NullLogger();
        this.logger = new ConsoleLogger();

        // this.logger.info(type);
        // this.logger.info(attributes);
        // this.logger.info(children);

        // this.logger = logger || new NullLogger();

        if ( _.isArray(type) ) {

            let tempParams = _.clone(type);
            if ( _.isArray(tempParams[0]) ) {
                this.tokenType = 'component'; // TEMP!!!
                this.attributes = {};
                // debugger;
                // this.attributes = tempParams[1];
                this.children = tempParams;
            } else {
                // debugger;
                this.tokenType = tempParams.shift();
                this.attributes = tempParams.shift();
                this.children = tempParams;
            }

            this.attributes = this.attributes || {};
            this.children = this.children || [];

            return;
        }

        this.tokenType = type;
        this.attributes = attributes || {};
        this.children = children || [];

    }

    public async render(): Promise<JsxRenderResultType> {
        return new Promise<HTMLElement>(async (resolve: Function, reject: Function) => {

            // debugger;
            this.resolve = resolve;

            if (_.isUndefined(this.tokenType)) {
                return this.resolve(this.skipTag());
            }

            if (this.tokenType instanceof HTMLElement || this.tokenType instanceof Text) {
                return this.resolve(this.tokenType);
                // return resolve(this.tokenType);
            }

            if ( _.isString(this.tokenType) ) {
                // debugger;
                return await this.renderJsxFromString();
            }

            let initParams = {};
            if (this.attributes && this.attributes.config) {
                initParams = this.attributes.config;
                delete this.attributes.config;
            }

            if (!Detect.isVisualComponent(this.tokenType)) {
                return this.renderJsxFromNotVisualComponent();
            }

            return this.renderJsxFromVisualComponent(initParams);
        });
    }

    private async renderJsxFromString(): Promise<any> {

        // специальные теги
        // todo: need to made as components or something pluggable

        if ( this.tokenType == 'for' ) {
            try {
                this.renderAsSpecialNodeFor();
                return;
            } catch (e) {
                this.logger.error('Failed to render FOR tag: '+e.message);
                return this.resolve(this.skipTag());
            }
            // return this.renderAsSpecialNodeFor();
        }

        if ( this.tokenType == 'if' ) {
            try {
                this.prepareRenderAsSpecialNodeIf();
            } catch (e) {
                this.logger.error('Failed to render IF tag: '+e.message);
                return this.resolve(this.skipTag());
            }
            // return this.renderAsSpecialNodeIf();
        }

        if ( this.tokenType == 'switch' ) {
            try {
                this.prepareRenderAsSpecialNodeSwitch();
            } catch (e) {
                this.logger.error('Failed to render SWITCH tag: '+e.message);
                return this.resolve(this.skipTag());
            }

        }

        // если элемент - обычный тег, то привязывать компонент к нему не надо
        // todo: однако бывает что этот тег - "component"
        let generatedElement = document.createElement(this.tokenType);
        // debugger;
        this.applyAttributesToElement(generatedElement, this.attributes);

        let renderedChildren = await this.renderChildren(this.children);
        // _.forEach(renderedChildren, (renderedChild: Element) => {
        renderedChildren.forEach((renderedChild: Element) => {

            if (renderedChild instanceof Text) {
                generatedElement.appendChild(renderedChild);
            } else if ( renderedChild instanceof Element ) {

                switch (renderedChild.tagName) {

                    case 'COMPONENT':
                    case 'FOREACH': // todo: for?
                    case 'SWITCH':
                    case 'DEFAULT':
                    case 'CASE':
                    case 'IF':
                        // todo: for?

                        // debugger;

                        _.forEach($(renderedChild).contents(),(ifChildNode)=>{
                            if ( ifChildNode instanceof Node ) {
                                generatedElement.appendChild(ifChildNode);
                            } else {
                                $(generatedElement).append(ifChildNode);
                            }
                        });

                        break;

                    default:
                        generatedElement.appendChild(renderedChild);
                }

            }

        });

        return this.resolve(generatedElement);

    }

    private applyAttributesToElement(element: Element|CharacterData, attributes: Object): void {

        if (!_.isElement(element)) {
            return;
        }

        _.forEach( attributes, (value, attribute: string) => {

            if ( _.startsWith(attribute,'on') ) { // а если аттрибут типа onetwo = '123'?
                $(element).off(attribute.substring(2)); // снимаем существующий обработчик, если был
                $(element).on( attribute.substring(2), <EventListener>value );
            } else if ( _.startsWith(attribute,'data-') && _.isObjectLike(value) ) {
                (<Element>element).setAttribute(attribute, JSON.stringify(value)); // а если еще раз вызвать, перезапишет?
            } else {
                let stringified: string;
                try {
                    stringified = value.toString();
                } catch (e) {
                    stringified = 'Unable to stringify value of attribute '+attribute;
                }

                (<Element>element).setAttribute(attribute, stringified); // а если еще раз вызвать, перезапишет?
            }

        });

    }

    private async renderAsSpecialNodeFor() {
        // debugger;
        if ( !('each' in this.attributes) ) {
            return this.resolve(this.skipTag('Incorrect "each" attribute in FOREACH statement!'));
        }

        if ( !('do' in this.attributes) ) {
            return this.resolve(this.skipTag('Incorrect "do" attribute in FOREACH statement!'));
        }

        let list: any[] = this.attributes['each'];
        let func: Function = this.attributes['do'];
        let result: any[] = [];

        let iterator = 1;
        list.forEach((val, key, arr) => {
            result.push( func(val, key, iterator, arr) );
            iterator++;
        });

        let rendered = await (new JsxArray('component', {}, result)).render();

        return this.resolve(rendered);
    }

    private async prepareRenderAsSpecialNodeIf() {
        // debugger;

        if ( 'pass' in this.attributes && !this.attributes['pass'] ) {
            return this.resolve(this.skipTag());
        }

        if ( 'not' in this.attributes && !!this.attributes['not'] ) {
            return this.resolve(this.skipTag());
        }

        if ( !('not' in this.attributes || 'pass' in this.attributes) ) {
            return this.resolve(this.skipTag('Incorrect condition in IF statement!'));
        }

        if ( 'then' in this.attributes ) {

            // может быть полезно в тех случаях, когда генерация вложенных компонентов
            // использует какие-то переменные, которые будут неопределены в случае,
            // если условие, определенное в pass/not не сработает

            let thenClosure: Function = this.attributes['then'];
            if (!_.isFunction(thenClosure)) {
                return this.resolve(this.skipTag('Incorrect THEN attribute in IF statement!'));
            }

            let result = thenClosure();

            // let rendered = await this.renderJsxArray('component',{},result);
            let rendered = await (new JsxArray('component', {}, result)).render();

            return this.resolve( rendered );
        }

        // this.resolve(await (new JsxArray('component', {}, this.children)).render());
        // this.resolve(this.renderChildren(this.children))
    }

    /**
     * @throws Error
     */
    private async prepareRenderAsSpecialNodeSwitch() {
        let testingValue = this.attributes['var'];

        let strictMode = false;
        if ( 'strict' in this.attributes ) {
            strictMode = !_.includes(['false',false], this.attributes['strict']);
        }

        let matchedCase = null;
        let defaultCase = null;

        for (let i = 0; i < this.children.length; i++) {

            let caseChild = this.children[i];
            if ( !_.isArray(caseChild) ) {
                continue;
            }

            if ( caseChild[0] === 'default' ) {
                defaultCase = caseChild;
                continue;
            }

            if ( caseChild[0] != 'case' ) {
                continue;
            }

            let childAttributes = caseChild[1];
            if ( !('value' in childAttributes) ) {
                continue;
            }

            if ( ( !strictMode && testingValue == childAttributes['value'] ) || ( strictMode && testingValue === childAttributes['value'] ) ) {
                matchedCase = caseChild;
                break;
            }
        }

        if (matchedCase) {
            this.children = [ matchedCase ];
        } else if ( defaultCase ) {
            this.children = [ defaultCase ];
        } else {
            throw new Error('Switch tag must have at least one child: CASE or DEFAULT');
            // return resolve(this.skipTag());
            // return resolve(new Comment);
        }
    }

    private async renderJsxFromNotVisualComponent(): Promise<Element> {

        return new Promise<Element>(async () => {

            let renderedChildren = await this.renderChildren(this.children);
            let result = this.tokenType({
                providedAttributes: this.attributes,
                providedChildren: renderedChildren,
            });

            if (_.isArray(result) === false) {
                return this.resolve($(result).get(0));
            }

            let rendered = await (new JsxArray(result)).render();

            // вычисляем значение аттрибута CSS-классов
            if (this.attributes['class']) {
                $(rendered).addClass(this.attributes['class']);
                delete this.attributes['class'];
            }

            // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
            // это и для компонента, и для обычного тега

            this.applyAttributesToElement(rendered, this.attributes);
            return this.resolve(rendered);

        });




            /*
            await Promise.all(this.type({
                providedAttributes: this.attributes,
                providedChildren: renderedChildren,
            }).then(async (result: any) => {

                if (_.isArray(result) === false) {
                    return this.resolve($(result).get(0));
                }

                let rendered: HTMLElement = await (new JsxArray(result)).render();

                // вычисляем значение аттрибута CSS-классов
                if (this.attributes['class']) {
                    $(rendered).addClass(this.attributes['class']);
                    delete this.attributes['class'];
                }

                // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                // это и для компонента, и для обычного тега

                this.applyAttributesToElement(rendered, this.attributes);
                return this.resolve(rendered);
            }));

        });

        return Promise.all<Element>(await this.renderChildren(this.children)).then((renderedChildren: Element[]) => {

            Promise.all(this.type({
                providedAttributes: this.attributes,
                providedChildren: renderedChildren,
            }).then(async (result: any) => {

                if (_.isArray(result) === false) {
                    return this.resolve( $(result).get(0) );
                }

                let rendered: HTMLElement = await (new JsxArray(result)).render();

                // вычисляем значение аттрибута CSS-классов
                if (this.attributes['class']) {
                    $(rendered).addClass(this.attributes['class']);
                    delete this.attributes['class'];
                }

                // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                // это и для компонента, и для обычного тега

                this.applyAttributesToElement(rendered, this.attributes);
                return this.resolve(rendered);
            }));

        });
        */
    }

    /**
     * @param initParams
     */
    private async renderJsxFromVisualComponent(initParams: Object|any): Promise<JsxRenderResultType> {
        let generatedComponent: VisualComponent;

        if (typeof this.tokenType === 'function') {
            // @ts-ignore
            generatedComponent = <VisualComponent>new this.tokenType(initParams);
        } else if ((typeof this.tokenType === 'object') && (<{}>this.tokenType instanceof VisualComponent)) {
            // если элемент - уже существующий визуальный компонент
            generatedComponent = this.tokenType;
        } else {
            return this.resolve(this.skipTag('Visual component cannot be rendered: it must me function or object'));
        }

        // noinspection SuspiciousTypeOfGuard,PointlessBooleanExpressionJS
        if (generatedComponent instanceof VisualComponent === false) {
            throw new Error(Detect.className(this.tokenType)+' poor VisualComponent generator/instance!');
        }
        // expect( generatedComponent instanceof VisualComponent, Detect.className(type)+' poor VisualComponent generator/instance!' );

        let renderedChildren: Element[] = await this.renderChildren(this.children);
        let generatedElement = await generatedComponent.display({
            providedAttributes: this.attributes,
            providedChildren: renderedChildren
        });

        // вычисляем значение аттрибута CSS-классов
        if (this.attributes['class']) {
            $(generatedElement).addClass( this.attributes['class'] );
            delete this.attributes['class'];
        }

        // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
        // это и для компонента, и для обычного тега

        this.applyAttributesToElement(generatedElement, this.attributes);

        return this.resolve(generatedElement);
    }

    // private renderChildren(children: any[]): Promise<Element[]>|Iterable<Element> {
    private renderChildren(children: any[]): Promise<Element[]> {

        let pendingRenderingElements: any[] = [];
        let providedChildren = [];

        children.forEach(async childNode => {

            if ( _.isString(childNode) ) {
                pendingRenderingElements.push(document.createTextNode(childNode));
            } else if ( childNode instanceof HTMLElement ) {
                pendingRenderingElements.push(childNode);
            } else if ( _.isArray(childNode) ) {
                // а надо ли нам сразу рендерить вложенные компоненты? Ведь в компонент они будут переданы параметром,
                // и не факт что будут использованы... Ну ладно, пока так

                if (_.isElement(childNode[0])) {
                    childNode.forEach((elem) => {
                        pendingRenderingElements.push(elem);
                    } );
                } else {
                    pendingRenderingElements.push((new JsxArray(childNode).render()));
                    // pendingRenderingElements.push(await this.renderJsxArray(childNode));

                }

            } else if (childNode instanceof VisualComponent) {
                pendingRenderingElements.push((new JsxArray(childNode).render()));
                // pendingRenderingElements.push(await this.renderJsxArray(childNode));
                // pendingRenderingElements.push( jsx(childNode) );
            }

        } );

        return new Promise<Element[]>(async (resolve: Function, reject: Function) => {
            // Promise.all(pendingRenderingElements).then((...generatedChildren) => {
            Promise.all(pendingRenderingElements).then((generatedChildren) => {
                resolve(<Element[]><unknown>generatedChildren);
            });
        });
    }

    private skipTag(message?: string): Node {
        if (message) {
            this.logger._warn(message);
        }

        return new Comment;
    }

}