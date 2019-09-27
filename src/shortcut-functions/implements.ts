import { includes } from "lodash";

export function implementsInterface(object: {[index: string]: unknown}, objInterface: {[index: string]: any;}): boolean {

    if (typeof object !== 'object' || typeof objInterface !== 'object') {
        return false;
    }

    for (let key in objInterface) {
        let expectedType = objInterface[key];
        if (expectedType === undefined) {
            continue;
        }

        let actualValue: unknown = object[key];
        let actualType = typeof actualValue;

        if ((typeof expectedType === 'string') && (actualType !== expectedType)) {
            console.log('FALSE because '+key+' with value "'+actualValue+'" (type '+actualType+') is not expected '+expectedType);
            return false;
        } else if (Array.isArray(expectedType)) {
            if (!Array.isArray(actualValue) || !arrayMatchesInterface(actualValue, expectedType)) {
                return false;
            }
        } else if (typeof expectedType === 'object') {
            if ((actualType !== 'object') || !implementsInterface(<any>actualValue, expectedType)) {
                console.log('FALSE because '+key+' with value "'+actualValue+'" (type '+actualType+') is not object or does not implement expected structure '+expectedType);
                return false;
            }
        }

    }

    return true;
}

export function arrayMatchesInterface(actualArray: unknown[], allowedTypesForArray: unknown[]): boolean {

    if (!Array.isArray(actualArray) || !Array.isArray(allowedTypesForArray)) {
        return false;
    }

    let arraysInAllowedTypes: any[]|null = null;

    return actualArray.every((actualArrayItem: unknown): boolean => {
        let actualArrayItemType = typeof actualArrayItem;

        if ((actualArrayItemType === 'string') && !includes(allowedTypesForArray, actualArrayItemType)) {
            return false;
        }

        if (Array.isArray(actualArrayItem)) {

            if (arraysInAllowedTypes === null) {
                arraysInAllowedTypes = [];
                for (let allowedTypesItem of allowedTypesForArray) {
                    if (Array.isArray(allowedTypesItem)) {
                        arraysInAllowedTypes.push(allowedTypesItem);
                    }
                }
            }

            if (arraysInAllowedTypes.length === 0) {
                return false;
            }

            if (!arraysInAllowedTypes.some((allowedArray: any[]) => {
                return arrayMatchesInterface(actualArrayItem, allowedArray);
            })) {
                return false;
            }

        }

        return true;
    });

}