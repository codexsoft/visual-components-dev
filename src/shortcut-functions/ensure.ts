export default function ensure(expressionResult: boolean|any, message: string): void {
    if (!expressionResult) {
        throw new Error( message );
    }
}