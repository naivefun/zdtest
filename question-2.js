'use strict';

module.exports.run = function compareUris(uri1, uri2) {
    let u1 = parseUri(uri1);
    let u2 = parseUri(uri2);

    if (u1 && u2) {
        u1.port = u1.port || '80';
        u2.port = u2.port || '80';
        for (let key of ['username', 'password', 'port']) {
            if (u1[key] !== u2[key]) {
                return false;
            }
        }

        for (let key of ['scheme', 'domain']) {
            if (u1[key] && u2[key]) {
                if (u1[key].toLowerCase() !== u2[key].toLowerCase())
                    return false;
            } else return false;
        }

        let matchesPath = comparePaths(u1.path, u2.path);
        if (!matchesPath) return false;
        let matchesQuery = compareQuery(u1.query, u2.query);
        if (!matchesQuery) return false;

        return true;
    }

    return false;
}

function parseUri(uri) {
    if (typeof uri === 'string') {
        uri = decodeURI(uri);
        let regex = /([a-zA-Z]+):\/\/(([\w]+):([\w]+)@)?([\w\.]+):?([0-9]+)?([\.\w\/]+)(\?(.+))?/gi;
        let groups = {
            scheme: 1,
            username: 3,
            password: 4,
            domain: 5,
            port: 6,
            path: 7,
            query: 9
        };

        let m = regex.exec(uri);
        if (m) {
            return {
                scheme: m[groups.scheme],
                username: m[groups.username],
                password: m[groups.password],
                domain: m[groups.domain],
                port: m[groups.port],
                path: m[groups.path],
                query: m[groups.query]
            };
        }
    }
}

function comparePaths(path1, path2) {
    if (path1 === path2) return true;

    if (isString(path1) && isString(path2)) {
        let normalize = (path) => {
            let segments = path.split('/');
            let result = [];
            for (let seg of segments) {
                if (seg === '.') continue;
                else if (seg === '..') result.pop();
                else result.push(seg);
            }

            return result.join('/') || '/';
        };

        return normalize(path1) === normalize(path2);
    }

    return false;
}

function compareQuery(query1, query2) {
    if (query1 === query2) return true;

    if (isString(query1) && isString(query2)) {
        let collect = (query) => {
            let pairs = query.split('&');
            let result = {};
            for (let pair of pairs) {
                if (isQueryPair(pair)) {
                    let kv = pair.split('=');
                    let key = kv[0], value = kv[1];
                    if (!isEmpty(key)) {
                        result[key] = result[key] || [];
                        result[key].push(value);
                    }
                }
            }

            return result;
        };

        let r1 = collect(query1), r2 = collect(query2), keys = Object.keys(r1);
        if (keys.length === Object.keys(r2).length) {
            for (let key of keys) {
                if (!r2[key]) return false;
                if (r1[key].length !== r2[key].length) return false;
                for (let i = 0; i < r1[key].length; i++) {
                    if (r1[key][i] !== r2[key][i]) return false;
                }
            }

            return true;
        }
    }

    return false;
}

function isString(input) {
    return typeof input === 'string';
}

function isQueryPair(input) {
    if (!isString(input)) return false;
    return input.indexOf('=') > 0;
}

function isEmpty(input) {
    return !input || !input.trim();
}
