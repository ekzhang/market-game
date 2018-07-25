/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var _ = require('@sailshq/lodash');

module.exports = {

  subscribeRoom: async function(req, res) {
    const room_id = req.param('room_id');
    const result = await Event.find({ room_id: room_id });
    sails.sockets.join(req, "room" + room_id);
    return res.json(result);
  }

};

