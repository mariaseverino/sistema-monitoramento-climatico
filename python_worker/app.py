import os
import httpx
import pika
import json
import time
from apscheduler.schedulers.blocking import BlockingScheduler

KEY = os.getenv("KEY")
RABBITMQ_URL = os.getenv("RABBITMQ_URL")
API_URL = os.getenv("API_URL")

params = pika.URLParameters(RABBITMQ_URL)


def connect_with_retry(params, retries=10):
    for _ in range(retries):
        try:
            return pika.BlockingConnection(params)
        except Exception as e:
            print("Erro:", e)
            time.sleep(5)
    raise Exception("Não conseguiu conectar ao RabbitMQ depois de várias tentativas.")


def fetch_users_locations():
    try:
        response = httpx.get(API_URL, timeout=10)
        users = response.json()

        return users

    except Exception as e:
        print("Erro:", e)

def fetch_weather(user, channel):
    url = (
        f"http://api.openweathermap.org/data/2.5/weather"
        f"?lat={user['latitude']}&lon={user['longitude']}&lang=pt_br&appid={KEY}"
    )

    try:
        response = httpx.get(url, timeout=10)
        data = response.json()

        payload = {
            "user": user,
            "coord": data["coord"],
            "weather": {
                "description": data["weather"][0]["description"],
                "temp": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "icon": data["weather"][0]["icon"],
            },
        }

        body = json.dumps(payload)

        channel.basic_publish(
            exchange="weather",
            routing_key="weather.save",
            body=body,
            properties=pika.BasicProperties(delivery_mode=2),
        )

    except Exception as e:
        print("Erro:", e)

def job():

    connection = connect_with_retry(params)
    channel = connection.channel()

    channel.exchange_declare(exchange="weather", exchange_type="topic", durable=True)
    channel.queue_declare(queue="weather.save", durable=True)
    channel.queue_bind(exchange="weather", queue="weather.save", routing_key="weather.save")

    users = fetch_users_locations()
    print(users)

    for user in users:
        fetch_weather(user, channel)

    connection.close()


if __name__ == "__main__":
    job()
    scheduler = BlockingScheduler()
    scheduler.add_job(job, "interval", hours=1)
    scheduler.start()
