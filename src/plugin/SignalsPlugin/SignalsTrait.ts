import Signal from "./Signal";
// import Components from "../../Components";
import {signal} from "./SignalsPlugin";
import VisualComponent from "../../VisualComponent";

export default class SignalsTrait {

    public signalCustomHandler(s: Signal): boolean|null {
        return null;
    }

    public async _signalHandleHook(signal: Signal): Promise<void> {
    }

    /**
     * Сигналы, которые умеет обрабатывать компонент
     * @public
     */
    public listenSignals(): {[index: string]: Function} {
        return {};
    };

    public signal(this: VisualComponent, name: string, data: any = {}): boolean {
        return signal(this, name, data);
    }

}