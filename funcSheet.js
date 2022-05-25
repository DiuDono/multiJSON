import fs from "fs";
function manipFileByChunks(src, func, startValue = undefined) {
    var iStr = fs.createReadStream(src);
    iStr.setEncoding("utf-8");
    let returnValue = startValue;
    return new Promise((resolve, reject) => {
        iStr.on('data', function (c) {
            returnValue = func(returnValue, c);
        })
        iStr.on('end', () => {
            resolve(returnValue);
        })
    })
}
async function searchObject(src, value, property = "id") {
    var lf = '"' + property + '":';
    switch (typeof value) {
        case "string": lf += '"' + value + '"';
            break;
        case "number": lf += value.toString();
            break;
        default: return null;
    }
    //lf = what the function must look for in the text
    let retVal = await manipFileByChunks(src, (r, c) => {
        if (r != undefined) {
            return r
        }
        else {
            let scanStart = c.indexOf(lf);
            console.log(lf);
            if (scanStart != -1) {
                let timeSaver = lf.length;
                let scan = scanStart;
                let bracketCounter = 1;
                while (bracketCounter != 0) {
                    scan--;
                    switch (c[scan]) {
                        case "{": bracketCounter--; break;
                        case "}": bracketCounter++; break;
                    }
                }
                let objectStart = scan;
                scan = scanStart + timeSaver;
                bracketCounter = 1;
                while (bracketCounter != 0) {
                    switch (c[scan]) {
                        case "{": bracketCounter++; break;
                        case "}": bracketCounter--; break;
                    }
                    scan++;
                }
                let objectEnd = scan;
                r = JSON.parse(c.substring(objectStart, objectEnd));
                return r;
            }
            else {
                return undefined;
            }
        }
    });
    return retVal;
}
export { searchObject }
async function main() {
    let timer = Date.now();
    let textFile = await searchObject("test.txt", "1");
    console.log(textFile);
    console.log(Date.now() - timer);
}
main();