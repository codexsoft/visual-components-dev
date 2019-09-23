"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var _ = require("lodash");
var VisualComponent_1 = require("./VisualComponent");
/**
 * Реестр визуальных компонентов
 */
var Components = /** @class */ (function () {
    function Components(logger) {
        /**
         * Достаточно полный перечень событий браузера, разбитый по группам
         */
        this.DOMEvents = {
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
        this._lastId = 0;
        /**
         * @deprecated
         * @type {{}}
         */
        this.list = {};
        this.logger = logger;
    }
    Components.prototype.activatePrerendered = function ($element, componentClass, params) {
        if (params === void 0) { params = {}; }
        this.logger.space();
        this.logger.major('Активация компонента ' + Detect.className(componentClass) + ', предварительно отрендеренного сервером: ');
        try {
            $element.assignComponentToPrerendered(componentClass, params);
        }
        catch (e) {
            this.logger.error('Error while initializing component: ' + e.message);
            // this.logger.error('Error while initializing component <?= $_this->getRtid() ?>: '+e.message);
            this.logger.log(e);
        }
    };
    Components.prototype.stopComponentsInNode = function (node) {
        // TODO: а не включить ли .add(node) сюда?
        var $components = $(node).find('.VisualComponent');
        _.forEach($components, function (component) {
            $(component).model().__stop();
        });
    };
    Components.prototype.renderChildren = function (children) {
        var def = $.Deferred();
        var pendingRenderingElements = [];
        var providedChildren = [];
        _.forEach(children, function (childNode) {
            if (_.isString(childNode)) {
                pendingRenderingElements.push(document.createTextNode(childNode));
            }
            else if (childNode instanceof HTMLElement) {
                pendingRenderingElements.push(childNode);
            }
            else if (_.isArray(childNode)) {
                // а надо ли нам сразу рендерить вложенные компоненты? Ведь в компонент они будут переданы параметром,
                // и не факт что будут использованы... Ну ладно, пока так
                if (_.isElement(childNode[0])) {
                    _.forEach(childNode, function (elem) {
                        pendingRenderingElements.push(elem);
                    });
                }
                else {
                    pendingRenderingElements.push(jsx(childNode));
                }
            }
            else if (childNode instanceof VisualComponent_1.default) {
                pendingRenderingElements.push(jsx(childNode));
            }
        });
        $.when.apply($, pendingRenderingElements).done(function () {
            var generatedChildren = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                generatedChildren[_i] = arguments[_i];
            }
            def.resolve(generatedChildren);
        });
        return def.promise();
    };
    Components.prototype.renderJsxArray = function (type, config) {
        if (config === void 0) { config = {}; }
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        // если передан один параметр и он массив, то вытаскиваем параметры
        if (_.isArray(type)) {
            var tempParams = _.clone(type);
            if (_.isArray(tempParams[0])) {
                type = 'component'; // TEMP!!!
                config = {};
                children = tempParams;
            }
            else {
                type = tempParams.shift();
                config = tempParams.shift();
                children = tempParams;
            }
            // delete(tempParams);
            tempParams = undefined;
        }
        var def = $.Deferred();
        // TODO: сохранять в generatedElement.meta type, config?
        // так бывает с пустыми массивами
        if (_.isUndefined(type))
            return def.resolve(new Comment);
        if (type instanceof HTMLElement)
            return def.resolve(type);
        if (type instanceof Text)
            return def.resolve(type);
        var attributes = config || {};
        var generatedElement;
        if (_.isString(type)) {
            // специальные теги
            if (type == 'for') {
                if (!('each' in attributes)) {
                    this.logger.warn('Incorrect "each" attribute in FOREACH statement!');
                    def.resolve(new Comment);
                }
                if (!('do' in attributes)) {
                    this.logger.warn('Incorrect "do" attribute in FOREACH statement!');
                    def.resolve(new Comment);
                }
                var list = attributes['each'];
                var func_1 = attributes['do'];
                var result_1 = [];
                var iterator_1 = 1;
                _.forEach(list, function (val, key, arr) {
                    result_1.push(func_1(val, key, iterator_1, arr));
                    iterator_1++;
                });
                jsx('component', {}, result_1).done(function (rendered) {
                    def.resolve(rendered);
                });
                return def.promise();
            }
            else if (type == 'if') {
                if ('pass' in attributes && !attributes['pass'])
                    def.resolve(new Comment);
                else if ('not' in attributes && !!attributes['not'])
                    def.resolve(new Comment);
                else if (!('not' in attributes || 'pass' in attributes)) {
                    this.logger.warn('Incorrect condition in IF statement!');
                    def.resolve(new Comment);
                }
                else if ('then' in attributes) {
                    // может быть полезно в тех случаях, когда генерация вложенных компонентов
                    // использует какие-то переменные, которые будут неопределены в случае,
                    // если условие, определенное в pass/not не сработает
                    var thenClosure = attributes['then'];
                    if (!_.isFunction(thenClosure)) {
                        this.logger.warn('Incorrect THEN attribute in IF statement!');
                        def.resolve(new Comment);
                    }
                    var result = thenClosure();
                    jsx('component', {}, result).done(function (rendered) {
                        def.resolve(rendered);
                    });
                    return def.promise();
                }
            }
            else if (type == 'switch') {
                var testingValue = attributes['var'];
                var strictMode = false;
                if ('strict' in attributes) {
                    strictMode = !_.includes(['false', false], attributes['strict']);
                }
                var matchedCase = null;
                var defaultCase = null;
                for (var i = 0; i < children.length; i++) {
                    var caseChild = children[i];
                    if (!_.isArray(caseChild))
                        continue;
                    if (caseChild[0] === 'default') {
                        defaultCase = caseChild;
                        continue;
                    }
                    if (caseChild[0] != 'case')
                        continue;
                    var childAttributes = caseChild[1];
                    if (!('value' in childAttributes))
                        continue;
                    if ((!strictMode && testingValue == childAttributes['value']) || (strictMode && testingValue === childAttributes['value'])) {
                        matchedCase = caseChild;
                        break;
                    }
                }
                if (matchedCase) {
                    children = [matchedCase];
                }
                else if (defaultCase) {
                    children = [defaultCase];
                }
                else {
                    def.resolve(new Comment);
                }
            }
            // если элемент - обычный тег, то привязывать компонент к нему не надо
            generatedElement = document.createElement(type);
            le.components.applyAttributesToElement(generatedElement, attributes);
            $.when(le.components.renderChildren(children)).done(function (renderedChildren) {
                _.forEach(renderedChildren, function (renderedChild) {
                    if (renderedChild instanceof Text)
                        generatedElement.appendChild(renderedChild);
                    else if (renderedChild instanceof Element) {
                        switch (renderedChild.tagName) {
                            case 'COMPONENT':
                            case 'FOREACH':
                            case 'SWITCH':
                            case 'DEFAULT':
                            case 'CASE':
                            case 'IF':
                                // debugger;
                                _.forEach($(renderedChild).contents(), function (ifChildNode) {
                                    if (ifChildNode instanceof Node)
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
                def.resolve(generatedElement);
            });
        }
        else {
            // берем из атрибута config аргументы конструктора
            var initParams = {};
            if (attributes['config']) {
                initParams = attributes['config'];
                delete attributes['config'];
            }
            // в простом случае у нас не визуальный компонент, а функция. Причем она может возвращать JSX.
            if (!Detect.isVisualComponent(type)) {
                $.when(le.components.renderChildren(children)).done(function (renderedChildren) {
                    $.when(type({
                        providedAttributes: attributes,
                        providedChildren: renderedChildren,
                    })).done(function (result) {
                        if (_.isArray(result)) {
                            // $.when(this.renderJsxArray(result)).done(rendered => {
                            $.when(jsx(result)).done(function (rendered) {
                                // debugger;
                                // вычисляем значение аттрибута CSS-классов
                                if (attributes['class']) {
                                    $(rendered).addClass(attributes['class']);
                                    delete attributes['class'];
                                }
                                // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                                // это и для компонента, и для обычного тега
                                le.components.applyAttributesToElement(rendered, attributes);
                                def.resolve(rendered);
                            });
                        }
                        else if (_.isString(result)) {
                            def.resolve($(result).get(0));
                        }
                        // def.resolve( generatedElement );
                    });
                });
            }
            else { // иначе считаем что это компонент (или его конструктор)
                var generatedComponent_1;
                if (typeof type === 'function') {
                    generatedComponent_1 = new type(initParams);
                }
                else if (_.isObject(type) && type instanceof VisualComponent_1.default) {
                    // если элемент - уже существующий визуальный компонент
                    generatedComponent_1 = type;
                }
                expect(generatedComponent_1 instanceof VisualComponent_1.default, Detect.className(type) + ' poor VisualComponent generator/instance!');
                $.when(le.components.renderChildren(children)).done(function (renderedChildren) {
                    $.when(generatedComponent_1.display({
                        providedAttributes: attributes,
                        providedChildren: renderedChildren,
                    })).done(function (generatedElement) {
                        // вычисляем значение аттрибута CSS-классов
                        if (attributes['class']) {
                            $(generatedElement).addClass(attributes['class']);
                            delete attributes['class'];
                        }
                        // вешаем указанные в аттрибутах события или же устанавливаем эти самые аттрибуты
                        // это и для компонента, и для обычного тега
                        le.components.applyAttributesToElement(generatedElement, attributes);
                        def.resolve(generatedElement);
                    });
                });
            }
        }
        return def.promise();
    };
    Components.prototype.applyAttributesToElement = function (element, attributes) {
        _.forEach(attributes, function (value, attribute) {
            if (_.startsWith(attribute, 'on')) { // а если аттрибут типа onetwo = '123'?
                $(element).off(attribute.substring(2)); // снимаем существующий обработчик, если был
                $(element).on(attribute.substring(2), value);
            }
            else {
                if (_.startsWith(attribute, 'data-') && _.isObjectLike(value)) {
                    element.setAttribute(attribute, JSON.stringify(value)); // а если еще раз вызвать, перезапишет?
                }
                else {
                    element.setAttribute(attribute, value); // а если еще раз вызвать, перезапишет?
                }
            }
        });
    };
    /**
     * Генерирует следующий по счету ID для нового визуального компонента
     * @returns {number}
     */
    Components.prototype.nextId = function () {
        //debugger;
        this._lastId++;
        return this._lastId;
    };
    /**
     * Связывает между собой HTML-элемент и модель визуального компонента
     * @param element
     * @param model
     */
    Components.prototype.tie = function (element, model) {
        model.setElement(element);
        element.model = model;
    };
    /**
     * @deprecated
     * @param componentId
     * @param componentData
     */
    Components.prototype.register = function (componentId, componentData) {
        this.list[componentId] = componentData;
    };
    return Components;
}());
exports.default = Components;
