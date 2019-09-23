export default interface LoggerInterface {
    log(message: any): void;
    info( message: any ): void;
    major( message: any ): void;
    notice( message: any ): void;
    warn( message: any ): void;
    error( message ): void;
    timenotice( message ): void;
    timeminor( message ): void;
    timeinfo( message ): void;
    timewarn( message ): void;
    timeerror( message ): void;
    group( message, collapsed?: boolean): void;
    close(): void;
    clean(): void;
    minor( message ): void;
    space(): void;
}