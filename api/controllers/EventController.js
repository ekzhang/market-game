/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var _ = require('@sailshq/lodash');

async function getRoom(room_id) {
  return await Event.find({
    where: { room_id: room_id },
    sort: 'createdAt ASC'
  });
}

function aggregate(room) {
  let host = null;
  let sell = NaN, buy = NaN;
  for (const e of room) {
    if (e.type === 'end') {
      return null;
    }
    if (e.type === 'created') {
      host = e.user;
    }
    else if (e.type === 'taken' || e.type === 'sold') {
      sell = buy = NaN;
    }
    else if (e.type === 'bid') {
      buy = e.data;
    }
    else if (e.type === 'at') {
      sell = e.data;
    }
  }
  return { host, sell, buy };
}

module.exports = {

  subscribeRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const result = await getRoom(room_id);
    sails.sockets.join(req, "room" + room_id);
    return res.json(result);
  },

  action: async function(req, res) {
    const verb = req.param('verb');
    const room_id = req.param('room_id');
    const room = await getRoom(room_id);
    const info = aggregate(room);
    if (info === null || room.length === 0) {
      return res.badRequest("No such active room");
    }

    const user = req.session.id;
    let event = {
      room_id,
      type: verb,
      user
    };

    // Verb is: bid/at, taken/sold, end
    if (verb === 'end') {
      // End the game
      if (info.host !== user)
        return res.badRequest("Not allowed to end this game.");
    }
    else if (verb === 'bid' || verb === 'at'
      || verb === 'taken' || verb === 'sold') {

      event.data = req.param("amt");
    }
    else {
      return res.badRequest("Invalid verb");
    }

    await Event.create(event);
    sails.sockets.broadcast("room" + room_id, "message", event);
    return res.ok();
  }

};

