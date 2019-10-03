// import JsxArray from "./JsxArray";
import Components from "./Components";
import * as $ from "jquery";
import * as _ from "lodash";
import TestComponent from "./components/TestComponent/TestComponent";
import Events from "./events/Events";
import {implementsInterface} from "./shortcut-functions/implements";
import ComponentLifecycleEventInterface from "./events/ComponentLifecycleEventInterface";
import Detect from "./Detect";
import ListenEventsInterface, {listenEventsInterface} from "./types/ListenEventsInterface";
import ConsoleLogger from "./logger/ConsoleLogger";
import KeyboardInterface, {listenKeyboardInterface} from "./plugin/KeypressPlugin/KeyboardInterface";

// async function x(jsx: JsxArray): Promise<any> {
//     return new Promise<any>(async (resolve) => {
//         resolve(await jsx.render());
//     })
// }

// let jsx = new JsxArray(<b>hello world<h1>Big world</h1></b>);

// Promise.all([x(jsx)]).then((result: any) => {
//     console.log(result);
// });

$(() => {

    Components.logger = new ConsoleLogger();
    Components.init();

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
    this.dispatcher.addEventListener(Events.componentBeforeStart, (e: CustomEvent<ComponentLifecycleEventInterface>) => {

        // debugger;

        if (!implementsInterface<ListenEventsInterface>(e.detail.component, listenEventsInterface)) {
            // debugger;
            return;
        }

        Components.logger.debug('HANDLER: Event handlers activating for component '+Detect.className(e.detail.component));
        let component: ListenEventsInterface  = e.detail.component;

        if (Components.TERMINATE_EVENTS) {

            Components.logger.debug( '[ BIND EVENTS ] Включено терминирование событий мыши по умолчанию.' );
            component.$element().on(Components.TERMINATE_EVENTS, ( e: Event ) => {

                if (!_.includes(['mousemove','mouseover','mouseout','mouseleave','mouseenter','mouseup','mousedown'], e.type)) {
                    Components.logger._minor('Event '+e.type+' terminated in '+component.getClass());
                }

                e.stopPropagation();

            } );

        }

        let eventHandlers = component.listenEvents();
        if (_.isEmpty( eventHandlers)) {
            return;
        }

        $.each(eventHandlers, (eventName: string, handler: Function) => {
            Components.logger.debug( '[ BIND EVENTS ] Регистрация обработчика события: ' + eventName );
            component.$element().off(eventName); // снимаем существующий обработчик, если был
            // @ts-ignore
            component.$element().on(eventName, handler);
        } );

    });

    let component = new TestComponent;

    console.log('displaying');
    component.display().then((result) => {
        console.log(result);
        $(result).appendTo($('body'));
    }).catch((e) => {
        console.log(e);
    });

});