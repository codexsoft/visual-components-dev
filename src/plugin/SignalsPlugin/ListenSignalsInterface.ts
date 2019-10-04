import Signal from "./Signal";

export default interface ListenSignalsInterface {
    listenSignals(): {[index: string]: Function};
    signalCustomHandler(s: Signal): boolean|null;
    _signalHandleHook(signal: Signal): Promise<void>;
}

export const listenSignalsInterface = {
    listenSignals: 'function',
    signalCustomHandler: 'function',
    _signalHandleHook: 'function',
};