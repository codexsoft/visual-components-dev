import * as $ from 'jquery';
import * as _ from 'lodash';
import VisualComponent from "./VisualComponent";
import Detect from "./Detect";
import ComponentsSettings from "./ComponentsSettings";
import ComponentsEventDispatcher from "./ComponentsEventDispatcher";
import triggerEventRegister from './jquery-functions/triggerEvent';
import mountComponentRegister from './jquery-functions/mountComponent';
import NullLogger from "./logger/NullLogger";
import LoggerInterface from "./logger/LoggerInterface";
import Keyboard from "./plugin/KeypressPlugin/Keyboard";
import AbstractPlugin from "./plugin/AbstractPlugin";

export type VisualComonentIdentificator = string;

/**
 * Реестр визуальных компонентов
 */
export default class Components {

    public static classNames: {[index: string]: Function} = {};

    public static findClassNameByComponent(component: VisualComponent): string {
        return this.findClassNameByClass(component.constructor);
    }

    public static findClassNameByClass(componentClass: Function): string {
        for (let classNamesKey in this.classNames) {
            if (this.classNames[classNamesKey] === componentClass) {
                return classNamesKey;
            }
        }

        let className = Detect.className(componentClass);
        this.classNames[className] = componentClass;
        return className;
    }

    public static readonly visualComponentCssClass: string = '.VisualComponent';

    /**
     * какие события мыши терминировать по умолчанию в этом компоненте?
     * например, DOMEvents.MouseEvent;
     * @type {string}
     */
    public static TERMINATE_EVENTS: string = '';

    public static init() {

        triggerEventRegister();
        mountComponentRegister();

        console.log('init');
        console.log(this.logger);

        this.settings = new ComponentsSettings();
        this.dispatcher = new ComponentsEventDispatcher();

        this.plugins.forEach((plugin) => {
            this.logger.debug('Initialization of plugin');
            this.logger.debug(plugin);
            plugin.init(this.dispatcher);
        });
    }

    static get logger(): LoggerInterface {
        return this._logger;
    }

    static set logger(value: LoggerInterface) {
        this._logger = value;
    }

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

}