import os
import pika
import json
from dotenv import load_dotenv

load_dotenv()

class RabbitMQClient:
    def __init__(self):
        self.rabbitmq_url = os.getenv("RABBITMQ_URL")

        # Conexão
        self.params = pika.URLParameters(self.rabbitmq_url)
        self.connection = pika.BlockingConnection(self.params)
        self.channel = self.connection.channel()

        self._setup()

    def _setup(self):
        self.channel.exchange_declare(
            exchange="weather",
            exchange_type="topic",
            durable=True
        )

        self.channel.queue_declare(
            queue="weather.save",
            durable=True
        )

        self.channel.queue_bind(
            exchange="weather",
            queue="weather.save",
            routing_key="weather.save"
        )

    def publish(self, payload):
        body = json.dumps(payload)
        self.channel.basic_publish(
            exchange="weather",
            routing_key="weather.save",
            body=body,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        self.connection.close()


