const express = require("express");
const app = express();
const port = 3030;
const { ZingMp3 } = require("zingmp3-api-full");
const nct = require("./nct.js");
const { getLyricNCT } = require("./getLyric.js");

app.get("/nct/song/:id", async (req, res) => {
    const { id } = req.params;
    const [responseSong, responseLyric] = await Promise.all([nct.getSong(id), nct.getLyric(id)]);

    let data = {};
    if (responseSong.error === false) {
        const { title, thumbnail, streamUrls } = responseSong.data.song;
        const { streamUrl: url } = streamUrls[0];
        data = {
            title,
            url,
            image: thumbnail,
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

    if (response.error === false) {
        let newData = response.data.search.song.song.map(song => {
            return {
                id: song.key,
                title: song.title,
                artists: song.artists,
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
        const { title, artistsNames, thumbnail } = responseInfo.data;
        data['title'] = title;
        data['author'] = artistsNames;
        data['image'] = thumbnail;
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
    if (response.msg === 'Success') {
        let newData = response.data.songs.map(({ encodeId, title, thumbnail }) => {
            return {
                id: encodeId,
                title,
                image: thumbnail,
                type: 'zing'
            }
        })
        return res.json({
            status: 200,
            data: newData
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
