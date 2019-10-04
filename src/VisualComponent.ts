import * as _ from 'lodash';
import * as $ from 'jquery';
import Components, {VisualComonentIdentificator} from "./Components";
import Detect from "./Detect";
import JsxArray from "./JsxArray";
import VisualComponentDisplayOptionsInterface from "./VisualComponentDisplayOptionsInterface";
import ensure from "./shortcut-functions/ensure";
import Events from "./events/Events";
import ComponentLifecycleEventInterface from "./events/ComponentLifecycleEventInterface";
import {ComponentRenderResultType} from "./types/ComponentRenderResultType";
import NullLogger from "./logger/NullLogger";
import LoggerInterface from "./logger/LoggerInterface";
import {JsxRenderResultType} from "./types/JsxRenderResultType";
import Signal from "./plugin/SignalsPlugin/Signal";

export default abstract class VisualComponent {

    protected logger: LoggerInterface = new NullLogger();

    /**
     * if true, then no DIV.VisualComponent wrapper generated, used for form fields generating
     * @type {boolean}
     */
    protected displayWithoutContainer: boolean = false;

    static LAYOUT_DEFAULT = 'default';

    // private __cachedDetectedClassname: string|null = null;

    protected layout: string = VisualComponent.LAYOUT_DEFAULT;

    /**
     * DOM-элемент, с которым связана модель этого визуального компонента
     */
    private _element: HTMLElement|undefined = undefined;

    /**
     * ID визуального компонента, назначенный в браузере
     */
    protected id: VisualComonentIdentificator;

    private _jsxProvidedAttributes: {} = {};

    /**
     * used while rendering
     */
    private _jsxProvidedChildren: any[] = [];

    constructor( parameters: {
        id?: VisualComonentIdentificator
    } = {} ) {

        this.id = this.getClass()+Components.nextId(); // идентификатор DOM визуального компонента

        let identifier: VisualComonentIdentificator|null = parameters['id'] || null;

        if (identifier) {
            // @ts-ignore
            let $identifier: JQuery = $(identifier);
            if ($identifier.length) {
                this.setElement($identifier.get(0));
            }
        }

        this.logger = Components.logger;

        this.logger.info( 'Сконструирован компонент ' + this.debugName() );
        this._configurate( parameters ); // todo: really needed?
        this.logger.debug( 'Инициализация компонента ' + this.debugName() );
        try {
            this.init(parameters);
        } catch(e) {
            this.logger.error(e.message);
            this.logger.error(e);
        }

    }

    /**
     * Инициализация после конструирования компонента. Вызывается один раз.
     * ВАЖНО! ЭЛЕМЕНТ ЕЩЕ НЕ ОТРИСОВАН! ИЗ INIT К НЕМУ НЕЛЬЗЯ ОБРАЩАТЬСЯ!
     * @param parameters
     */
    protected async init(parameters: Object): Promise<void> {
    }

    /**
     * Поведение по умолчанию - задать значения одноименным свойствам компонента
     * @param parameters
     * @private
     */
    protected _configurate( parameters: Object ) {

        let self: VisualComponent = this;

        let stringified = JSON.stringify(parameters);
        if ( stringified.length <= 200 ) {
            this.logger._minor('configurating '+this.getClass()+' using params: '+stringified);
        } else {
            this.logger._minor('configurating '+this.getClass());
        }

        if (!_.isEmpty(parameters))
            this.logger._minor(parameters);

        _.forEach( parameters, ( value, key ) => {
            // @ts-ignore
            self[key] = value;
        } );

        this.logger._minor(this);

    }


    // noinspection JSUnusedGlobalSymbols
    protected jsxProvidedChildren(): any[] {
        return this._jsxProvidedChildren;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @returns {Object}
     * == this.props...
     */
    protected jsxProvidedAttributes(): Object {
        return this._jsxProvidedAttributes;
    }

    /**
     * назначенный ID при конструировании в le.components
     * @returns {number}
     */
    public getId(): VisualComonentIdentificator {
        return this.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public installAppending( element: Element ): Promise<VisualComponent> {
        return new Promise<VisualComponent>(async (resolve: Function, reject: Function) => {
            await $(element).mountComponent(this, { mode: 'append' });
            resolve(this);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public async installInstead( element: Element ): Promise<VisualComponent> {
        return new Promise<VisualComponent>(async (resolve: Function, reject: Function) => {
            await $(element).mountComponent(this, { mode: 'replace' });
            resolve(this);
        });
    }

    /**
     * Обновление контента СУЩЕСТВУЮШЕГО визуального компонента и его реактивация
     * @param content
     * @param id
     */
    public prerenderedContentUpdate(content: string, id?: string ) {

        this.logger.notice('Обновление контента компонента '+id+' и реактивация!');

        // TODO: replace может разрушить связь с переменными, указывающими на прежний элемент
        this.$element().replaceWith(content);

        // заставляем сработать скрипты инициализации и активации компонентов, которые в контенте
        $(document).triggerEvent('ready');
    }

    // /**
    //  * задать фокусировку keypress на этот компонент
    //  * может все-таки использовать le.keyboard.focusOn?
    //  * А то это жесткая привязка к модулю keypress
    //  */
    // protected setFocus(): void {
    //     Components.keyboard.focusOn(this);
    // }

    // /**
    //  * снять фокусировку keypress с этого компонента
    //  */
    // protected unfocus(): void {
    //     Components.keyboard.unfocus(this);
    // }

    protected killViewport(): void {
        this._element = undefined;
    }

    public setElement(domElement: HTMLElement): this {
        if (_.isElement(domElement)) {
            this._element = domElement;
        }
        return this;
    }

    public getClass(): string {
        // __CLASS__ from typescript-magic-variable-plugin can be used instead
        // if (!this.__cachedDetectedClassname) {
        //     this.__cachedDetectedClassname = Detect.className(this);
        // }

        // return this.__cachedDetectedClassname;
        // console.log('getting class of');
        // console.log(this);
        // console.log('this constructor is');
        // console.log(this.constructor);
        // return Components.findClassNameByClass(this.constructor);
        return Components.findClassNameByComponent(this);
    }

    public class(): string {
        return this.getClass();
    }

    // public static class(): string {
    //     return __CLASS__;
    // }

    protected getCssClass(): string {
        return this.getClass();
    }

    protected getClassStatic() {
        // @ts-ignore
        let staticClass = window[this.getClass()];
        return staticClass ? staticClass : false;
    }

    /**
     * После рендеринга содержимого, нужно повесить на component.Element слушальщики событий,
     * сообщений, сигналов и клавиатурных сочетаний. Кроме того, выполняется пользовательский
     * произвольный код по активации компонента.
     */
    public async __start() {

        this.logger.debug('Старт компонента '+this.debugName());

        Components.dispatcher.dispatchEvent(Events.create<ComponentLifecycleEventInterface>(Events.componentBeforeStart, {
            component: this
        }));

        // executing custom activation code
        this.logger.debug('Активация компонента '+this.debugName());
        await this.activate();

        Components.dispatcher.dispatchEvent(Events.create<ComponentLifecycleEventInterface>(Events.componentAfterStart, {
            component: this
        }));
    }

    /**
     * Останов этого конкретного компонента
     * @private
     */
    public async __stop() {
        this.logger._minor('Деактивация компонента '+this.debugName());

        Components.dispatcher.dispatchEvent(Events.create<ComponentLifecycleEventInterface>(Events.componentBeforeStop, {
            component: this
        }));

        await Components.stopComponentsInNode(this.element());
        this.killViewport();
        await this.deactivate();

        Components.dispatcher.dispatchEvent(Events.create<ComponentLifecycleEventInterface>(Events.componentAfterStop, {
            component: this
        }));
    }

    /**
     * Custom component deactivation code
     */
    protected async deactivate(): Promise<void> {
        // return;
        // return new Promise(async (resolve: Function) => { resolve(); });
    }

    /**
     * Пользовательский код активации компонента после рендеринга содержимого
     * todo:возможно, активацию следует сделать на promise-ах, мало ли
     * If a single argument is
     * passed to jQuery.when() and it is not a Deferred or a Promise, it will be treated as a
     * resolved Deferred and any doneCallbacks attached will be executed immediately. The
     * doneCallbacks are passed the original argument. In this case any failCallbacks you might
     * set are never called since the Deferred is never rejected.
     * http://api.jquery.com/jQuery.when/
     *
     * In the event a Deferred was resolved with no value, the corresponding doneCallback argument
     * will be undefined.
     */
    protected async activate(): Promise<void> {
    }

    /**
     * Вычислить классы всех предков данного класса, начиная от VisualComponent
     * TODO: кроссбраузерно?
     * @param foundAncestors array
     * @returns array
     */
    public getAncestorsClasses(foundAncestors: string[] = []): string[] {

        // @ts-ignore
        if ( !this['__proto__'] || !this['__proto__'].constructor ) {
            return foundAncestors;
        }

        // @ts-ignore
        let proto = this['__proto__'];

        // hack... Работает постольку, поскольку VisualComponent класс без родительского класса
        if (proto.constructor.name === 'Object') {
            return foundAncestors;
        }

        foundAncestors.push(proto.constructor.name);

        return proto.getAncestorsClasses
            ? proto.getAncestorsClasses(foundAncestors)
            : foundAncestors;
    }

    /**
     * Генерация DOM-события
     */
    public trigger(name: string, parameters: Object = {}): VisualComponent {

        if ( !this.$element().length ) {
            this.logger._notice('Failed to trigger event by component '+this.debugName()+': no DOM element tied!');
            return this;
        }

        let msg = 'Component '+this.debugName()+' triggered event '+name;
        msg += (_.isEmpty(parameters) ? ' without parameters' : ' providing parameters:');
        this.logger._minor(msg);

        if (!_.isEmpty(parameters)) {
            this.logger._minor(parameters);
        }

        this.$element().triggerEvent(name, parameters);
        return this;

    }

    /**
     * Для получения сообщений из IFRAME-ов
     * TODO: возможно, актуальна только в контексте всего документа, а не компонента
     */
    protected listenMessages(): Object {
        return {};
    }

    /**
     * При рендеринге может быть использован метод компонента вроде this.layout_default();
     * Эта функция вычисляет имя этого метода на основе названия layout-а
     * @param layoutName
     * @returns {string}
     * @private
     */
    private __layoutMethodName( layoutName: string = '' ): string {
        return 'layout_' + ( layoutName ? layoutName : this.layout );
    }

    /**
     * Проверяет, существует ли функция layout_xxx() в компоненте
     * @param layoutName
     * @returns {boolean}
     */
    private __layoutMethodExists( layoutName: string = '' ): boolean {
        // @ts-ignore
        return !!this[this.__layoutMethodName(layoutName)];
    }

    /**
     * @param newLayout
     */
    async switchLayoutTo(newLayout: string): Promise<void> {
        if ( !this.__layoutMethodExists(newLayout) ) return;
        this.layout = newLayout;
        await this.$element().mountComponent(this);
    }

    public createContainerElement(): HTMLElement {
        let $container = $('<div>');
        this.getAncestorsClasses().forEach(function (ancestorClass: string) {
            $container.addClass(ancestorClass);
        });

        return $container.get(0);
    }

    // noinspection JSMethodCanBeStatic
    private elementIsJsxWrapper(element: Node): element is HTMLElement {
        // @ts-ignore
        return (element.tagName !== undefined) && (_.includes(['COMPONENT'], element.tagName));
    }

    // public async display(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element|Comment> {
    public async display(options: VisualComponentDisplayOptionsInterface = {}): Promise<JsxRenderResultType> {

        this.logger.debug('Displaying '+this.getClass()+' visual component');
        // console.log(this.logger);

        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: ComponentRenderResultType = await this.render(beforeRenderResult);

        // return new Promise<Element|Comment>(async (resolve: Function, reject: Function) => {
        return new Promise<JsxRenderResultType>(async (resolve: Function, reject: Function) => {

            // debugger;
            if (_.isArray(content)) { // JSX array-based render

                let resultElement = await (new JsxArray(content)).toHtml();

                if (this.displayWithoutContainer) {

                    // simple case, used for components like form elements
                    Components.tie(resultElement, this);
                    await this.__start(); // опции?
                    return resolve(resultElement);

                } else {

                    let container = this.createContainerElement();

                    // we must unwrap elements, if they are in container <COMPONENT> (JSX must be just ONE element!)
                    if (this.elementIsJsxWrapper(resultElement) && $(resultElement).contents().length) {
                        // может быть аттрибуты DIV копировать?..

                        // we must also unwrap single child COMPONENT element if it exists (todo: really?)
                        let contents = $(resultElement).contents();
                        if (contents.length === 1) {
                            let firstElement = contents.get(0);
                            if (this.elementIsJsxWrapper(firstElement)) {
                                resultElement = firstElement;
                            }
                        }

                        let attributes = resultElement.attributes;
                        $.each(attributes, function() {
                            if (this.name !== 'class') {
                                $(container).attr(this.name, this.value);
                            } else {
                                $(container).addClass(this.value);
                            }
                        });

                        $(resultElement).contents().each( function() {
                            $(container).append(this);
                        });

                    } else {
                        $(container).append(resultElement);
                    }

                    Components.tie(container, this);
                    await this.__start(); // опции?

                    return resolve(container);
                }


            }

            /**
             * это может быть backend-рендеринг или шаблонный JST-рендер
             * string содержит только внутренний контент
             * что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..
             */
            if (typeof content === 'string') {

                let container = this.createContainerElement();
                $(container).html(content);
                Components.tie(container, this);
                await this.__start();

                resolve(container);
            }

            // это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
            if (_.isElement(content)) {
                this.logger._notice('not implemented!');
            }

            resolve(new Comment);

        });
    }

    private importDisplayVars(options: VisualComponentDisplayOptionsInterface): void {
        this._jsxProvidedChildren = options.providedChildren || [];
        this._jsxProvidedAttributes = options.providedAttributes || {};
    }

    //noinspection JSMethodCanBeStatic
    /**
     * Хорошее место для подготовки всего что нужно для рендера компонента.
     * Вызывается каждый раз перед рендером компонента
     * Promise-совместим!
     * todo: should be protected, but currently used by $.assignComponentToPrerendered
     * @returns {boolean}
     */
    public async beforeRender(): Promise<any> {
        return;
    }

    public abstract async render(params?: {[index: string]: any}): Promise<ComponentRenderResultType>;

    /**
     * Shortcut для доступа к элементу компонента, обернутому в JQuery
     * @returns JQuery
     */
    $element(): JQuery<HTMLElement> {
        if (this._element) {
            return $(this._element);
        }
        throw new Error('No element is tied with VisualComponent');
    }

    /**
     * Shortcut для доступа к элементу компонента
     * @returns {Element}
     */
    element(): Element {
        if (this._element) {
            return this._element;
        }
        throw new Error('No element is tied with VisualComponent');
    }

    /**
     * Shortcut для доступа к элементу компонента (возвращает как HTMLElement)
     * @returns {HTMLElement}
     */
    public htmlElement(): HTMLElement {
        return <HTMLElement>this.element();
    }

    /**
     * just a shortcut
     */
    public findParentComponent(): VisualComponent|null {
        return Components.findParentComponent(this);
    }

    public debugName() {
        return this.getClass()+'('+this.id+')';
    }

    // /**
    //  * События, которые компонент умеет обрабатывать
    //  * Если событие не должно всплывать наверх, в обработчике нужно вернуть false
    //  * По факту, это работает через JQuery.on()
    //  *
    //  * Внутри обработчика можно проверить, произошло ли событие внутри компонента:
    //  * if ( this.eventNotInternal(e ) ) return;
    //  *
    //  * Можно терминировать события, произошедшие в дочерних компонентах (опционально, по умолчанию отключено)
    //  */
    // public listenEvents(): {[index: string]: Function} {
    //     return {};
    // }

    // /**
    //  * Отрисовка компонента через JST-шаблон
    //  * @param layoutName
    //  * @param parameters
    //  * @returns {string}
    //  */
    // protected renderViaClient( layoutName: string = 'default', parameters: Object = {} ): string {
    //     return this.renderJsTemplate(layoutName, parameters);
    // }

    protected async refreshViewport() {
        await this.switchLayoutTo( this.layout );
    }

    protected async reRender(): Promise<void> {
        await this.$element().mountComponent(this, {mode: 'replace'});
    }

    protected exportData() {
        let exportObj: any = {};
        _.forEach( this, ( value, key ) => {

            if (_.includes([
                'id',
                'isSimple',
                '_jsxProvidedChildren',
                '_jsxProvidedAttributes',
                '_element',
                '__cachedDetectedClassname',
                // 'USE_WARE',
                // 'TERMINATE_EVENTS',
                // 'props',
                // 'selfUrl',
                'layout',
            ], key)) return;
            exportObj[key] = value;

        });
        return exportObj;
    }

    // /**
    //  * какие события мыши терминировать по умолчанию в этом компоненте?
    //  * например, DOMEvents.MouseEvent;
    //  * @type {string}
    //  */
    // protected TERMINATE_EVENTS: string = '';

    // public static readonly class: string = __CLASS__;
    // private readonly class: string = __CLASS__;

    // [key: string]: any;

}
