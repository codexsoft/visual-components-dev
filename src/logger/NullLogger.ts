import {LoggableType} from "../types/LoggableType";
import LoggerInterface from "./LoggerInterface";

export default class NullLogger implements LoggerInterface {

    public readonly LEVEL_EMERGENCY: number = 100;
    public readonly LEVEL_ALERT: number = 200;
    public readonly LEVEL_CRITICAL: number = 300;
    public readonly LEVEL_ERROR: number = 400;
    public readonly LEVEL_WARNING: number = 500;
    public readonly LEVEL_NOTICE: number = 600;
    public readonly LEVEL_INFO: number = 700;
    public readonly LEVEL_DEBUG: number = 800;

    _log(message: any): void {
    };

    _info(message: any): void {
    };

    _major(message: any): void {
    };

    _notice(message: any): void {
    };

    _warn(message: any): void {
    };

    _error(message: string): void {
    };

    _timenotice(message: string): void {
    };

    _timeminor(message: string): void {
    };

    _timeinfo(message: string): void {
    };

    _timewarn(message: string): void {
    };

    _timeerror(message: string): void {
    };

    _group(message: string, collapsed?: boolean): void {
    };

    _close(): void {
    };

    _clean(): void {
    };

    _minor(message: string): void {
    };

    _space(): void {
    };

    /** @inheritDoc */
    emergency(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    alert(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    critical(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    error(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    warning(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    notice(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    info(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    debug(message: LoggableType, context?: Object): void {
    };

    /** @inheritDoc */
    log(level: number, message: LoggableType, context?: Object): void {
    };
}