export default function expect(expressionResult: boolean|any, message: string): void {
    if (!expressionResult) {
        throw new Error( message );
    }
}