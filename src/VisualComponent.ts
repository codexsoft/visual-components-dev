import {LoggerInterface} from "./LoggerInterface";
import _ from 'lodash';
import $ from 'jquery';

export default abstract class VisualComponent {

    private logger: LoggerInterface;

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
    private _element: Element = null;

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, le.components.DOMEvents.MouseEvent;
     * @type {string}
     */
    protected TERMINATE_EVENTS: string = '';

    /**
     * ID визуального компонента, назначенный в браузере
     */
    protected id: number = null;

    /**
     * ID процесса визуального компонента на стороне сервера (если таковой имеется)
     * @WARE
     */
    protected rtid: string = null;

    protected selfUrl: string = '';

    public getRtid() {
        return this.rtid;
    }

    private _jsxProvidedAttributes: Object = {};
    private _jsxProvidedChildren: Array<any>;

    constructor( parameters: Object = {} ) {

        this.id = le.components.nextId(); // идентификатор DOM визуального компонента

        let identifier = parameters['id'] || null;

        if ( identifier && $( identifier ).length )
            this.setElement( $( identifier ).get( 0 ) );

        this.logger.log( 'Сконструирован компонент ' + this.debugName() );
        this._configurate( parameters );
        le.console.minor( 'Инициализация компонента ' + this.debugName() );
        this.init( parameters );

    }

    /**
     * Инициализация после конструирования компонента. Вызывается один раз.
     * @param parameters
     */
    protected init( parameters: Object ) {
    }

    protected exportData() {
        let exportObj = {};
        _.forEach( this, ( value, key ) => {

            if (in_array(key,[
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
                ])) return;
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

        let self = this;

        let stringified = JSON.stringify(parameters);
        if ( stringified.length <= 200 ) {
            le.console.minor('configurating '+this.getClass()+' using params: '+stringified);
        } else {
            le.console.minor('configurating '+this.getClass());
        }

        if (!_.isEmpty(parameters))
            le.console.minor(parameters);

        _.forEach( parameters, ( value, key ) => {

            self[key] = value;
        } );

        le.console.minor(this);

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
    public getId() {
        return this.id;
    }

    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public installAppending( element: Element ): JQueryPromise<VisualComponent> {

        let def = $.Deferred();

        $(element).mountComponent( this, { mode: 'append' } ).done( () => {
            def.resolve( this );
        } );

        return <JQueryPromise<VisualComponent>> def.promise();

    }

    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    public installInstead( element: Element ): JQueryPromise<VisualComponent> {

        let def = $.Deferred();

        $(element).mountComponent( this, { mode: 'replace' } ).done( () => {
            def.resolve( this );
        } );

        return <JQueryPromise<VisualComponent>> def.promise();

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

    protected interact( component: VisualComponent, title: string = '' ): JQueryPromise<any> {
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
    protected openModal(options: OpenModalOptions ): ModalComponentInterface {

        debugger;
        let modalComponent = options.modalComponent || new Component.Common__Modal__Blurred;

        if ( typeof options['title'] !== "undefined" && typeof modalComponent['setTitle'] !== "undefined" )
            modalComponent['setTitle']( options['title'] );

        let subComponent = options.content;
        let signalHandlers = options.signals || {};
        let signalTerminators = options.terminators || {};

        let handlers = _.merge( signalHandlers, signalTerminators );

        modalComponent
            .setParentComponent(this)
            .setComponent( subComponent )
            .fire( handlers, _.keys( signalTerminators ) );

        return modalComponent;

    }

    /**
     * Может терминирующие сигналы просто перечислять?
     * @param modalComponent
     * @param subComponent
     * @param signalHandlers
     * @deprecated
     */
    protected modal(modalComponent: Component.Common__Modal, subComponent: VisualComponent, signalHandlers: Object = {} ) {

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
    protected confirm( text: string, handlers: Object ) {

        if ( typeof window['Component']['Common__Dialog__Confirm'] === 'undefined' ) {
            le.console.error('Component.Common__Dialog__Confirm VisualComponent not found!!!');
            return;
        }

        this.openModal({

            title: 'Требуется подтверждение',

            content: ( new Component.Common__Dialog__Confirm )
                .setDefault(false)
                .setText(text),

            terminators: {

                yes: ( s: Signal ) => handlers['yes'] ? handlers['yes'] : () => {},
                no: ( s: Signal ) => handlers['no'] ? handlers['no'] : () => {},

            }

        });

    }

    /**
     * Обновление контента СУЩЕСТВУЮШЕГО визуального компонента и его реактивация
     * @param content
     * @param id
     */
    public prerenderedContentUpdate(content: string, id: string = null ) {

        le.console.major('Обновление контента компонента '+id+' и реактивация!');

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
        le.keyboard.focusOn( this );
    }

    /**
     * снять фокусировку keypress с этого компонента
     */
    protected unfocus(): void {
        le.keyboard.unfocus( this );
    }

    protected killViewport(): void {
        this._element = undefined;
    }

    public setElement( domElement: Element ): void {
        if ( _.isElement( domElement ) ) this._element = domElement;
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

    protected cssUrl( fileName ) {
        return 'url("' + this.backendUrl() + fileName + '")';
    }

    private __startListenEvents() {

        if ( this.TERMINATE_EVENTS ) {

            le.console.minor( '[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.' );
            this.$element().on( this.TERMINATE_EVENTS, ( e: Event ) => {

                if (!in_array(e.type,['mousemove','mouseover','mouseout','mouseleave','mouseenter','mouseup','mousedown'])) {
                    le.console.minor('Event '+e.type+' terminated in '+this.getClass());
                }

                e.stopPropagation();

            } );

        }

        let eventHandlers = this.listenEvents();
        if ( _.isEmpty( eventHandlers ) ) return;

        $.each( eventHandlers, ( eventName, handler ) => {
            le.console.minor( '[ BIND EVENTS ] Регистрация обработчика события: ' + eventName );
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
        le.console.minor('Активация компонента '+this.debugName());
        le.keyboard.registerCombos( this.id, this.listenKeyboard() );
        this.activate(); // TODO: сделать на promise-ах
    }

    /**
     * Останов этого конкретного компонента
     * @private
     */
    public __stop() {
        le.console.minor('Деактивация компонента '+this.debugName());
        le.keyboard.unregisterCombosForComponent( this.id );
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
     * Вычислить классы всех предков, начиная от VisualComponent
     * TODO: кроссбраузерно?
     * @param foundAncestors array
     * @returns array
     */
    public getAncestors( foundAncestors: Array<string> = null ) {

        if ( !foundAncestors ) foundAncestors = [];

        if ( !this['__proto__'] || !this['__proto__'].constructor )
            return foundAncestors;

        // hack... Работает постольку, поскольку VisualComponent класс без родительского класса
        if ( this['__proto__'].constructor.name === 'Object' )
            return foundAncestors;

        foundAncestors.push( this['__proto__'].constructor.name );
        return this['__proto__'].getAncestors
            ? this['__proto__'].getAncestors( foundAncestors )
            : foundAncestors;

    }

    /**
     * Генерация DOM-события
     */
    public trigger( name: string, parameters: Object = {} ): VisualComponent {

        if ( !this.$element().length ) {
            le.console.notice('Failed to trigger event by component '+this.debugName()+': no viewport element tied!');
            return this;
        }

        let msg = 'Component '
            +this.debugName()
            +' triggered event '
            +name;

        msg += ( _.isEmpty(parameters) ? ' without parameters' : ' providing parameters:' );
        le.console.minor(msg);

        if ( !_.isEmpty(parameters) )
            le.console.minor(parameters);
        this.$element().triggerEvent( name, parameters );
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
     * https://lodash.com
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * → '<li>fred</li><li>barney</li>'
     * TODO: а не следует ли возвращать HTMLElement?
     * @returns {string}
     */
    protected renderJsTemplate( templateName: string, parameters: Object = {} ): string {

        if ( typeof _ == 'undefined' ) {
            le.console.error( 'Cannot render javascript template ' + templateName + ' - required lodash module is undefined!' );
            return '';
        }

        parameters['_this'] = this;

        let templatePrefix = 'template_jst_' + this.getClass() + '_';
        let templateId = templatePrefix + templateName;

        let compiled = null;

        if ( le.templates.templateIsCached( templateId ) ) {
            this.logger.log( 'compiling ' + templateId + ' from cache with parameters:' );
            this.logger.log( parameters );
            compiled = le.templates.getCached(templateId);
        } else {
            this.logger.log( 'compiling ' + templateId + ' by lodash with parameters:' );
            this.logger.log( parameters );
            let templateString = $( '#' + templateId ).html();
            if ( !templateString ) {
                le.console.error( 'Template ' + templateId + ' not found!' );
                return '';
            }
            compiled = _.template( templateString, {variable: 'data'} );
            le.templates.cacheTemplate( templateId, compiled );
        }

        try {
            return compiled( parameters );
        } catch ( e ) {
            le.console.error('Exception while compiling template '+templateName+': '+e.toString());
            return '';
        }

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
    switchLayoutTo( newLayout ): void {
        if ( !this.__layoutMethodExists(newLayout) ) return;
        this.layout = newLayout;
        this.$element().mountComponent(this);
        // this.$element().installExistingComponent(this);
    }

    public createContainer(): HTMLElement {

        let $container = $( '<div>' );
        this.getAncestors().forEach( function ( ancestorClass ) {
            $container.addClass( ancestorClass );
        } );

        if ( this['rtid'] ) {
            $container.attr('id',this['rtid']);
        }

        return $container.get(0);

    }

    public displaySimple( options: Object = {} ): JQueryPromise<Element> {

        le.console.notice('displaying simple...');

        let dfd = $.Deferred();

        this._jsxProvidedChildren = options['providedChildren'] || [];
        this.props = this._jsxProvidedAttributes = options['providedAttributes'] || {};

        $.when( this.beforeRender() ).done( ( beforeRenderResult: any ) => {

            // so, we can implement render function with parameters, like ( vars: { hello: string } ) {
            $.when( this.render( beforeRenderResult ) ).done( ( content: any ) => {

                if ( _.isElement( content ) ) {

                    // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                    le.console.notice('not implemented!');

                } else if ( _.isArray( content ) ) { // JSX array-based render

                    $.when( jsx( content ) ).done(( resultElement )=>{

                        le.components.tie( resultElement, this );
                        this.activate();

                        dfd.resolve( resultElement );

                    });

                } else if ( _.isString( content ) ) {

                    le.console.notice('content cannot be string!');

                    // это может быть backend-рендеринг или шаблонный JST-рендер
                    // string содержит только внутренний контент
                    // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..

                    dfd.resolve( new Comment );

                }

            } );

        });

        return <JQueryPromise<Element>> dfd.promise();

    }

    /**
     * Deferred-Полифил для разных способов рендеринга визуального компонента
     */
    public display( options: Object = {} ): JQueryPromise<Element> {

        if ( this.isSimple )
            return this.displaySimple(options);

        let dfd = $.Deferred();

        this._jsxProvidedChildren = options['providedChildren'] || [];
        this.props = this._jsxProvidedAttributes = options['providedAttributes'] || {};

        $.when( this.beforeRender() ).done( ( beforeRenderResult: any ) => {

            // so, we can implement render function with parameters, like ( vars: { hello: string } ) {
            $.when( this.render( beforeRenderResult ) ).done( ( content: any ) => {

                if ( _.isElement( content ) ) {

                    // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                    le.console.notice('not implemented!');

                } else if ( _.isArray( content ) ) { // JSX array-based render

                    jsx( content ).done(( resultElement)=>{

                        let container = this.createContainer();

                        if ( in_array(resultElement.tagName,['COMPONENT']) && $(resultElement).contents().length) {
                            // может быть аттрибуты DIV копировать?..

                            while ( $(resultElement).contents().length == 1 && $(resultElement).contents().first().get(0).tagName == 'COMPONENT' ) {
                                resultElement = $(resultElement).contents().first().get(0);
                            }

                            $(resultElement).contents().each( function() {
                                $(container).append( this );
                            } );

                        } else {
                            $(container).append( resultElement );
                        }

                        le.components.tie( container, this );
                        this.__start(); // опции?

                        dfd.resolve( container );

                    });

                } else if ( _.isString( content ) ) {

                    // это может быть backend-рендеринг или шаблонный JST-рендер
                    // string содержит только внутренний контент
                    // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..

                    let container = this.createContainer();
                    $(container).html( content );

                    le.components.tie( container, this );
                    this.__start(); // опции?

                    dfd.resolve( container );

                }

            } );

        });

        return <JQueryPromise<Element>> dfd.promise();

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
     * @returns {boolean}
     */
    protected beforeRender() {
        return;
    }

    public render( options ): JQueryPromise<any>|string {
        return this.renderViaBackend();
    }

    /**
     * Shortcut для доступа к элементу компонента, обернутому в JQuery
     * @returns {JQuery}
     */
    $element(): JQuery {
        return $( this._element );
    }

    /**
     * Shortcut для доступа к элементу компонента
     * @returns {Element}
     */
    element(): Element {
        return this._element;
    }

    /**
     * Shortcut для доступа к элементу компонента (возвращает как HTMLElement)
     * @returns {HTMLElement}
     */
    htmlelement(): HTMLElement {
        return <HTMLElement>this._element;
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
    protected __up(): VisualComponent {

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
    protected signal( name, data: Object = {} ): boolean {

        let signal = new Signal();
        signal.name = name;
        signal.data = data;
        signal.trigger = this;
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
    protected listenSignals() {
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

        le.console.minor( 'Всплытие сигнала вверх...' );

        let parentModel = this.__up();

        try {
            expect( parentModel, 'Родительский компонент не обнаружен!' );
        } catch ( e ) {
            le.console.error( e.message );
            return;
        }

        if ( parentModel instanceof VisualComponent )
            parentModel._signalHandle( signal );

    }

    /**
     * Вычислить путь, пройденный событием до этого компонента,
     * при этом выбирая только визуальные компоненты
     * @param e
     * @returns {Array}
     */
    protected getEventPathComponents( e: Event ) {


        // TODO: можно путь взять отсюда: window.testEvent.path
        // TODO: можно не элементы, а модели в путь включать

        let path = [];
        let $current = $( e.target );
        let $parent;

        do {

            if ( $current.hasClass('VisualComponent') )
                $current = $current.parent();

            $parent = $current.closest('.VisualComponent');

            if ( $parent.length )
                path.push( $parent.get(0) );

            $current = $parent;

        } while ( $parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document );

        return path;

    }

    /**
     * Вычислить путь, пройденный событием до этого компонента
     * @param e
     * @returns {Array}
     */
    protected getEventPath( e: Event ): Array<Element> {

        // TODO: можно путь взять отсюда: window.testEvent.path

        let $current = $( e.target );
        let $parent;
        let path = [];

        do {
            $parent = $current.parent();
            if ( $parent.length )
                path.push( $parent.get(0) );
            $current = $parent;
        } while ( $parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document );

        return path;

    }

    /**
     * Определяет, что событие возникло в другом компоненте
     * @param e
     * @returns {boolean}
     */
    protected eventNotInternal( e: Event ): boolean {
        return this.isEventInternal(e) == false;
    }

    /**
     * Определяет, возникло ли событие непосредственно внутри этого компонента
     * @param e
     * @returns {boolean}
     */
    protected isEventInternal( e: Event ): boolean {

        return ( $( e.target )
            .closest('.VisualComponent')
            .get(0) === this.element() );

    }

    //noinspection JSMethodCanBeStatic
    protected customSignalHandler( s: Signal ) {
        return null;
    }

    protected _signalHandleHook(signal: Signal) {

    }

    /**
     * Обработать сигнал
     */
    protected _signalHandle( signal: Signal ) {

        signal.trip.push( this );
        let continueBubbling = true; // bubbling by default!
        let handlerMethodName = 'on_' + signal.name;

        if ( this[handlerMethodName] ) {

            le.console.info('Handling signal in component ' + this.debugName() + ' via method ' + handlerMethodName );
            continueBubbling = this[handlerMethodName](signal); // will be undefined by default!

        } else if ( this.listenSignals()[signal.name] ) {

            // TODO: call trigger callback?

            this._signalHandleHook(signal);


            continueBubbling = this.listenSignals()[signal.name].call( this, signal );

        } else {

            le.console.minor( 'Handling signal by customSignalHandler in ' + this.debugName() );
            let customResult = this.customSignalHandler(signal);
            if ( customResult !== null )
                continueBubbling = customResult;
            else
                le.console.minor( 'Signal handler not set in ' + this.debugName() );

        }

        if ( continueBubbling ) {
            this._signalBubble( signal );
        }
        else {
            le.console.minor( 'Signal '+signal.name+' bubbling stopped!' );
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
                           options: backendCommandSpecOptions = {} ): JQueryPromise<any> {

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
     * @returns {JQueryPromise<T>}
     */
    protected renderViaBackend( layoutName = 'default', parameters: Object = {} ): JQueryPromise<any> {

        let process = $.Deferred();

        // todo: как бы брать параметры автоматом?

        this.renderByBackendStaticAsynchronous( layoutName, parameters )
            .always( ( result: string ) => {
                process.resolve( result );
            } );

        return process.promise();
    }

    /**
     * TODO: Отправляем запрос на сервер, чтобы получить отрендеренный компонент
     * @returns {string}
     */
    protected renderByBackendStaticAsynchronous(layout: string = VisualComponent.LAYOUT_DEFAULT, parameters: Object = {} ): JQueryPromise<string> {

        let process = $.Deferred();

        this.logger.log('Rendering layout '+layout+' of component '+this.debugName()+' by backend...');
        // debugger;

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

        return <JQueryPromise<string>> process.promise();

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
