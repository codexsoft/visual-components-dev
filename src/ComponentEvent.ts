import VisualComponent from "./VisualComponent";

export default class ComponentEvent {

    private component: VisualComponent;
    private event: Event;

    constructor(event: Event, component: VisualComponent) {
        this.component = component;
        this.event = event;
    }

    /**
     * Определяет, возникло ли событие непосредственно внутри этого компонента
     * @param e
     * @returns {boolean}
     */
    protected isInternal(): boolean {

        return ($(<Element>this.event.target)
            .closest('.VisualComponent')
            .get(0) === this.component.element());
    }

    /**
     * Определяет, что событие возникло в другом компоненте
     * @param e
     * @returns {boolean}
     */
    protected notInternal(): boolean {
        return !this.isInternal();
    }

    /**
     * Вычислить путь, пройденный событием до этого компонента
     * @param e
     * @returns {Array}
     */
    protected getPath( e: Event ): Array<Element> {

        // TODO: можно путь взять отсюда: window.testEvent.path

        let $current = $(<Element>e.target);
        let $parent;
        let path = [];

        do {
            $parent = $current.parent();
            if ($parent.length) {
                path.push($parent.get(0));
            }

            $current = $parent;

        // @ts-ignore
        } while ( $parent.length && $parent.get(0) !== this.component.element() && $parent.get(0) !== document);

        return path;
    }

}