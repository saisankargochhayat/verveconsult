
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

var compression = require('compression');

app.use(compression()); //use compression
var sendgrid  = require('sendgrid')(/*sendgrid api_key here*/);
var sendmail = function(){};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//-------------------------------Contact Us function----------------------------

app.post('/contactus',function(req,res,next){
  console.log(req.body);
  //Email construction for brookhaven
  var a = parseInt(req.body.checkHuman_a);
  var b = parseInt(req.body.checkHuman_b);
  var c = parseInt(req.body.senderHuman);
  console.log(a + ' + ' + b + ' == ' + c);
  if(a+b !== c){
    console.log("Captcha check failed");
    res.status = 500;
    res.send("Not human ?");
  }else{
    var email     = new sendgrid.Email({
      to:       'verveconsultancy16@gmail.com',
      toname : 'VerveConsult',
      from:     req.body.email,
      fromname: req.body.name,
      subject:  'Contact Us from VerveConsult',
      replyto : req.body.email,
      text:     'Message from '+ req.body.name+' < '+req.body.email+ ' > '
      + ' : ' + req.body.message,
      html: '<h3> Message from ' + req.body.name + ' < '+req.body.email+ ' > '
      + ' : </h3> <br><h2>'+req.body.message+ '</h2>'
    });
    //sending email to brookhaven
    sendgrid.send(email, function(err, json) {
      if (err) { console.log(err);
        res.status = 500;
        res.send('There was some problem. Please try again later.');
      }else{
        console.log(json);
        //if succesfully sent the mail , send an email to the user
        //mail construction for user
        var email     = new sendgrid.Email({
          to:       req.body.email,
          toname : req.body.name,
          from:     'verveconsultancy16@gmail.com',
          fromname: 'VerveConsult',
          subject:  'Contact Us from VerveConsult',
          replyto : 'verveconsultancy16@gmail.com',
          text:     'Thank You for contacting us. We will get back to you shortly.',
          html: '<h1> Thank You for contacting us. We will get back to you shortly.</h1> '
        });



        //send mail to user
        sendgrid.send(email, function(err, json) {
          if (err) { console.log(err);
            res.status = 500;
            res.send('There was some problem. Please try again later.');
          }else{
            //if succesfull , send success message
            console.log(json);
            res.send({'status' : 'success'});
          }
        });
      }
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect('/404.html')
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

//app.listen(3000, function () {
  // console.log('Example app listening on port 3000!');
// });

module.exports = app;
