package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

	"encoding/json"
	"net/http"
)

type User struct {
	Id    		string `json:"id"`
	Latitude    float32 `json:"latitude"`
	Longitude   float32 `json:"longitude"`
}

type Weather struct {
	Description   string `json:"description"`
	Temp    	  float32 `json:"temp"`
	Humidity      float32 `json:"humidity"`
	WindSpeed     float32 `json:"wind_speed"`
	Icon          string `json:"icon"`
}

type Payload struct {
    User    User    `json:"user"`
    Weather Weather `json:"weather"`
}

func connectRabbit() *amqp.Connection {
	url := os.Getenv("RABBITMQ_URL")

	for {
		conn, err := amqp.Dial(url)
		if err == nil {
			return conn
		}
		log.Printf("RabbitMQ não conectou, tentando novamente em 5s... (%v)\n", err)
		time.Sleep(5)
	}
}

func processMessage(body []byte) (bool, error){
	api := os.Getenv("API_URL2")
	url := api + "/weather"

	var data Payload

	err := json.Unmarshal(body, &data)

	if err != nil {
		log.Printf("JSON inválido: %v", err)
		return false, err
	}

	response, err := http.Post(url, "application/json", bytes.NewBuffer(body))

	if err != nil{
		return false, err
	}

	defer response.Body.Close()

	if response.StatusCode >= 400{
		return false, fmt.Errorf("erro da API: %d", response.StatusCode)
	}

	return true, nil
}

func main() {
	conn := connectRabbit()
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather.save",
		true, false, false, false, nil,
	)
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}

	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}

	var forever chan struct{}

	go func() {
		for msg := range msgs {
			process, err := processMessage(msg.Body)

			if process {
				msg.Ack(false)
			} else{
				msg.Nack(false, true)
				log.Println("erro:", err)
			}
		}
	}()

	<-forever
}
