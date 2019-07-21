/**
 * NicknameController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const uuid = require('uuid/v4');

module.exports = {

  setNick: function(req, res) {
    if (!req.session.uuid) {
      req.session.uuid = uuid();
    }
    let nick = req.param('nick').trim();
    if (!nick) {
      return res.badRequest("No nickname provided");
    }
    req.session.nick = nick;
    req.session.uid = nick + "|" + req.session.uuid;
    return res.ok();
  }

};
