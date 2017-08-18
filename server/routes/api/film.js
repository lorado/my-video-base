const Film = require('../../models/Film');
const ObjectId = require('mongoose').Types.ObjectId;
const express = require('express');
const router = express.Router();

// Error handling
const sendError = (err, res) => {
  const message = typeof err == 'object' ? err.message : err;
  res.status(500).json({
    errorMessage: message
  });
};

router.get('/count', (req, res) => {
  Film.count({
    _account: req._accountId
  }, (err, count) => {
    if (err) {
      return sendError(err, res);
    }
    res.json(count);
  })
});

router.get('/fetch', (req, res) => {
  const perPage = 20;
  const currentPage = req.query.currentPage ? +req.query.currentPage : 1;

  const query = {
    _account: req._accountId
  };
  if (req.query.filterByTitle) {
    query.title = new RegExp(req.query.filterByTitle, 'i')
  }
  const response = {};

  const countPromise = new Promise((resolve, reject) => {
    Film.count(query, (err, count) => {
      if (err) {
        reject(err);
      }
      response.totalFound = count;
      resolve();
    });
  });

  const fetchPromise = new Promise((resolve, reject) => {
    Film
      .find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({title: 'asc'})
      .exec((err, films) => {
        if (err) {
          reject(err);
        }

        response.films = films;
        resolve();
      });
  });

  Promise.all([countPromise, fetchPromise]).then(() => {
    response.maxPage = Math.ceil(response.totalFound / perPage);
    res.json(response);
  }).catch((err) => {
    return sendError(err, res);
  })


});

router.get('/getById/:_id', (req, res) => {
  Film.findById(req.params._id, (err, film) => {
    if (err) {
      return sendError(err, res);
    }
    if (!film) {
      return sendError('No Film Found', res);
    }

    res.json(film);
  });
});

router.post('/save', (req, res) => {
  // try to find film in DB
  Film.findById(req.body._id, (err, film) => {
    if (err) {
      return sendError(err, res);
    }
    // sanitize input
    req.body.originalTitle = req.body.originalTitle ? req.body.originalTitle : null;
    req.body.posterPath = req.body.posterPath ? req.body.posterPath : null;
    req.body.backdropPath = req.body.backdropPath ? req.body.backdropPath : null;
    req.body.overview = req.body.overview ? req.body.overview : null;
    req.body.releaseDate = req.body.releaseDate ? req.body.releaseDate : null;
    req.body.genres = req.body.genres ? req.body.genres : [];
    req.body.placeToFind = req.body.placeToFind ? req.body.placeToFind : null;

    if (film) {
      // update
      if (film._account.toString() !== req._accountId) {
        return sendError('This is not your film!', res);
      }

      film.title = req.body.title;
      film.originalTitle = req.body.originalTitle;
      film.posterPath = req.body.posterPath;
      film.backdropPath = req.body.backdropPath;
      film.overview = req.body.overview;
      film.releaseDate = req.body.releaseDate;
      film.genres = req.body.genres;
      film.placeToFind = req.body.placeToFind;
    } else {
      // create new
      film = new Film({
        title: req.body.title,
        originalTitle: req.body.originalTitle,
        posterPath: req.body.posterPath,
        backdropPath: req.body.backdropPath,
        overview: req.body.overview,
        releaseDate: req.body.releaseDate,
        genres: req.body.genres,
        placeToFind: req.body.placeToFind,
        _account: req._accountId
      });
    }
    film.save((err, result) => {
      if (err) {
        return sendError(err, res);
      }
      res.json({
        _id: result._id
      });
    });
  });
});

router.post('/remove', (req, res) => {
  Film.remove({_id: req.body._id}, (err) => {
    if (err) {
      return sendError(err, res);
    }

    res.json(true);
  });
});

module.exports = router;
