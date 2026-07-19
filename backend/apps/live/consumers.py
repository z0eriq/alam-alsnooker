import json

from channels.generic.websocket import AsyncWebsocketConsumer


class LiveMatchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("live_matches", self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({"type": "connected", "channel": "live"}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("live_matches", self.channel_name)

    async def match_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "match_update",
                    "event": event.get("event"),
                    "match": event.get("match"),
                }
            )
        )


class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("bookings", self.channel_name)
        await self.accept()
        await self.send(
            text_data=json.dumps({"type": "connected", "channel": "bookings"})
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("bookings", self.channel_name)

    async def booking_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "booking_update",
                    "event": event.get("event"),
                    "booking": event.get("booking"),
                }
            )
        )
