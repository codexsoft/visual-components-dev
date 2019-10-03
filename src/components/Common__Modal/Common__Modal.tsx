import * as _ from "lodash";
import * as $ from "jquery";
import ListenEventsInterface from "../../types/ListenEventsInterface";
import VisualComponent from "../../VisualComponent";
import Signal from "../../Signal";
import Components from "../../Components";
import KeyboardInterface from "../../plugin/KeypressPlugin/KeyboardInterface";

export default abstract class Common__Modal extends VisualComponent implements KeyboardInterface, ListenEventsInterface {

    // protected TERMINATE_EVENTS = true;
    // protected INDEPENDENT_MODAL: boolean = true;

    // @ts-ignore
    protected parentComponent: VisualComponent;
    // @ts-ignore
    protected component: VisualComponent;

    protected _signals = {};

    /**
     * названия сигналов, после обработки которых нужно завершать диалог
     */
    protected _terminators: Array<string> = [];

    /**
     * Конструирует модальное окно
     */
    protected abstract constructModal(): JQuery;
    protected abstract destroyModal(): void;
    protected abstract afterComponentMounted(renderedComponentElement: Element): void;

    protected async _signalHandleHook(signal: Signal): Promise<void> {

        if (!_.includes(this.getTerminators(), signal.name) ) {
            return;
        }

        await this.finish(); // закрываем модальное окно

        // забываем про клавиатурные сочетания источника событий
        Components.keyboard.unregisterCombosForComponent(signal.trigger.getId());
    }

    listenKeyboard() {
        return {
            esc: () => { this.finish(); this.signal('cancelled'); return false; },
        }
    }

    // listenKeyboard() { return _.assign({
    //     TODO: сделать возможным по клику вне окна закрывать его
    //     esc: () => { this.finish(); this.signal('cancelled'); return false; },
    // }, super.listenKeyboard()); }

    /**
     * Обработка событий внутри компонента
     */
    listenEvents() { return {
        cancel: () => { this.finish(); this.signal('cancelled'); return false; },
        refresh: () => { this.reRender(); return false; },
    };}

    async activateAsync(): Promise<any> {
        return new Promise(async (resolve: Function, reject: Function) => {
            // debugger;
            await this.$element().find('div.component').mountComponent(this.component);
            Components.keyboard.focusOn( this.component );
            resolve();
        });
    }

    public getTerminators() {
        return this._terminators;
    }

    public setParentComponent( component: VisualComponent ) {
        this.parentComponent = component;
        return this;
    }

    public setComponent( component: VisualComponent ) {
        this.component = component;
        return this;
    }

    public setSignalHandlers( signalHandlers: Object ) {
        this._signals = signalHandlers;
        return this;
    }

    /**
     * Назначенные родительским компонентом обработчики сигналов из дочернего компонента
     * Если сигнал будет пойман, модальное окно по умолчанию будет закрыто
     */
    listenSignals() {
        return this._signals;
    }

    public afterFinish(): void {

        // noinspection SuspiciousTypeOfGuard
        if (!(this.parentComponent instanceof VisualComponent)) {
            return;
        }

        $("html, body").animate({
            // @ts-ignore
            scrollTop: this.parentComponent.$element().offset().top
        },"slow");

    }

    /**
     * После отлова ожидаемого сигнала из дочернего компонента,
     * модальное окно следует закрыть, что и делает эта функция
     *
     * todo слушателей клавиатурных событий, связанных с этим объектом, нужно убивать!
     * todo модель наверное тоже следует уничтожать чтобы освобождать память?
     *
     * @param answer
     */
    public async finish( answer: any = null ) {

        this.logger._minor('Finishing modal '+this.debugName()+'!..');
        await Components.stopComponentsInNode( this.component.element() );
        await this.component.__stop();
        this.destroyModal();
        this.killViewport();
        this.logger._minor('Modals should be removed...');
        Components.keyboard.unregisterCombosForComponent(this.id);
        // debugger;
        // this.signal('cancel');

        this.afterFinish();

        // возвращаем клавиатурный фокус компоненту-инициатору
        Components.keyboard.focusOn( this.parentComponent );

    }

    public async fire( signalHandlers: Object = {}, terminators = [] ) {

        this._terminators = terminators;

        if (!_.isEmpty(signalHandlers)) {
            this.setSignalHandlers(signalHandlers);
        }

        // привязываем модал к созданному модальному окну
        let renderedComponentElement = await this.constructModal().mountComponent(this);
        this.afterComponentMounted(renderedComponentElement);


        // this.constructModal().mountComponent( this ).always(( renderedComponentElement ) => {
        //     this.afterComponentMounted( renderedComponentElement );
        // });

    }

}