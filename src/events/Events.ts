export default {
    create: function<T>(name: string, details: T): CustomEvent {
        return new CustomEvent(name, {
            detail: details
        });
    },
    componentStarted: 'visualComponent.started',
}