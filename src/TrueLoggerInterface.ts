export default interface TrueLoggerInterface {

    LEVEL_EMERGENCY: number;
    LEVEL_ALERT: number;
    LEVEL_CRITICAL: number;
    LEVEL_ERROR: number;
    LEVEL_WARNING: number;
    LEVEL_NOTICE: number;
    LEVEL_INFO: number;
    LEVEL_DEBUG: number;

    /**
     * System is unusable.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    emergency(message: string, context?: Object): void;

    /**
     * Action must be taken immediately.
     *
     * Example: Entire website down, database unavailable, etc. This should
     * trigger the SMS alerts and wake you up.
     *
     * @param {string} message
     * @param {Object} context     * @return void
     */
    alert(message: string, context?: Object): void;

    /**
     * Critical conditions.
     *
     * Example: Application component unavailable, unexpected exception.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    critical(message: string, context?: Object): void;

    /**
     * Runtime errors that do not require immediate action but should typically
     * be logged and monitored.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    error(message: string, context?: Object): void;

    /**
     * Exceptional occurrences that are not errors.
     *
     * Example: Use of deprecated APIs, poor use of an API, undesirable things
     * that are not necessarily wrong.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    warning(message: string, context?: Object): void;

    /**
     * Normal but significant events.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    notice(message: string, context?: Object): void;

    /**
     * Interesting events.
     *
     * Example: User logs in, SQL logs.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    info(message: string, context?: Object): void;

    /**
     * Detailed debug information.
     *
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    debug(message: string, context?: Object): void;

    /**
     * Logs with an arbitrary level.
     *
     * @param {number} level
     * @param {string} message
     * @param {Object} context
     * @return void
     */
    log(level: number, message: string, context?: Object): void;
}