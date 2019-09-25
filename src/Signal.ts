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

    public name: string;
    public data: any = {};
    // @ts-ignore
    public trigger: VisualComponent;
    public trip: VisualComponent[] = [];

    constructor(name: string, trigger: VisualComponent) {
        this.name = name;
        this.trigger = trigger;
    }

    public by(component: VisualComponent): boolean {
        return component == this.trigger;
    }

    public from(component: VisualComponent): boolean {
        return this.trip.some(function(current) {
            return component == current;
        });
    }

}