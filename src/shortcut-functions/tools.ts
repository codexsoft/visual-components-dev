export function blobToFile(blob: Blob, contentType: string, filename: string = 'file'): File {
    return new File([blob], filename, {type: contentType, lastModified: Date.now()});
}

export function getFileExtension(path: string): string {
    let parts = path.split('.');
    if (parts.length > 0) {
        // @ts-ignore
        return parts.pop().toLowerCase();;
    } else {
        return '';
    }
}

export function getFileBasename( path: string ): string {
    return path.replace(/\\/g,'/').replace(/.*\//, '');
}

/**
 * /myfilepath/extensions/filename.png => filename.png
 *
 * @param filepath
 * @returns {string}
 */
export function getFilenameWithExt(filepath: string): string {
    return filepath.replace(/^.*[\\\/]/, '');
}

/**
 * trigger a DOM event via script
 * @param {Object,String} element a DOM node/node id
 * @param {String} event a given event to be fired - click,dblclick,mousedown,etc.
 */
export function fireEvent(element: HTMLElement, event: string) {
    let evt;

    // @ts-ignore
    if (document.createEventObject) { // dispatch for IE
        // @ts-ignore
        evt = document.createEventObject();
        // @ts-ignore
        return element.fireEvent('on' + event, evt);
    } else { // dispatch for firefox + others
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}

export function setSelectionRange(input: HTMLInputElement, selectionStart: number, selectionEnd: number) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
        // @ts-ignore
    } else if (input.createTextRange) {
        // @ts-ignore
        let range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

export function setCaretToPos(input: HTMLInputElement, pos: number): void {
    setSelectionRange(input, pos, pos);
}

export function isEmail(email: string): boolean {
    let pattern = /^([a-z0-9_.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
    return pattern.test(email);
}

/**
 * @param elm1
 * @param elm2
 * @throws {Error}
 */
export function swapNodes(elm1: Node, elm2: Node) {
    let parent1, next1,
        parent2, next2;

    parent1 = elm1.parentNode;
    parent2 = elm2.parentNode;

    if (!parent1 || !parent2) {
        throw new Error('Nodes have no parent elements, so cannot be swapped!');
    }

    next1   = elm1.nextSibling;
    next2   = elm2.nextSibling;

    parent1.insertBefore(elm2, next1);
    parent2.insertBefore(elm1, next2);
}

/**
 * trigger a DOM event via script
 * @param {Object,String} element a DOM node/node id
 * @param {String} eventName a given event to be fired - click,dblclick,mousedown,etc.
 * @param params
 */
export function fireCustomEvent(element: HTMLElement, eventName: string, params: Object = {}) {
    // if (!_.isEmpty(params))
    // le.console.log(params);

    // @ts-ignore
    if (document.createEventObject) { // Реализация события в IE
        // @ts-ignore
        let o = document.createEventObject();
        o.detail = params;
        try {
            // @ts-ignore
            element.fireEvent('on'+eventName, o);
        } catch ( e ) {
            // le.console.error('Sorry, custom events does not work in IE (Tryed to trigger event '+eventName+')');
        }

    }
    else { // dispatch for firefox + others
        let x = new CustomEvent(eventName, params);
        x.initCustomEvent( eventName, true, true, params );
        element.dispatchEvent(x);
        return;
    }
}