import Ably from "ably/promises";
let options = { key: process.env.ABLY_API_KEY };

export default async function handler(req, res) {
  const client = new Ably.Realtime(options);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: req.query.clientId,
  });
  res.status(200).json(tokenRequestData);
}
