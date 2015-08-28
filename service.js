let Promise = require("bluebird");
let fetch = require("node-fetch");
let config = require("./config.json");
let fs = Promise.promisifyAll(require("fs"));

let localFile = "./cards.debug.json";

function fetchLocally() {
    console.log("Fetching cards locally...");
    let jsonResult = require(localFile);
    return Promise.resolve(jsonResult);
}

function fetchRemotely(secrets) {
    console.log("Fetching cards remotely...");
    let url = `https://api.trello.com/1/boards/${config.boardId}/cards?key=${secrets.key}&token=${secrets.token}`;

    return fetch(url)
        .then(res => {
            if (res.ok) {
                return Promise.resolve(res.json());
            } else {
                return Promise.reject(res.statusText);
            }
        });
}


export function fetchCards(secrets) {
    return new Promise((resolve, reject) => {
        if (process.env.LOCAL !== "true") {
            return fetchRemotely(secrets).then(resolve);
        }
        return fs.statAsync(localFile)
            .then(stat => {
                if (stat.isFile() && process.env.LOCAL) {
                    return fetchLocally().then(resolve);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}
