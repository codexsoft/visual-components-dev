"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var $ = require("jquery");
var Sdk = /** @class */ (function () {
    function Sdk(logger) {
        this.logger = logger;
    }
    Sdk.prototype.addRequestFields = function (data) {
        // data['LE_BUNDLE_TIMESTAMP'] = le.config.bundleTimestamp;
        data['LE_BUNDLE_TIMESTAMP'] = le.ware.settings.bundleTimestamp;
        data['LE_CURRENT_TAB_ID'] = le.tab.id; // указываем номер текущей вкладки
        data['LE_LAST_URL'] = le.tab.lastUrl;
        data['LE_CSRF_TOKEN'] = le.ware.csrfToken();
        // return data;
    };
    Sdk.prototype.addRequestFieldsToForm = function (data) {
        // data.append('LE_BUNDLE_TIMESTAMP', le.config.bundleTimestamp );
        data.append('LE_BUNDLE_TIMESTAMP', le.ware.settings.bundleTimestamp);
        data.append('LE_CURRENT_TAB_ID', le.tab.id);
        data.append('LE_LAST_URL', le.tab.lastUrl);
        data.append('LE_CSRF_TOKEN', le.ware.csrfToken());
    };
    /**
     * @WARE!
     * @param type
     * @param data
     * @param options
     * @returns {JQueryPromise<T>}
     */
    Sdk.prototype.wareRequest = function (type, data, options) {
        // let url = options.url || le.config.pathAjaxDefault;
        var _this = this;
        if (options === void 0) { options = {}; }
        var url = options.url || le.ware.settings.pathAjaxDefault;
        var raw = options.raw || false;
        var extractedFiles = le.tools.extractFiles(data);
        // debugger;
        // let extractedFiles = le.toolbox.extractFiles(data);
        var headers = {
            LE_CSRF_TOKEN: le.ware.csrfToken(),
            LE_CLIENT_MESSAGE: 'TYPE_EXECUTE_UNIVERSAL_OPERATION',
            'X-Client-Message': 'TYPE_EXECUTE_UNIVERSAL_OPERATION',
        };
        var requestData = {};
        requestData['LE_REQUEST_CONTAINER'] = data;
        if (type)
            requestData['LE_REQUEST_TYPE'] = type;
        var result;
        var requestOptions = {};
        if (!_.isEmpty(extractedFiles)) {
            var sendingData = new FormData;
            // _.forEach( extractedFiles, function( file, id ) {
            //     sendingData.append( id, file );
            // });
            for (var id in extractedFiles) {
                var file = extractedFiles[id];
                sendingData.append(id, file);
            }
            // _.forEach( requestData, function( value, key ) {
            //     sendingData.append( key, JSON.stringify(value) );
            // });
            for (var key in requestData) {
                var value = requestData[key];
                sendingData.append(key, JSON.stringify(value));
            }
            this.addRequestFieldsToForm(sendingData);
            // sendingData['a'] = '';
            requestOptions = {
                type: "POST",
                url: url,
                processData: false,
                contentType: false,
                data: sendingData,
                headers: headers,
            };
        }
        else {
            this.addRequestFields(requestData);
            requestOptions = {
                type: "POST",
                url: url,
                processData: true,
                data: requestData,
                headers: headers,
            };
        }
        var process = $.Deferred();
        this.logger.log(requestOptions);
        $.ajax(requestOptions)
            .done(function (response) {
            process.resolve(response, true);
        }).fail(function (response) {
            raw ? response.responseText : response.responseJSON;
            var parsedResponse;
            if (!raw) {
                try {
                    parsedResponse = JSON.parse(response.responseText);
                }
                catch (e) {
                    if ('statusText' in response) {
                        _this.logger.timeerror('Ошибка: ' + response.statusText);
                    }
                    return process.reject({}, false);
                    // return;
                }
                var PROCESSED = 0;
                var MALFORMED = -1;
                var RUNTIME_EXCEPTION = -2;
                var NOT_FETCHED = -3;
                var NOT_JSONABLE = -4;
                var HANDLER_TIMEOUT = -5;
                var COMMAND_UNKNOWN = -6;
                /**
                 * Команда могла начать выполнение, но, по каким-то причинам, в ходе выполнения
                 * произошла ошибка. В этом случае мы также прекращаем обработку результата выполнения
                 * команды и, если задан обработчик для случая неудачного выполнения команды, вызываем его
                 */
                if (parsedResponse.reason != PROCESSED) {
                    var errorDesc = '';
                    if (parsedResponse.message)
                        errorDesc = parsedResponse.message;
                    var resultCodeExplanation = '';
                    switch (parsedResponse.reason) {
                        case NOT_FETCHED:
                            resultCodeExplanation =
                                'Сервер не смог разобрать запрос';
                            break;
                        case MALFORMED:
                            resultCodeExplanation =
                                'Не найден обработчик команды';
                            break;
                        case RUNTIME_EXCEPTION:
                            resultCodeExplanation =
                                'Произошла исключительная ситуация во премя исполнения команды';
                            break;
                        case HANDLER_TIMEOUT:
                            resultCodeExplanation =
                                'Процесс обработчика не существует (скорее всего, завершен по тайм-ауту)';
                            break;
                        case COMMAND_UNKNOWN:
                            resultCodeExplanation =
                                'Команда неизвестна обработчику';
                            break;
                        // 'Команда '+command+' неизвестна обработчику'; break;
                        default:
                            if ('statusText' in response)
                                resultCodeExplanation = 'Неизвестно (' + response.statusText + ')';
                            else
                                resultCodeExplanation = 'Неизвестно';
                    }
                    _this.logger.timeerror('Сервер сообщил, что команда не была выполнена: ' + resultCodeExplanation + '. ' + errorDesc);
                    if (parsedResponse.exceptions) {
                        _this.logger.group('Исключительные ситуации при выполнении команды:');
                        // _.forEach(parsedResponse.exceptions, function (exceptionText) {
                        _.forEach(parsedResponse.exceptions, function (exceptionText) {
                            _this.logger.log(exceptionText);
                        });
                        _this.logger.close();
                    }
                    if (parsedResponse.log)
                        _this.logger.display_log(parsedResponse.log);
                }
            }
            return process.reject(raw ? response.responseText : response.responseJSON, false);
        });
        if (result)
            this.logger.log('Специальный запрос отправлен');
        return process.promise();
        // return process;
    };
    return Sdk;
}());
exports.Sdk = Sdk;
