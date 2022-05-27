# multiJSON
JSON files being limited to 1 object is annoying, so I gonna make a library to handle txt files containing multiple JSON objects
All functions are asynchronous, use await before calling them to make them somewhat synchronous
i.e. : searchObject("test.txt",42) : asynchronous, returns a promise containing a JSON object
       await searchObject("test.txt",42) : synchronous, returns a JSON object
If you're too lazy to read comments, or if such comments don't exist, here is a list of functions
    manipFilesByChunks(src,func,startValue) : will read a file by chunks, and apply func to each chunk as soon as it's read
        the return value of func will be assigned to returnValue, and returnValue is initialised as startValue.
        func must take 2 parameters, first is returnValue, second is the chunk of file read. The file is read in utf-8
    readFile(src) : reads a file, and returns a (huge) string containing the file's data. The file is read in utf-8
    searchObject(src,value,parameter = "id") : search an object (in JSON format) with the specified value for the
        specified parameter, in a file. It returns the searched object (already parsed)
    searchObjectV(src,value,parameter = "id") : same as searchObject, but searches through a variable
    updateObject(src,newObject) : removes the first object with same id as newObject (if any) from the src file, then adds
        newObject to the txt file. newObject needs an id
    updateObjects(src,newObjects) : apply updateObject to all elements of newObjects, newObjects MUST be an array (I put a
        check so if it's not an array, nothing happens)