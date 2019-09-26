import NullLogger from "./NullLogger";
import {LoggableType} from "./types/LoggableType";

export default class ConsoleLogger extends NullLogger {

    /** @inheritDoc */
    emergency(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_EMERGENCY, message, context);
    };

    /** @inheritDoc */
    alert(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_ALERT, message, context);
    };

    /** @inheritDoc */
    critical(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_CRITICAL, message, context);
    };

    /** @inheritDoc */
    error(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_ERROR, message, context);
    };

    /** @inheritDoc */
    warning(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_WARNING, message, context);
    };

    /** @inheritDoc */
    notice(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_NOTICE, message, context);
    };

    /** @inheritDoc */
    info(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_INFO, message, context);
    };

    /** @inheritDoc */
    debug(message: LoggableType, context?: Object): void {
        this.log(this.LEVEL_DEBUG, message, context);
    };

    /** @inheritDoc */
    log(level: number, message: LoggableType, context?: Object): void {
        console.log(message);
    };

}