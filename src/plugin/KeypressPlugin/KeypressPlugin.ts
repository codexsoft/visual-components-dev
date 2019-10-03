import Components from "../../Components";
import Events from "../../events/Events";
import ComponentLifecycleEventInterface from "../../events/ComponentLifecycleEventInterface";
import {implementsInterface} from "../../shortcut-functions/implements";
import KeyboardInterface, {listenKeyboardInterface} from "./KeyboardInterface";
import Detect from "../../Detect";
import Keyboard from "./Keyboard";
import AbstractPlugin from "../AbstractPlugin";

export default class KeypressPlugin extends AbstractPlugin {

    public static keyboard: Keyboard;

    public init() {

        // @ts-ignore
        Components.dispatcher.addEventListener(Events.componentBeforeStart, (e: CustomEvent<ComponentLifecycleEventInterface>) => {

            if (!implementsInterface<KeyboardInterface>(e.detail.component, listenKeyboardInterface)) {
                return;
            }

            Components.logger.debug('HANDLER: Keyboard handlers activating for component '+Detect.className(e.detail.component));
            if (Components.keyboard) {
                // Components.logger.debug('Keyboard is defined');
                // Components.logger.debug(Components.keyboard);
                // this.keyboard.registerCombos(e.detail.componentId, e.detail.listenCombos);
                // this.keyboard.registerCombos(e.detail.component.getId(), e.detail.listenCombos);
                Components.keyboard.registerCombos(e.detail.component.getId(), e.detail.component.listenKeyboard());
            }
        });

        // @ts-ignore
        Components.dispatcher.addEventListener(Events.componentBeforeStop, (e: CustomEvent<ComponentLifecycleEventInterface>) => {
            Components.keyboard.unregisterCombosForComponent(e.detail.component.getId());
        });

    }

}