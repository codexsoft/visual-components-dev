import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Keypress from 'keypress.js';
import VisualComponent from "./VisualComponent";
import Detect from "./Detect";
import ComponentsSettings from "./ComponentsSettings";
import ComponentsEventDispatcher from "./ComponentsEventDispatcher";
import ComponentLifecycleEventInterface from "./events/ComponentLifecycleEventInterface";
import Events from "./events/Events";
import {implementsInterface} from "./shortcut-functions/implements";
import ListenEventsInterface, {listenEventsInterface} from "./types/ListenEventsInterface";
import triggerEventRegister from './jquery-functions/triggerEvent';
import mountComponentRegister from './jquery-functions/mountComponent';
import NullLogger from "./logger/NullLogger";
import LoggerInterface from "./logger/LoggerInterface";
import Keyboard from "./plugin/KeypressPlugin/Keyboard";
import KeyboardInterface, {listenKeyboardInterface} from "./plugin/KeypressPlugin/KeyboardInterface";
import AbstractPlugin from "./plugin/AbstractPlugin";
// import JstTemplates from "./JstTemplates";
// import ComponentStartedEvent from "./events/ComponentStartedEvent";

export type VisualComonentIdentificator = string;

/**
 * Реестр визуальных компонентов
 */
export default class Components {

    public static readonly visualComponentCssClass: string = '.VisualComponent';

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, DOMEvents.MouseEvent;
     * @type {string}
     */
    public static TERMINATE_EVENTS: string = '';

    static get logger(): LoggerInterface {
        return this._logger;
    }

    static set logger(value: LoggerInterface) {
        this._logger = value;
    }

    public static keyboard: Keyboard;
    // public static jstTemplates: JstTemplates;
    public static dispatcher: ComponentsEventDispatcher;
    public static plugins: AbstractPlugin[] = [];

    private static _logger: LoggerInterface = new NullLogger();
    static settings: ComponentsSettings;

    /**
     * @private
     */
    private static _lastId = 0;

    /**
     * Was used when server-rendering used: when component is already displayed but not started yet.
     * @param $element
     * @param componentClass
     * @param params
     */
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

    public static async stopComponentsInNode( node: Element ): Promise<void> {

        return new Promise<void>(function(resolve: Function) {
            // TODO: а не включить ли .add(node) сюда?
            // let $node = <JQuery><unknown>$(node);
            // let $components = $node.find(this.visualComponentCssClass);
            let $components = (<JQuery><unknown>$(node)).find(Components.visualComponentCssClass);
            _.forEach($components, async (component) => {
                await $(<HTMLElement>component).model().__stop();
            } );
            resolve();
        });
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

        triggerEventRegister();
        mountComponentRegister();

        this.plugins.forEach((plugin) => {
            plugin.init(this.dispatcher);
        });

        // debugger;
        console.log('init');
        // console.log(this._logger);
        console.log(this.logger);
        // this.logger.info('initialization');
        // debugger;

        // this.jstTemplates = new JstTemplates();
        this.settings = new ComponentsSettings();
        this.dispatcher = new ComponentsEventDispatcher();

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