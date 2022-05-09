#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function set(path, value, object) {
    var schema = object; // a moving reference to internal objects within obj
    var pList = path.split(".");
    var len = pList.length;
    for (var i = 0; i < len - 1; i++) {
        var elem = pList[i];
        if (!schema[elem])
            schema[elem] = {};
        schema = schema[elem];
    }
    schema[pList[len - 1]] = value;
}
/*
npx setjsonkey [json-path] key1.key2.[index/latest/push].key3 "value"


 collect arguments 1 2 and 3
 find file (arg1) in path, import json (or start with empty object in a new file)
 reduce keys (arg2) to go deeper into the object and create keys as they don't exist
 make sure it works with arrays too
 convert value string (arg3) to number, boolean if they seem to be like that

*/
const [jsonPath, keyLocation, value] = process.argv.slice(2); //NB: can also be undefined!
const usage = 'usage: npx setjsonkey [json-file-path] key1.key2.[index/latest/push].key3 "value" (Check https://github.com/Code-From-Anywhere/setjsonkey for more info)';
//console.log({ jsonPath, keyLocation, value });
// VALIDATION
if (!keyLocation || keyLocation.length === 0) {
    console.log(usage);
    process.exit(0);
}
const getFolder = (pathString) => {
    const parts = pathString.split("/");
    parts.splice(-1);
    return parts.join("/");
};
const jsonPathWithExtension = jsonPath.endsWith(".json")
    ? jsonPath
    : jsonPath + ".json";
const absolutePath = path_1.default.resolve(jsonPathWithExtension);
const fileExists = fs_1.default.existsSync(absolutePath);
if (!fileExists) {
    const folder = getFolder(absolutePath);
    console.log("creating folder because it didn't exist yet", folder);
    //fs.mkdirSync(folder, { recursive: true });
}
let object = {};
if (fileExists) {
    try {
        object = JSON.parse(fs_1.default.readFileSync(absolutePath, "utf8"));
    }
    catch (e) {
        console.log("No JSON found here, so we're overwriting it with our new JSON");
    }
}
if (typeof object !== "object") {
    object = {};
}
const realValue = value === "true" || value === "false"
    ? Boolean(value)
    : !isNaN(Number(value))
        ? Number(value)
        : value;
// UPDATE/SET JSON key
set(keyLocation, realValue, object);
fs_1.default.writeFileSync(absolutePath, JSON.stringify(object), { encoding: "utf8" });
// console.log({ absolutePath, fileExists, object });
console.log("succesfully changed your json!");
