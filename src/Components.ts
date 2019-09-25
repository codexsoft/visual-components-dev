import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Keypress from 'keypress.js';
import LoggerInterface from "./LoggerInterface";
import VisualComponent from "./VisualComponent";
import NullLogger from "./NullLogger";
import Detect from "./Detect";
import Keyboard from "./Keyboard";
import JstTemplates from "./JstTemplates";

/**
 * Реестр визуальных компонентов
 */
export default class Components {

    public static keyboard: Keyboard;
    public static jstTemplates: JstTemplates;

    private static logger: LoggerInterface = new NullLogger();

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

        this.logger.space();
        this.logger.major('Активация компонента '+Detect.className(componentClass)+', предварительно отрендеренного сервером: ');

        try {
            $element.assignComponentToPrerendered( componentClass, params );
        } catch ( e ) {
            this.logger.error('Error while initializing component: '+e.message);
            // this.logger.error('Error while initializing component <?= $_this->getRtid() ?>: '+e.message);
            this.logger.log( e );
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
        //debugger;
        this._lastId++;
        return this._lastId;
    }

    /**
     * Связывает между собой HTML-элемент и модель визуального компонента
     * @param element
     * @param model
     */
    public static tie( element: Element, model: VisualComponent ): void {
        model.setElement( element );
        element.model = model;
    }

    public static create(constructorFunction: Function, parameters: {} = {}): VisualComponent {
        // @ts-ignore
        return new constructorFunction(parameters);
    }

    public static init() {

        // debugger;

        this.jstTemplates = new JstTemplates();

        if (window.keypress) {
            this.keyboard = new Keyboard(new window.keypress.Listener);

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

}