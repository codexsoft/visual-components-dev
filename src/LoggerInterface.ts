import {LoggableType} from "./types/LoggableType";

export default interface LoggerInterface {
    _log(message: any): void;
    _info(message: any): void;
    _major(message: any): void;
    _notice(message: any): void;
    _warn(message: any): void;
    _error(message: string): void;
    _timenotice(message: string): void;
    _timeminor(message: string): void;
    _timeinfo(message: string): void;
    _timewarn(message: string): void;
    _timeerror(message: string): void;
    _group(message: string, collapsed?: boolean): void;
    _close(): void;
    _clean(): void;
    _minor(message: string|any): void;
    _space(): void;

    /**
     * System is unusable.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    emergency(message: LoggableType, context?: Object): void;

    /**
     * Action must be taken immediately.
     *
     * Example: Entire website down, database unavailable, etc. This should
     * trigger the SMS alerts and wake you up.
     *
     * @param {LoggableType} message
     * @param {Object} context     * @return void
     */
    alert(message: LoggableType, context?: Object): void;

    /**
     * Critical conditions.
     *
     * Example: Application component unavailable, unexpected exception.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    critical(message: LoggableType, context?: Object): void;

    /**
     * Runtime errors that do not require immediate action but should typically
     * be logged and monitored.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    error(message: LoggableType, context?: Object): void;

    /**
     * Exceptional occurrences that are not errors.
     *
     * Example: Use of deprecated APIs, poor use of an API, undesirable things
     * that are not necessarily wrong.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    warning(message: LoggableType, context?: Object): void;

    /**
     * Normal but significant events.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    notice(message: LoggableType, context?: Object): void;

    /**
     * Interesting events.
     *
     * Example: User logs in, SQL logs.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    info(message: LoggableType, context?: Object): void;

    /**
     * Detailed debug information.
     *
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    debug(message: LoggableType, context?: Object): void;

    /**
     * Logs with an arbitrary level.
     *
     * @param {number} level
     * @param {LoggableType} message
     * @param {Object} context
     * @return void
     */
    log(level: number, message: LoggableType, context?: Object): void;

}
