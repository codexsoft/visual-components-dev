import Signal from "../../Signal";
import VisualComponent from "../../VisualComponent";
import ListenSignalsInterface, {listenSignalsInterface} from "./ListenSignalsInterface";
import Components from "../../Components";
import ensure from "../../shortcut-functions/ensure";
import { implementsInterface } from "@codexsoft/function-implements-interface";

export default class SignalsPlugin {

    public _signalHandle(signal: Signal, component: VisualComponent): void {

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
            this._signalBubble(signal, component);
        } else {
            Components.logger.debug('Signal '+signal.name+' bubbling stopped!');
        }

    }

    /**
     * Отправить сигнал на обработку вышестоящим визуальным компонентам
     * Бросить сигнал вверх для дальнейшей обработки родительскими компонентами
     * Может быть использован для того, чтобы выполнить какие-то действия перед проксированием
     */
    public _signalBubble(signal: Signal, component: VisualComponent) {

        Components.logger._minor( 'Всплытие сигнала вверх...' );

        let parentModel = Components.findParentComponent(component);

        try {
            ensure(parentModel, 'Родительский компонент не обнаружен!');
        } catch ( e ) {
            Components.logger._error( e.message );
            return;
        }

        if (implementsInterface<ListenSignalsInterface>(parentModel, listenSignalsInterface)) {
            this._signalHandle(signal, parentModel);
        }
    }

}

export function signal(component: VisualComponent, name: string, data: Object = {}): boolean {

    let signal = new Signal(name, component);
    signal.data = data;
    Components.logger.debug('Signal "' + name + '" '+JSON.stringify(data)+' fired in '+component.debugName()+'!');

    (new SignalsPlugin)._signalHandle(signal, component);

    // для удобства в использовании при конвертации события в сигнал и прекращения обработки события
    return false;
}