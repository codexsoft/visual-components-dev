import LoggerInterface from "./LoggerInterface";
import Signal from './Signal';
import * as _ from 'lodash';
import * as $ from 'jquery';
import NullLogger from "./NullLogger";
import Components from "./Components";
import Detect from "./Detect";
import JsxArray from "./JsxArray";
import VisualComponentDisplayOptionsInterface from "./VisualComponentDisplayOptionsInterface";
import expect from "./shortcut-functions/expect";
import Events from "./events/Events";
import ComponentStartedEventInterface from "./events/ComponentStartedEventInterface";
import {RenderResultType} from "./types/RenderResultType";

export default abstract class VisualComponent {

    // public static readonly class: string = __CLASS__;
    // private readonly class: string = __CLASS__;

    [key: string]: any;

    protected logger: LoggerInterface = new NullLogger();

    /**
     * if true, then no DIV.VisualComponent wrapper generated, used for form fields generating
     * @type {boolean}
     */
    protected displayWithoutContainer: boolean = false;

    static LAYOUT_DEFAULT = 'default';

    private __cachedDetectedClassname: string|null = null;

    protected layout: string = VisualComponent.LAYOUT_DEFAULT;

    /**
     * DOM-элемент, с которым связана модель этого визуального компонента
     */
    private _element: HTMLElement|undefined = undefined;

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, DOMEvents.MouseEvent;
     * @type {string}
     */
    protected TERMINATE_EVENTS: string = '';

    /**
     * ID визуального компонента, назначенный в браузере
     */
    protected id: number;

    private _jsxProvidedAttributes: {} = {};

    /**
     * used while rendering
     */
    private _jsxProvidedChildren: any[] = [];

    constructor( parameters: {
        id?: number
    } = {} ) {

        this.id = Components.nextId(); // идентификатор DOM визуального компонента

        let identifier: number|null = parameters['id'] || null;

        if (identifier) {
            // @ts-ignore
            let $identifier: JQuery = $(identifier);
            if ($identifier.length) {
                this.setElement($identifier.get(0));
            }
        }

        this.logger._log( 'Сконструирован компонент ' + this.debugName() );
        this._configurate( parameters );
        this.logger._minor( 'Инициализация компонента ' + this.debugName() );
        this.init( parameters );

    }

    /**
     * Инициализация после конструирования компонента. Вызывается один раз.
     * @param parameters
     */
    protected init( parameters: Object ) {
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
                    'TERMINATE_EVENTS',
                    // 'props',
                    // 'selfUrl',
                    'layout',
                ], key)) return;
            exportObj[key] = value;

        });
        return exportObj;
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


    protected jsxProvidedChildren(): any[] {
        return this._jsxProvidedChildren;
    }

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
    public getId(): number {
        return <number>this.id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public installAppending( element: Element ): Promise<VisualComponent> {
        let self: VisualComponent = this;
        return new Promise<VisualComponent>(async function(resolve: Function, reject: Function) {
            await $(element).mountComponent(self, { mode: 'append' });
            resolve(self);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public async installInstead( element: Element ): Promise<VisualComponent> {

        let self: VisualComponent = this;
        // let def = $.Deferred();
        return new Promise<VisualComponent>(async function(resolve: Function, reject: Function) {
            await $(element).mountComponent(self, { mode: 'replace' });
            resolve(self);
        });

        // $(element).mountComponent( this, { mode: 'replace' } ).done( () => {
        //     def.resolve( this );
        // } );

        // return <Promise<VisualComponent>> def.promise();

    }



    /**
     * Обновление контента СУЩЕСТВУЮШЕГО визуального компонента и его реактивация
     * @param content
     * @param id
     */
    public prerenderedContentUpdate(content: string, id?: string ) {

        this.logger._major('Обновление контента компонента '+id+' и реактивация!');

        // TODO: replace может разрушить связь с переменными, указывающими на прежний элемент
        this.$element().replaceWith(content);

        // заставляем сработать скрипты инициализации и активации компонентов, которые в контенте
        $(document).triggerEvent('ready');
    }

    /**
     * задать фокусировку keypress на этот компонент
     * может все-таки использовать le.keyboard.focusOn?
     * А то это жесткая привязка к модулю keypress
     */
    protected setFocus(): void {
        Components.keyboard.focusOn(this);
    }

    /**
     * снять фокусировку keypress с этого компонента
     */
    protected unfocus(): void {
        Components.keyboard.unfocus(this);
    }

    protected killViewport(): void {
        this._element = undefined;
    }

    public setElement(domElement: HTMLElement): void {
        if (_.isElement(domElement)) {
            this._element = domElement;
        }
    }

    public getClass(): string {
        // __CLASS__ from typescript-magic-variable-plugin can be used instead
        if (!this.__cachedDetectedClassname) {
            this.__cachedDetectedClassname = Detect.className(this);
        }

        return this.__cachedDetectedClassname;
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

    /*
    private __startListenEvents() {

        return;

        if (this.TERMINATE_EVENTS) {

            this.logger._minor( '[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.' );
            this.$element().on( this.TERMINATE_EVENTS, ( e: Event ) => {

                if (!_.includes(['mousemove','mouseover','mouseout','mouseleave','mouseenter','mouseup','mousedown'], e.type)) {
                    this.logger._minor('Event '+e.type+' terminated in '+this.getClass());
                }

                e.stopPropagation();

            } );

        }

        let eventHandlers = this.listenEvents();
        if (_.isEmpty( eventHandlers)) {
            return;
        }

        $.each(eventHandlers, (eventName: string, handler: Function) => {
            this.logger._minor( '[ BIND EVENTS ] Регистрация обработчика события: ' + eventName );
            this.$element().off(eventName); // снимаем существующий обработчик, если был
            // @ts-ignore
            this.$element().on(eventName, handler);
        } );

    }
    */

    /**
     * После рендеринга содержимого, нужно повесить на component.Element слушальщики событий,
     * сообщений, сигналов и клавиатурных сочетаний. Кроме того, выполняется пользовательский
     * произвольный код по активации компонента.
     */
    public async __start() {
        // Components.dispatcher.dispatchEvent(new Event('visualComponent.started'));
        // Components.dispatcher.dispatchEvent(new ComponentStartedEvent(this.id, this.listenKeyboard(), this));

        // Components.dispatcher.dispatchEvent(new CustomEvent(Events.componentStarted, {
        //     detail: {
        //         componentId: this.id,
        //         listenCombos: this.listenKeyboard(),
        //         component: this
        //     }
        // }));

        Components.dispatcher.dispatchEvent(Events.create<ComponentStartedEventInterface>(Events.componentStarted, {
            componentId: this.id,
            listenCombos: this.listenKeyboard(),
            component: this
        }));

        // this.id, this.listenKeyboard(), this));
        // this.__startListenEvents();
        this.logger._minor('Активация компонента '+this.debugName());
        // Components.keyboard.registerCombos(this.id, this.listenKeyboard());

        // executing custom activation code
        await this.activateAsync();
        this.activate();
    }

    /**
     * Останов этого конкретного компонента
     * @private
     */
    public async __stop() {
        this.logger._minor('Деактивация компонента '+this.debugName());

        Components.stopComponentsInNode(this.element());
        // todo: fire event, keyboard must be pluggable!
        Components.keyboard.unregisterCombosForComponent(this.id);

        this.killViewport();

        // executing custom deactivation code
        await this.deactivateAsync();
        this.deactivate();
    }

    protected deactivate() {
    }

    protected async deactivateAsync(): Promise<void> {
        return new Promise(async (resolve: Function) => { resolve(); });
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
    protected async activateAsync(): Promise<void> {
        return new Promise(async (resolve: Function) => { resolve(); });
    }

    protected activate(): void {
    }

    /**
     * Вычислить классы всех предков данного класса, начиная от VisualComponent
     * TODO: кроссбраузерно?
     * @param foundAncestors array
     * @returns array
     */
    public getAncestors(foundAncestors: string[] = []) {

        if ( !this['__proto__'] || !this['__proto__'].constructor ) {
            return foundAncestors;
        }

        let proto = this['__proto__'];

        // hack... Работает постольку, поскольку VisualComponent класс без родительского класса
        if (proto.constructor.name === 'Object') {
            return foundAncestors;
        }

        foundAncestors.push(proto.constructor.name);

        return proto.getAncestors
            ? proto.getAncestors(foundAncestors)
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
     * Привязка обработчиков клавиатурных сочетаний keypress
     */
    listenKeyboard(): Object {
        return {};
    }

    /**
     * Для получения сообщений из IFRAME-ов
     * TODO: возможно, актуальна только в контексте всего документа, а не компонента
     */
    protected listenMessages(): Object {
        return {};
    }

    /**
     * Скомпилировать JST-шаблон
     * TODO: а не следует ли возвращать HTMLElement?
     * @returns {string}
     */
    protected renderJsTemplate( templateName: string, parameters: Object = {} ): string {
        let templateId = 'template_jst_'+this.getClass()+'_'+templateName;
        let templateString = $('#'+templateId).html();

        return Components.jstTemplates.render(templateString, this, parameters);
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
        return !!this[this.__layoutMethodName(layoutName)];
    }

    /**
     * @param newLayout
     */
    switchLayoutTo(newLayout: string): void {
        if ( !this.__layoutMethodExists(newLayout) ) return;
        this.layout = newLayout;
        this.$element().mountComponent(this);
    }

    public createContainerElement(): HTMLElement {
        let $container = $('<div>');
        this.getAncestors().forEach(function (ancestorClass: string) {
            $container.addClass(ancestorClass);
        });

        return $container.get(0);
    }

    // noinspection JSMethodCanBeStatic
    private elementIsJsxWrapper(element: Node): boolean {
        // @ts-ignore
        return (element.tagName !== undefined) && (_.includes(['COMPONENT'], element.tagName));
    }

    public async display(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element|Comment> {

        this.logger.debug('Displaying '+this.getClass()+' visual component');
        console.log('Displaying '+this.getClass()+' visual component');
        console.log(this.logger);

        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: any[]|string = await this.render(beforeRenderResult);

        return new Promise<Element|Comment>(async (resolve: Function, reject: Function) => {

            if (_.isArray(content)) { // JSX array-based render

                let resultElement = await (new JsxArray(<any[]>content)).render();

                if (this.displayWithoutContainer) {
                    // simple case, used for components like form elements
                    Components.tie(resultElement, this);
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
                                resultElement = <HTMLElement>firstElement;
                            }
                        }

                        $(resultElement).contents().each( function() {
                            $(container).append(this);
                        });

                    } else {
                        $(container).append(resultElement);
                    }

                    Components.tie( container, this );
                    await this.__start(); // опции?

                    resolve( container );

                }

                return;
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
    public beforeRender(): any {
        return;
    }

    public abstract render(params?: {[index: string]: any}): Promise<any[]|string>|any[]|string;
    /*
    public render(params?: {[index: string]: any}): Promise<any[]|string>|any[]|string {
        // by default, rendering via backend...
        return this.renderViaBackend();
    }
    */

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

    public findParentComponent(): VisualComponent|null {

        let $self = this.$element();

        let $parentComponent = $self.parent().closest( '.VisualComponent' );
        return $parentComponent.length ? $parentComponent.get(0).model : null;

    }

    public debugName() {
        return this.getClass() + '('+this.id+')';
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

    /**
     * Отправить сигнал на обработку вышестоящим визуальным компонентам
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     */
    public _signalBubble( signal: Signal ) {

        this.logger._minor( 'Всплытие сигнала вверх...' );

        let parentModel = Components.findParentComponent(this);

        try {
            expect(parentModel, 'Родительский компонент не обнаружен!');
        } catch ( e ) {
            this.logger._error( e.message );
            return;
        }

        if (parentModel instanceof VisualComponent) {
            parentModel._signalHandle( signal );
        }
    }

    /**
     * Отрисовка компонента через JST-шаблон
     * @param layoutName
     * @param parameters
     * @returns {string}
     */
    protected renderViaClient( layoutName: string = 'default', parameters: Object = {} ): string {
        return this.renderJsTemplate(layoutName, parameters);
    }

    protected refreshViewport() {
        this.switchLayoutTo( this.layout );
    }

    protected reRender() {
        this.$element().mountComponent(this, {mode: 'replace'});
    }

    protected signalCustomHandler(s: Signal): boolean|null {
        return null;
    }

    protected _signalHandleHook(signal: Signal) {

    }

    /**
     * Обработать сигнал
     */
    protected _signalHandle(signal: Signal): void {

        signal.trip.push(this);
        let continueBubbling = true; // bubbling by default!
        // let handlerMethodName: string = 'on_' + signal.name;

        // if (this[handlerMethodName]) {
        //
        //     this.logger.info('Handling signal in component ' + this.debugName() + ' via method ' + handlerMethodName );
        //     continueBubbling = this[handlerMethodName](signal); // will be undefined by default!
        //
        // } else if ( this.listenSignals()[signal.name] ) {
        if ( this.listenSignals()[signal.name] ) {

            // TODO: call trigger callback?
            this._signalHandleHook(signal);
            continueBubbling = this.listenSignals()[signal.name].call(this, signal);

        } else {

            this.logger._minor( 'Handling signal by customSignalHandler in ' + this.debugName() );
            let customResult = this.signalCustomHandler(signal);
            if (customResult !== null) {
                continueBubbling = customResult;
            } else {
                this.logger._minor('Signal handler not set in '+this.debugName());
            }
        }

        if ( continueBubbling ) {
            this._signalBubble( signal );
        } else {
            this.logger._minor( 'Signal '+signal.name+' bubbling stopped!' );
        }

    }

    /**
     * Сгенерировать сигнал
     * TODO: может сделать третий параметр callback - чтобы вызывать его
     * когда сигнал будет обработан?
     * @param name
     * @param data
     */
    protected signal(name: string, data: Object = {}): boolean {

        let signal = new Signal(name, this);
        signal.data = data;
        this.logger._log( 'Signal "' + name + '" '+JSON.stringify(data)+' fired in '+this.debugName()+'!' );

        this._signalHandle( signal );

        // для удобства в использовании при конвертации события в сигнал и прекращения обработки события
        return false;
    }

    /**
     * Сигналы, которые умеет обрабатывать компонент
     * @public
     */
    protected listenSignals(): {[index: string]: Function} {
        return {};
    };

}
