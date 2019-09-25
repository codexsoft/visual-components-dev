import LoggerInterface from "./LoggerInterface";
import Signal from './Signal';
import * as _ from 'lodash';
import * as $ from 'jquery';
import NullLogger from "./NullLogger";
import ModalComponentInterface from "./ModalComponentInterface";
import OpenModalOptionsInterface from "./OpenModalOptionsInterface";
import Components from "./Components";
import Common__Modal__Blurred from "./components/Common__Modal__Blurred";
import Common__Modal from "./components/Common__Modal";
import Common__Dialog__Confirm from "./components/Common__Dialog__Confirm";
import Detect from "./Detect";
import JsxArray from "./JsxArray";
import VisualComponentDisplayOptionsInterface from "./VisualComponentDisplayOptionsInterface";
import expect from "./shortcut-functions/expect";
import VisualComponent from "./VisualComponent";

/**
 * @deprecated
 */
export default abstract class VisualComponentOld {

    /**
     * Выполнить команду на стороне бэкенда этого компонента
     * @WARE!
     * @param command
     * @param params
     * @param options
     */
    public executeCommand( command: string, params: Object = {},
                           options: backendCommandSpecOptions = {} ): Promise<any> {

        return le.ware.componentBackendCommand(this,command,params,options);

    }

    /**
     * Сообщить бэкенду компонента о произошедшем событии
     * @WARE!
     * @param event
     * @param params
     */
    public backendEvent( event, params: Object | boolean = false ): void {

        this.logger.log('backendEvent '+event);
        le.ware.componentBackendEvent(this,event,params);

    }

}

/**
 * Способы рендеринга компонента
 *
 * В классе компонента рендеринг шаблонов описывается примерно так:
 * layout_default() {
     *     return this.renderViaBackend( 'default', { accidentId: this.accidentId } );
     * }
 *
 * Внутри рендеринг можно делать по-разному:
 *
 * Способ 1: Асинхронно запросить рендер у сервера
 * let dfd = $.Deferred();
 * $.when( this.renderByBackendStaticAsynchronous( 'default', { accidentId: this.accidentId }))
 *     .always( ( result ) => dfd.resolve( result ) );
 * return dfd.promise();
 *
 * или короче: return this.renderViaBackend( 'default', { accidentId: this.accidentId } );
 *
 * Способ 2: Запросить у бэкенда рендер контента СИНХРОННО
 * return this.renderByBackendStaticSynchronous( 'default', { accidentId: this.accidentId } );
 *
 * Способ 3: Сразу вернуть результат
 * return this.renderJsTemplate('default'); // сгенерировать, используя JST-шаблон
 * return '<div></div>'; // или просто вычислить
 *
 * let path = 'components/Osagotime/Gui__Standard/';
 *
 */

