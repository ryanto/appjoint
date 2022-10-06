export default function handler(req, res) {
  let authHeader = req.headers.authorization;

  // extract the user id from the test auth headers.
  let authJsonString = authHeader.replace(/^Bearer echo:/, '');

  let userId;
  try {
    let authData = JSON.parse(authJsonString);
    userId = authData.uid;
  } catch (e) {
    // console.error(e);
  }

  res.status(200).json({ userId });
}
