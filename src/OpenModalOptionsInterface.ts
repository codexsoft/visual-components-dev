import VisualComponent from "./VisualComponent";
import ModalComponentInterface from "./ModalComponentInterface";

export default interface OpenModalOptionsInterface {

    content: VisualComponent,
    modalComponent?: ModalComponentInterface,
    title?: string,
    signals?: Object,
    terminators?: Object,

}