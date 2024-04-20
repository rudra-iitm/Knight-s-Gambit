import express from "express";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import client from "@repo/db/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async function (req, res) {
    try{
        const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
        if (!WEBHOOK_SECRET) {
          throw new Error("You need a WEBHOOK_SECRET in your .env");
        }
        const payload = req.body;
        const headers = req.headers;

        const wh = new Webhook(WEBHOOK_SECRET);
 
        let evt: any;

        try {
          // @ts-ignore
          evt = wh.verify(payload, headers);
        } catch (err: any) {
          console.error("Webhook failed to verify. Error:", err.message);
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        const { id } = evt.data;
        const eventType = evt.type;
        // Console log the full payload to view
        console.log("Webhook body:", evt.data);
        console.log("event type:", eventType);

        if (eventType === "user.created") {
          console.log("User created event received");
          const { email_addresses, id, username, last_active_at, last_name, first_name } = evt.data;
          console.log("User created:", { email_addresses, id, username });
          const email = email_addresses[0].email_address
          const user = await client.user.create({
            data: {
              email,
              id: id,
              username,
              lastLogin: new Date(last_active_at),
              lastname: last_name,
              firstname: first_name,
              provider: 'CLERK',
            }
          });
          console.log(user);
        }

        return res.status(200).json({
          success: true,
          message: "Webhook received",
        });

    } catch (error : any) {
      console.error(`Error: ${error}`);
        res.status(400).json({
          success: false,
          message: error.message,
        });
    }
  }
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
