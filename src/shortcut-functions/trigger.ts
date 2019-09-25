export default function trigger(eventName: string, params: {} = {}) {
    return function(this: JQuery) {
        return $(this).triggerEvent(eventName, params);
    }
}