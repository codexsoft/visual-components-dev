import VisualComponent from "./VisualComponent";
import * as Keypress from 'keypress.js';
import * as _ from "lodash";
import LoggerInterface from "./LoggerInterface";
import NullLogger from "./NullLogger";

export default class Keyboard {

    private logger: LoggerInterface = new NullLogger();

    /**
     * Зарегистрированные клавиатурные сочетания (['tab','meta x'])
     * Используется нотация keypress
     * @type {Array}
     */
    private combos: string[]|any = [];

    // private preventDefaultValue = true;

    // public continueBubble() {
    //     return true;
    // }

    // /**
    //  * @deprecated
    //  * @returns {boolean}
    //  */
    // public preventDefault() {
    //     return this.preventDefaultValue;
    // }

    /**
     * @private
     */
    private _callbacks: any = {};

    private listener: Keypress.Listener;

    /**
     * @private
     */
    private _focused: VisualComponent|null = null;

    constructor(listener: Keypress.Listener, logger?: LoggerInterface) {
        this.listener = listener;
        this.logger = logger || new NullLogger();
    }

    public focused(): VisualComponent|null {
        // TODO: текущий компонент используется только для клавиатурных сочетаний
        return this._focused;
    }

    public focusOn( component: VisualComponent ) {

        // noinspection SuspiciousTypeOfGuard
        if ( component instanceof VisualComponent ) {
            if ( this._focused ) {
                this._focused.$element().removeClass( 'keyboardFocused' );
            }
            component.$element().addClass('keyboardFocused');
            this.logger._minor('[KEYBOARD] Считыватель клавиатуры сфокусирован на компоненте '+component.debugName());
            this._focused = component;
        }
    }

    public unfocus( component: VisualComponent ) {
        if ( this._focused === component )
            this._focused = null;
    }

    public unregisterCombosForComponent(componentId: number) {

        this.logger._minor('Забываем про клавиатурные сочетания компонента с id = '+componentId);
        _.forEach(this._callbacks, ( comboListeners, combo ) => {

            this.logger._minor('Забываем про сочетание '+combo+' компонента '+componentId);

            delete this._callbacks[combo][componentId];

            if ( !this._callbacks[combo].length ) {

                delete this._callbacks[combo];

                if ( combo in this.combos )
                    delete this.combos[combo];

                this.listener.unregister_combo(combo);

            }

        });
        // TODO: пустые можно убирать в принципе

    }

    public handle(combo: string, e: KeyboardEvent){

        this.logger._minor('[ KEYBOARD ] Зарегистрировано событие: комбинация клавиш: '+combo);

        if ( !_.includes(this.combos, combo) ) {
            this.logger._log('Нет обработчика для этой комбинации!');
            return;
        }

        //let component = le.components.focused();
        let component = this.focused();

        // this.logger.log('Компонент, имеющий фокус:');
        // this.logger.log(component);
        // this.logger.log(component.getId());

        // this.logger.log('Родительский компонент:');
        // this.logger.log(component.parentComponent());
        // this.logger.log(component.parentComponent().getId());

        let continueBubbling = false;

        while (component instanceof VisualComponent) {
            if ( this._callbacks[combo] && this._callbacks[combo][component.getId()] ) {
                this.logger._log('Обработчик комбинации найден у компонента с id = '+component.getId()+'!');
                this.logger._log(component);
                continueBubbling = this._callbacks[combo][component.getId()]();
                if (!continueBubbling) break;
            }
            component = component.findParentComponent();
        }

        e.preventDefault();
        e.stopPropagation();
        return false;

    }

    /**
     * Зарегистрировать несколько клавиатурных сочетаний
     * @param componentId
     * @param combosx
     */
    public registerCombos(componentId: number, combosx: {}) {

        if ( _.isEmpty(combosx) ) return;

        // this.init();

        $.each( combosx, ( combo, callbackFunction ) => {
            this.addComboListener( combo, componentId, callbackFunction );
        } );
    }

    /**
     * Зарегистрировать одно клавиатурное сочетание
     * @param combo
     * @param componentId
     * @param handlerFunction
     */
    public addComboListener(combo: string, componentId: number, handlerFunction: Function) {

        if (!_.includes(this.combos, combo)) {
            this.combos.push(combo);
        }

        this.logger._minor('[ KEYBOARD ]: Добавлена комбинация клавиш для прослушки компонентом '+componentId+': ['+combo+']');
        this.listener.simple_combo(combo, (e?: KeyboardEvent): boolean => {
            if (e instanceof KeyboardEvent) {
                this.handle( combo, e );
            }
            return true;
        });

        if ( !this._callbacks[combo] ) this._callbacks[combo] = {};
        this._callbacks[combo][componentId] = handlerFunction;

    }

}