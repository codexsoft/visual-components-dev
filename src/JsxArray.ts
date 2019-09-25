import * as _ from "lodash";
import Detect from "./Detect";
import VisualComponent from "./VisualComponent";
import LoggerInterface from "./LoggerInterface";
import NullLogger from "./NullLogger";

export default class JsxArray {

    private type: any;
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

        this.resolve = function(){};
        this.logger = new NullLogger();
        // this.logger = logger || new NullLogger();

        if ( _.isArray(type) ) {

            let tempParams = _.clone(type);
            if ( _.isArray(tempParams[0]) ) {
                this.type = 'component'; // TEMP!!!
                this.attributes = {};
                this.children = tempParams;
            } else {
                this.type = tempParams.shift();
                this.attributes = tempParams.shift();
                this.children = tempParams;
            }

            return;
        }

        this.attributes = attributes;
        this.children = children;

    }

    public async render(): Promise<HTMLElement> {
        return new Promise<HTMLElement>(async (resolve: Function, reject: Function) => {

            this.resolve = resolve;

            if (_.isUndefined(this.type)) {
                return this.resolve(this.skipTag());
            }

            if (this.type instanceof HTMLElement || this.type instanceof Text) {
                return resolve(this.type);
            }

            if ( _.isString(this.type) ) {
                return await this.renderJsxFromString();
            }

            let initParams = {};
            if ( this.attributes['config'] ) {
                initParams = this.attributes['config'];
                delete this.attributes['config'];
            }

            if (!Detect.isVisualComponent(this.type)) {
                return this.renderJsxFromNotVisualComponent();
            }

            return this.renderJsxFromVisualComponent(initParams);
        });
    }

    private async renderJsxFromString(): Promise<any> {

        // специальные теги

        if ( this.type == 'for' ) {
            return this.renderAsSpecialNodeFor();
        }

        if ( this.type == 'if' ) {
            return this.renderAsSpecialNodeIf();
        }

        if ( this.type == 'switch' ) {
            try {
                this.renderAsSpecialNodeSwitch();
            } catch (e) {
                return this.resolve(this.skipTag());
            }

        }

        // если элемент - обычный тег, то привязывать компонент к нему не надо
        let generatedElement = document.createElement(this.type);
        this.applyAttributesToElement( generatedElement, this.attributes );

        let renderedChildren = await this.renderChildren(this.children);
        _.forEach(renderedChildren, (renderedChild: Element) => {

            if (renderedChild instanceof Text)
                generatedElement.appendChild(renderedChild);
            else if ( renderedChild instanceof Element ) {

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

            return this.resolve(generatedElement);

        });

    }

    private applyAttributesToElement( element: Element, attributes: Object ): void {

        _.forEach( attributes, (value, attribute: string) => {

            if ( _.startsWith(attribute,'on') ) { // а если аттрибут типа onetwo = '123'?
                $(element).off(attribute.substring(2)); // снимаем существующий обработчик, если был
                $(element).on( attribute.substring(2), <EventListener>value );
            } else if ( _.startsWith(attribute,'data-') && _.isObjectLike(value) ) {
                element.setAttribute(attribute, JSON.stringify(value)); // а если еще раз вызвать, перезапишет?
            } else {
                element.setAttribute(attribute, value.toString()); // а если еще раз вызвать, перезапишет?
            }

        });

    }

    private async renderAsSpecialNodeFor() {
        if ( !('each' in this.attributes) ) {
            return this.resolve(this.skipTag('Incorrect "each" attribute in FOREACH statement!'));
        }

        if ( !('do' in this.attributes) ) {
            return this.resolve(this.skipTag('Incorrect "do" attribute in FOREACH statement!'));
        }

        let list = this.attributes['each'];
        let func: Function = this.attributes['do'];
        let result: any[] = [];

        let iterator = 1;
        _.forEach(list, (val, key, arr) => {
            result.push( func(val, key, iterator, arr) );
            iterator++;
        });

        let rendered = await (new JsxArray('component', {}, result)).render();

        return this.resolve(rendered);
    }

    private async renderAsSpecialNodeIf() {
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
    }

    /**
     * @throws Error
     */
    private async renderAsSpecialNodeSwitch() {
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

    private async renderJsxFromNotVisualComponent(): Promise<Node> {

        Promise.all(this.renderChildren(this.children)).then((renderedChildren: Array<Element>) => {

            Promise.all(this.type({
                providedAttributes: this.attributes,
                providedChildren: renderedChildren,
            }).then(async (result: any) => {

                if (_.isArray(result) === false) {
                    return this.resolve( $(result).get(0) );
                }

                let rendered: any = await (new JsxArray(result)).render();

                // вычисляем значение аттрибута CSS-классов
                if (this.attributes['class']) {
                    $(rendered).addClass(this.attributes['class']);
                    delete this.attributes['class'];
                }

                // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                // это и для компонента, и для обычного тега

                this.applyAttributesToElement(rendered, this.attributes);
                return this.resolve(rendered);

                /*
                Promise.all((new JsxArray(result)).render()).then((rendered: any) => {
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
                */

            }));

        });

    }

    /**
     * @param initParams
     */
    private async renderJsxFromVisualComponent(initParams: Object|any): Promise<Node> {
        let generatedComponent: VisualComponent;

        if (typeof this.type === 'function') {
            // @ts-ignore
            generatedComponent = <VisualComponent>new this.type(initParams);
        } else if ((typeof this.type === 'object') && (<{}>this.type instanceof VisualComponent)) {
            // если элемент - уже существующий визуальный компонент
            generatedComponent = this.type;
        } else {
            return this.resolve(this.skipTag('Visual component cannot be rendered: it must me function or object'));
        }

        if (generatedComponent instanceof VisualComponent === false) {
            throw new Error(Detect.className(this.type)+' poor VisualComponent generator/instance!');
        }
        // expect( generatedComponent instanceof VisualComponent, Detect.className(type)+' poor VisualComponent generator/instance!' );

        let renderedChildren: Element[]|{} = await this.renderChildren(this.children);
        let generatedElement = await generatedComponent.display({
            providedAttributes: this.attributes,
            providedChildren: renderedChildren,
            displayWithContainer: false
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

    private renderChildren(children: any[]): Promise<Element[]>|Iterable<Element> {

        let pendingRenderingElements: any[] = [];
        let providedChildren = [];

        _.forEach(children, async childNode => {

            if ( _.isString(childNode) ) {
                pendingRenderingElements.push(document.createTextNode(childNode));
            } else if ( childNode instanceof HTMLElement ) {
                pendingRenderingElements.push(childNode);
            } else if ( _.isArray(childNode) ) {
                // а надо ли нам сразу рендерить вложенные компоненты? Ведь в компонент они будут переданы параметром,
                // и не факт что будут использованы... Ну ладно, пока так

                if (_.isElement(childNode[0])) {
                    _.forEach(childNode, (elem) => {
                        pendingRenderingElements.push(elem);
                    } );
                } else {
                    pendingRenderingElements.push(await (new JsxArray(childNode).render()));
                    // pendingRenderingElements.push(await this.renderJsxArray(childNode));

                }

            } else if (childNode instanceof VisualComponent) {
                pendingRenderingElements.push(await (new JsxArray(childNode).render()));
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
            this.logger.warn(message);
        }

        return new Comment;
    }

}