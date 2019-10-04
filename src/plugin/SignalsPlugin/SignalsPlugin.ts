import VisualComponent from "../../VisualComponent";
import ListenSignalsInterface, {listenSignalsInterface} from "./ListenSignalsInterface";
import Components from "../../Components";
import ensure from "../../shortcut-functions/ensure";
import { implementsInterface } from "@codexsoft/function-implements-interface";
import Signal from "./Signal";
import Events from "../../events/Events";
import AbstractPlugin from "../AbstractPlugin";
import SignalsTrait from "./SignalsTrait";
import applyMixins from "mixins-may-apply";
import VisualComponentWithSignals from "./VisualComponentWithSignals";
import ComponentSignalEventInterface from "../../events/ComponentSignalEventInterface";

export default class SignalsPlugin extends AbstractPlugin {

    init(dispatcher: EventTarget): void {
        applyMixins(VisualComponentWithSignals, [SignalsTrait]);

        dispatcher.addEventListener(Events.componentSentSignal,
            // @ts-ignore
            (e: CustomEvent<ComponentSignalEventInterface>) => {
                this.signalHandle(e.detail.signal, e.detail.signal.trigger);
            }
        );
    }

    public signalHandle(signal: Signal, component: VisualComponent): void {

        signal.trip.push(component);
        let continueBubbling = true; // bubbling by default!

        if (implementsInterface<ListenSignalsInterface>(component, listenSignalsInterface)) {
            let signalHandlers = component.listenSignals();
            if (signal.name in signalHandlers) {
                component._signalHandleHook(signal);
                continueBubbling = signalHandlers[signal.name].call(this, signal);
            } else {
                Components.logger._minor('Handling signal by customSignalHandler in ' + component.debugName());
                let customResult = component.signalCustomHandler(signal);
                if (customResult !== null) {
                    continueBubbling = customResult;
                } else {
                    Components.logger.debug('Signal handler not set in '+component.debugName());
                }
            }
        }

        if ( continueBubbling ) {
            this.signalBubble(signal, component);
        } else {
            Components.logger.debug('Signal '+signal.name+' bubbling stopped!');
        }

    }

    /**
     * Отправить сигнал на обработку вышестоящим визуальным компонентам
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     */
    public signalBubble(signal: Signal, component: VisualComponent) {

        Components.logger.debug('Всплытие сигнала вверх...');

        let parentModel = Components.findParentComponent(component);

        try {
            ensure(parentModel, 'Родительский компонент не обнаружен!');
        } catch (e) {
            Components.logger.error(e.message);
            return;
        }

        if (implementsInterface<ListenSignalsInterface>(parentModel, listenSignalsInterface)) {
            this.signalHandle(signal, parentModel);
        }
    }

}

export function signal(component: VisualComponent, name: string, data: Object = {}): boolean {

    // Components.logger.info('signal\'s this is:');
    // Components.logger.info(this);
    // Components.logger.info(this instanceof VisualComponent);

    let signal = new Signal(name, component);
    signal.data = data;
    Components.logger.debug('Signal "' + name + '" '+JSON.stringify(data)+' fired in '+component.debugName()+'!');

    Components.dispatcher.dispatchEvent(Events.create<Signal>(Events.componentSentSignal, signal));

    // (new SignalsPlugin)._signalHandle(signal, component);

    // для удобства в использовании при конвертации события в сигнал и прекращения обработки события
    return false;
}