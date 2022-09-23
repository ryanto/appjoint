// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  let authHeader = req.headers.authorization;

  // extract the user id from the test auth headers.
  let jsonString = authHeader.replace(/^Bearer echo:/, '');

  let userId;
  try {
    let authData = JSON.parse(jsonString);
    userId = authData.uid;
  } catch (e) {
    // console.error(e);
  }

  res.status(200).json({ userId });
}
