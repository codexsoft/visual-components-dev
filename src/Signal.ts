/**
 *
 * События поднимаются по DOM-дереву
 * При этом пользуемся ими обычно для обслуживания интерактивности
 * внутри компонента, и не пускаем вверх (вышестоящие компоненты не обрабатывают)
 * события, произошедшие в нижестоящих
 *
 * А Signals - необязательно же по DOM вверх идти! Модалки, например, в DOM
 * могут не быть вложенными друг в друга, однако можно указать предка и передавать
 * на обработку ему...
 *
 * В общем, события - проверять в обработчиках что они internal
 * А сигналы в диалогах - через handler-ы, там необязательно вложенность
 *
 */
import VisualComponent from "./VisualComponent";

export default class Signal {

    public name = null;
    public data: any = {};
    public trigger: VisualComponent = null;
    public trip = [];

    public by( component ) {
        return component == this.trigger;
    }

    from( component ) {
        return this.trip.some( function( current ){ return component == current; } );
    }

}