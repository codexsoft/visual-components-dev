import Components from "../Components";

export default function mixin(targetConstructor: Function, mixins: Function[]) {
    Components.findClassNameByClass(targetConstructor);
    mixins.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name === 'constructor') {
                return;
            }
            // @ts-ignore
            Object.defineProperty(targetConstructor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}
