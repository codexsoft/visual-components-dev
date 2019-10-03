import Components from "./Components";
import VisualComponent from "./VisualComponent";
export {Components, VisualComponent};

if (window) {
    // @ts-ignore
    window['Components'] = Components;
}