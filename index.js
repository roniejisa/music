const express = require("express");
const app = express();
const port = 3030;
const { ZingMp3 } = require("zingmp3-api-full");
const nct = require("./nct.js");
const { getLyricNCT } = require("./getLyric.js");
const path = require('path');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.get("/nct/song/:id", async (req, res) => {
    const { id } = req.params;
    const [responseSong, responseLyric] = await Promise.all([nct.getSong(id), nct.getLyric(id)]);

    let data = {};
    if (responseSong.error === false && responseSong.data.song.streamUrls.length) {
        const { title, thumbnail, streamUrls, artists } = responseSong.data.song;
        const { streamUrl: url } = streamUrls[0];
        data = {
            title,
            url,
            image: thumbnail,
            author: artists.map(artist => artist.name).join(','),
            type: 'nct'
        }
    }

    if (responseLyric.error === false) {
        let lyrics = await getLyricNCT(responseLyric.data.lyric.originalUrl);
        data['lyrics'] = lyrics;
    }

    return res.json({
        status: 200,
        data: data,
    });
});

app.get("/nct/search/:keyword", async (req, res) => {
    const { keyword } = req.params;
    if (!keyword) {
        return res.json({
            status: 100,
            data: {}
        })
    }

    const response = await nct.searchByKeyword(keyword);

    if (response.error === false && response.data.search && response.data.search.song && response.data.search.song.song) {
        
        let newData = response.data.search.song.song.map(song => {
            return {
                id: song.key,
                title: song.title,
                image: song.thumbnail,
                author: song.artists.map(artist => artist.name).join(', '),
                type: 'nct'
            }
        });
        return res.json({
            status: 200,
            data: newData
        })
    }

    return res.json({
        status: 100,
        data: {},
    });
});

app.get('/zing/song/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.json({
            status: 100,
            data: {}
        })
    }

    let [responseSong, responseInfo, responseLyric] = await Promise.all([ZingMp3.getSong(id), ZingMp3.getInfoSong(id), ZingMp3.getLyric(id)]);

    let data = {};

    if (responseSong.msg === 'Success') {
        data['url'] = responseSong.data['128'];
    }

    if (responseInfo.msg === 'Success') {
        const { title, artistsNames, thumbnailM } = responseInfo.data;
        data['title'] = title;
        data['author'] = artistsNames;
        data['image'] = thumbnailM;
    }

    if (responseLyric.msg === 'Success') {
        data['lyrics'] = responseLyric.data.sentences;
    }

    return res.json({
        status: 200,
        data
    })
})

app.get('/zing/search/:keyword', async (req, res) => {
    const { keyword } = req.params;
    if (!keyword) {
        return res.json({
            status: 100,
            data: {}
        })
    }
    let response = await ZingMp3.search(keyword);
    if (response.msg === 'Success' && response.data.songs) {
        let newData = response.data.songs.map(({ encodeId, title, thumbnailM, artistsNames }) => {
            return {
                id: encodeId,
                title,
                author:artistsNames,
                image: thumbnailM,
                type: 'zing'
            }
        })
        return res.json({
            status: 200,
            data: newData
        });
    }
    return res.json({
        status: 100,
        data: []
    })
})

app.get('/topSong', async (req, res) => {
    var response = await ZingMp3.getChartHome();
    if (response.msg === 'Success') {
        var newData = response.data.RTChart.items.map(({ encodeId, title, thumbnailM, artistsNames }) => {
            return {
                id: encodeId,
                title,
                author: artistsNames,
                image: thumbnailM,
                type: 'zing'
            }
        })
        return res.json({
            status: 200,
            data: newData
        })
    }
    return res.json({
        status: 100,
        data: []
    })
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/app.js', function (req, res) {
    res.sendFile(path.join(__dirname, '/app.js'));
});

app.get('/assets/css/style.css', function (req, res) {
    res.sendFile(path.join(__dirname, '/assets/css/style.css'));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
