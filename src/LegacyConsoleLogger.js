"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LegacyConsoleLogger = /** @class */ (function () {
    function LegacyConsoleLogger() {
        // константы типов сообщений лога
        this.LE_LOG_MINOR = 1;
        this.LE_LOG_HEADER = 2;
        this.LE_LOG_GROUP_OPEN = 4;
        this.LE_LOG_GROUP_CLOSE = 8;
        this.LE_LOG_INFO = 16;
        this.LE_LOG_MAJOR = 32;
        this.LE_LOG_NOTICE = 64;
        this.LE_LOG_ERROR = 128;
        this.LE_LOG_EXCEPTION = 256;
        this.LE_LOG_FATALERROR = 512;
        this.LE_LOG_CONSOLE_DARK = false;
        this.settings = {
            on: false,
            allowClearing: true,
            groupingEnabled: false,
        };
        this.counter = 0;
    }
    // private LE_LOG_CONSOLE_CLEAR = true;
    LegacyConsoleLogger.prototype.logtime = function () {
        this.counter++;
        return (le.request.time_spent() / 1000).toFixed(3);
    };
    LegacyConsoleLogger.prototype.complex = function (message) {
        return (_.isObject(message) || _.isArray(message));
    };
    // private on = liquidConfig.config.CONSOLE_LOGGING;
    // private on: boolean = !!(le.config && le.config.console && le.config.console.on);
    // let on = true;
    LegacyConsoleLogger.prototype.log = function (message) {
        this.counter++;
        this.settings.on && this.info(message);
        // this.on && this.info(message);
    };
    // TODO: научить принимать несколько значений (arguments)
    // public multi( ...messages ) {
    //     let x:WindowConsole = window.console;
    //     this.on && x.log( ...messages );
    // this.on && console.log( messages );
    // }
    // x( ...args ) {
    // var args = Array.prototype.slice.call(arguments);
    // var args = [];
    // for (var i = 0; i < arguments.length; i++) {
    //     args[i] = arguments[i];
    // }
    // this.on && this.info(...args);
    // }
    // public test() {
    // let x = [1,2,3];
    // document.console.log( ...x );
    // console.log( ...arguments );
    // }
    // public info( message: any ): void {
    LegacyConsoleLogger.prototype.info = function (message) {
        this.counter++;
        this.settings.on && console.log(message);
        // this.on && console.log(message);
    };
    //info: function( message ) {
    //	LE.console.on ? console.info(message) : null;
    //},
    LegacyConsoleLogger.prototype.major = function (message) {
        this.counter++;
        // if ( !this.on ) return;
        if (!this.settings.on)
            return;
        if (!console.debug)
            return console.log(message); // IE workaround
        if (this.complex(message))
            return console.log(message);
        console.log('%c' + message, 'font-weight: bold');
        //LE.console.on ? console.log('%c'+message,'text-decoration: underline') : null;
        //$LE.console.on ? console.log('%c'+message,'font-weight: bold') : null;
    };
    LegacyConsoleLogger.prototype.notice = function (message) {
        this.counter++;
        // if ( !this.on ) return;
        if (!this.settings.on)
            return;
        if (!console.debug)
            return console.log(message); // IE workaround
        if (this.complex(message))
            return console.info(message);
        this.LE_LOG_CONSOLE_DARK && console.info('%c' + message, 'color: #CC9460');
        !this.LE_LOG_CONSOLE_DARK && console.info('%c' + message, 'color: blue');
        //le.console.on && LE_LOG_CONSOLE_DARK ? console.log('%c'+message,'color: #CC9460') : null;
        //le.console.on && !LE_LOG_CONSOLE_DARK ? console.debug(message) : null;
    };
    LegacyConsoleLogger.prototype.warn = function (message) {
        this.counter++;
        this.settings.on ? console.warn(message) : null;
        // this.on ? console.warn(message) : null;
    };
    LegacyConsoleLogger.prototype.error = function (message) {
        this.counter++;
        // if ( !this.on ) return;
        if (!this.settings.on)
            return;
        if (!console.debug)
            return console.log(message); // IE workaround
        if (this.complex(message))
            return console.error(message);
        this.LE_LOG_CONSOLE_DARK && console.log('%c' + message, 'color: #D77F7B;');
        !this.LE_LOG_CONSOLE_DARK && console.log('%c' + message, 'background-color: #F7EAE6; color: #940000;');
    };
    LegacyConsoleLogger.prototype.timenotice = function (message) {
        this.notice(this.stamp(message));
    };
    LegacyConsoleLogger.prototype.timeminor = function (message) {
        this.minor(this.stamp(message));
    };
    LegacyConsoleLogger.prototype.timeinfo = function (message) {
        this.info(this.stamp(message));
    };
    LegacyConsoleLogger.prototype.timewarn = function (message) {
        this.settings.on ? this.warn(this.logtime() + ': ' + message) : null;
        // this.on ? this.warn( this.logtime() + ': ' + message) : null;
    };
    LegacyConsoleLogger.prototype.timeerror = function (message) {
        this.error(this.stamp(message));
        //if ( _.isObject(message) || _.isArray(message) ) return error(message);
        //le.console.on ? error( logtime() + ': ' + message) : null;
        //if ( !le.console.on ) return;
        //if ( !console.debug ) return console.log(message); // IE workaround
        //le.console.LE_LOG_CONSOLE_DARK ? console.log('%c' + logtime() + ': ' + message,'color: #D77F7B;') : null;
        //!le.console.LE_LOG_CONSOLE_DARK ? console.log('%c' + logtime() + ': ' + message,'background-color: #F7EAE6; color: #940000;') : null;
        //LE.console.on ? console.error( logtime() + ': ' + message) : null;
    };
    LegacyConsoleLogger.prototype.stamp = function (message) {
        if (!this.complex(message))
            message = this.logtime() + ': ' + message;
        return message;
    };
    LegacyConsoleLogger.prototype.group = function (message, collapsed) {
        if (collapsed === void 0) { collapsed = true; }
        this.counter++;
        // if ( !this.on ) return;
        if (!this.settings.on)
            return;
        // if ( collapsed === undefined ) collapsed = true;
        if (!console.group)
            return this.major(message);
        collapsed && console.groupCollapsed
            ? console.groupCollapsed(message)
            : console.group(message);
    };
    LegacyConsoleLogger.prototype.close = function () {
        this.counter++;
        if (!console.groupEnd)
            return;
        this.settings.on && console.groupEnd();
        // this.on && console.groupEnd();
    };
    LegacyConsoleLogger.prototype.clean = function () {
        this.counter++;
        this.settings.allowClearing && console.clear();
        // this.LE_LOG_CONSOLE_CLEAR && console.clear();
    };
    LegacyConsoleLogger.prototype.minor = function (message) {
        this.counter++;
        // if ( !this.on ) return;
        if (!this.settings.on)
            return;
        if (!console.debug)
            return console.log(message); // IE workaround
        if (this.complex(message))
            return console.log(message);
        !this.LE_LOG_CONSOLE_DARK && console.debug('%c' + message, 'color: silver');
        this.LE_LOG_CONSOLE_DARK && console.debug('%c' + message, 'color: #636E85');
    };
    LegacyConsoleLogger.prototype.space = function () {
        this.counter++;
        this.settings.on && console.log('');
        // this.on && console.log('');
    };
    return LegacyConsoleLogger;
}());
exports.default = LegacyConsoleLogger;
