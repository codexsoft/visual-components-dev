// async function get(): Promise<Object> {
//     return new Promise<Object>();
// }

async function get(url) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function (event) {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);//OK
            } else {
                reject(xhr.statusText);//Error
            }
        };
        xhr.open('GET', url, true);//Async
        xhr.send();
    });
}
async function main() {
    // var indexPage = await get("index.html");
    var indexPage = await get("test.html");
    console.log(indexPage);
}
main();