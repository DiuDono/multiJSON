import fs from "fs";
async function manipFileByChunks(src, func, startValue = undefined) {//just a shortcut for other functions
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
    return manipFileByChunks(src, (r, c) => {
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
        else {
            res(undefined);
        }
    })
}
async function updateObject(src, newObjects) {
    let txt = await readFile(src);
    let id = newObjects.id;
    let getout = await searchObjectV(txt, id);
    getout = JSON.stringify(getout);
    let getoutIndex = txt.indexOf(getout);
    if (getoutIndex >= 1) {
        txt = txt.slice(0, getoutIndex - 1) + txt.slice(getoutIndex + getout.length);
    }
    else if (getoutIndex == 0) {
        txt = txt.slice(getout.length);
    }
    txt += "\n" + JSON.stringify(newObjects);
    return new Promise((res) => {
        fs.writeFile(src, txt, () => res(true));
    })
}
async function updateObjects(src, newObjects) {
    if (Array.isArray(newObjects)) {
        let txt = await readFile(src);
        for (var i in newObjects) {
            let id = newObjects[i].id;
            let getout = await searchObjectV(txt, id);
            getout = JSON.stringify(getout);
            let getoutIndex = txt.indexOf(getout);
            if (getoutIndex >= 1) {
                txt = txt.slice(0, getoutIndex - 1) + txt.slice(getoutIndex + getout.length);
            }
            else if (getoutIndex == 0) {
                txt = txt.slice(getout.length);
            } if (getoutIndex != -1) {
                txt = txt.slice(0, getoutIndex - 1) + txt.slice(getoutIndex + getout.length);
            }
            txt += "\n" + JSON.stringify(newObjects[i]);
        }
        return new Promise((res) => {
            fs.writeFile(src, txt, () => res(true));
        })
    }
    else {
        return new Promise((res) => {
            res(false);
        })
    }
}
export default { manipFileByChunks, readFile, searchObject, searchObjectV, updateObject, updateObjects }