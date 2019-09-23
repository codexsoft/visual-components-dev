import * as $ from 'jquery';
import * as _ from 'lodash';
import LoggerInterface from "./LoggerInterface";
import VisualComponent from "./VisualComponent";

/**
 * Реестр визуальных компонентов
 */
export default class Components {

    private logger: LoggerInterface;

    constructor(logger: LoggerInterface|null) {
        this.logger = logger;
    }

    /**
     * Достаточно полный перечень событий браузера, разбитый по группам
     */
    public readonly DOMEvents = {
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
    private _lastId = 0;

    /**
     * @deprecated
     * @type {{}}
     */
    private list = {};

    public activatePrerendered( $element: JQuery, componentClass, params: Object = {} ) {

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

    public stopComponentsInNode( node: Element ): void {
        // TODO: а не включить ли .add(node) сюда?
        let $components = $(node).find('.VisualComponent');
        _.forEach( $components, function(component: HTMLElement) {
            $(component).model().__stop();
        } );
    }

    private renderChildren( children: Array<any> ): JQueryPromise<Array<Element>|{}> {

        let def = $.Deferred();
        let pendingRenderingElements = [];
        let providedChildren = [];

        _.forEach( children, childNode => {

            if ( _.isString(childNode) ) {
                pendingRenderingElements.push(document.createTextNode(childNode));
            } else if ( childNode instanceof HTMLElement ) {
                pendingRenderingElements.push(childNode);
            } else if ( _.isArray(childNode) ) {
                // а надо ли нам сразу рендерить вложенные компоненты? Ведь в компонент они будут переданы параметром,
                // и не факт что будут использованы... Ну ладно, пока так

                if ( _.isElement(childNode[0]) ) {
                    _.forEach( childNode, ( elem ) => {
                        pendingRenderingElements.push( elem );
                    } );
                } else {
                    pendingRenderingElements.push( jsx(childNode) );

                }

            } else if ( childNode instanceof VisualComponent ) {
                pendingRenderingElements.push( jsx(childNode) );
            }

        } );

        $.when( ...pendingRenderingElements ).done(( ...generatedChildren )=> {
            def.resolve( generatedChildren );
        });

        return def.promise();

    }

    public renderJsxArray( type, config: Object = {}, ...children: Array<any>): JQueryPromise<HTMLElement|{}> {

        // если передан один параметр и он массив, то вытаскиваем параметры
        if ( _.isArray(type) ) {

            let tempParams = _.clone(type);
            if ( _.isArray(tempParams[0]) ) {
                type = 'component'; // TEMP!!!
                config = {};
                children = tempParams;
            } else {
                type = tempParams.shift();
                config = tempParams.shift();
                children = tempParams;
            }

            // delete(tempParams);
            tempParams = undefined;

        }

        let def = $.Deferred();

        // TODO: сохранять в generatedElement.meta type, config?

        // так бывает с пустыми массивами
        if ( _.isUndefined(type) )
            return def.resolve( new Comment );

        if ( type instanceof HTMLElement)
            return def.resolve( type );

        if ( type instanceof Text)
            return def.resolve( type );

        let attributes = config || {};
        let generatedElement: HTMLElement;

        if ( _.isString(type) ) {

            // специальные теги

            if ( type == 'for' ) {

                if ( !('each' in attributes) ) {
                    this.logger.warn('Incorrect "each" attribute in FOREACH statement!');
                    def.resolve( new Comment );
                }

                if ( !('do' in attributes) ) {
                    this.logger.warn('Incorrect "do" attribute in FOREACH statement!');
                    def.resolve( new Comment );
                }

                let list = attributes['each'];
                let func = attributes['do'];
                let result = [];

                let iterator = 1;
                _.forEach(list,(val,key,arr)=>{
                    result.push( func(val,key,iterator,arr) );
                    iterator++;
                });

                jsx('component',{},result).done((rendered)=>{
                    def.resolve( rendered );
                });

                return def.promise();

            } else if ( type == 'if' ) {

                if ( 'pass' in attributes && !attributes['pass'] )
                    def.resolve( new Comment );

                else if ( 'not' in attributes && !!attributes['not'] )
                    def.resolve( new Comment );

                else if ( !('not' in attributes || 'pass' in attributes) ) {

                    this.logger.warn('Incorrect condition in IF statement!');
                    def.resolve( new Comment );

                } else if ( 'then' in attributes ) {

                    // может быть полезно в тех случаях, когда генерация вложенных компонентов
                    // использует какие-то переменные, которые будут неопределены в случае,
                    // если условие, определенное в pass/not не сработает

                    let thenClosure = attributes['then'];
                    if (!_.isFunction(thenClosure)) {
                        this.logger.warn('Incorrect THEN attribute in IF statement!');
                        def.resolve( new Comment );
                    }
                    let result = thenClosure();
                    jsx('component',{},result).done((rendered)=>{
                        def.resolve( rendered );
                    });

                    return def.promise();

                }

            } else if ( type == 'switch' ) {
                let testingValue = attributes['var'];

                let strictMode = false;
                if ( 'strict' in attributes ) {
                    strictMode = !_.includes(['false',false], attributes['strict']);
                }

                let matchedCase = null;
                let defaultCase = null;

                for (let i = 0; i < children.length; i++) {

                    let caseChild = children[i];
                    if ( !_.isArray(caseChild) ) continue;

                    if ( caseChild[0] === 'default' ) {
                        defaultCase = caseChild;
                        continue;
                    }

                    if ( caseChild[0] != 'case' ) continue;
                    let childAttributes = caseChild[1];
                    if ( !('value' in childAttributes) ) continue;
                    if ( ( !strictMode && testingValue == childAttributes['value'] ) || ( strictMode && testingValue === childAttributes['value'] ) ) {
                        matchedCase = caseChild;
                        break;
                    }
                }

                if ( matchedCase ) {
                    children = [ matchedCase ];
                } else if ( defaultCase ) {
                    children = [ defaultCase ];
                } else {
                    def.resolve( new Comment );
                }

            }

            // если элемент - обычный тег, то привязывать компонент к нему не надо
            generatedElement = document.createElement(type);
            le.components.applyAttributesToElement( generatedElement, attributes );

            $.when( le.components.renderChildren( children ) ).done(( renderedChildren: Array<Element> )=>{

                _.forEach(renderedChildren,renderedChild => {

                    if ( renderedChild instanceof Text)
                        generatedElement.appendChild(renderedChild);
                    else if ( renderedChild instanceof Element ) {

                        switch (renderedChild.tagName) {

                            case 'COMPONENT':
                            case 'FOREACH':
                            case 'SWITCH':
                            case 'DEFAULT':
                            case 'CASE':
                            case 'IF':

                                // debugger;

                                _.forEach($(renderedChild).contents(),(ifChildNode)=>{
                                    if ( ifChildNode instanceof Node )
                                        generatedElement.appendChild(ifChildNode);
                                    else
                                        $(generatedElement).append(ifChildNode);

                                });

                                break;

                            default:
                                generatedElement.appendChild(renderedChild);
                        }

                    }

                });

                def.resolve( generatedElement );

            });

        } else {

            // берем из атрибута config аргументы конструктора
            let initParams = {};
            if ( attributes['config'] ) {
                initParams = attributes['config'];
                delete attributes['config'];
            }

            // в простом случае у нас не визуальный компонент, а функция. Причем она может возвращать JSX.
            if ( !Detect.isVisualComponent(type) ) {

                $.when( le.components.renderChildren( children ) ).done(( renderedChildren: Array<Element> )=>{

                    $.when( type({
                        providedAttributes: attributes,
                        providedChildren: renderedChildren,
                        // }) ).done( ( generatedElement: Element ) => {
                    }) ).done( ( result ) => {

                        if ( _.isArray(result) ) {
                            // $.when(this.renderJsxArray(result)).done(rendered => {
                            $.when(jsx(result)).done(rendered => {
                                // debugger;
                                // вычисляем значение аттрибута CSS-классов
                                if ( attributes['class'] ) {
                                    $(rendered).addClass( attributes['class'] );
                                    delete attributes['class'];
                                }

                                // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                                // это и для компонента, и для обычного тега

                                le.components.applyAttributesToElement( rendered, attributes );
                                def.resolve( rendered );
                            });
                        } else if ( _.isString(result) ) {
                            def.resolve( $(result).get(0) );
                        }

                        // def.resolve( generatedElement );

                    } );

                });

            } else { // иначе считаем что это компонент (или его конструктор)

                let generatedComponent: VisualComponent;

                if (typeof type === 'function') {
                    generatedComponent = new type(initParams);
                } else if ( _.isObject(type) && type instanceof VisualComponent ) {

                    // если элемент - уже существующий визуальный компонент
                    generatedComponent = type;

                }

                expect( generatedComponent instanceof VisualComponent, Detect.className(type)+' poor VisualComponent generator/instance!' );

                $.when( le.components.renderChildren( children ) ).done(( renderedChildren: Array<Element> )=>{

                    $.when( generatedComponent.display({
                        providedAttributes: attributes,
                        providedChildren: renderedChildren,
                    }) ).done( ( generatedElement: Element ) => {

                        // вычисляем значение аттрибута CSS-классов
                        if ( attributes['class'] ) {

                            $(generatedElement).addClass( attributes['class'] );

                            delete attributes['class'];
                        }

                        // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                        // это и для компонента, и для обычного тега

                        le.components.applyAttributesToElement( generatedElement, attributes );
                        def.resolve( generatedElement );

                    } );

                });

            }

        }

        return def.promise();

    }

    applyAttributesToElement( element: Element, attributes: Object ): void {

        _.forEach( attributes, ( value, attribute: string ) => {

            if ( _.startsWith(attribute,'on') ) { // а если аттрибут типа onetwo = '123'?

                $(element).off(attribute.substring(2)); // снимаем существующий обработчик, если был
                $(element).on( attribute.substring(2), <EventListener>value );

            } else {
                if ( _.startsWith(attribute,'data-') && _.isObjectLike(value) ) {
                    element.setAttribute(attribute, JSON.stringify(value)); // а если еще раз вызвать, перезапишет?
                } else {
                    element.setAttribute(attribute, value); // а если еще раз вызвать, перезапишет?
                }

            }

        });

    }

    /**
     * Генерирует следующий по счету ID для нового визуального компонента
     * @returns {number}
     */
    public nextId() {
        //debugger;
        this._lastId++;
        return this._lastId;
    }

    /**
     * Связывает между собой HTML-элемент и модель визуального компонента
     * @param element
     * @param model
     */
    public tie( element: Element, model: VisualComponent ) {
        model.setElement( element );
        element.model = model;
    }

    /**
     * @deprecated
     * @param componentId
     * @param componentData
     */
    public register( componentId, componentData ){
        this.list[componentId] = componentData;
    }

}