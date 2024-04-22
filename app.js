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

    get: async (url, body = null, type = 'json') => {
        return await request.send('GET', url, body, type);
    },
    post: async (url, body, type = 'json') => {
        return await request.send("POST", url, body, type);
    }
}
var audio = document.querySelector('audio');
var formSong = document.querySelector('.song form');
var formSearch = document.querySelector('.search form');
var result = document.querySelector('.result');

var copyResult = result.querySelector('button');
var contentResult = result.querySelector('.content');

var inputSong = formSong.querySelector('input');
var selectSong = formSong.querySelector('select');

var inputSearch = formSearch.querySelector('input');
var selectSearch = formSearch.querySelector('select');
formSong.addEventListener('submit', async function (e) {
    e.preventDefault();
    var value = inputSong.value.trim();
    var selectValue = selectSong.value;

    if (value === '' || selectValue === '') {
        alert('Vui lòng nhập đầy đủ thông tin!');
        inputSong.focus();
        return false;
    }
    contentResult.innerHTML = `<style>.rs-loading-main{display: flex; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
    const response = await request.get(`${selectValue}/song/${value}`);
    const { data } = response.data;
    if (data.url) {
        audio.src = data.url;
    }
    contentResult.textContent = JSON.stringify(data, undefined, 2);
})

formSearch.addEventListener('submit', async function (e) {
    e.preventDefault();
    var value = inputSearch.value.trim();
    var selectValue = selectSearch.value;

    if (value === '' || selectValue === '') {
        alert('Vui lòng nhập đầy đủ thông tin!');
        inputSearch.focus();
        return false;
    }
    contentResult.innerHTML = `<style>.rs-loading-main{display: flex; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
    const response = await request.get(`${selectValue}/search/${value}`);
    const { data } = response.data;
    if (data.url) {
        audio.src = data.url;
    }
    contentResult.textContent = JSON.stringify(data, undefined, 2);
})


copyResult.addEventListener('click', function () {
    if (contentResult.textContent === '') {
        alert('Không có dữ liệu');
        return false;
    }
    Clipboard.copy(contentResult.textContent);
    alert('Đã copy')
})

window.Clipboard = (function (window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function (text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);

