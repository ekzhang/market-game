/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

function getRoom(room_id) {
  return Event.find({
    where: { room_id: room_id },
    sort: 'createdAt ASC'
  });
}

function aggregate(room) {
  let host = null;
  let sell = NaN, buy = NaN;
  let suser = null, buser = null;
  for (const e of room) {
    if (e.type === 'end') {
      return null;
    }
    if (e.type === 'created') {
      host = e.user;
    }
    else if (e.type === 'taken') {
      sell = NaN;
      suser = null;
    }
    else if (e.type === 'sold') {
      buy = NaN;
      buser = null;
    }
    else if (e.type === 'bid') {
      buy = e.data;
      buser = e.user;
    }
    else if (e.type === 'at') {
      sell = e.data;
      suser = e.user;
    }
  }
  return { host, sell, buy, suser, buser };
}

module.exports = {

  subscribeRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const result = await getRoom(room_id);
    if (req.isSocket)
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

    const user = req.session.uid;
    let event = {
      room_id,
      type: verb,
      user
    };

    // Verb is: bid/at, taken/sold, end
    if (verb === 'end') {
      // End the game
      if (info.host !== user)
        return res.forbidden("Not allowed to end this game");
    }
    else if (verb === 'bid' || verb === 'at') {
      const amt = Number(req.param('amt'));
      if (isNaN(amt) || !Number.isInteger(amt) || amt <= 0 || amt > 1000)
        return res.badRequest("Invalid number provided");
      if ((verb === 'bid' && (amt <= info.buy || amt >= info.sell))
          || (verb === 'at' && (amt >= info.sell || amt <= info.buy)))
        return res.badRequest("Invalid bid/at cost");
      event.data = amt;
    }
    else if (verb === 'taken' || verb === 'sold') {
      if ((verb === 'taken' && isNaN(info.sell)) || (verb === 'sold' && isNaN(info.buy)))
        return res.badRequest("No current offer to take/sell");
      if ((verb === 'sold' && user === info.buser) || (verb === 'taken' && user === info.suser))
        return res.badRequest("Cannot take own offer");
    }
    else {
      return res.badRequest("Invalid verb");
    }

    await Event.create(event);
    sails.sockets.broadcast("room" + room_id, "message", event);
    return res.ok();
  }

};
