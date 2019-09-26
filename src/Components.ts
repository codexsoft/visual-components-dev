import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Keypress from 'keypress.js';
import LoggerInterface from "./LoggerInterface";
import VisualComponent from "./VisualComponent";
import NullLogger from "./NullLogger";
import Detect from "./Detect";
import Keyboard from "./Keyboard";
import JstTemplates from "./JstTemplates";
import ComponentsSettings from "./ComponentsSettings";
import ComponentsEventDispatcher from "./ComponentsEventDispatcher";
import ComponentStartedEvent from "./events/ComponentStartedEvent";
import ComponentStartedEventInterface from "./events/ComponentStartedEventInterface";
import Events from "./events/Events";

/**
 * Реестр визуальных компонентов
 */
export default class Components {

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, DOMEvents.MouseEvent;
     * @type {string}
     */
    protected static TERMINATE_EVENTS: string = '';

    static get logger(): LoggerInterface {
        return this._logger;
    }

    static set logger(value: LoggerInterface) {
        this._logger = value;
    }

    public static keyboard: Keyboard;
    public static jstTemplates: JstTemplates;
    public static dispatcher: ComponentsEventDispatcher;

    private static _logger: LoggerInterface = new NullLogger();
    static settings: ComponentsSettings;

    private constructor(logger: LoggerInterface|null) {
        // this.logger = logger || new NullLogger();
    }

    /**
     * Достаточно полный перечень событий браузера, разбитый по группам
     */
    public static readonly DOMEvents = {
        UIEvent: "abort DOMActivate error load resize scroll select unload",
        ProgressEvent: "abort error load loadend loadstart progress progress timeout",
        Event: "abort afterprint beforeprint cached canplay canplaythrough change chargingchange chargingtimechange checking close dischargingtimechange DOMContentLoaded downloading durationchange emptied ended ended error error error error fullscreenchange fullscreenerror input invalid languagechange levelchange loadeddata loadedmetadata noupdate obsolete offline online open open orientationchange pause pointerlockchange pointerlockerror play playing ratechange readystatechange reset seeked seeking stalled submit success suspend timeupdate updateready visibilitychange volumechange waiting",
        AnimationEvent: "animationend animationiteration animationstart",
        AudioProcessingEvent: "audioprocess",
        BeforeUnloadEvent: "beforeunload",
        TimeEvent: "beginEvent endEvent repeatEvent",
        OtherEvent: "blocked complete upgradeneeded versionchange",
        FocusEvent: "blur DOMFocusIn  Unimplemented DOMFocusOut  Unimplemented focus focusin focusout",
        MouseEvent: "click contextmenu dblclick mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup show",
        SensorEvent: "compassneedscalibration Unimplemented userproximity",
        OfflineAudioCompletionEvent: "complete",
        CompositionEvent: "compositionend compositionstart compositionupdate",
        ClipboardEvent: "copy cut paste",
        DeviceLightEvent: "devicelight",
        DeviceMotionEvent: "devicemotion",
        DeviceOrientationEvent: "deviceorientation",
        DeviceProximityEvent: "deviceproximity",
        MutationNameEvent: "DOMAttributeNameChanged DOMElementNameChanged",
        MutationEvent: "DOMAttrModified DOMCharacterDataModified DOMNodeInserted DOMNodeInsertedIntoDocument DOMNodeRemoved DOMNodeRemovedFromDocument DOMSubtreeModified",
        DragEvent: "drag dragend dragenter dragleave dragover dragstart drop",
        GamepadEvent: "gamepadconnected gamepaddisconnected",
        HashChangeEvent: "hashchange",
        KeyboardEvent: "keydown keypress keyup",
        MessageEvent: "message message message message",
        PageTransitionEvent: "pagehide pageshow",
        PopStateEvent: "popstate",
        StorageEvent: "storage",
        SVGEvent: "SVGAbort SVGError SVGLoad SVGResize SVGScroll SVGUnload",
        SVGZoomEvent: "SVGZoom",
        TouchEvent: "touchcancel touchend touchenter touchleave touchmove touchstart",
        TransitionEvent: "transitionend",
        WheelEvent: "wheel"
    };

    /**
     * @private
     */
    private static _lastId = 0;

    public static activatePrerendered( $element: JQuery, componentClass: Function, params: Object = {} ) {

        this._logger._space();
        this._logger._major('Активация компонента '+Detect.className(componentClass)+', предварительно отрендеренного сервером: ');

        try {
            $element.assignComponentToPrerendered( componentClass, params );
        } catch (e) {

            if (e instanceof Error) {
                this._logger._error('Error while initializing component: '+e.message);
                // this.logger.error('Error while initializing component <?= $_this->getRtid() ?>: '+e.message);
                this._logger.debug(e);
            }

        }

    }

    public static stopComponentsInNode( node: Element ): void {
        // TODO: а не включить ли .add(node) сюда?
        let $components = $(node).find('.VisualComponent');
        _.forEach($components, (component) => {
            $(<HTMLElement>component).model().__stop();
        } );
    }

    /**
     * Генерирует следующий по счету ID для нового визуального компонента
     * @returns {number}
     */
    public static nextId(): number {
        this._lastId++;
        return this._lastId;
    }

    /**
     * Связывает между собой HTML-элемент и модель визуального компонента
     * @param element
     * @param model
     */
    public static tie(element: HTMLElement, model: VisualComponent): void {
        model.setElement(element);
        element.model = model;
    }

    /*
    public static create(constructorFunction: Function, parameters: {} = {}): VisualComponent {
        // @ts-ignore
        let component: VisualComponent = new constructorFunction(parameters);

        component.id = Components.nextId(); // идентификатор DOM визуального компонента

        let identifier: number|null = parameters.id || null;

        if (identifier !== null) {
            // @ts-ignore
            let $identifier: JQuery = $(identifier);
            if ($identifier.length) {
                component.setElement($identifier.get(0));
            }
        }

        this.logger._log( 'Сконструирован компонент ' + this.debugName() );
        component._configurate( parameters );
        this.logger._minor( 'Инициализация компонента ' + this.debugName() );
        component.init( parameters );

        return component;
    }
    */

    public static init() {

        debugger;
        console.log('init');
        // console.log(this._logger);
        console.log(this.logger);
        // this.logger.info('initialization');
        // debugger;

        this.jstTemplates = new JstTemplates();
        this.settings = new ComponentsSettings();
        this.dispatcher = new ComponentsEventDispatcher();

        // @ts-ignore
        this.dispatcher.addEventListener(Events.componentStarted, (e: CustomEvent<ComponentStartedEventInterface>) => {
            this.logger.debug('HANDLER: Keyboard handlers activating for component '+Detect.className(e.detail.component));
            if (this.keyboard) {
                this.logger.debug('Keyboard is defined');
                this.logger.debug(this.keyboard);
                this.keyboard.registerCombos(e.detail.componentId, e.detail.listenCombos);
            }
        });

        // @ts-ignore
        this.dispatcher.addEventListener(Events.componentStarted, (e: CustomEvent<ComponentStartedEventInterface>) => {

            this.logger.debug('HANDLER: Event handlers activating for component '+Detect.className(e.detail.component));
            let component = e.detail.component;

            if (this.TERMINATE_EVENTS) {

                this.logger._minor( '[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.' );
                component.$element().on( this.TERMINATE_EVENTS, ( e: Event ) => {

                    if (!_.includes(['mousemove','mouseover','mouseout','mouseleave','mouseenter','mouseup','mousedown'], e.type)) {
                        this.logger._minor('Event '+e.type+' terminated in '+component.getClass());
                    }

                    e.stopPropagation();

                } );

            }

            let eventHandlers = component.listenEvents();
            if (_.isEmpty( eventHandlers)) {
                return;
            }

            $.each(eventHandlers, (eventName: string, handler: Function) => {
                this.logger._minor( '[ BIND EVENTS ] Регистрация обработчика события: ' + eventName );
                component.$element().off(eventName); // снимаем существующий обработчик, если был
                // @ts-ignore
                component.$element().on(eventName, handler);
            } );

        });

        this.keyboard = new Keyboard(new Keypress.Listener(<Element>document.getElementsByTagName('body').item(0)));
        if (window.keypress) {
            // @ts-ignore
            // this.keyboard = new Keyboard(new window.keypress.Listener(document.getElementsByTagName('body').item(0)));
            // this.keyboard = new Keyboard(new Keypress.Listener(document.getElementsByTagName('body').item(0)));

            /*
            this.keyboard.registerCombos( 0, {
                // TODO: глобальные обработчики, при этом, не должны ПЕРЕКРЫВАТЬ ввод текста в input, например.
                // TODO: это не будет работать, чтобы работало нужно чтобы фокус был
                'alt 1': () => {
                    le.debug.devInfoSwitch();
                },

                // TODO: это не будет работать, чтобы работало нужно чтобы фокус был
                'alt 2': () => {
                    le.debug.keyboardFocusVisibleSwitch();
                }
            });
            */

        }

    }

    public static findParentComponent(component: VisualComponent): VisualComponent|null {

        let $self = component.$element();

        let $parentComponent = $self.parent().closest( '.VisualComponent' );
        return $parentComponent.length ? $parentComponent.get(0).model : null;

    }

    /**
     * @WARE!
     * @returns {string}
     */
    public static backendUrl(component: VisualComponent) {
        return Components.settings.urlToRoot+'src/components/'+component.getClass()+'/';
    }

    /**
     *
     * @param component
     * @param fileName
     */
    public static cssUrl(component: VisualComponent, fileName: string): string {
        return 'url("' + Components.backendUrl(component) + fileName + '")';
    }

    /**
     * Получить URL к изображению
     * @param component
     * @param image
     * @returns {string}
     */
    public static imageUrl(component: VisualComponent, image: string): string {
        return Components.backendUrl(component)+'images/'+image;
    }

    // protected url(): string {
    //     return Components.settings.urlToRoot + this.selfUrl;
        // protected selfUrl: string = '';
    // }

}