import VisualComponent from "./VisualComponent";
import ListenSignalsInterface from "./plugin/SignalsPlugin/ListenSignalsInterface";
import Signal from "./Signal";

export default abstract class VisualComponentWithSignals extends VisualComponent implements ListenSignalsInterface {

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

}