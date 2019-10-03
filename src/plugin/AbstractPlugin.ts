export default abstract class AbstractPlugin {
    public abstract init(dispatcher: EventTarget): void;
}