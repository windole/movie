var Movie = require('../models/movie.js');
var User = require('../models/user.js');
var _ = require('underscore');

module.exports = function(app){
  //pre handle user
  app.use(function (req, res,next) {
     var _user = req.session.user;
     if(_user){
      app.locals.user = _user;
     }
      return next()
  })

  //routes
  //index
  app.get('/', function (req, res) {
    console.log('user in session:'+req.session.user);

    Movie.fetch(function (err, movies) {
      if (err) {
        console.log(err)
      }
      res.render('index', {
        title: '首页',
        movies: movies
      });
    });
  });

  // signup
  app.post('/user/signup',function(req,res){
    var _user = req.body.user;
    //console.log(_user)
    //req.param('user')

    User.findOne({name: _user.name}, function(err, user){
      if(err){
        console.log(err)
      }
      if(user){
        return res.redirect('/');
      }else{
        var user = new User(_user);
        user.save(function(err,user){
        if(err){
          console.log(err);
        }
          console.log(user);
        res.redirect('/admin/userlist');
      })
      }
    }) 

  })

  //signin
  app.post('/user/signin',function(req,res){
      var _user = req.body.user;
      var name = _user.name;
      var password = _user.password;

      User.findOne({name:name},function(err,user){
        if(err){
          console.log(err);
        }
        if(!user){
          return res.redirect('/');
        }
        user.comparePassword(password,function(err,isMatch){
          if(err) console.log(err);
          if(isMatch){
            console.log('password is matched');
            req.session.user = user;
            return res.redirect('/');
          }else{
            console.log('password is not matched');
          }
        })
      })
  })

  //logout
  app.get('/logout',function(req,res){
      delete req.session.user;
      delete app.locals.user;
      res.redirect('/');
  })

  //userlist page
  app.get('/admin/userlist', function (req, res) {
    User.fetch(function (err, users) {
      if (err) {
        console.log(err);
      }
      res.render('userlist', {
        title: '用户列表页',
        users: users
      });
    })
  });


  //detail
  app.get('/movie/:id', function (req, res) {
    var id = req.params.id;
    Movie.findById(id, function (err, movie) {
      if (err) {
        console.log(err)
      }
      res.render('detail', {
        title: '详情页' + movie.title,
        movie: movie
      });
    });

  });
  //admin
  app.get('/admin/movie', function (req, res) {
    res.render('admin', {
      title: '后台录入',
      movie: {
        title: '',
        doctor: '',
        country: '',
        language: '',
        summary: '',
        year: '',
        flash: '',
        poster: ''
      }
    });
  });
  app.get('/admin/update/:id', function (req, res) {
    var id = req.params.id;
    if (id) {
      Movie.findById(id, function (err, movie) {
        res.render('admin', {
          title: '后台更新',
          movie: movie
        });
      });
    }
  });
  app.post('/admin/movie/new', function (req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;
    if (id !== 'undefined') {
      Movie.findById(id, function (err, movie) {
        if (err) {
          console.log(err);
        }
        _movie = _.extend(movie, movieObj);
        _movie.save(function (err, movie) {
          if (err) {
            console.log(err)
          }
          res.redirect('/movie/' + movie._id)
        })
      })
    } else {
      _movie = new Movie({
        doctor: movieObj.doctor,
        title: movieObj.title,
        language: movieObj.language,
        country: movieObj.country,
        year: movieObj.year,
        poster: movieObj.poster,
        flash: movieObj.flash,
        summary: movieObj.summary,

      })
      _movie.save(function (err, movie) {
        if (err) {
          console.log(err);
        }
        res.redirect('/movie/' + movie._id)
      })
    }
  })

  //list
  app.get('/admin/list', function (req, res) {
    Movie.fetch(function (err, movies) {
      if (err) {
        console.log(err);
      }
      res.render('list', {
        title: '列表',
        movies: movies
      });
    })
  });

  //delete
  app.delete('/admin/list', function (req, res) {
    var id = req.query.id
    if (id) {
      Movie.remove({
        _id: id
      }, function (err, movie) {
        if (err) {
          console.log(err);
        } else {
          res.json({
            success: 1
          })
        }
      })
    }
  })
  
}
