var Movie = require('../models/movie.js');
var Comment = require('../models/comment.js');
var Category = require('../models/category.js');
var _ = require('underscore');

  //detail
exports.detail = function (req, res) {
    var id = req.params.id;
    Movie.findById(id, function (err, movie) {
      Comment
      .find({movie:id})
      .populate('from','name')
      .populate('reply.from reply.to','name')
      .exec(function(err,comments){
          console.log(comments)
          res.render('detail', {
          title: '详情页',
          movie: movie,
          comments:comments
        });
      });
    });

  };
  //admin
exports.new = function (req, res) {
  Category.find({},function(err,categories){
    res.render('admin', {
      title: '后台录入',
      categories: categories,
      movie: {}
    });
  })
  };
// admin update page
exports.update = function(req, res) {
  var id = req.params.id

  if (id) {
    Movie.findById(id, function(err, movie) {
      Category.find({}, function(err, categories) {
        res.render('admin', {
          title: 'imooc 后台更新页',
          movie: movie,
          categories: categories
        })
      })
    })
  }
}

// admin post movie
exports.save = function(req, res) {
  console.log('req.body:'+req.body)
  console.log('req.body.movie:'+req.body.movies)
  //var id = req.params.id
  var id = req.body.movie._id
  var movieObj = req.body.movie
  var _movie
  var categoryId = movieObj.categories;

  if (req.poster) {
    movieObj.poster = req.poster
  }

  if (id) {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }
      Categories.update({_id:movie.categories},{$pullAll:{"movies":[id]}},function(err){
        _movie=_.extend(movie,movieObj);
        _movie.save(function(err,movie){
          if(err){
            console.log(err);
          }
          Categories.update({_id:categoryId},{$addToSet:{"movies":id}},function(err){
            res.redirect("/movie/"+movie._id);
          });
        });
       });
    });
  }
  else {
    _movie = new Movie(movieObj)

    //var categoryId = _movie.category
    var categoryName = movieObj.categoryName

    _movie.save(function(err, movie) {
      if (err) {
        console.log(err)
      }
      if (categoryId) {
        Category.findById(categoryId, function(err, category) {
          category.movies.push(movie._id)

          category.save(function(err, category) {
            res.redirect('/movie/' + movie._id)
          })
        })
      }
      else if (categoryName) {
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })

        category.save(function(err, category) {
          movie.category = category._id
          movie.save(function(err, movie) {
            res.redirect('/movie/' + movie._id)
          })
        })
      }
    })
  }
}
  //list
exports.list = function (req, res) {
    Movie.fetch(function (err, movies) {
      if (err) {
        console.log(err);
      }
      res.render('list', {
        title: '列表',
        movies: movies
      });
    })
  };

  //delete
exports.del = function (req, res) {
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
  }