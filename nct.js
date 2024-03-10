const sha512 = require("js-sha512");
const PROXY_URL = "https://nct.napdev.workers.dev/";
const API_URL = "https://beta.nhaccuatui.com/api/";
const API_KEY = "e3afd4b6c89147258a56a641af16cc79";
const SECRET_KEY = "6847f1a4fc2f4eb6ab13f9084e082ef4";

const request = {
    endpoint: "",
    headers: {},
    body: {},
    params: {},
    setHeaders: (key, value) => {
        request.headers[key] = value;
    },
    setBody: (key, value) => {
        request.body[key] = value;
    },
    buildData: (data, type) => {
        if (type === 'json') {
            return JSON.stringify(data)
        } else {
            var params = [];
            for (const [key, value] of Object.entries(data)) {
                params.push(`${key}=${value}`);
            }
            params = params.join('&');
            return params;
        }
    },
    setParam: (key, value) => {
        request.params[key] = value;
    },
    send: async (method, url, body = null, type = "json") => {
        let dataParam = "";
        const options = {
            headers: request.headers
        }
        if (type === "json") {
            options.headers["Content-Type"] = "application/json"
        } else if (type === 'form') {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }
        if (body) {
            if (method === 'GET' || options.headers["Content-Type"] === "application/x-www-form-urlencoded") {
                options["body"] = request.buildData(body);
            } else {
                options["body"] = JSON.stringify(body);
            }
        }
        if (Object.entries(request.params).length) {
            dataParam += '?' + request.buildData(request.params);
        }

        options['method'] = method;
        try {
            const response = await fetch(`${request.getEndpoint()}${url}${dataParam}`, options);
            const json = await response.json();

            return {
                error: false,
                status: "OK",
                data: json
            }
        } catch (err) {
            return {
                error: true,
                message: err
            }
        }
    },
    getEndpoint: () => {
        return request.endpoint;
    },
    setEndpoint: (endpoint) => {
        request.endpoint = endpoint
    },

    get: async (url, body, type = 'json') => {
        return await request.send('GET', url, body, type);
    },
    post: async (url, body, type = 'json') => {
        return await request.send("POST", url, body, type);
    }
}
request.setEndpoint(API_URL);
const now = String(Date.now());
const hash = sha512.hmac(SECRET_KEY, now);
request.setParam('t', now)
request.setParam('s', hash)
request.setParam('a', API_KEY)
request.setHeaders('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
request.setHeaders('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
request.setHeaders('Access-Control-Allow-Credentials', 'true');
request.setHeaders('Access-Control-Allow-Origin', '*');
// const getHome = () => client.post("home");
const getSong = async (songId) => {
    var data = await request.post("media/info", { key: songId, type: "song" }, 'form');
    return data;
}

const searchByKeyword = async (keyword) => {
    var data = await request.post("search/all", { key: keyword }, 'form');
    return data;
}

const getLyric = async (songId) => {
    var data = await request.post("lyric", { key: songId, type: "song" }, 'form');
    // console.log(data);
    return data;
}
getLyric('f7XACmvhWloS');
module.exports = {
    getSong,
    searchByKeyword,
    getLyric
}
// const getPlaylists = () => client.post("tags");
// const getPlaylistDetail = (playlistId) =>
//     client.post(
//         "media/info",
//         joinQueryString({ key: playlistId, type: "playlist" })
//     );
// const getLyric = (songId) =>
//     client.post("lyric", joinQueryString({ key: songId, type: "song" }));
// const getVideoDetail = (videoId) =>
//     client.post(
//         "media/info",
//         joinQueryString({ key: videoId, type: "video" })
//     );
// const getTopics = () => client.post("topic");
// const getTopicDetail = (topicId) =>
//     client.post("topic/detail", joinQueryString({ key: topicId }));
// const getChart = (
//     { category = "nhac-viet", time } = {
//         category: "nhac-viet",
//     }
// ) =>
//     client.post(
//         "ranking/top20",
//         joinQueryString({
//             category,
//             type: "song",
//             size: 20,
//             week:
//                 (time === null || time === void 0 ? void 0 : time.week) ||
//                 undefined,
//             year:
//                 (time === null || time === void 0 ? void 0 : time.year) ||
//                 undefined,
//         })
//     );
// const getTop100 = (top100Id) =>
//     client.post("top100", joinQueryString({ key: top100Id }));
// const searchByKeyword = (keyword) =>
//     client.post("search/all", joinQueryString({ key: keyword }));
// const getTopKeyword = () => client.post("search/topkeyword");

// const getTrendingArtists = () =>
//     client.post("ranking/artist", joinQueryString({ size: 10 }));
// const exploreArtists = (
//     { nation = "hot", gender = 1 } = { nation: "hot", gender: 1 }
// ) => client.post("artist", joinQueryString({ nation, gender }));
// const getArtistDetail = (artistId) =>
//     client.post(
//         "artist/detail",
//         joinQueryString({
//             shortLink: artistId,
//             type: "all",
//             size: 20,
//             index: 1,
//             sort: 0,
//         })
//     );
// const explore = ({ type, key = "moi-hot", page = 1, pageSize = 36 }) =>
//     client.post(
//         "genre",
//         joinQueryString({ type, key, order: 1, pageIndex: page, pageSize })
//     );
