export default interface LoggerInterface {
    log(message: any): void;
    info(message: any): void;
    major(message: any): void;
    notice(message: any): void;
    warn(message: any): void;
    error(message: string): void;
    timenotice(message: string): void;
    timeminor(message: string): void;
    timeinfo(message: string): void;
    timewarn(message: string): void;
    timeerror(message: string): void;
    group(message: string, collapsed?: boolean): void;
    close(): void;
    clean(): void;
    minor(message: string): void;
    space(): void;
}