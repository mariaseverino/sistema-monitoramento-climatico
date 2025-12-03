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
        print(API_URL)
        response = httpx.get(API_URL, timeout=100)
        users = response.json()

        if not users:
            print("Nenhum usuário encontrado ou erro na API.")
            return []

        return users

    except Exception as e:
        print("Erro:", e)

def fetch_weather(user, channel):
    url = (
        f"http://api.openweathermap.org/data/2.5/weather"
        f"?lat={user['coord']['lat']}&lon={user['coord']['lon']}&lang=pt_br&appid={KEY}"
    )

    try:
        response = httpx.get(url, timeout=100)
        data = response.json()

        payload = {
            "userId": user['_id'],
            "lat": user['coord']['lat'],
            "lon": user['coord']['lon'],
            "description": data["weather"][0]["description"],
            "temp": (data["main"]["temp"] - 273.15),
            "humidity": data["main"]["humidity"],
            "windSpeed": data["wind"]["speed"],
            "icon": data["weather"][0]["icon"],
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
