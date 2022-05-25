import fs from "fs";
function manipFileByChunks(src, func, startValue = undefined) {//just a shortcut for other functions
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
async function readFile(src) {//it reads a file
    return manipFileByChunks(src, (r, c) => {
        r += c;
        return r;
    }, "");
}
//search a JSON object in a (txt) file, given the value of a property fo that object
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
//search JSON object in a string, same requirements as searchObject
async function searchObjectV(txt, value, property = "id") {
    var lf = '"' + property + '":';
    switch (typeof value) {
        case "string": lf += '"' + value + '"';
            break;
        case "number": lf += value.toString();
            break;
        default: return null;
    }
    return new Promise((res, rej) => {
        let epsilon = txt.indexOf(lf);
        if (epsilon != -1) {
            let scan = epsilon;
            let bracketCounter = 1;
            while (bracketCounter != 0) {
                scan--;
                switch (txt[scan]) {
                    case "{": bracketCounter--; break;
                    case "}": bracketCounter++; break;
                }
            }
            let objectStart = scan;
            scan = epsilon + lf.length;
            bracketCounter = 1;
            while (bracketCounter != 0) {
                switch (txt[scan]) {
                    case "{": bracketCounter++; break;
                    case "}": bracketCounter--; break;
                }
                scan++;
            }
            let objectEnd = scan;
            let r = JSON.parse(txt.substring(objectStart, objectEnd));
            res(r);
        }
    })
}
async function changeObject(src,id,newObject) {
    let txt = await readFile(src);
    let lf = '"id":';
    switch (typeof id) {
        case "string": lf += '"' + id + '"';
            break;
        case "number": lf += id.toString();
            break;
        default: return null;
    }
    let getout = await searchObjectV(txt,id);
    getout = JSON.stringify(getout);
    txt = txt.slice(0,txt.indexOf(getout)-2)+txt.slice(txt.indexOf(getout)+getout.length);
    txt += "\n"+JSON.stringify(newObject);
    let pen = fs.createWriteStream("./test.txt");
    pen.write(txt);
}
export default { manipFileByChunks, readFile, searchObject, searchObjectV, changeObject }
async function main() {
    let timer = Date.now();
    await changeObject('test.txt',"11",{id:"11",pr1:"bas",pr2:51});
    console.log(Date.now() - timer);
}
main();