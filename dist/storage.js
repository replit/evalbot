'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config) {
  _firebase2.default.initializeApp(config);
  var teamsRef = _firebase2.default.database().ref('/teams');
  var channelsRef = _firebase2.default.database().ref('/channels');
  var usersRef = _firebase2.default.database().ref('/users');

  var storage = {
    teams: {
      get: function get(teamId, done) {
        teamsRef.child(teamId).once('value').then(function (data) {
          return done();
        }, function (err) {
          return done(err);
        });
      },
      save: function save(teamData, done) {
        teamsRef.child(teamData.id).set(teamData).then(function () {
          return done(undefined, teamData);
        }, function (err) {
          return done(err, teamData);
        });
      },
      all: function all(done) {
        teamsRef.once('value').then(function (snapshot) {
          var teamsObj = snapshot.val();
          var teamsArr = values(teamsObj);
          done(undefined, teamsArr);
        }, function (err) {
          return done(err);
        });
      }
    },
    users: {
      get: function get(userId, done) {
        usersRef.child(userId).once('value').then(function (data) {
          return done();
        }, function (err) {
          return done(err);
        });
      },
      save: function save(userData, done) {
        usersRef.child(userData.id).set(userData).then(function () {
          return done(undefined, userData);
        }, function (err) {
          return done(err, userData);
        });
      },
      all: function all(done) {
        usersRef.once('value').then(function (snapshot) {
          var usersObj = snapshot.val();
          var usersArr = values(usersObj);
          done(undefined, usersArr);
        }, function (err) {
          return done(err);
        });
      }
    },
    channels: {
      get: function get(channelId, done) {
        channelsRef.child(channelId).once('value').then(function (data) {
          return done();
        }, function (err) {
          return done(err);
        });
      },
      save: function save(channelData, done) {
        channelsRef.child(channelData.id).set(channelData).then(function () {
          return done(undefined, channelData);
        }, function (err) {
          return done(err, channelData);
        });
      },
      all: function all(done) {
        channelsRef.once('value').then(function (snapshot) {
          var channelsObj = snapshot.val();
          var channelsArr = values(channelsObj);
          done(undefined, channelsArr);
        }, function (err) {
          return done(err);
        });
      }
    }
  };

  return storage;
};

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function values(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}