var frame;
var regionSelect = document.getElementById('region');
var mallSelect = document.getElementById('mall');
var codeArea = document.getElementById('code');
var createButton = document.getElementById('create');
var widthText = document.getElementById('width');
var heightText = document.getElementById('height');

var codeTemplate = '<script charset="utf-8" src="https://floors-widget.api.2gis.ru/loader.js" id="dg-floors-widget-loader"></script>\n' +
'<script charset="utf-8">\n' +
'    DG.FloorsWidget.init({\n' +
'        width: \'%width%px\',\n' +
'        height: \'%height%px\',\n' +
'        initData: {complexId: \'%id%\'}\n' +
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

function removeFrame() {
    if (frame) {
        document.body.removeChild(frame);
        frame = null;
    }
}
function updateRegions(data) {
    addBlankOption(regionSelect);

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

function validateText() {
    widthText.value = Math.max(760, widthText.value);
    heightText.value = Math.max(400, heightText.value);
}

createButton.onclick = function() {
    var id = mallSelect.value;

    if (!id || !id.length) { return; }

    removeFrame();

    validateText();

    frame = document.createElement('iframe');
    frame.width = widthText.value;
    frame.height = heightText.value;
    frame.src = 'https://floors-widget.api.2gis.ru/?complexId=' + id;
    document.body.appendChild(frame);

    codeArea.value = codeTemplate
        .replace('%width%', widthText.value)
        .replace('%height%', heightText.value)
        .replace('%id%', id);
};
