import LoggerInterface from "./LoggerInterface";

export default class LegacyConsoleLogger implements LoggerInterface
{

    // константы типов сообщений лога

    private readonly LE_LOG_MINOR = 1;
    private readonly LE_LOG_HEADER = 2;
    private readonly LE_LOG_GROUP_OPEN = 4;
    private readonly LE_LOG_GROUP_CLOSE = 8;
    private readonly LE_LOG_INFO = 16;
    private readonly LE_LOG_MAJOR = 32;
    private readonly LE_LOG_NOTICE = 64;
    private readonly LE_LOG_ERROR = 128;
    private readonly LE_LOG_EXCEPTION = 256;
    private readonly LE_LOG_FATALERROR = 512;
    private readonly LE_LOG_CONSOLE_DARK = false;

    public settings: {
        on: boolean,
        allowClearing: boolean,
        groupingEnabled: boolean,
    } = {
        on: false,
        allowClearing: true,
        groupingEnabled: false,
    };

    public counter: number = 0;

    // private LE_LOG_CONSOLE_CLEAR = true;

    private logtime(): string {
        this.counter++;
        return (le.request.time_spent()/1000).toFixed(3);
    }

    private complex(message: any){
        return ( _.isObject(message) || _.isArray(message) );
    }

    // private on = liquidConfig.config.CONSOLE_LOGGING;
    // private on: boolean = !!(le.config && le.config.console && le.config.console.on);
    // let on = true;


    public log(message: any): void {
        this.counter++;
        this.settings.on && this.info(message);
        // this.on && this.info(message);
    }

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
    public info( message: any ): void {
        this.counter++;
        this.settings.on && console.log(message);
        // this.on && console.log(message);
    }

    //info: function( message ) {
    //	LE.console.on ? console.info(message) : null;
    //},
    public major( message: any ): void {

        this.counter++;

        // if ( !this.on ) return;
        if ( !this.settings.on ) return;
        if ( !console.debug ) return console.log(message); // IE workaround

        if ( this.complex(message) ) return console.log(message);

        console.log('%c'+message,'font-weight: bold');
        //LE.console.on ? console.log('%c'+message,'text-decoration: underline') : null;
        //$LE.console.on ? console.log('%c'+message,'font-weight: bold') : null;
    }

    public notice( message: any ): void {

        this.counter++;

        // if ( !this.on ) return;
        if ( !this.settings.on ) return;
        if ( !console.debug ) return console.log(message); // IE workaround

        if ( this.complex(message) ) return console.info(message);

        this.LE_LOG_CONSOLE_DARK && console.info('%c'+message,'color: #CC9460');
        !this.LE_LOG_CONSOLE_DARK && console.info('%c'+message,'color: blue');

        //le.console.on && LE_LOG_CONSOLE_DARK ? console.log('%c'+message,'color: #CC9460') : null;
        //le.console.on && !LE_LOG_CONSOLE_DARK ? console.debug(message) : null;

    }

    public warn( message: any ): void {
        this.counter++;
        this.settings.on ? console.warn(message) : null;
        // this.on ? console.warn(message) : null;
    }

    public error( message: string ): void {

        this.counter++;

        // if ( !this.on ) return;
        if ( !this.settings.on ) return;
        if ( !console.debug ) return console.log(message); // IE workaround

        if ( this.complex(message) ) return console.error(message);

        this.LE_LOG_CONSOLE_DARK && console.log('%c'+message,'color: #D77F7B;');
        !this.LE_LOG_CONSOLE_DARK && console.log('%c'+message,'background-color: #F7EAE6; color: #940000;');
    }

    public timenotice( message: string ): void {
        this.notice( this.stamp(message) );
    }

    public timeminor( message: string ): void {
        this.minor( this.stamp(message) );
    }

    public timeinfo( message: string ): void {
        this.info( this.stamp(message) );
    }

    public timewarn( message: string ): void {
        this.settings.on ? this.warn( this.logtime() + ': ' + message) : null;
        // this.on ? this.warn( this.logtime() + ': ' + message) : null;
    }

    public timeerror( message: string ): void {

        this.error( this.stamp(message) );

        //if ( _.isObject(message) || _.isArray(message) ) return error(message);

        //le.console.on ? error( logtime() + ': ' + message) : null;

        //if ( !le.console.on ) return;
        //if ( !console.debug ) return console.log(message); // IE workaround

        //le.console.LE_LOG_CONSOLE_DARK ? console.log('%c' + logtime() + ': ' + message,'color: #D77F7B;') : null;
        //!le.console.LE_LOG_CONSOLE_DARK ? console.log('%c' + logtime() + ': ' + message,'background-color: #F7EAE6; color: #940000;') : null;

        //LE.console.on ? console.error( logtime() + ': ' + message) : null;
    }

    private stamp( message: string ): void|string {
        if ( !this.complex(message) ) message = this.logtime()+': '+message;
        return message;
    }

    public group( message: string, collapsed: boolean = true ): void {

        this.counter++;

        // if ( !this.on ) return;
        if ( !this.settings.on ) return;
        // if ( collapsed === undefined ) collapsed = true;
        if ( !console.group ) return this.major( message );

        collapsed && console.groupCollapsed
            ? console.groupCollapsed( message )
            : console.group( message );

    }
    public close(): void {
        this.counter++;
        if ( !console.groupEnd ) return;
        this.settings.on && console.groupEnd();
        // this.on && console.groupEnd();
    }

    public clean(): void {
        this.counter++;
        this.settings.allowClearing && console.clear();
        // this.LE_LOG_CONSOLE_CLEAR && console.clear();
    }

    public minor( message: string ) {

        this.counter++;

        // if ( !this.on ) return;
        if ( !this.settings.on ) return;
        if ( !console.debug ) return console.log(message); // IE workaround

        if ( this.complex(message) ) return console.log(message);

        !this.LE_LOG_CONSOLE_DARK && console.debug('%c'+message,'color: silver');
        this.LE_LOG_CONSOLE_DARK && console.debug('%c'+message,'color: #636E85');

    }

    public space() {
        this.counter++;
        this.settings.on && console.log('');
        // this.on && console.log('');
    }

}