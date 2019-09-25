import LoggerInterface from "./LoggerInterface";
import Signal from './Signal';
import * as _ from 'lodash';
import * as $ from 'jquery';
import NullLogger from "./NullLogger";
import ModalComponentInterface from "./ModalComponentInterface";
import OpenModalOptionsInterface from "./OpenModalOptionsInterface";
import Components from "./Components";
import Common__Modal__Blurred from "./components/Common__Modal__Blurred";
import Common__Modal from "./components/Common__Modal";
import Common__Dialog__Confirm from "./components/Common__Dialog__Confirm";
import Detect from "./Detect";
import JsxArray from "./JsxArray";
import VisualComponentDisplayOptionsInterface from "./VisualComponentDisplayOptionsInterface";
import expect from "./shortcut-functions/expect";

export default abstract class VisualComponent {

    [key: string]: any;

    protected logger: LoggerInterface = new NullLogger();

    protected props: {
        config?: Object;
    };

    /**
     * if true, then no DIV.VisualComponent wrapper generated, used for form fields generating
     * @type {boolean}
     */
    protected isSimple: boolean = false;

    static LAYOUT_DEFAULT = 'default';
    protected _path: string;
    protected USE_WARE = false;

    private __cachedDetectedClassname: string = null;

    protected layout: string = VisualComponent.LAYOUT_DEFAULT;

    /**
     * DOM-элемент, с которым связана модель этого визуального компонента
     */
    private _element: Element|undefined = undefined;

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, le.components.DOMEvents.MouseEvent;
     * @type {string}
     */
    protected TERMINATE_EVENTS: string = '';

    /**
     * ID визуального компонента, назначенный в браузере
     */
    protected id: number;

    protected selfUrl: string = '';

    private _jsxProvidedAttributes: Object = {};

    /**
     * used while rendering
     */
    private _jsxProvidedChildren: Array<any>;

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

        this.logger.log( 'Сконструирован компонент ' + this.debugName() );
        this._configurate( parameters );
        this.logger.minor( 'Инициализация компонента ' + this.debugName() );
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
                    'USE_WARE',
                    'TERMINATE_EVENTS',
                    'props',
                    'selfUrl',
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
            this.logger.minor('configurating '+this.getClass()+' using params: '+stringified);
        } else {
            this.logger.minor('configurating '+this.getClass());
        }

        if (!_.isEmpty(parameters))
            this.logger.minor(parameters);

        _.forEach( parameters, ( value, key ) => {
            // @ts-ignore
            self[key] = value;
        } );

        this.logger.minor(this);

    }


    protected jsxProvidedChildren(): Array<any> {
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
     * Получить URL к изображению
     * @param image
     * @returns {string}
     */
    protected imageUrl( image: string ): string {
        return this.backendUrl()+'images/'+image;
    }

    /**
     * experimental! TODO: write code
     * @param signalName
     * @param callback
     * @returns {VisualComponent}
     * @deprecated
     */
    protected onSignal( signalName: string, callback: Function ) {
        return this;
    }

    /**
     * experimental! TODO: write code
     * @param eventName
     * @param callback
     * @deprecated
     * @returns {VisualComponent}
     */
    protected onEvent( eventName: string, callback: Function ) {
        return this;
    }

    /**
     * experimental! TODO: write code
     * @param combo
     * @param callback
     * @returns {VisualComponent}
     * @deprecated
     */
    protected onKey( combo: string, callback: Function ) {
        return this;
    }

    protected interact( component: VisualComponent, title: string = '' ): Promise<any> {
        let process = $.Deferred();
        this.openModal({
            title: title,
            content: component,
            terminators: {
                // целевое событие - сигнал done
                done: (s: Signal) => {
                    return process.resolve( s.data );
                },
            },
            signals: {
                // при отмене (закрытие диалогового окна) формируем reject
                cancelled: (s: Signal) => {
                    return process.reject( s.data );
                },
            }
        });
        return process.promise();
    }

    /**
     * Открыть модальное окно, назначив родительским этот компонент
     * @param options
     */
    protected openModal(options: OpenModalOptionsInterface): ModalComponentInterface {

        // debugger;
        let modalComponent = options.modalComponent || new Common__Modal__Blurred;

        if (typeof options.title !== "undefined" && typeof modalComponent.setTitle !== "undefined") {
            modalComponent['setTitle'](options.title);
        }

        let subComponent = options.content;
        let signalHandlers = options.signals || {};
        let signalTerminators: {} = options.terminators || {};

        let handlers = _.merge(signalHandlers, signalTerminators);

        modalComponent
            .setParentComponent(this)
            .setComponent( subComponent )
            .fire(handlers, <[]>_.keys(signalTerminators));

        return modalComponent;

    }

    /**
     * Может терминирующие сигналы просто перечислять?
     * @param modalComponent
     * @param subComponent
     * @param signalHandlers
     * @deprecated
     */
    protected modal(modalComponent: Common__Modal, subComponent: VisualComponent, signalHandlers: Object = {} ) {

        modalComponent
            .setParentComponent(this)
            .setComponent( subComponent )
            .fire( signalHandlers );

    }

    /**
     * TODO: Подобные вещи подключаемыми делать следует!.. Но как это в TS делается?
     * todo: возможно, класс компонента-подтверждения следует сделать настраиваемым
     * @param text
     * @param handlers
     */
    protected confirm( text: string, handlers: Object|any) {

        // if ( typeof window.Common__Dialog__Confirm === 'undefined' ) {
        //     this.logger.error('Common__Dialog__Confirm VisualComponent not found!!!');
        //     return;
        // }

        this.openModal({

            title: 'Требуется подтверждение',

            content: (new Common__Dialog__Confirm)
                .setDefault(false)
                .setText(text),

            terminators: {
                yes: ( s: Signal ) => handlers.yes ? handlers.yes : () => {},
                no: ( s: Signal ) => handlers.no ? handlers.no : () => {},
            }

        });

    }

    /**
     * Обновление контента СУЩЕСТВУЮШЕГО визуального компонента и его реактивация
     * @param content
     * @param id
     */
    public prerenderedContentUpdate(content: string, id?: string ) {

        this.logger.major('Обновление контента компонента '+id+' и реактивация!');

        // TODO: replace может разрушить связь с переменными, указывающими на прежний элемент
        this.$element().replaceWith( content );

        // заставляем сработать скрипты инициализации и активации компонентов, которые в контенте
        $(document).triggerEvent('ready');

    }

    protected url(): string {
        return le.ware.settings.urlToRoot + this.selfUrl;
    }

    /**
     * задать фокусировку keypress на этот компонент
     * может все-таки использовать le.keyboard.focusOn?
     * А то это жесткая привязка к модулю keypress
     */
    protected setFocus(): void {
        Components.keyboard.focusOn( this );
    }

    /**
     * снять фокусировку keypress с этого компонента
     */
    protected unfocus(): void {
        Components.keyboard.unfocus( this );
    }

    protected killViewport(): void {
        this._element = undefined;
    }

    public setElement( domElement: Element ): void {
        if ( _.isElement( domElement ) ) {
            this._element = domElement;
        }
    }

    protected getClass(): string {

        if ( !this.__cachedDetectedClassname )
            this.__cachedDetectedClassname = Detect.className(this);

        return this.__cachedDetectedClassname;
    }

    public getClassPublic(): string {
        return this.getClass();
    }

    protected getCssClass(): string {
        return this.getClass();
    }

    protected getClassStatic() {
        // @ts-ignore
        let staticClass = window[this.getClass()];
        return staticClass ? staticClass : false;
    }

    /**
     * @WARE!
     * @returns {string}
     */
    protected backendUrl() {
        return le.ware.settings.urlToRoot+'src/components/'+this.getClass()+'/';
    }

    protected cssUrl(fileName: string): string {
        return 'url("' + this.backendUrl() + fileName + '")';
    }

    private __startListenEvents() {

        if ( this.TERMINATE_EVENTS ) {

            this.logger.minor( '[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.' );
            this.$element().on( this.TERMINATE_EVENTS, ( e: Event ) => {

                if (!_.includes(['mousemove','mouseover','mouseout','mouseleave','mouseenter','mouseup','mousedown'], e.type)) {
                    this.logger.minor('Event '+e.type+' terminated in '+this.getClass());
                }

                e.stopPropagation();

            } );

        }

        let eventHandlers = this.listenEvents();
        if ( _.isEmpty( eventHandlers ) ) return;

        $.each( eventHandlers, ( eventName, handler ) => {
            this.logger.minor( '[ BIND EVENTS ] Регистрация обработчика события: ' + eventName );
            this.$element().off(eventName); // снимаем существующий обработчик, если был
            this.$element().on( eventName, handler );
        } );

    }

    /**
     * После рендеринга содержимого, нужно повесить на component.Element слушальщики событий,
     * сообщений, сигналов и клавиатурных сочетаний. Кроме того, выполняется пользовательский
     * произвольный код по активации компонента.
     */
    public __start() {
        this.__startListenEvents();
        this.logger.minor('Активация компонента '+this.debugName());
        Components.keyboard.registerCombos( this.id, this.listenKeyboard() );
        this.activate(); // TODO: сделать на promise-ах
    }

    /**
     * Останов этого конкретного компонента
     * @private
     */
    public __stop() {
        this.logger.minor('Деактивация компонента '+this.debugName());
        // todo: fire event, keyboard must be pluggable!
        Components.keyboard.unregisterCombosForComponent(this.id);
        this.deactivate();
    }

    protected deactivate() {
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
    protected activate() {
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
            this.logger.notice('Failed to trigger event by component '+this.debugName()+': no DOM element tied!');
            return this;
        }

        let msg = 'Component '+this.debugName()+' triggered event '+name;
        msg += (_.isEmpty(parameters) ? ' without parameters' : ' providing parameters:');
        this.logger.minor(msg);

        if (!_.isEmpty(parameters)) {
            this.logger.minor(parameters);
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

    public createContainer(): HTMLElement {

        let $container = $('<div>');
        this.getAncestors().forEach(function (ancestorClass: string) {
            $container.addClass(ancestorClass);
        } );

        // if ( this['rtid'] ) {
        //     $container.attr('id',this['rtid']);
        // }

        return $container.get(0);

    }

    public async displaySimple(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element> {

        this.logger.notice('displaying simple...');
        // this._jsxProvidedChildren = options.providedChildren || [];
        // this.props = this._jsxProvidedAttributes = options.providedAttributes || {};

        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: any = await this.render(beforeRenderResult);

        return new Promise((resolve: Function, reject: Function) => {

            if (_.isElement(content)) {

                // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                this.logger.notice('not implemented!');

            } else if (_.isArray(content)) { // JSX array-based render

                let resultElement: Element = await (new JsxArray(content)).render();
                Components.tie( resultElement, this );
                this.activate();
                resolve(resultElement);

            } else if ( _.isString( content ) ) {

                this.logger.notice('content cannot be string!');

                // это может быть backend-рендеринг или шаблонный JST-рендер
                // string содержит только внутренний контент
                // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..
                resolve(new Comment);
            }

        });

    }

    private importDisplayVars(options: VisualComponentDisplayOptionsInterface): void {
        this._jsxProvidedChildren = options.providedChildren || [];
        this.props = this._jsxProvidedAttributes = options.providedAttributes || {};
    }

    /**
     * Deferred-Полифил для разных способов рендеринга визуального компонента
     */
    public async display(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element> {

        if ( this.isSimple ) {
            return this.displaySimple(options);
        }

        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: any = await this.render(beforeRenderResult);

        return new Promise((resolve: Function, reject: Function) => {
            if ( _.isElement( content ) ) {

                // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                this.logger.notice('not implemented!');

            } else if ( _.isArray( content ) ) { // JSX array-based render

                let resultElement: Element = await (new JsxArray(content)).render();
                let container = this.createContainer();
                if ( _.includes(['COMPONENT'], resultElement.tagName) && $(resultElement).contents().length) {
                    // может быть аттрибуты DIV копировать?..

                    let contents = $(resultElement).contents();
                    if (contents.length == 1) {
                        let firstElement = contents.first().get(0);
                        if (firstElement.tagName !== undefined && firstElement.tagName == 'COMPONENT') {
                            resultElement = firstElement;
                        }
                    }
                    // while (contents.length == 1 && contents.first().get(0).tagName == 'COMPONENT' ) {
                    //     resultElement = $(resultElement).contents().first().get(0);
                    // }

                    $(resultElement).contents().each( function() {
                        $(container).append(this);
                    } );

                } else {
                    $(container).append(resultElement);
                }

                Components.tie( container, this );
                this.__start(); // опции?

                resolve( container );

            } else if ( _.isString( content ) ) {

                // это может быть backend-рендеринг или шаблонный JST-рендер
                // string содержит только внутренний контент
                // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..

                let container = this.createContainer();
                $(container).html( content );

                Components.tie(container, this);
                this.__start(); // опции?

                resolve( container );
            }
        });

        /**
         * Что может происходить?
         * 1. Компонент сразу все отрендерит и отдаст, например, string
         * 2. Компонент, чтобы отрендерить контент, будет куда-то еще асинхронно обращаться
         * и тогда вернет он promise
         * 3. Компонент вернет МАССИВ, который был сгенерирован из JSX
         */

    }


    //noinspection JSMethodCanBeStatic
    /**
     * Хорошее место для подготовки всего что нужно для рендера компонента.
     * Вызывается каждый раз перед рендером компонента
     * Promise-совместим!
     * todo: should be protected, but currently used by $.assignComponentToPrerendered
     * @returns {boolean}
     */
    public beforeRender() {
        return;
    }

    public render(): Promise<any>|string {
        return this.renderViaBackend();
    }

    /**
     * Shortcut для доступа к элементу компонента, обернутому в JQuery
     * @returns JQuery
     */
    $element(): JQuery<Element> {
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
    htmlelement(): HTMLElement {
        return <HTMLElement>this.element();
    }

    /**
     * Найти по DOM родительский визуальный компонент
     * Либо вернет себя же, если найти не удалось
     *
     * TODO: вообще, концептуально, дочерние элементы не должны бы обращаться к родительским таким образом
     * то есть пользователю бы не нужно иметь доступ к этому методу
     *
     * @final
     * @deprecated
     */
    protected __up(): VisualComponent|null {

        let $self = this.$element();

        let $parentComponent = $self.parent().closest( '.VisualComponent' );
        return $parentComponent.length ? $parentComponent.get(0).model : null;

        // TODO: $parentComponent.model() ?

    }

    public findParentComponent(): VisualComponent {

        let $self = this.$element();

        let $parentComponent = $self.parent().closest( '.VisualComponent' );
        return $parentComponent.length ? $parentComponent.get(0).model : null;

    }

    public debugName() {
        return this.getClass() + '('+this.id+')';
    }

    public signalPublic( name, data: Object = {} ): boolean {
        return this.signal( name, data );
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
        this.logger.log( 'Signal "' + name + '" '+JSON.stringify(data)+' fired in '+this.debugName()+'!' );

        this._signalHandle( signal );

        // для удобства в использовании при конвертации события в сигнал и прекращения обработки события
        return false;

    }

    /**
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     * @param signal
     */
    protected signalProxy( signal: Signal ): void {
        this._signalBubble(signal);
    }

    /**
     * Сигналы, которые умеет обрабатывать компонент
     * @public
     */
    protected listenSignals(): {[index: string]: Function} {
        return {};
    };

    /**
     * События, которые компонент умеет обрабатывать
     * Если событие не должно всплывать наверх, в обработчике нужно вернуть false
     * По факту, это работает через JQuery.on()
     *
     * Внутри обработчика можно проверить, произошло ли событие внутри компонента:
     * if ( this.eventNotInternal(e ) ) return;
     *
     * Можно терминировать события, произошедшие в дочерних компонентах (опционально, по умолчанию отключено)
     *
     */
    protected listenEvents() {
        return {};
    }

    /**
     * Отправить сигнал на обработку вышестоящим визуальным компонентам
     */
    _signalBubble( signal: Signal ) {

        this.logger.minor( 'Всплытие сигнала вверх...' );

        let parentModel = this.__up();

        try {
            expect(parentModel, 'Родительский компонент не обнаружен!');
        } catch ( e ) {
            this.logger.error( e.message );
            return;
        }

        if (parentModel instanceof VisualComponent) {
            parentModel._signalHandle( signal );
        }
    }

    /**
     * Вычислить путь, пройденный событием до этого компонента,
     * при этом выбирая только визуальные компоненты
     * @param e
     * @returns {Array}
     * @deprecated should be moved away from VisualComponent
     */
    protected getEventPathComponents(e: Event) {

        // TODO: можно путь взять отсюда: window.testEvent.path
        // TODO: можно не элементы, а модели в путь включать

        let path = [];
        let $current = $( <Element>e.target );
        let $parent;

        do {

            if ( $current.hasClass('VisualComponent') )
                $current = $current.parent();

            $parent = $current.closest('.VisualComponent');

            if ( $parent.length )
                path.push( $parent.get(0) );

            $current = $parent;

        } while ( $parent.length && $parent.get(0) !== this.element());
        // } while ( $parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document );

        return path;

    }

    /**
     * Вычислить путь, пройденный событием до этого компонента
     * @param e
     * @returns {Array}
     * @deprecated should be moved away from VisualComponent
     */
    protected getEventPath( e: Event ): Array<Element> {

        // TODO: можно путь взять отсюда: window.testEvent.path

        let $current = $( <Element>e.target );
        let $parent;
        let path = [];

        do {
            $parent = $current.parent();
            if ( $parent.length )
                path.push( $parent.get(0) );
            $current = $parent;
        } while ( $parent.length && $parent.get(0) !== this.element());
        // } while ( $parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document );

        return path;
    }

    /**
     * Определяет, что событие возникло в другом компоненте
     * @param e
     * @returns {boolean}
     * @deprecated should be moved away from VisualComponent
     */
    protected eventNotInternal( e: Event ): boolean {
        return !this.isEventInternal(e);
    }

    /**
     * Определяет, возникло ли событие непосредственно внутри этого компонента
     * @param e
     * @returns {boolean}
     * @deprecated should be moved away from VisualComponent
     */
    protected isEventInternal( e: Event ): boolean {

        return ( $(<Element>e.target)
            .closest('.VisualComponent')
            .get(0) === this.element() );
    }

    protected customSignalHandler( s: Signal ) {
        return null;
    }

    protected _signalHandleHook(signal: Signal) {

    }

    /**
     * Обработать сигнал
     */
    protected _signalHandle( signal: Signal ) {

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
            continueBubbling = this.listenSignals()[signal.name].call( this, signal );

        } else {

            this.logger.minor( 'Handling signal by customSignalHandler in ' + this.debugName() );
            let customResult = this.customSignalHandler(signal);
            if (customResult !== null) {
                continueBubbling = customResult;
            } else {
                this.logger.minor( 'Signal handler not set in ' + this.debugName() );
            }
        }

        if ( continueBubbling ) {
            this._signalBubble( signal );
        }
        else {
            this.logger.minor( 'Signal '+signal.name+' bubbling stopped!' );
        }

    }

    /**
     * Выполнить команду на стороне бэкенда этого компонента
     * @WARE!
     * @param command
     * @param params
     * @param options
     */
    public executeCommand( command: string, params: Object = {},
                           options: backendCommandSpecOptions = {} ): Promise<any> {

        return le.ware.componentBackendCommand(this,command,params,options);

    }

    /**
     * Сообщить бэкенду компонента о произошедшем событии
     * @WARE!
     * @param event
     * @param params
     */
    public backendEvent( event, params: Object | boolean = false ): void {

        this.logger.log('backendEvent '+event);
        le.ware.componentBackendEvent(this,event,params);

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

    /**
     * Отрисовка компонента через сервер
     * TODO: это же просто проксирует renderByBackendStaticAsynchronous?.. А зачем?
     * @param layoutName
     * @param parameters
     * @returns {Promise<T>}
     */
    protected renderViaBackend(layoutName = 'default', parameters: Object = {}): Promise<any> {

        return new Promise<string>(async (resolve, reject) => {
            let result: string = await this.renderByBackendStaticAsynchronous( layoutName, parameters )
            resolve(result);
        });


        // todo: как бы брать параметры автоматом?
    }

    /**
     * TODO: Отправляем запрос на сервер, чтобы получить отрендеренный компонент
     * @returns {string}
     */
    protected renderByBackendStaticAsynchronous(layout: string = VisualComponent.LAYOUT_DEFAULT, parameters: Object = {} ): Promise<string> {

        this.logger.log('Rendering layout '+layout+' of component '+this.debugName()+' by backend...');

        let data = {

            // если используем существующий бэкенд
            rtid: this.rtid, // если обращаемся к существующему процессу

            // в обоих ситуациях
            layout: layout, // какой шаблон использовать для отрисовки?

            // если создаем новый бэкенд
            className: this.getClass(), // какого класс нужно использовать для создания бэкенда?
            initialParameters: parameters, // параметры для создания
            createPersistant: false, // создавать бэкенд на время сессии или одноразово?

        };

        return new Promise<string>(async (resolve, reject) => {

        });

        // let process = $.Deferred();


        // debugger;



        le.backend.wareRequest( 'LE_COMPONENT_RENDER_LAYOUT', data )
            .done( ( result: OperationResult ) => {

                // debugger;

                if ( _.isObject(result.content) ) {
                    this.rtid = result.content.rtid;
                    process.resolve( result.content.rendered );
                } else {
                    process.resolve( result.content );
                }

            } )
            .fail( () => {
                // debugger;
                process.resolve( '<div style="text-align: center;">Ошибка отрисовки на стороне сервера!<hr /><button onclick="$(this).triggerEvent(\'cancel\')">Закрыть</button></div>' );
            } )
        ;

        // TODO: передаваемые параметры - они для конструирования компонента или для передачи в layout???

        return <Promise<string>> process.promise();

    }

    protected refreshViewport() {
        this.switchLayoutTo( this.layout );
    }

    public reRenderPublic() {
        this.reRender();
    }

    protected reRender() {
        this.$element().mountComponent(this, {mode: 'replace'});
    }

}

/**
 * Способы рендеринга компонента
 *
 * В классе компонента рендеринг шаблонов описывается примерно так:
 * layout_default() {
     *     return this.renderViaBackend( 'default', { accidentId: this.accidentId } );
     * }
 *
 * Внутри рендеринг можно делать по-разному:
 *
 * Способ 1: Асинхронно запросить рендер у сервера
 * let dfd = $.Deferred();
 * $.when( this.renderByBackendStaticAsynchronous( 'default', { accidentId: this.accidentId }))
 *     .always( ( result ) => dfd.resolve( result ) );
 * return dfd.promise();
 *
 * или короче: return this.renderViaBackend( 'default', { accidentId: this.accidentId } );
 *
 * Способ 2: Запросить у бэкенда рендер контента СИНХРОННО
 * return this.renderByBackendStaticSynchronous( 'default', { accidentId: this.accidentId } );
 *
 * Способ 3: Сразу вернуть результат
 * return this.renderJsTemplate('default'); // сгенерировать, используя JST-шаблон
 * return '<div></div>'; // или просто вычислить
 *
 * let path = 'components/Osagotime/Gui__Standard/';
 *
 */

