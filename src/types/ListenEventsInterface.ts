import VisualComponent from "../VisualComponent";

// export default interface ListenEventsInterface extends VisualComponent {
export default interface ListenEventsInterface extends VisualComponent {
    /**
     * События, которые компонент умеет обрабатывать
     * Если событие не должно всплывать наверх, в обработчике нужно вернуть false
     * По факту, это работает через JQuery.on()
     *
     * Внутри обработчика можно проверить, произошло ли событие внутри компонента:
     * if ( this.eventNotInternal(e ) ) return;
     *
     * Можно терминировать события, произошедшие в дочерних компонентах (опционально, по умолчанию отключено)
     */
    listenEvents(): {[index: string]: Function};
}

export const listenEventsInterface = {
    listenEvents: 'function',
};