export default interface KeyboardInterface {
    listenKeyboard(): {[index: string]: Function};
}
export const listenKeyboardInterface = {
    listenKeyboard: 'function',
};