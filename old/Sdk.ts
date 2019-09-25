import * as _ from 'lodash';
import * as $ from 'jquery';
import LoggerInterface from "./LoggerInterface";

export class Sdk {

    private logger: LoggerInterface;

    constructor(logger: LoggerInterface|null) {
        this.logger = logger;
    }

    private addRequestFields( data: Object ) {

        // data['LE_BUNDLE_TIMESTAMP'] = le.config.bundleTimestamp;
        data['LE_BUNDLE_TIMESTAMP'] = le.ware.settings.bundleTimestamp;
        data['LE_CURRENT_TAB_ID'] = le.tab.id; // указываем номер текущей вкладки
        data['LE_LAST_URL'] = le.tab.lastUrl;
        data['LE_CSRF_TOKEN'] = le.ware.csrfToken();
        // return data;
    }

    private addRequestFieldsToForm( data: FormData ) {

        // data.append('LE_BUNDLE_TIMESTAMP', le.config.bundleTimestamp );
        data.append('LE_BUNDLE_TIMESTAMP', le.ware.settings.bundleTimestamp );
        data.append('LE_CURRENT_TAB_ID', le.tab.id );
        data.append('LE_LAST_URL', le.tab.lastUrl );
        data.append('LE_CSRF_TOKEN', le.ware.csrfToken() );

    }

    /**
     * @WARE!
     * @param type
     * @param data
     * @param options
     * @returns {Promise<T>}
     */
    public wareRequest( type: string|null, data: Object, options: OperationOptions = {} ): Promise<any> {

        // let url = options.url || le.config.pathAjaxDefault;

        let url = options.url || le.ware.settings.pathAjaxDefault;
        let raw = options.raw || false;
        let extractedFiles = le.tools.extractFiles(data);
        // debugger;
        // let extractedFiles = le.toolbox.extractFiles(data);

        let headers = {
            LE_CSRF_TOKEN: le.ware.csrfToken(),
            LE_CLIENT_MESSAGE: 'TYPE_EXECUTE_UNIVERSAL_OPERATION', // todo: delete
            'X-Client-Message': 'TYPE_EXECUTE_UNIVERSAL_OPERATION',
        };

        let requestData = {};
        requestData['LE_REQUEST_CONTAINER'] = data;

        if ( type )
            requestData['LE_REQUEST_TYPE'] = type;

        let result: JQueryXHR;
        let requestOptions = {};

        if ( !_.isEmpty(extractedFiles) ) {

            let sendingData: FormData = new FormData;

            // _.forEach( extractedFiles, function( file, id ) {
            //     sendingData.append( id, file );
            // });

            for (let id in extractedFiles) {
                let file = extractedFiles[id];
                sendingData.append(id, file);
            }

            // _.forEach( requestData, function( value, key ) {
            //     sendingData.append( key, JSON.stringify(value) );
            // });

            for (let key in requestData) {
                let value = requestData[key];
                sendingData.append( key, JSON.stringify(value) );
            }

            this.addRequestFieldsToForm( sendingData );
            // sendingData['a'] = '';

            requestOptions = {
                type: "POST",
                url: url,
                processData: false,
                contentType: false,
                data: sendingData,
                headers: headers,
            };

        } else {

            this.addRequestFields( requestData );

            requestOptions = {
                type: "POST",
                url: url,
                processData: true,
                data: requestData,
                headers: headers,
            };

        }

        let process = $.Deferred();

        this.logger.log(requestOptions);

        $.ajax( requestOptions )
            .done( ( response: Object ) => {
                process.resolve( response, true );
            } ).fail( ( response: JQueryXHR ) => {

            raw ? response.responseText : response.responseJSON;

            let parsedResponse;
            if ( !raw ) {

                try {
                    parsedResponse = JSON.parse(response.responseText);
                } catch ( e ) {
                    if ( 'statusText' in response ) {
                        this.logger.timeerror('Ошибка: '+response.statusText);
                    }
                    return process.reject( {}, false);
                    // return;
                }

                const PROCESSED = 0;
                const MALFORMED = -1;
                const RUNTIME_EXCEPTION = -2;
                const NOT_FETCHED = -3;
                const NOT_JSONABLE = -4;
                const HANDLER_TIMEOUT = -5;
                const COMMAND_UNKNOWN = -6;

                /**
                 * Команда могла начать выполнение, но, по каким-то причинам, в ходе выполнения
                 * произошла ошибка. В этом случае мы также прекращаем обработку результата выполнения
                 * команды и, если задан обработчик для случая неудачного выполнения команды, вызываем его
                 */
                if ( parsedResponse.reason != PROCESSED ) {

                    let errorDesc = '';
                    if ( parsedResponse.message )
                        errorDesc = parsedResponse.message;

                    let resultCodeExplanation = '';
                    switch ( parsedResponse.reason ) {

                        case NOT_FETCHED: resultCodeExplanation =
                            'Сервер не смог разобрать запрос'; break;

                        case MALFORMED: resultCodeExplanation =
                            'Не найден обработчик команды'; break;

                        case RUNTIME_EXCEPTION: resultCodeExplanation =
                            'Произошла исключительная ситуация во премя исполнения команды'; break;

                        case HANDLER_TIMEOUT: resultCodeExplanation =
                            'Процесс обработчика не существует (скорее всего, завершен по тайм-ауту)'; break;

                        case COMMAND_UNKNOWN: resultCodeExplanation =
                            'Команда неизвестна обработчику'; break;
                        // 'Команда '+command+' неизвестна обработчику'; break;

                        default:
                            if ( 'statusText' in response )
                                resultCodeExplanation = 'Неизвестно ('+response.statusText+')';
                            else
                                resultCodeExplanation = 'Неизвестно';

                    }

                    this.logger.timeerror('Сервер сообщил, что команда не была выполнена: '+resultCodeExplanation+'. '+errorDesc);

                    if ( parsedResponse.exceptions ) {

                        this.logger.group('Исключительные ситуации при выполнении команды:');
                        // _.forEach(parsedResponse.exceptions, function (exceptionText) {
                        _.forEach(parsedResponse.exceptions, (exceptionText) => {
                            this.logger.log(exceptionText);
                        });
                        this.logger.close();

                    }

                    if ( parsedResponse.log )
                        this.logger.display_log( parsedResponse.log );

                }

            }

            return process.reject( raw ? response.responseText : response.responseJSON, false );

        } );

        if ( result ) this.logger.log('Специальный запрос отправлен');

        return process.promise();
        // return process;

    }

}