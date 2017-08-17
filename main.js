var frame;
var regionSelect = document.getElementById('region');
var mallSelect = document.getElementById('mall');
var localeSelect = document.getElementById('locale');
var codeArea = document.getElementById('code');
var createButton = document.getElementById('create');
var widthText = document.getElementById('width');
var heightText = document.getElementById('height');
var queryText = document.getElementById('query');

var codeTemplate = '<script charset="utf-8" src="https://floors-widget.api.2gis.ru/loader.js" id="dg-floors-widget-loader"></script>\n' +
'<script charset="utf-8">\n' +
'    DG.FloorsWidget.init({\n' +
'        width: \'%width%\',\n' +
'        height: \'%height%\',\n' +
'        initData: %initData%\n' +
'    });\n' +
'</script>';

function addBlankOption(select, text) {
    var option = document.createElement('option');
    option.value = null;
    option.text = text || '--';
    select.add(option);
}

function empty(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function sortByName(a, b) {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
}

function removeFrame() {
    if (frame) {
        document.body.removeChild(frame);
        frame = null;
    }
}
function updateRegions(data) {
    addBlankOption(regionSelect);

    data.result.items.sort(sortByName);
    data.result.items.forEach(function(region) {
        var option = document.createElement('option');
        option.value = region.id;
        option.text = region.name;
        regionSelect.add(option);
    });

    localStorage.setItem('regions', JSON.stringify(data));
}

var dataFromStorage = localStorage.getItem('regions');

if (dataFromStorage) {
    updateRegions(JSON.parse(dataFromStorage));
} else {
    fetch('https://catalog.api.2gis.ru/2.0/region/list?key=ruregt3044')
        .then(function(res) {
            return res.json();
        })
        .then(updateRegions);
}

regionSelect.onchange = function() {
    list = {};
    empty(mallSelect);
    codeArea.value = '';

    fetch('https://floors.api.2gis.ru/complexes?region_id=' + regionSelect.value)
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            addBlankOption(mallSelect);

            data.sort(sortByName);
            data.forEach(function(mall) {
                list[mall.id] = mall;
                var option = document.createElement('option');
                option.value = mall.id;
                option.text = mall.name;
                mallSelect.add(option);
            });
        });
};

mallSelect.onchange = function() {
    codeArea.value = '';
    removeFrame();
};

function getSize() {
    var width = widthText.value;
    if (Number(width)) {
        widthText.value = Math.max(760, width);
        width += 'px';
    }

    var height = heightText.value;
    if (Number(height)) {
        heightText.value = Math.max(400, height);
        height += 'px';
    }

    return [width, height];
}

createButton.onclick = function() {
    var id = mallSelect.value;

    if (!id || !id.length) { return; }

    removeFrame();

    var initData = {
        complexId: id,
        options: {}
    };

    if (localeSelect.value !== 'ru_RU') {
        initData.options.locale = localeSelect.value;
    }

    if (queryText.value !== '') {
        initData.options.initialSearchQuery = queryText.value;
    }

    var size = getSize();

    frame = document.createElement('iframe');
    frame.width = size[0];
    frame.height = size[1];
    frame.src = './widget.html?' + encodeURIComponent(JSON.stringify(initData));
    document.body.appendChild(frame);
    frame.onload = function() {
        frame.contentWindow.postMessage({initData}, '*');
    };

    codeArea.value = codeTemplate
        .replace('%width%', size[0])
        .replace('%height%', size[1])
        .replace('%initData%', JSON.stringify(initData, null, 4).replace(/\n/g, '\n        '));
};
