import firebase from 'firebase'

export default function(config) {
  firebase.initializeApp(config)
  const teamsRef = firebase.database().ref('/teams')
  const channelsRef = firebase.database().ref('/channels')
  const usersRef = firebase.database().ref('/users')

  const storage = {
    teams: {
      get: (teamId, done) => {
        teamsRef.child(teamId)
          .once('value')
          .then(
            (data) => done(),
            (err) => done(err)
          )
      },
      save: (teamData, done) => {
        teamsRef.child(teamData.id)
          .set(teamData)
          .then(
            () => done(undefined, teamData),
            (err) => done(err, teamData)
          )
      },
      all: (done) => {
        teamRef.once('value')
          .then(
            (snapshot) => {
              const teamsObj = snapshot.val()
              const teamsArr = Object.values(teamsObj)
              done(undefined, teamsArr)
            },
            (err) => done(err)
          )
      },
    },
    users: {
      get: (userId, done) => {
        usersRef.child(userId)
          .once('value')
          .then(
            (data) => done(),
            (err) => done(err)
          )
      },
      save: (userData, done) => {
        usersRef.child(userData.id)
          .set(userData)
          .then(
            () => done(undefined, userData),
            (err) => done(err, userData)
          )
      },
      all: (done) => {
        userRef.once('value')
          .then(
            (snapshot) => {
              const usersObj = snapshot.val()
              const usersArr = Object.values(usersObj)
              done(undefined, usersArr)
            },
            (err) => done(err)
          )
      },
    },
    channels: {
      get: (channelId, done) => {
        channelsRef.child(channelId)
          .once('value')
          .then(
            (data) => done(),
            (err) => done(err)
          )
      },
      save: (channelData, done) => {
        channelsRef.child(channelData.id)
          .set(channelData)
          .then(
            () => done(undefined, channelData),
            (err) => done(err, channelData)
          )
      },
      all: (done) => {
        channelRef.once('value')
          .then(
            (snapshot) => {
              const channelsObj = snapshot.val()
              const channelsArr = Object.values(channelsObj)
              done(undefined, channelsArr)
            },
            (err) => done(err)
          )
      },
    },
  }

  return storage
}
