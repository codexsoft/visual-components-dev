"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Signal_1 = require("./Signal");
var _ = require("lodash");
var $ = require("jquery");
var VisualComponent = /** @class */ (function () {
    function VisualComponent(parameters) {
        if (parameters === void 0) { parameters = {}; }
        /**
         * if true, then no DIV.VisualComponent wrapper generated, used for form fields generating
         * @type {boolean}
         */
        this.isSimple = false;
        this.USE_WARE = false;
        this.__cachedDetectedClassname = null;
        this.layout = VisualComponent.LAYOUT_DEFAULT;
        /**
         * DOM-элемент, с которым связана модель этого визуального компонента
         */
        this._element = null;
        /**
         * какие события мыши терминировать по умолчанию в этом компоненте?
         * например, le.components.DOMEvents.MouseEvent;
         * @type {string}
         */
        this.TERMINATE_EVENTS = '';
        /**
         * ID визуального компонента, назначенный в браузере
         */
        this.id = null;
        /**
         * ID процесса визуального компонента на стороне сервера (если таковой имеется)
         * @WARE
         */
        this.rtid = null;
        this.selfUrl = '';
        this._jsxProvidedAttributes = {};
        this.id = le.components.nextId(); // идентификатор DOM визуального компонента
        var identifier = parameters['id'] || null;
        if (identifier && $(identifier).length)
            this.setElement($(identifier).get(0));
        this.logger.log('Сконструирован компонент ' + this.debugName());
        this._configurate(parameters);
        this.logger.minor('Инициализация компонента ' + this.debugName());
        this.init(parameters);
    }
    VisualComponent.prototype.getRtid = function () {
        return this.rtid;
    };
    /**
     * Инициализация после конструирования компонента. Вызывается один раз.
     * @param parameters
     */
    VisualComponent.prototype.init = function (parameters) {
    };
    VisualComponent.prototype.exportData = function () {
        var exportObj = {};
        _.forEach(this, function (value, key) {
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
            ], key))
                return;
            exportObj[key] = value;
        });
        return exportObj;
    };
    /**
     * Поведение по умолчанию - задать значения одноименным свойствам компонента
     * @param parameters
     * @private
     */
    VisualComponent.prototype._configurate = function (parameters) {
        var self = this;
        var stringified = JSON.stringify(parameters);
        if (stringified.length <= 200) {
            this.logger.minor('configurating ' + this.getClass() + ' using params: ' + stringified);
        }
        else {
            this.logger.minor('configurating ' + this.getClass());
        }
        if (!_.isEmpty(parameters))
            this.logger.minor(parameters);
        _.forEach(parameters, function (value, key) {
            self[key] = value;
        });
        this.logger.minor(this);
    };
    VisualComponent.prototype.jsxProvidedChildren = function () {
        return this._jsxProvidedChildren;
    };
    /**
     *
     * @returns {Object}
     * == this.props...
     */
    VisualComponent.prototype.jsxProvidedAttributes = function () {
        return this._jsxProvidedAttributes;
    };
    /**
     * назначенный ID при конструировании в le.components
     * @returns {number}
     */
    VisualComponent.prototype.getId = function () {
        return this.id;
    };
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    VisualComponent.prototype.installAppending = function (element) {
        var _this_1 = this;
        var def = $.Deferred();
        $(element).mountComponent(this, { mode: 'append' }).done(function () {
            def.resolve(_this_1);
        });
        return def.promise();
    };
    /**
     * Инсталлирует компонент внутрь указанного элемента
     * @param element
     * @returns {this}
     */
    VisualComponent.prototype.installInstead = function (element) {
        var _this_1 = this;
        var def = $.Deferred();
        $(element).mountComponent(this, { mode: 'replace' }).done(function () {
            def.resolve(_this_1);
        });
        return def.promise();
    };
    /**
     * Получить URL к изображению
     * @param image
     * @returns {string}
     */
    VisualComponent.prototype.imageUrl = function (image) {
        return this.backendUrl() + 'images/' + image;
    };
    /**
     * experimental! TODO: write code
     * @param signalName
     * @param callback
     * @returns {VisualComponent}
     * @deprecated
     */
    VisualComponent.prototype.onSignal = function (signalName, callback) {
        return this;
    };
    /**
     * experimental! TODO: write code
     * @param eventName
     * @param callback
     * @deprecated
     * @returns {VisualComponent}
     */
    VisualComponent.prototype.onEvent = function (eventName, callback) {
        return this;
    };
    /**
     * experimental! TODO: write code
     * @param combo
     * @param callback
     * @returns {VisualComponent}
     * @deprecated
     */
    VisualComponent.prototype.onKey = function (combo, callback) {
        return this;
    };
    VisualComponent.prototype.interact = function (component, title) {
        if (title === void 0) { title = ''; }
        var process = $.Deferred();
        this.openModal({
            title: title,
            content: component,
            terminators: {
                // целевое событие - сигнал done
                done: function (s) {
                    return process.resolve(s.data);
                },
            },
            signals: {
                // при отмене (закрытие диалогового окна) формируем reject
                cancelled: function (s) {
                    return process.reject(s.data);
                },
            }
        });
        return process.promise();
    };
    /**
     * Открыть модальное окно, назначив родительским этот компонент
     * @param options
     */
    VisualComponent.prototype.openModal = function (options) {
        debugger;
        var modalComponent = options.modalComponent || new Component.Common__Modal__Blurred;
        if (typeof options['title'] !== "undefined" && typeof modalComponent['setTitle'] !== "undefined")
            modalComponent['setTitle'](options['title']);
        var subComponent = options.content;
        var signalHandlers = options.signals || {};
        var signalTerminators = options.terminators || {};
        var handlers = _.merge(signalHandlers, signalTerminators);
        modalComponent
            .setParentComponent(this)
            .setComponent(subComponent)
            .fire(handlers, _.keys(signalTerminators));
        return modalComponent;
    };
    /**
     * Может терминирующие сигналы просто перечислять?
     * @param modalComponent
     * @param subComponent
     * @param signalHandlers
     * @deprecated
     */
    VisualComponent.prototype.modal = function (modalComponent, subComponent, signalHandlers) {
        if (signalHandlers === void 0) { signalHandlers = {}; }
        modalComponent
            .setParentComponent(this)
            .setComponent(subComponent)
            .fire(signalHandlers);
    };
    /**
     * TODO: Подобные вещи подключаемыми делать следует!.. Но как это в TS делается?
     * todo: возможно, класс компонента-подтверждения следует сделать настраиваемым
     * @param text
     * @param handlers
     */
    VisualComponent.prototype.confirm = function (text, handlers) {
        if (typeof window['Component']['Common__Dialog__Confirm'] === 'undefined') {
            this.logger.error('Component.Common__Dialog__Confirm VisualComponent not found!!!');
            return;
        }
        this.openModal({
            title: 'Требуется подтверждение',
            content: (new Component.Common__Dialog__Confirm)
                .setDefault(false)
                .setText(text),
            terminators: {
                yes: function (s) { return handlers['yes'] ? handlers['yes'] : function () { }; },
                no: function (s) { return handlers['no'] ? handlers['no'] : function () { }; },
            }
        });
    };
    /**
     * Обновление контента СУЩЕСТВУЮШЕГО визуального компонента и его реактивация
     * @param content
     * @param id
     */
    VisualComponent.prototype.prerenderedContentUpdate = function (content, id) {
        if (id === void 0) { id = null; }
        this.logger.major('Обновление контента компонента ' + id + ' и реактивация!');
        // TODO: replace может разрушить связь с переменными, указывающими на прежний элемент
        this.$element().replaceWith(content);
        // заставляем сработать скрипты инициализации и активации компонентов, которые в контенте
        $(document).triggerEvent('ready');
    };
    VisualComponent.prototype.url = function () {
        return le.ware.settings.urlToRoot + this.selfUrl;
    };
    /**
     * задать фокусировку keypress на этот компонент
     * может все-таки использовать le.keyboard.focusOn?
     * А то это жесткая привязка к модулю keypress
     */
    VisualComponent.prototype.setFocus = function () {
        le.keyboard.focusOn(this);
    };
    /**
     * снять фокусировку keypress с этого компонента
     */
    VisualComponent.prototype.unfocus = function () {
        le.keyboard.unfocus(this);
    };
    VisualComponent.prototype.killViewport = function () {
        this._element = undefined;
    };
    VisualComponent.prototype.setElement = function (domElement) {
        if (_.isElement(domElement))
            this._element = domElement;
    };
    VisualComponent.prototype.getClass = function () {
        if (!this.__cachedDetectedClassname)
            this.__cachedDetectedClassname = Detect.className(this);
        return this.__cachedDetectedClassname;
    };
    VisualComponent.prototype.getClassPublic = function () {
        return this.getClass();
    };
    VisualComponent.prototype.getCssClass = function () {
        return this.getClass();
    };
    VisualComponent.prototype.getClassStatic = function () {
        var staticClass = window[this.getClass()];
        return staticClass ? staticClass : false;
    };
    /**
     * @WARE!
     * @returns {string}
     */
    VisualComponent.prototype.backendUrl = function () {
        return le.ware.settings.urlToRoot + 'src/components/' + this.getClass() + '/';
    };
    VisualComponent.prototype.cssUrl = function (fileName) {
        return 'url("' + this.backendUrl() + fileName + '")';
    };
    VisualComponent.prototype.__startListenEvents = function () {
        var _this_1 = this;
        if (this.TERMINATE_EVENTS) {
            this.logger.minor('[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.');
            this.$element().on(this.TERMINATE_EVENTS, function (e) {
                if (!_.includes(['mousemove', 'mouseover', 'mouseout', 'mouseleave', 'mouseenter', 'mouseup', 'mousedown'], e.type)) {
                    _this_1.logger.minor('Event ' + e.type + ' terminated in ' + _this_1.getClass());
                }
                e.stopPropagation();
            });
        }
        var eventHandlers = this.listenEvents();
        if (_.isEmpty(eventHandlers))
            return;
        $.each(eventHandlers, function (eventName, handler) {
            _this_1.logger.minor('[ BIND EVENTS ] Регистрация обработчика события: ' + eventName);
            _this_1.$element().off(eventName); // снимаем существующий обработчик, если был
            _this_1.$element().on(eventName, handler);
        });
    };
    /**
     * После рендеринга содержимого, нужно повесить на component.Element слушальщики событий,
     * сообщений, сигналов и клавиатурных сочетаний. Кроме того, выполняется пользовательский
     * произвольный код по активации компонента.
     */
    VisualComponent.prototype.__start = function () {
        this.__startListenEvents();
        this.logger.minor('Активация компонента ' + this.debugName());
        le.keyboard.registerCombos(this.id, this.listenKeyboard());
        this.activate(); // TODO: сделать на promise-ах
    };
    /**
     * Останов этого конкретного компонента
     * @private
     */
    VisualComponent.prototype.__stop = function () {
        this.logger.minor('Деактивация компонента ' + this.debugName());
        le.keyboard.unregisterCombosForComponent(this.id);
        this.deactivate();
    };
    VisualComponent.prototype.deactivate = function () {
    };
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
    VisualComponent.prototype.activate = function () {
    };
    /**
     * Вычислить классы всех предков данного класса, начиная от VisualComponent
     * TODO: кроссбраузерно?
     * @param foundAncestors array
     * @returns array
     */
    VisualComponent.prototype.getAncestors = function (foundAncestors) {
        if (foundAncestors === void 0) { foundAncestors = null; }
        if (!foundAncestors)
            foundAncestors = [];
        if (!this['__proto__'] || !this['__proto__'].constructor)
            return foundAncestors;
        // hack... Работает постольку, поскольку VisualComponent класс без родительского класса
        if (this['__proto__'].constructor.name === 'Object')
            return foundAncestors;
        foundAncestors.push(this['__proto__'].constructor.name);
        return this['__proto__'].getAncestors
            ? this['__proto__'].getAncestors(foundAncestors)
            : foundAncestors;
    };
    /**
     * Генерация DOM-события
     */
    VisualComponent.prototype.trigger = function (name, parameters) {
        if (parameters === void 0) { parameters = {}; }
        if (!this.$element().length) {
            this.logger.notice('Failed to trigger event by component ' + this.debugName() + ': no DOM element tied!');
            return this;
        }
        var msg = 'Component '
            + this.debugName()
            + ' triggered event '
            + name;
        msg += (_.isEmpty(parameters) ? ' without parameters' : ' providing parameters:');
        this.logger.minor(msg);
        if (!_.isEmpty(parameters))
            this.logger.minor(parameters);
        this.$element().triggerEvent(name, parameters);
        return this;
    };
    /**
     * Привязка обработчиков клавиатурных сочетаний keypress
     */
    VisualComponent.prototype.listenKeyboard = function () {
        return {};
    };
    /**
     * Для получения сообщений из IFRAME-ов
     * TODO: возможно, актуальна только в контексте всего документа, а не компонента
     */
    VisualComponent.prototype.listenMessages = function () {
        return {};
    };
    /**
     * Скомпилировать JST-шаблон
     * https://lodash.com
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * → '<li>fred</li><li>barney</li>'
     * TODO: а не следует ли возвращать HTMLElement?
     * @returns {string}
     */
    VisualComponent.prototype.renderJsTemplate = function (templateName, parameters) {
        if (parameters === void 0) { parameters = {}; }
        if (typeof _ == 'undefined') {
            this.logger.error('Cannot render javascript template ' + templateName + ' - required lodash module is undefined!');
            return '';
        }
        parameters['_this'] = this;
        var templatePrefix = 'template_jst_' + this.getClass() + '_';
        var templateId = templatePrefix + templateName;
        var compiled = null;
        if (le.templates.templateIsCached(templateId)) {
            this.logger.log('compiling ' + templateId + ' from cache with parameters:');
            this.logger.log(parameters);
            compiled = le.templates.getCached(templateId);
        }
        else {
            this.logger.log('compiling ' + templateId + ' by lodash with parameters:');
            this.logger.log(parameters);
            var templateString = $('#' + templateId).html();
            if (!templateString) {
                this.logger.error('Template ' + templateId + ' not found!');
                return '';
            }
            compiled = _.template(templateString, { variable: 'data' });
            le.templates.cacheTemplate(templateId, compiled);
        }
        try {
            return compiled(parameters);
        }
        catch (e) {
            this.logger.error('Exception while compiling template ' + templateName + ': ' + e.toString());
            return '';
        }
    };
    /**
     * При рендеринге может быть использован метод компонента вроде this.layout_default();
     * Эта функция вычисляет имя этого метода на основе названия layout-а
     * @param layoutName
     * @returns {string}
     * @private
     */
    VisualComponent.prototype.__layoutMethodName = function (layoutName) {
        if (layoutName === void 0) { layoutName = ''; }
        return 'layout_' + (layoutName ? layoutName : this.layout);
    };
    /**
     * Проверяет, существует ли функция layout_xxx() в компоненте
     * @param layoutName
     * @returns {boolean}
     */
    VisualComponent.prototype.__layoutMethodExists = function (layoutName) {
        if (layoutName === void 0) { layoutName = ''; }
        return !!this[this.__layoutMethodName(layoutName)];
    };
    /**
     * @param newLayout
     */
    VisualComponent.prototype.switchLayoutTo = function (newLayout) {
        if (!this.__layoutMethodExists(newLayout))
            return;
        this.layout = newLayout;
        this.$element().mountComponent(this);
        // this.$element().installExistingComponent(this);
    };
    VisualComponent.prototype.createContainer = function () {
        var $container = $('<div>');
        this.getAncestors().forEach(function (ancestorClass) {
            $container.addClass(ancestorClass);
        });
        if (this['rtid']) {
            $container.attr('id', this['rtid']);
        }
        return $container.get(0);
    };
    VisualComponent.prototype.displaySimple = function (options) {
        var _this_1 = this;
        if (options === void 0) { options = {}; }
        this.logger.notice('displaying simple...');
        var dfd = $.Deferred();
        this._jsxProvidedChildren = options['providedChildren'] || [];
        this.props = this._jsxProvidedAttributes = options['providedAttributes'] || {};
        $.when(this.beforeRender()).done(function (beforeRenderResult) {
            // so, we can implement render function with parameters, like ( vars: { hello: string } ) {
            $.when(_this_1.render(beforeRenderResult)).done(function (content) {
                if (_.isElement(content)) {
                    // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                    _this_1.logger.notice('not implemented!');
                }
                else if (_.isArray(content)) { // JSX array-based render
                    $.when(jsx(content)).done(function (resultElement) {
                        le.components.tie(resultElement, _this_1);
                        _this_1.activate();
                        dfd.resolve(resultElement);
                    });
                }
                else if (_.isString(content)) {
                    _this_1.logger.notice('content cannot be string!');
                    // это может быть backend-рендеринг или шаблонный JST-рендер
                    // string содержит только внутренний контент
                    // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..
                    dfd.resolve(new Comment);
                }
            });
        });
        return dfd.promise();
    };
    /**
     * Deferred-Полифил для разных способов рендеринга визуального компонента
     */
    VisualComponent.prototype.display = function (options) {
        var _this_1 = this;
        if (options === void 0) { options = {}; }
        if (this.isSimple)
            return this.displaySimple(options);
        var dfd = $.Deferred();
        this._jsxProvidedChildren = options['providedChildren'] || [];
        this.props = this._jsxProvidedAttributes = options['providedAttributes'] || {};
        $.when(this.beforeRender()).done(function (beforeRenderResult) {
            // so, we can implement render function with parameters, like ( vars: { hello: string } ) {
            $.when(_this_1.render(beforeRenderResult)).done(function (content) {
                if (_.isElement(content)) {
                    // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                    _this_1.logger.notice('not implemented!');
                }
                else if (_.isArray(content)) { // JSX array-based render
                    jsx(content).done(function (resultElement) {
                        var container = _this_1.createContainer();
                        if (_.includes(['COMPONENT'], resultElement.tagName) && $(resultElement).contents().length) {
                            // может быть аттрибуты DIV копировать?..
                            while ($(resultElement).contents().length == 1 && $(resultElement).contents().first().get(0).tagName == 'COMPONENT') {
                                resultElement = $(resultElement).contents().first().get(0);
                            }
                            $(resultElement).contents().each(function () {
                                $(container).append(this);
                            });
                        }
                        else {
                            $(container).append(resultElement);
                        }
                        le.components.tie(container, _this_1);
                        _this_1.__start(); // опции?
                        dfd.resolve(container);
                    });
                }
                else if (_.isString(content)) {
                    // это может быть backend-рендеринг или шаблонный JST-рендер
                    // string содержит только внутренний контент
                    // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..
                    var container = _this_1.createContainer();
                    $(container).html(content);
                    le.components.tie(container, _this_1);
                    _this_1.__start(); // опции?
                    dfd.resolve(container);
                }
            });
        });
        return dfd.promise();
        /**
         * Что может происходить?
         * 1. Компонент сразу все отрендерит и отдаст, например, string
         * 2. Компонент, чтобы отрендерить контент, будет куда-то еще асинхронно обращаться
         * и тогда вернет он promise
         * 3. Компонент вернет МАССИВ, который был сгенерирован из JSX
         */
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Хорошее место для подготовки всего что нужно для рендера компонента.
     * Вызывается каждый раз перед рендером компонента
     * Promise-совместим!
     * @returns {boolean}
     */
    VisualComponent.prototype.beforeRender = function () {
        return;
    };
    VisualComponent.prototype.render = function (options) {
        return this.renderViaBackend();
    };
    /**
     * Shortcut для доступа к элементу компонента, обернутому в JQuery
     * @returns {JQuery}
     */
    VisualComponent.prototype.$element = function () {
        return $(this._element);
    };
    /**
     * Shortcut для доступа к элементу компонента
     * @returns {Element}
     */
    VisualComponent.prototype.element = function () {
        return this._element;
    };
    /**
     * Shortcut для доступа к элементу компонента (возвращает как HTMLElement)
     * @returns {HTMLElement}
     */
    VisualComponent.prototype.htmlelement = function () {
        return this._element;
    };
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
    VisualComponent.prototype.__up = function () {
        var $self = this.$element();
        var $parentComponent = $self.parent().closest('.VisualComponent');
        return $parentComponent.length ? $parentComponent.get(0).model : null;
        // TODO: $parentComponent.model() ?
    };
    VisualComponent.prototype.findParentComponent = function () {
        var $self = this.$element();
        var $parentComponent = $self.parent().closest('.VisualComponent');
        return $parentComponent.length ? $parentComponent.get(0).model : null;
    };
    VisualComponent.prototype.debugName = function () {
        return this.getClass() + '(' + this.id + ')';
    };
    VisualComponent.prototype.signalPublic = function (name, data) {
        if (data === void 0) { data = {}; }
        return this.signal(name, data);
    };
    /**
     * Сгенерировать сигнал
     * TODO: может сделать третий параметр callback - чтобы вызывать его
     * когда сигнал будет обработан?
     * @param name
     * @param data
     */
    VisualComponent.prototype.signal = function (name, data) {
        if (data === void 0) { data = {}; }
        var signal = new Signal_1.default();
        signal.name = name;
        signal.data = data;
        signal.trigger = this;
        this.logger.log('Signal "' + name + '" ' + JSON.stringify(data) + ' fired in ' + this.debugName() + '!');
        this._signalHandle(signal);
        // для удобства в использовании при конвертации события в сигнал и прекращения обработки события
        return false;
    };
    /**
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     * @param signal
     */
    VisualComponent.prototype.signalProxy = function (signal) {
        this._signalBubble(signal);
    };
    /**
     * Сигналы, которые умеет обрабатывать компонент
     * @public
     */
    VisualComponent.prototype.listenSignals = function () {
        return {};
    };
    ;
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
    VisualComponent.prototype.listenEvents = function () {
        return {};
    };
    /**
     * Отправить сигнал на обработку вышестоящим визуальным компонентам
     */
    VisualComponent.prototype._signalBubble = function (signal) {
        this.logger.minor('Всплытие сигнала вверх...');
        var parentModel = this.__up();
        try {
            expect(parentModel, 'Родительский компонент не обнаружен!');
        }
        catch (e) {
            this.logger.error(e.message);
            return;
        }
        if (parentModel instanceof VisualComponent)
            parentModel._signalHandle(signal);
    };
    /**
     * Вычислить путь, пройденный событием до этого компонента,
     * при этом выбирая только визуальные компоненты
     * @param e
     * @returns {Array}
     */
    VisualComponent.prototype.getEventPathComponents = function (e) {
        // TODO: можно путь взять отсюда: window.testEvent.path
        // TODO: можно не элементы, а модели в путь включать
        var path = [];
        var $current = $(e.target);
        var $parent;
        do {
            if ($current.hasClass('VisualComponent'))
                $current = $current.parent();
            $parent = $current.closest('.VisualComponent');
            if ($parent.length)
                path.push($parent.get(0));
            $current = $parent;
        } while ($parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document);
        return path;
    };
    /**
     * Вычислить путь, пройденный событием до этого компонента
     * @param e
     * @returns {Array}
     */
    VisualComponent.prototype.getEventPath = function (e) {
        // TODO: можно путь взять отсюда: window.testEvent.path
        var $current = $(e.target);
        var $parent;
        var path = [];
        do {
            $parent = $current.parent();
            if ($parent.length)
                path.push($parent.get(0));
            $current = $parent;
        } while ($parent.length && $parent.get(0) !== this.element() && $parent.get(0) !== document);
        return path;
    };
    /**
     * Определяет, что событие возникло в другом компоненте
     * @param e
     * @returns {boolean}
     */
    VisualComponent.prototype.eventNotInternal = function (e) {
        return this.isEventInternal(e) == false;
    };
    /**
     * Определяет, возникло ли событие непосредственно внутри этого компонента
     * @param e
     * @returns {boolean}
     */
    VisualComponent.prototype.isEventInternal = function (e) {
        return ($(e.target)
            .closest('.VisualComponent')
            .get(0) === this.element());
    };
    //noinspection JSMethodCanBeStatic
    VisualComponent.prototype.customSignalHandler = function (s) {
        return null;
    };
    VisualComponent.prototype._signalHandleHook = function (signal) {
    };
    /**
     * Обработать сигнал
     */
    VisualComponent.prototype._signalHandle = function (signal) {
        signal.trip.push(this);
        var continueBubbling = true; // bubbling by default!
        var handlerMethodName = 'on_' + signal.name;
        if (this[handlerMethodName]) {
            this.logger.info('Handling signal in component ' + this.debugName() + ' via method ' + handlerMethodName);
            continueBubbling = this[handlerMethodName](signal); // will be undefined by default!
        }
        else if (this.listenSignals()[signal.name]) {
            // TODO: call trigger callback?
            this._signalHandleHook(signal);
            continueBubbling = this.listenSignals()[signal.name].call(this, signal);
        }
        else {
            this.logger.minor('Handling signal by customSignalHandler in ' + this.debugName());
            var customResult = this.customSignalHandler(signal);
            if (customResult !== null)
                continueBubbling = customResult;
            else
                this.logger.minor('Signal handler not set in ' + this.debugName());
        }
        if (continueBubbling) {
            this._signalBubble(signal);
        }
        else {
            this.logger.minor('Signal ' + signal.name + ' bubbling stopped!');
        }
    };
    /**
     * Выполнить команду на стороне бэкенда этого компонента
     * @WARE!
     * @param command
     * @param params
     * @param options
     */
    VisualComponent.prototype.executeCommand = function (command, params, options) {
        if (params === void 0) { params = {}; }
        if (options === void 0) { options = {}; }
        return le.ware.componentBackendCommand(this, command, params, options);
    };
    /**
     * Сообщить бэкенду компонента о произошедшем событии
     * @WARE!
     * @param event
     * @param params
     */
    VisualComponent.prototype.backendEvent = function (event, params) {
        if (params === void 0) { params = false; }
        this.logger.log('backendEvent ' + event);
        le.ware.componentBackendEvent(this, event, params);
    };
    /**
     * Отрисовка компонента через JST-шаблон
     * @param layoutName
     * @param parameters
     * @returns {string}
     */
    VisualComponent.prototype.renderViaClient = function (layoutName, parameters) {
        if (layoutName === void 0) { layoutName = 'default'; }
        if (parameters === void 0) { parameters = {}; }
        return this.renderJsTemplate(layoutName, parameters);
    };
    /**
     * Отрисовка компонента через сервер
     * TODO: это же просто проксирует renderByBackendStaticAsynchronous?.. А зачем?
     * @param layoutName
     * @param parameters
     * @returns {JQueryPromise<T>}
     */
    VisualComponent.prototype.renderViaBackend = function (layoutName, parameters) {
        if (layoutName === void 0) { layoutName = 'default'; }
        if (parameters === void 0) { parameters = {}; }
        var process = $.Deferred();
        // todo: как бы брать параметры автоматом?
        this.renderByBackendStaticAsynchronous(layoutName, parameters)
            .always(function (result) {
            process.resolve(result);
        });
        return process.promise();
    };
    /**
     * TODO: Отправляем запрос на сервер, чтобы получить отрендеренный компонент
     * @returns {string}
     */
    VisualComponent.prototype.renderByBackendStaticAsynchronous = function (layout, parameters) {
        var _this_1 = this;
        if (layout === void 0) { layout = VisualComponent.LAYOUT_DEFAULT; }
        if (parameters === void 0) { parameters = {}; }
        var process = $.Deferred();
        this.logger.log('Rendering layout ' + layout + ' of component ' + this.debugName() + ' by backend...');
        // debugger;
        var data = {
            // если используем существующий бэкенд
            rtid: this.rtid,
            // в обоих ситуациях
            layout: layout,
            // если создаем новый бэкенд
            className: this.getClass(),
            initialParameters: parameters,
            createPersistant: false,
        };
        le.backend.wareRequest('LE_COMPONENT_RENDER_LAYOUT', data)
            .done(function (result) {
            // debugger;
            if (_.isObject(result.content)) {
                _this_1.rtid = result.content.rtid;
                process.resolve(result.content.rendered);
            }
            else {
                process.resolve(result.content);
            }
        })
            .fail(function () {
            // debugger;
            process.resolve('<div style="text-align: center;">Ошибка отрисовки на стороне сервера!<hr /><button onclick="$(this).triggerEvent(\'cancel\')">Закрыть</button></div>');
        });
        // TODO: передаваемые параметры - они для конструирования компонента или для передачи в layout???
        return process.promise();
    };
    VisualComponent.prototype.refreshViewport = function () {
        this.switchLayoutTo(this.layout);
    };
    VisualComponent.prototype.reRenderPublic = function () {
        this.reRender();
    };
    VisualComponent.prototype.reRender = function () {
        this.$element().mountComponent(this, { mode: 'replace' });
    };
    VisualComponent.LAYOUT_DEFAULT = 'default';
    return VisualComponent;
}());
exports.default = VisualComponent;
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
