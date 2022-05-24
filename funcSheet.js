const fs = require("fs");
function searchObject(src, value, property = "id") {
    var lf = '"' + property + '":';
    switch (typeof value) {
        case "string": lf += '"' + value + '"';
            break;
        case "number": lf += value.toString();
            break;
        default: return null;
    }
    //lf = what the function must look for in the text
    var iStr = fs.createReadStream(src);
    iStr.setEncoding("utf-8");
    let retVal;
    return new Promise((resolve, reject) => {
        iStr.on('data', function (chunk) {
            let timeSaver = lf.length;
            let scanStart = chunk.indexOf(lf);
            if (scanStart != -1) {
                let scan = scanStart;
                let bracketCounter = 1;
                while (bracketCounter != 0) {
                    scan--;
                    switch (chunk[scan]) {
                        case "{": bracketCounter--; break;
                        case "}": bracketCounter++; break;
                    }
                }
                let objectStart = scan;
                scan = scanStart + timeSaver;
                bracketCounter = 1;
                while (bracketCounter != 0) {
                    switch (chunk[scan]) {
                        case "{": bracketCounter++; break;
                        case "}": bracketCounter--; break;
                    }
                    scan++;
                }
                let objectEnd = scan;
                retVal = JSON.parse(chunk.substring(objectStart, objectEnd));
            }
        })
        iStr.on('end', () => {
            resolve(retVal);
        })
    })
}
export { searchObject }
async function main() {
    let timer = Date.now();
    let search = await searchObject("test.txt", "meme");
    console.log(search);
    console.log(Date.now() - timer);
}
main();