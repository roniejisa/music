const express = require("express");
const app = express();
const port = 3030;
const { ZingMp3 } = require("zingmp3-api-full");
const nct = require("./nct.js");
const { getLyricNCT } = require("./getLyric.js");

app.get("/nct/song/:id", async (req, res) => {
    const { id } = req.params;
    const response = await nct.getSong(id);
    if (response.error === false) {
        const { title, thumbnail, streamUrls, key } = response.data.song
        return res.json({
            status: 200,
            data: {
                title,
                streamUrls,
                id: key,
                image: thumbnail,
                type: 'nct'
            }
        })
    }
    return res.json({
        status: 100,
        data: {},
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

app.get("/nct/lyric/:id", async (req, res) => {
    const { id } = req.params;
    const response = await nct.getLyric(id);
    if (response.error === false) {
        let lyrics = await getLyricNCT(response.data.lyric.originalUrl);
        return res.json({
            status: 200,
            data: lyrics,
        });
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
    let response = await ZingMp3.getInfoSong(id);
    if (response.msg !== 'Success') {
        console.log(response.dat.songs);
        return false;
    }
    return res.json({
        status: 100,
        data: {}
    })
})

app.get('/zing/lyric/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.json({
            status: 100,
            data: {}
        })
    }
    let response = await ZingMp3.getLyric(id);
    if (response.msg === 'Success') {
        return res.json({
            status: 200,
            data: response.data.sentences
        });
    }
    return res.json({
        status: 100,
        data: {}
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
