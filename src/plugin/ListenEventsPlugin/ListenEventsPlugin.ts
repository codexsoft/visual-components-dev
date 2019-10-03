import Events from "../../events/Events";
import ComponentLifecycleEventInterface from "../../events/ComponentLifecycleEventInterface";
import {implementsInterface} from "../../shortcut-functions/implements";
import ListenEventsInterface, {listenEventsInterface} from "../../types/ListenEventsInterface";
import Components from "../../Components";
import Detect from "../../Detect";
import * as _ from "lodash";
import AbstractPlugin from "../AbstractPlugin";

export default class ListenEventsPlugin extends AbstractPlugin {

    public init(dispatcher: EventTarget) {
        // @ts-ignore
        dispatcher.addEventListener(Events.componentBeforeStart, (e: CustomEvent<ComponentLifecycleEventInterface>) => {

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
    }

}