var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var unzip = require('node-unzip');
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({
    dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        var projectName = file.originalname.replace('.zip', '');
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        fs.createReadStream(file.path).pipe(unzip.Extract({ path: './projects/' + projectName
                                                          }).on('close', function(){
            console.log('DONE!');
            initProject(projectName);
        }));
    }
}));

var initProject = function(projectName){
    console.log(projectName);
    
    async.series([
        function(seriesCallback){
            var cute = 'mv ./projects/' + projectName  + ' ./projects/' + projectName + '_tmp';
            exec(cute, function (error, stdout, stderr) {
                if (error || stderr){
                    console.log(error || stderr);
                }
                else{
                    console.log(stdout);
                    seriesCallback();
                }
            });
        },
        function(seriesCallback){
            var cute = 'mv ./projects/' + projectName + '_tmp/' + projectName + ' ./projects/'
            exec(cute, function (error, stdout, stderr) {
                if (error || stderr){
                    console.log(error || stderr);
                }
                else{
                    console.log(stdout);
                    seriesCallback();
                }
            }); 
        },
        function(seriesCallback){
            var cute = 'rm -R ./projects/' + projectName + '_tmp';
            exec(cute, function (error, stdout, stderr) {
                if (error || stderr){
                    console.log(error || stderr);
                }
                else{
                    console.log(stdout);
                    seriesCallback();
                }
            }); 
        },
        function(seriesCallback){
            var cute = 'mkdir -p ./projects/' + projectName + '/node_modules';
            exec(cute, function (error, stdout, stderr) {
                if (error || stderr){
                    console.log(error || stderr);
                }
                else{
                    console.log(stdout);
                    seriesCallback();
                }
            }); 
        }
    ], function(){
        var cute = 'npm install --prefix ./projects/' + projectName;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            else{
                console.log(stdout);
                console.log('DONE!');
                createSystemFiles(projectName, 5555);
            }
        }); 
    });
};

var createSystemFiles = function(projectName, port){
    console.log('create systemfiles!');
    fs.readFile('./scripts/node.sh', 'utf-8', function(err, data){
        if (err) throw err;
        var newValue = data.replace('{PROJECTNAME}', projectName).replace('{PORT}', port);

        fs.writeFile('./projects/' + projectName + '/daemon.sh', newValue, 'utf-8', function (err) {
            if (err) throw err;
            console.log('startup script created');
            var cute = 'chmod +x ./projects/' + projectName + '/daemon.sh';
            exec(cute, function (error, stdout, stderr) {
                if (error || stderr){
                    console.log(error || stderr);
                }
                else{
                    console.log(stdout);
                    runProject(projectName);
                }
            });
        });
    });

};

var runProject = function(projectName){
    var cute = './projects/' + projectName + '/daemon.sh';
    exec(cute, function (error, stdout, stderr) {
        if (error || stderr){
            console.log(error || stderr);
        }
        else{
            console.log(stdout);
        }
    });
};

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;