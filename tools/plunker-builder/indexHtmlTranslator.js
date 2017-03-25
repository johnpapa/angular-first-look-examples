module.exports = {
  translate: translate
};

var _rxRules = {
  basehref: {
    from: /<base href=".*"[/]?>/,
    to: '<script>document.write(\'<base href="\' + document.location + \'" />\');</script>'
  },
  angular_pkg: {
    from: /src=".?node_modules\/@angular/g,
    to: 'src="https://npmcdn.com/@angular'
  },
  script: {
    from: /<script.*".*%tag%".*>.*<\/script>/,
    to: '<script src="%tag%"></script>'
  },
  link: {
    from: '/<link rel="stylesheet" href=".*%tag%".*>/',
    to: '<link rel="stylesheet" href="%tag%">'
  },
  system_extra_main: {
    from: /main:\s*[\'|\"]index.js[\'|\"]/,
    to: 'main: "index.ts"'
  },
  system_extra_defaultExtension: {
    from: /defaultExtension:\s*[\'|\"]js[\'|\"]/,
    to: 'defaultExtension: "ts"'
  }
};

var _rxData = [
  {
    pattern: 'basehref',
  },
  {
    pattern: 'script',
    from: 'node_modules/core-js/client/shim.min.js',
    to:   'https://npmcdn.com/core-js/client/shim.min.js'
  },
  {
    pattern: 'script',
    from: 'node_modules/zone.js/dist/zone.js',
    to:   'https://npmcdn.com/zone.js@0.6.26?main=browser'
  },
  {
    pattern: 'script',
    from: 'node_modules/systemjs/dist/system.src.js',
    to:   'https://npmcdn.com/systemjs@0.19.40/dist/system.src.js'
  },
  {
    pattern: 'angular_pkg',
  },
  {
    pattern: 'system_extra_main'
  },
  {
    pattern: 'system_extra_defaultExtension'
  }
];



function translate(html) {
  _rxData.forEach(function(rxDatum) {
    var rxRule = _rxRules[rxDatum.pattern];
    // rxFrom is a rexexp
    var rxFrom = rxRule.from;
    if (rxDatum.from) {
      var from = rxDatum.from.replace('/', '\/');
      var rxTemp = rxFrom.toString();
      rxTemp = rxTemp.replace('%tag%', from);
      rxFrom = rxFromString(rxTemp);
    }
    // rxTo is a string
    var rxTo = rxRule.to;
    if (rxDatum.to) {
      var to = rxDatum.to;
      to = Array.isArray(to) ? to : [to];
      to = to.map(function (toItem) {
        return rxTo.replace("%tag%", toItem);
      });
      rxTo = to.join("\n    ");
    }
    html = html.replace(rxFrom, rxTo );
  });

  return html;
}

function rxFromString(rxString) {
  var rx = /^\/(.*)\/(.*)/;
  var pieces = rx.exec(rxString);
  return RegExp(pieces[1], pieces[2]);
}
