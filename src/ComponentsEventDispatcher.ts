export default class ComponentsEventDispatcher implements EventTarget {
    private target = document.createTextNode('');
    public dispatchEvent = this.target.dispatchEvent.bind(this.target);
    public removeEventListener = this.target.removeEventListener.bind(this.target);
    public addEventListener = this.target.addEventListener.bind(this.target);
}