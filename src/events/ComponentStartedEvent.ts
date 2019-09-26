import VisualComponent from "../VisualComponent";

/**
 * @deprecated Event cannot be extended in JS...
 */
export default class ComponentStartedEvent extends CustomEvent<Object> {
    public static readonly NAME = 'visualComponent.started';
    public componentId: any;
    public listenCombos: Object;
    public component: VisualComponent;

    public constructor(componentId: any, combos: Object, component: VisualComponent, eventInitDict?: EventInit) {
        super(ComponentStartedEvent.NAME, eventInitDict);
        // super('visualComponent.started', eventInitDict);
        this.component = component;
        this.listenCombos = combos;
        this.componentId = componentId;
    }

}