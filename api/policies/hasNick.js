module.exports = function(req, res, proceed) {
  if (req.session.uid)
    return proceed();
  return res.redirect('/nick' + '?next=' + encodeURIComponent(req.url));
}
