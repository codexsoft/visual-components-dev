import VisualComponent from "./VisualComponent";

export default interface ModalComponentInterface {
    [key: string]: any;
    fire(signalHandlers: Object, terminators: []): void;
    finish(answer: any): void;
    afterFinish(): void;
    getTerminators(): Array<string>;
    setParentComponent(component: VisualComponent): ModalComponentInterface;
    setComponent(component: VisualComponent): ModalComponentInterface;
    setSignalHandlers(signalHandlers: Object): ModalComponentInterface;

}