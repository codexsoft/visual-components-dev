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
import VisualComponent from "./VisualComponent";
import ModalComponentInterface from "./ModalComponentInterface";
import OpenModalOptionsInterface from "./OpenModalOptionsInterface";
import Common__Modal__Blurred from "./components/Common__Modal__Blurred";
import Common__Dialog__Confirm from "./components/Common__Dialog__Confirm";

/**
 * @deprecated
 */
export default abstract class VisualComponentOld {

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
     * Deferred-Полифил для разных способов рендеринга визуального компонента
     */
    public async display(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element> {

        if ( this.displayWithoutContainer ) {
            return this.displaySimple(options);
        }

        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: any = await this.render(beforeRenderResult);

        return new Promise<Element>(async (resolve: Function, reject: Function) => {
            if ( _.isElement( content ) ) {

                // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                this.logger.notice('not implemented!');

            } else if ( _.isArray( content ) ) { // JSX array-based render

                let resultElement: Element = await (new JsxArray(content)).render();
                let container = this.createContainerElement();
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
                await this.__start(); // опции?

                resolve( container );

            } else if ( _.isString( content ) ) {

                // это может быть backend-рендеринг или шаблонный JST-рендер
                // string содержит только внутренний контент
                // что если у компонента уже есть отрисованный контейнер? Все равно новый создаем?..

                let container = this.createContainerElement();
                $(container).html(content);

                Components.tie(container, this);
                await this.__start(); // опции?

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

    /**
     * todo: should be implemented in a single method display...
     * @param options
     */
    public async displaySimple(options: VisualComponentDisplayOptionsInterface = {}): Promise<Element> {

        this.logger.notice('displaying simple...');
        this.importDisplayVars(options);
        let beforeRenderResult: any = await this.beforeRender();
        let content: any = await this.render(beforeRenderResult);

        return new Promise(async (resolve: Function, reject: Function) => {

            if (_.isElement(content)) {

                // вообще это редкий случай. такое возможно, если render сделан как JSX, который не массив возвращает
                this.logger.notice('not implemented!');
                resolve(new Comment);

            } else if (_.isArray(content)) { // JSX array-based render

                let resultElement: Element = await (new JsxArray(content)).render();
                Components.tie(resultElement, this);
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

    public signalPublic( name, data: Object = {} ): boolean {
        return this.signal( name, data );
    }

    public reRenderPublic() {
        this.reRender();
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

    /**
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     * @param signal
     */
    protected signalProxy(signal: Signal): void {
        this._signalBubble(signal);
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

    protected interact(component: VisualComponent, title: string = ''): Promise<any> {
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

